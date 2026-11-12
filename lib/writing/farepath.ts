import type { Article } from "@/lib/writing-types";

export const farepath: Article = {
  slug: "fares-are-not-edge-weights",
  title: "Routing Engines: Non-Additive Pricing with K-Shortest Paths",
  dek: "Why the cheapest train route in Mumbai can't be found with Dijkstra, and how FarePath prices every candidate route exactly, offline, with every fare traceable to a source.",
  category: "Graph Algorithms",
  date: "Nov 2026",
  projects: ["farepath"],
  tags: ["Shortest paths", "Yen's algorithm", "Geospatial data", "Offline-first"],
  body: [
    {
      type: "p",
      text: "The obvious way to build a cheapest-route feature is to put a price on every edge and run Dijkstra. For Mumbai's rail network that gives wrong answers, and people pay real money based on the number on the screen. FarePath is an offline Android app that finds routes and fares across the suburban, metro and monorail lines, and most of the engineering went into one question: what does a journey actually cost?",
    },
    {
      type: "stats",
      items: [
        { value: "2.7 ms", label: "p50 route query (p99 9.1 ms, 260 station pairs)" },
        { value: "13.8 KB", label: "gzipped network: 218 stations, 19 lines" },
        { value: "0", label: "network calls, permissions or dependencies at runtime" },
      ],
    },
    { type: "h2", text: "Why fare is not edge-additive" },
    {
      type: "p",
      text: "A fare depends on the total distance of a contiguous run on one operator's network, read off a slab table. Within one operator, price is monotone in distance but not linear: 4 km and 11 km can cost the same. Across operators it gets worse, because every operator change restarts that operator's minimum fare. Mumbai's three metro companies each charge their own minimum, so a route that touches three of them pays three minimums.",
    },
    {
      type: "callout",
      label: "The design rule",
      text: "The graph never sees money. Routing only proposes candidate journeys. A separate fare function splits each journey into runs and prices it exactly. It is the only thing allowed to say what a journey costs.",
    },
    {
      type: "p",
      text: "Splitting into runs has its own rules. A change of operator starts a new run. An in-station transfer keeps the run going. A walk between stations ends it unless both stations share a paid area, and in Mumbai none do, so a short walk from one station to another means a second ticket.",
    },
    { type: "h2", text: "Finding candidates: Yen's K-shortest paths" },
    {
      type: "p",
      text: "If you cannot put fares on edges, you cannot search for the cheapest path directly. Instead FarePath generates a pool of good candidates and prices all of them. The graph is line-expanded: a node is a (station, line) pair, so changing lines is an explicit edge with a 180-second transfer penalty.",
    },
    {
      type: "list",
      items: [
        "Fastest: Dijkstra on travel time.",
        "Fewest transfers: Dijkstra with a heavy per-change cost, time as the tiebreak.",
        "Cheapest: Yen's K-shortest loopless paths with K = 10, plus the two routes above, all priced by the fare function.",
      ],
    },
    {
      type: "p",
      text: "Yen's algorithm runs on `distance + 0.5 × time` rather than pure distance. Pure distance would treat a transfer as free, since walking between platforms is zero metres of track, and the candidate list would fill up with silly routes that change lines five times. Among priced candidates, a fully priced fare beats a partial one, then lower cost wins, then shorter time.",
    },
    {
      type: "p",
      text: "The payoff shows up in real journeys. Aarey JVLR to Cuffe Parade costs ₹60 direct on Line 3 and ₹40 via the Western Line, at the cost of 22 extra minutes. A Dijkstra over per-edge prices cannot reliably find the cheaper one, because the price only exists once you know the whole run.",
    },
    { type: "h2", text: "Distances from the track, not the map" },
    {
      type: "p",
      text: "Because fares come from distance slabs, distance has to be right. Straight lines between stations under-report on every curve, and on a slab system a few hundred metres can move a journey into the next price band. FarePath measures along real track geometry from OpenStreetMap: it stitches each line's member ways into chains, snaps stations onto the track within 400 m, and sums the distance along consecutive track nodes.",
    },
    {
      type: "p",
      text: "There is no usable GTFS feed for Mumbai, so OSM is the source, and OSM is edited by volunteers. The build pins a specific relation for each of the 19 lines and refuses to ship if the data does not match what is expected:",
    },
    {
      type: "list",
      items: [
        "Ref, name or stop count differs from the pinned values.",
        "A stop cannot be located on the track, or stops land on disconnected pieces of track.",
        "The measured length is more than 2% over, or more than 10% under, the published length.",
        "The final network is not connected, a station is isolated, or an operating line has no fare data.",
      ],
    },
    {
      type: "p",
      text: "Those checks caught real problems: Harbour line stops in the wrong relation order (Kurla to Govandi measured 6.63 km instead of 4.23 km, and the line was corrected from 51.43 to 49.03 km), a station node with no name tag, two stations both called Naigaon 38 km apart, and the metro and suburban Ghatkopar stations sitting 74 m apart.",
    },
    { type: "h2", text: "Every fare says where it came from" },
    {
      type: "p",
      text: "Each fare table carries a confidence flag, a source URL and a verification date. Money is integer paise throughout. A journey's confidence is its weakest run, and the app labels anything estimated as estimated. Some tables are verified (Line 3's slabs, the monorail's 136-pair fare matrix); others are not yet, and the app says so on screen.",
    },
    {
      type: "p",
      text: "Some fares are left out on purpose. AC and first-class suburban fares are not in v1, because a guess would be off by ₹100 or more. The official monorail fare table contradicts itself on 19 pairs, and FarePath uses the higher fare. The monorail is suspended as of 2025-09-20, so the app shows no fare for it at all.",
    },
    { type: "h2", text: "Small enough to ship inside the app" },
    {
      type: "p",
      text: "The whole network is one 95 KB JSON file, 13.8 KB gzipped, built once at startup in 0.2 ms. That is why there is no on-device SQLite: at about 218 stations it would cost 1.5 to 2.5 MB of native library to buy indexed queries nobody needs. The core and data packages have zero dependencies and run on Node's native TypeScript with no build step.",
    },
    {
      type: "p",
      text: "71 tests run against the real shipped network file: golden fares, a case where the cheapest route is not the fastest, symmetry, monotonicity, operator minimums, confidence propagation, integer paise, and a performance budget of p99 under 10 ms.",
    },
    { type: "h2", text: "What's still open" },
    {
      type: "p",
      text: "The release notes list the blockers honestly. The suburban second-class table has no primary source yet, some operator boundaries are inferred, and two fares (Aarey to BKC, and one Navi Mumbai pair) have conflicting sources. None of that is hidden from the user: those fares are marked as estimates until they are verified.",
    },
  ],
};
