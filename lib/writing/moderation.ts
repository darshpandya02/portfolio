import type { Article } from "@/lib/writing-types";

export const moderation: Article = {
  slug: "at-least-once-without-double-work",
  title: "Event-Driven Pipelines: Idempotent Processing on At-Least-Once Queues",
  dek: "How the image moderation pipeline survives duplicate messages, crashed workers and stale leases, using Postgres as the source of truth and the queue as a doorbell.",
  category: "Event-Driven Systems",
  date: "Nov 2026",
  projects: ["image-moderation-platform"],
  tags: ["Message queues", "Idempotency", "Leases and fencing", "PostgreSQL"],
  body: [
    {
      type: "p",
      text: "Every message queue worth using promises at-least-once delivery, which is a polite way of saying your consumer will see the same message twice. In a moderation pipeline that matters: a duplicate delivery must not classify an image twice, a crashed worker must not leave an image stuck forever, and a worker that wakes up late must not overwrite a decision someone else already made. This is how the image moderation platform handles all three.",
    },
    {
      type: "stats",
      items: [
        { value: "1.05 s", label: "p50 end to end, upload to decision (n = 25, live)" },
        { value: "133 ms", label: "p50 model inference in production" },
        { value: "4", label: "attempts before a job is dead-lettered" },
      ],
    },
    { type: "h2", text: "The pipeline" },
    {
      type: "list",
      ordered: true,
      items: [
        "The browser asks for an upload. The API checks the rate limit, size and type, inserts an `awaiting_upload` row, and returns a Blob token scoped to exactly one pathname.",
        "The browser uploads the bytes straight to private Blob storage.",
        "On completion, the server reads the bytes back, checks magic bytes, strips metadata by re-encoding, and in one SQL statement marks the image `pending`, inserts a `queued` job and writes the audit entry. Then it publishes the job ID to the queue.",
        "A worker claims the job, runs two open-source classifiers on TensorFlow.js WebAssembly, evaluates the policy, and records the decision: approve, reject, or send to a human.",
        "Only approved images are ever served to the public gallery.",
      ],
    },
    {
      type: "callout",
      label: "The core idea",
      text: "The queue message carries nothing but a job ID. Postgres holds the truth about every job. A message is a doorbell that says go look at the database, so receiving it twice is harmless as long as the database decides who does the work.",
    },
    { type: "h2", text: "Claims are leases, not locks" },
    {
      type: "p",
      text: "A worker does not lock a job. It leases it for 120 seconds by setting `locked_until` and incrementing `attempts` in the same statement. A job is claimable if it is queued or retrying and due, or if it is processing but its lease has expired, and in both cases only while attempts remain.",
    },
    {
      type: "code",
      lang: "sql",
      code: "(status IN ('queued','retrying') AND next_attempt_at <= now() AND attempts < max_attempts)\nOR\n(status = 'processing' AND locked_until < now() AND attempts < max_attempts)",
      caption: "The claimable condition. A crashed worker's job becomes claimable again when its lease runs out.",
    },
    {
      type: "p",
      text: "That handles crashes. If a worker dies mid-inference, nobody has to notice: the lease simply expires and the next delivery or sweep picks the job up.",
    },
    { type: "h2", text: "Fencing the worker that comes back" },
    {
      type: "p",
      text: "Leases create the classic problem. A worker pauses (a cold start, a long garbage collection, a slow network), its lease expires, another worker claims the job and finishes it, and then the first worker wakes up and tries to write its result. Without protection, the late write wins.",
    },
    {
      type: "p",
      text: "The fix is a fencing token, and the attempt counter already is one. Every claim increments `attempts`, and every completion or failure write includes it in the WHERE clause:",
    },
    {
      type: "code",
      lang: "sql",
      code: "UPDATE jobs SET status = 'completed', ...\nWHERE id = $1 AND status = 'processing' AND attempts = $2",
    },
    {
      type: "p",
      text: "A stale worker's write matches zero rows, and the worker reports `lost_lease` instead of overwriting anything. Two more guards back it up: the result insert uses `ON CONFLICT (image_id) DO NOTHING`, and the image update only applies while the image is still `pending`.",
    },
    { type: "h2", text: "What a duplicate delivery actually does" },
    {
      type: "table",
      head: ["Job state when the message arrives", "What the consumer does"],
      rows: [
        ["`completed` or `dead_letter`", "Acknowledge the message and do nothing (`already_done`)."],
        ["`processing` with a live lease", "Ask the queue to redeliver later, after the lease has had time to expire."],
        ["`retrying` and not yet due", "Ask the queue to redeliver when the backoff ends."],
        ["Claimable", "Claim it and do the work."],
      ],
    },
    {
      type: "p",
      text: "Completing an upload twice is also harmless. Only the first call can move the image out of `awaiting_upload`, and the second one sees it has lost the race and stops.",
    },
    { type: "h2", text: "Retries, dead letters and the sweeper" },
    {
      type: "p",
      text: "Failures back off exponentially with full jitter: a base of 2 seconds, capped at 120, and a random delay inside that window so a burst of failures does not retry in lockstep. After 4 attempts the job moves to `dead_letter`, the image is marked `failed`, and the audit log records why. A job whose worker crashed on its final attempt is dead-lettered too, with the error recorded as a lease that expired on the last try.",
    },
    {
      type: "p",
      text: "There is also a sweeper, for the case where a message is lost entirely. It dead-letters exhausted jobs, claims due or lease-expired ones, and cleans up abandoned uploads, picking rows with `FOR UPDATE SKIP LOCKED` so several sweepers can never grab the same job. A partial index covers only the active statuses, so the sweep stays cheap however many finished jobs pile up.",
    },
    {
      type: "p",
      text: "One more race: if publishing to the queue fails right after the database commit, the job sits in `queued` with no message. Status polling notices jobs that have been queued for more than 20 seconds and re-publishes them, behind a guarded update so that a crowd of pollers produces exactly one re-publish.",
    },
    { type: "h2", text: "Why single statements instead of transactions" },
    {
      type: "p",
      text: "The database is reached over Neon's HTTP driver, and tests run against PGlite. Rather than depend on multi-statement transactions over HTTP, every state change that must be atomic is one SQL statement, usually a CTE that updates the job, the image and the audit log together. It makes each transition easy to reason about: it either happened completely or not at all.",
    },
    { type: "h2", text: "Results, and what they don't show" },
    {
      type: "table",
      head: ["Stage (live, n = 25)", "p50", "p95"],
      rows: [
        ["Upload to Blob from the client", "133 ms", "279 ms"],
        ["Complete (read back, sanitize, enqueue)", "395 ms", "828 ms"],
        ["Waiting in the queue", "188 ms", "617 ms"],
        ["Worker processing", "197 ms", "260 ms"],
        ["End to end", "1,045 ms", "1,636 ms"],
      ],
      caption: "Sequential 800x600 JPEG uploads from one laptop. The 4,153 ms maximum was a cold start.",
    },
    {
      type: "p",
      text: "On 500 labeled safe images, the default policy approved 97.0%, sent 2.0% to review and rejected 1.0%. I want to be clear about what that number is: it measures false alarms on safe content. Recall on unsafe content was not measured, and latency was measured from one location without concurrent load. The SKIP LOCKED test checks the query logic, not real lock contention, because PGlite runs everything on one connection.",
    },
    {
      type: "p",
      text: "Those gaps are the next experiments. The part I am confident in is the state machine: every message, crash and late wake-up has exactly one outcome, and 45 tests pin those outcomes down.",
    },
  ],
};
