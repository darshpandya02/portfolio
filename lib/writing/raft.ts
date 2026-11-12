import type { Article } from "@/lib/writing-types";

export const raft: Article = {
  slug: "raft-from-scratch",
  title: "Distributed Consensus: A Fault-Tolerant Raft Runtime in C++20",
  dek: "Writing consensus in C++20 with nothing but POSIX sockets, then attacking it with SIGKILL, SIGSTOP and two sanitizers until it stopped losing writes.",
  category: "Distributed Runtime",
  date: "Nov 2026",
  projects: ["raft-cluster-monitor"],
  tags: ["Consensus", "Fault tolerance", "C++20", "Durability"],
  body: [
    {
      type: "p",
      text: "Every distributed systems course teaches Raft from the paper. Very few make you find out what happens when the leader is killed halfway through an fsync. I rebuilt my Raft project from scratch in 2026 to answer that question properly: a cluster of real processes on real TCP, a replicated state machine that does something useful, and a test suite whose only job is to break it.",
    },
    {
      type: "stats",
      items: [
        { value: "36 / 36", label: "safety checks passing in release, TSan and ASan builds" },
        { value: "23,596", label: "writes per second on 3 nodes" },
        { value: "160 ms", label: "median election after a leader crash (3 nodes)" },
      ],
    },
    { type: "h2", text: "The shape of the system" },
    {
      type: "p",
      text: "Each node is its own `raftd` process. There is no RPC framework: frames are a little-endian u32 length followed by the payload, and the first byte of the payload is the message type (RequestVote, AppendEntries, their replies, and a few client messages). Integers are little-endian and strings are length-prefixed. The whole thing is C++20, the standard library and POSIX sockets.",
    },
    {
      type: "p",
      text: "The replicated state machine is a key-value store plus a health table, so the cluster monitors itself through the same log it agrees on. A client's write is answered only after its entry has been applied, and reads go through the log too, which makes them linearizable at the cost of a round of replication.",
    },
    {
      type: "list",
      items: [
        "One listener thread, plus one handler thread per incoming connection.",
        "One replicator thread per peer, which owns that peer's outgoing connection.",
        "A ticker thread for election timeouts, and an applier thread that applies committed entries.",
        "A single mutex guards all Raft state. Network I/O never happens while it is held.",
      ],
    },
    { type: "h2", text: "The decision I argued with myself about: fsync under the lock" },
    {
      type: "p",
      text: "The one thing that does happen under the mutex is disk I/O. When a node persists its term, its vote or new log entries, it does so while holding the lock. That costs concurrency, and I kept it anyway: no other thread should ever see state that is not yet durable. If a follower could answer a vote request based on a term it had not finished writing, a crash at the wrong moment would let it vote twice in the same term, and that is exactly the kind of bug that never shows up in a demo.",
    },
    {
      type: "code",
      lang: "on-disk format",
      code: "meta: [u64 term][i64 votedFor][u32 crc]           20 bytes, replaced atomically\nlog:  [u32 len][u32 crc][u64 term][command bytes]  one record per entry",
      caption: "meta is replaced by writing a temp file, fsync, rename, then fsync of the directory.",
    },
    {
      type: "p",
      text: "The CRC exists for one reason: torn writes. If the process dies while appending, the last record can be half on disk. On startup the node reads the log, discards any tail record whose checksum does not match, and truncates the file there. Conflicting entries are removed with `ftruncate`. Every append or truncate is followed by an fsync.",
    },
    { type: "h2", text: "Replication details that matter" },
    {
      type: "p",
      text: "When a follower rejects AppendEntries, it does not just say no. It returns the term of the conflicting entry and the first index of that term, or a conflict term of zero if its log is simply too short. The leader uses that to skip back a whole term per round trip instead of one entry at a time, which matters after a long partition.",
    },
    {
      type: "p",
      text: "The commit rule is the subtle one from the paper: a leader only advances its commit index by counting replicas of entries from its own current term. To make that possible immediately after an election, a new leader appends a no-op. And because I wanted the code to fail loudly rather than quietly, a node that is ever asked to truncate an index it has already committed logs `SAFETY_VIOLATION` and calls `std::abort()`.",
    },
    {
      type: "callout",
      label: "A test I'm glad exists",
      text: "A delayed duplicate of an older, shorter AppendEntries must not truncate the log. It is an easy mistake to make, since the older message looks valid, and one of the unit tests sends exactly that.",
    },
    { type: "h2", text: "Breaking it on purpose" },
    {
      type: "p",
      text: "Unit tests cover the pieces. The part I trust is the fault-injection suite, which runs real clusters of 3 and 5 processes while a client writes unique keys the whole time. Each run does three rounds of:",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "SIGKILL the leader, then restart it.",
        "SIGSTOP a follower for 1.5 seconds.",
        "SIGSTOP the leader until a new leader is elected, then SIGCONT it, so a stale leader wakes up into a newer term.",
        "SIGKILL a random minority of nodes and restart them.",
      ],
    },
    {
      type: "p",
      text: "After every run, six checks decide whether it passed: only one leader per term, every acknowledged write still present, committed prefixes never rewritten, logs converged across nodes, sampled reads returning the acknowledged values, and no crash or sanitizer report.",
    },
    {
      type: "table",
      head: ["Build", "Runs", "Checks passed", "Acked writes per run"],
      rows: [
        ["Release (-O2)", "6", "36 / 36", "61,268 to 121,685"],
        ["ThreadSanitizer", "6", "36 / 36", "58,666 to 99,331"],
        ["AddressSanitizer + UBSan", "6", "36 / 36", "62,046 to 108,825"],
      ],
      caption: "3 runs at 3 nodes and 3 runs at 5 nodes per build, same seed.",
    },
    {
      type: "p",
      text: "Running the same suite under ThreadSanitizer is what makes the single-mutex design something I can defend rather than just assert. Six threads per node, all touching shared state, and zero race reports while processes are being killed underneath them.",
    },
    { type: "h2", text: "Numbers, and the fsync asterisk" },
    {
      type: "table",
      head: ["Nodes", "Election p50 / p99", "Commit p50", "Throughput"],
      rows: [
        ["3", "160 / 323 ms", "0.096 ms", "23,596 writes/s"],
        ["5", "152 / 428 ms", "0.120 ms", "21,297 writes/s"],
        ["21", "127 / 177 ms", "0.320 ms", "10,777 writes/s"],
      ],
      caption: "Apple M5, localhost, 25 election trials per size, 16 clients for 10 s for throughput.",
    },
    {
      type: "p",
      text: "Two things in that table surprised me. Elections get faster as the cluster grows, because with more followers the first of many random timeouts tends to land closer to the 150 ms floor. And some elections finish under 150 ms at all, because a follower's timer started at its last heartbeat, not at the moment of the crash.",
    },
    {
      type: "p",
      text: "The commit numbers need an honest footnote. On macOS, plain `fsync(2)` does not flush the drive's write cache. With `--full-fsync`, which uses `F_FULLFSYNC`, commit latency on 3 nodes goes from 0.096 ms to 11.9 ms and throughput drops from 23,596 to 206 writes per second. That second number is the real cost of durability without group commit, and it is the first thing I would fix next.",
    },
    { type: "h2", text: "What it doesn't do" },
    {
      type: "list",
      items: [
        "No log compaction or snapshots, and the peer list is fixed at startup.",
        "No Pre-Vote or CheckQuorum, so a follower that resumes after a pause forces a needless term change.",
        "No client request deduplication. A retried command can be applied twice, which is harmless here only because puts and health reports are idempotent.",
        "No group commit, no pipelining (one RPC in flight per peer), and no lease reads.",
        "Tested on localhost only, with partitions simulated by SIGSTOP and SIGCONT.",
      ],
    },
    {
      type: "p",
      text: "Writing that list was as useful as writing the code. Each item is a known way production Raft implementations differ from the paper, and knowing exactly where mine stops is what lets me trust the parts that are there.",
    },
  ],
};
