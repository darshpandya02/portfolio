import type { Article } from "@/lib/writing-types";

export const concurrency: Article = {
  slug: "proving-you-cant-double-book",
  title: "Database Concurrency Control: Exclusion Constraints vs Optimistic Locking",
  dek: "Two systems, two concurrency strategies: pessimistic locks plus an exclusion constraint for hotel rooms, optimistic version tokens for medical stock. And the control experiments that show what breaks without them.",
  category: "Databases",
  date: "Nov 2026",
  projects: ["webook", "meditrack"],
  tags: ["PostgreSQL", "Transactions", "Optimistic locking", "Race testing"],
  body: [
    {
      type: "p",
      text: "Every booking system has the same bug waiting in it. Two requests check availability at the same moment, both see the room as free, and both insert a booking. Each request is correct on its own. Together they sell the same room twice. The only way I trust a fix for this is to fire many requests at once and count what comes back, and then remove the fix and watch it fail.",
    },
    {
      type: "stats",
      items: [
        { value: "1 of 20", label: "simultaneous bookings for one room succeed" },
        { value: "13 of 20", label: "succeed with the protections removed" },
        { value: "33 of 50", label: "stock issues succeed against 100 units, none lost" },
      ],
    },
    { type: "h2", text: "WeBook: a lock for good errors, a constraint for correctness" },
    {
      type: "p",
      text: "WeBook is a Django hotel booking system served over REST and GraphQL. Booking a room goes through one Command that locks the candidate room rows with `select_for_update()`, checks for overlapping active bookings, and inserts. A concurrent booking for the same room waits at the lock until the first transaction commits, then sees the new booking in its overlap check and gets a clean 409.",
    },
    {
      type: "p",
      text: "The lock is not what guarantees correctness, though. Postgres does that, with an exclusion constraint that makes overlapping active bookings for one room impossible to store:",
    },
    {
      type: "code",
      lang: "sql",
      code: "EXCLUDE USING gist (\n  int8range(room_id, room_id, '[]') WITH &&,\n  daterange(check_in, check_out, '[)') WITH &&\n) WHERE (status IN ('confirmed', 'checked_in'))",
    },
    {
      type: "list",
      items: [
        "The date range is half-open (`[)`), so one guest checking out and the next checking in on the same day do not conflict.",
        "The room is wrapped in a one-point `int8range` so the constraint works without the `btree_gist` extension on a shared database.",
        "Cancelled bookings fall outside the WHERE clause, so they free the room without being deleted.",
        "This is also why the project moved from MySQL to Postgres: MySQL has no exclusion constraints.",
      ],
    },
    {
      type: "callout",
      label: "Why both",
      text: "The lock gives users a fast, clean conflict response. The constraint means that even code which forgets the lock, a future admin script or a direct ORM insert, cannot store an overlapping booking. One is ergonomics, the other is the guarantee.",
    },
    { type: "h3", text: "The race test" },
    {
      type: "p",
      text: "The test starts 20 threads, each with its own database connection, holds them at a `threading.Barrier`, and releases them all at once to POST the same room and dates. It asserts exactly one 201, nineteen 409s, one confirmed booking, and an audit trail of one `ok` row and nineteen `rejected` rows. It passed 20 of 20 repeated runs.",
    },
    {
      type: "table",
      head: ["Protection", "Booked (201)", "Rejected (409)"],
      rows: [
        ["Lock and constraint", "1", "19"],
        ["Constraint only", "1", "19"],
        ["Neither (control)", "13", "7"],
      ],
      caption: "The two variants were produced by temporarily editing the code, not by a script in the repo.",
    },
    {
      type: "p",
      text: "The control row is the important one. Without protection, 13 guests were told they had the same room. That number is what makes the 1 meaningful.",
    },
    {
      type: "p",
      text: "The same Command layer writes an audit row inside the same transaction as the change, and both REST and GraphQL build the same Commands, so there is one place where the rules live. On the GraphQL side, per-request batch loaders took a nested bookings query from 1,602 SQL queries to 8 at 200 bookings.",
    },
    { type: "h2", text: "MediTrack: optimistic, because contention is different" },
    {
      type: "p",
      text: "MediTrack is an ASP.NET Core medical inventory system: lots with expiry dates, stock per location, and an append-only movement ledger. Here I chose optimistic concurrency. Stock rows carry an integer `Version` marked as a concurrency token, so every update is written as `WHERE Id = @id AND Version = @original`. If another request changed the row first, zero rows match and EF Core throws.",
    },
    {
      type: "p",
      text: "On a conflict the service clears its change tracker and reruns the whole operation from the read: reload stock, re-run the first-expiry-first-out allocation across lots, and write again, with a small random delay between attempts. A CHECK constraint that quantity is never negative sits underneath as a second line of defence.",
    },
    { type: "h3", text: "The race test" },
    {
      type: "p",
      text: "100 units are received. Then 40 issues of 3 units from different roles and 10 transfers of 3 units to the ICU are released together behind a single gate. The test asserts only 200s and 409s come back, the shelf never goes negative, shelf plus ICU plus issued equals exactly 100, 33 requests succeed with 1 unit left, the ledger sums to the stored balance, and every ledger row's running balance is distinct.",
    },
    {
      type: "p",
      text: "Over 16 Postgres runs the answer was always 33 successes and 17 clean `409 Insufficient stock` responses, with 70 to 133 concurrency retries per run.",
    },
    {
      type: "table",
      head: ["50 issues of 3 units against 100 on hand", "Succeeded", "Ledger says issued", "Shelf shows"],
      rows: [
        ["With the version token", "33", "99", "1"],
        ["Without the token", "50", "150", "94"],
      ],
      caption: "From the benchmark harness, which reruns the issues through the real services with the token switched off.",
    },
    {
      type: "p",
      text: "Without the token the system did not just oversell. It lost track of reality: the ledger recorded 150 units issued from a shelf that still showed 94. The CHECK constraint never fired, because the lost updates kept the stored quantity positive. That is the most useful thing the control taught me: a constraint only catches the wrong state it was written for.",
    },
    { type: "h2", text: "Choosing between them" },
    {
      type: "table",
      head: ["", "WeBook (pessimistic)", "MediTrack (optimistic)"],
      rows: [
        ["Mechanism", "Row lock, then overlap check", "Version token, retry on conflict"],
        ["Guarantee", "Exclusion constraint in Postgres", "Version check on every write, CHECK constraint below"],
        ["Fits when", "Conflicts are common on one row", "Conflicts are occasional and reads dominate"],
        ["Cost", "Waiting under contention", "Wasted work and retries under contention"],
      ],
    },
    {
      type: "p",
      text: "The MediTrack README says the quiet part out loud: for much hotter rows, a row lock would avoid retry storms. 70 to 133 retries for 50 requests is fine at this scale and would not be at a hundred times the load.",
    },
    { type: "h2", text: "Other things these systems prove" },
    {
      type: "list",
      items: [
        "MediTrack's four roles are checked by a 68-case test that crosses 17 endpoints with every role: denied pairs must return 403, allowed pairs must not.",
        "Composite indexes plus `AsNoTracking` projections cut the audit-trail query from 15.94 ms to 3.26 ms median on 50,000 movements. The indexes did most of it.",
        "156 MediTrack tests run against both Postgres and SQLite in CI, each integration fixture on its own throwaway database. WeBook runs 65 tests against Postgres 17.",
      ],
    },
    {
      type: "p",
      text: "One honest gap: MediTrack's ledger is append-only by convention. Deletes of referenced rows are blocked and items are soft-deleted, but there is no trigger or permission that physically prevents an update to a ledger row. If this were going into a hospital, that is the first thing I would add.",
    },
  ],
};
