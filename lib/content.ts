/**
 * Single source of truth for every piece of portfolio content.
 * The terminal, the virtual filesystem and the static pages all read from here.
 */

export const profile = {
  name: "Darsh Pandya",
  fullName: "Darsh Chetan Pandya",
  handle: "darsh",
  host: "portfolio",
  role: "Software Engineer",
  company: "SPHERE Research Infrastructure",
  location: "Boston, Massachusetts, USA",
  email: "darshpandya02@gmail.com",
  altEmail: "darshpandya02@gmail.com",
  shell: "/bin/zsh",
  avatar: "/images/darsh.jpg",
  avatarAlt: "Darsh Pandya",
  tagline: "I build distributed systems and backend services.",
  summary:
    "Software Engineer working on public research infrastructure for reproducible cybersecurity experimentation. MSCS from Northeastern. Most of my time goes to backend design: message queues, sharded consumers, connection pooling, and the unglamorous work of making a system survive its own load.",
  bio: [
    "I'm a software engineer in Boston. I work on SPHERE, an NSF-backed public research infrastructure that lets security researchers run reproducible experiments on real hardware. The interesting part isn't any single service — it's that other people's science depends on the thing staying up and behaving identically on Tuesday as it did on Friday.",
    "Before that I was a Software Engineer Co-op at Northeastern's Network Science Institute, where I reworked fragment navigation into a tag-based system and cut API response times by pooling connections instead of re-paying for TLS handshakes. Prior to Boston I was a backend intern at Gupshup in San Francisco, wiring Kafka for client-facing messaging and RabbitMQ for internal traffic between microservices, and a software engineering intern at Chance App in Mumbai building a match-making service on MERN.",
    "I finished my M.S. in Computer Science at Northeastern in December 2025 with a 3.97 GPA, and spent a year of it as a Teaching Assistant for Full-Stack Web Development — running tutorials, reviewing code, and writing the E2E tests I then graded people against. Teaching a thing is still the fastest way I know to find out whether I actually understand it.",
    "My default stack is Python and TypeScript, with Java when the problem wants a type system with sharp edges. Postgres and Redis for state, Docker and Kubernetes for shipping, and a strong preference for boring, observable architecture over clever architecture.",
    "Away from the keyboard I travel whenever the calendar allows it, and I play an unreasonable amount of Valorant.",
  ],
  interests: [
    "Distributed Systems",
    "Backend Engineering",
    "Research Infrastructure",
    "Developer Tooling",
    "Applied ML",
  ],
  availability: "Open to conversations about backend, distributed systems and research infrastructure.",
};

export const links = {
  github: "https://github.com/darshpandya02",
  linkedin: "https://www.linkedin.com/in/darshpandya02/",
  instagram: "https://www.instagram.com/darshpandya_/",
  email: `mailto:${profile.email}`,
  resume: "/files/resume.pdf",
  neuSite: "https://pandyadar.sites.northeastern.edu",
  sphere: "https://sphere-project.net",
};

export interface Experience {
  slug: string;
  company: string;
  role: string;
  location: string;
  start: string;
  end: string;
  current?: boolean;
  summary: string;
  highlights: string[];
  stack: string[];
  url?: string;
}

export const experience: Experience[] = [
  {
    slug: "sphere",
    company: "SPHERE Research Infrastructure",
    role: "Software Engineer",
    location: "Boston, MA",
    start: "Jan 2026",
    end: "Present",
    current: true,
    summary:
      "Building an NSF-backed public research infrastructure for reproducible cybersecurity experimentation, used by security researchers to run experiments on real hardware.",
    highlights: [
      "Engineer on SPHERE, public research infrastructure that gives cybersecurity researchers reproducible experiments on real, isolated hardware.",
      "Built multi-threaded load clients, message queues and sharded consumers for high-throughput services handling experiment orchestration.",
      "Stream real-time microphone audio from users to smart speakers over SRT via MediaMTX, so experiments drive voice assistants with live input instead of prerecorded audio.",
      "Co-author on the ACSAC 2026 paper describing the platform's architecture and its reproducibility guarantees.",
      "Work spans cloud-native architecture and developer tooling — the interfaces researchers actually touch when they define an experiment.",
    ],
    stack: ["Python", "Distributed Systems", "Message Queues", "MediaMTX", "SRT", "RTSP", "Docker", "Kubernetes", "Linux"],
    url: "https://sphere-project.net",
  },
  {
    slug: "ubiwell",
    company: "UbiWell Lab, Northeastern University",
    role: "Software Engineer",
    location: "Boston, MA",
    start: "Jul 2025",
    end: "Dec 2025",
    summary:
      "Backend and data-collection work for a mobile sensing study, where the research only works if the pipeline keeps running unattended for months.",
    highlights: [
      "Ran the Python data pipelines behind Flask, Gunicorn and Nginx on Linux for a study with 60+ active participants.",
      "Raised dataset completeness by 10% by finding and closing the gaps where sensor uploads were being dropped silently.",
      "Built the delivery-verification endpoint the team checked before each of 12 releases, so a broken notification path was caught before it cost a day of participant data.",
      "The whole job is unattended reliability: nobody is watching at 3am, and a participant whose data went missing cannot be asked to re-live the week.",
    ],
    stack: ["Python", "Flask", "Gunicorn", "Nginx", "Linux", "PostgreSQL", "Mobile Sensing"],
  },
  {
    slug: "netsi",
    company: "Network Science Institute, Northeastern University",
    role: "Software Engineer Co-op",
    location: "Boston, MA",
    start: "Jan 2025",
    end: "Jun 2025",
    summary:
      "Backend and API work on research data platforms at Northeastern's Network Science Institute.",
    highlights: [
      "Improved fragment navigation and management by adopting a tag-based system, reducing duplicate fragment instances by 30%.",
      "Applied connection pooling to cut the overhead of repeated SSL/TLS handshakes, improving API response times by 25%.",
    ],
    stack: ["Python", "REST APIs", "PostgreSQL", "Connection Pooling"],
  },
  {
    slug: "gupshup",
    company: "Gupshup",
    role: "Backend Developer Intern",
    location: "San Francisco, CA",
    start: "Jul 2024",
    end: "Sep 2024",
    summary:
      "Backend services and messaging infrastructure for a conversational messaging platform.",
    highlights: [
      "Developed an automated weekly scheduler in Java Spring Boot that analyzed ad spend and click-ratio metrics, contributing to a 15% revenue increase through better campaign targeting.",
      "Integrated Apache Kafka for external client messaging and RabbitMQ for internal inter-service messaging, raising message processing efficiency by 15%.",
      "Deployed Redis caching that cut database load by 35% and improved application scalability.",
      "Ran Agile sprints through Jira, streamlining delivery and increasing team throughput by 22% while keeping SDLC compliance intact.",
    ],
    stack: ["Java", "Spring Boot", "Apache Kafka", "RabbitMQ", "Redis", "Jira"],
  },
  {
    slug: "neu-ta",
    company: "Northeastern University",
    role: "Teaching Assistant — Full-Stack Web Development",
    location: "Boston, MA",
    start: "Jan 2024",
    end: "Dec 2024",
    summary:
      "Taught and supported students through Northeastern's full-stack web development course.",
    highlights: [
      "Ran tutorials on React.js, Node.js, TypeScript, Express.js, Jest, Cypress, MongoDB, Docker, JWT and Git.",
      "Performed code review and one-on-one office hours for students working through full-stack projects.",
      "Graded assignments against self-authored E2E and unit test suites rather than eyeballing submissions.",
    ],
    stack: ["React", "Node.js", "TypeScript", "Express", "Jest", "Cypress", "MongoDB", "Docker"],
  },
  {
    slug: "chance-app",
    company: "Chance App",
    role: "Software Engineering Intern",
    location: "Mumbai, India",
    start: "May 2022",
    end: "Oct 2022",
    summary:
      "Full-stack product work on a social match-making application.",
    highlights: [
      "Built the frontend in React and the backend in Express.js with Node and MongoDB, owning API routes and CRUD operations; SPA architecture cut load time by 30%.",
      "Devised a match-making algorithm using hash maps and priority queues that raised successful matches by 20%, with 90%+ Jest coverage across unit and integration tests.",
      "Implemented a CI/CD pipeline with GitHub Actions and Jenkins, reducing deployment time by 40%.",
    ],
    stack: ["React", "Express.js", "Node.js", "MongoDB", "Jest", "GitHub Actions", "Jenkins"],
  },
];

export interface Project {
  slug: string;
  name: string;
  tagline: string;
  year: string;
  featured: boolean;
  status: "shipped" | "wip" | "archived";
  description: string[];
  highlights: string[];
  stack: string[];
  github?: string;
  demo?: string;
}

export const projects: Project[] = [
  {
    slug: "image-moderation-platform",
    name: "Image Moderation Platform",
    tagline: "Event-driven image moderation with a queue, a policy engine and human review.",
    year: "2026",
    featured: true,
    status: "shipped",
    description: [
      "Upload an image and watch it move through the pipeline: it is stored privately, a moderation job is queued, a worker classifies it, and a policy engine approves it, rejects it or sends it to a human reviewer. Only approved images ever reach the public gallery.",
      "Rebuilt in 2026 on serverless infrastructure. The original 2024-25 version targeted AWS S3, Lambda, DynamoDB and Kafka.",
    ],
    highlights: [
      "p50 end-to-end moderation latency of 1.05 s and p95 of 1.64 s, measured over 25 live production uploads.",
      "Idempotent job pipeline with lease-based claims, attempt fencing, exponential backoff, dead-lettering after 4 attempts and a Postgres SKIP LOCKED sweeper.",
      "Open-source NSFW and ImageNet classifiers on TensorFlow.js WebAssembly inside serverless functions, 133 ms p50 inference in production.",
      "Approved 97% of 500 labeled safe images under the default policy. Every reviewer decision is written to an audit log.",
      "Uploads are validated by magic bytes, capped at 5 MB, stripped of EXIF and rate-limited per IP. 45 unit and integration tests run in GitHub Actions.",
    ],
    stack: ["TypeScript", "Next.js", "Vercel Queues", "Vercel Blob", "PostgreSQL", "TensorFlow.js", "GitHub Actions"],
    github: "https://github.com/darshpandya02/image-moderation-platform",
    demo: "https://image-moderation-platform.vercel.app",
  },
  {
    slug: "ecommerce-analytics-pipeline",
    name: "E-commerce Analytics Pipeline",
    tagline: "Scheduled ELT with dbt, data-quality gates and a live health dashboard.",
    year: "2026",
    featured: true,
    status: "shipped",
    description: [
      "A synthetic store emits sessions, carts, orders and refunds, including late, duplicate and deliberately broken events. Every 30 minutes a GitHub Actions job lands the batch as Parquet, loads it idempotently into Postgres, builds dbt models and gates the result on data-quality checks.",
      "Rebuilt from scratch in 2026. The original 2024 version targeted Kafka, Spark, Airflow and Snowflake. This one runs Python, dbt, Great Expectations and Postgres, and the README maps each original component to what replaced it.",
    ],
    highlights: [
      "Idempotent loads keyed by event ID with a watermark and load manifest in one transaction. A reload of the same batch inserts 0 rows.",
      "dbt staging, incremental and mart layers (daily revenue, conversion funnel, cohort retention, top products, refund rate) with 39 tests and source freshness.",
      "48 to 59 quality checks per run, including a revenue reconciliation between raw orders and published marts. They caught all 3 live injected anomalies and 8 of 9 anomaly types in an offline drill.",
      "Median run of 22.4 s (p95 28.3 s over 12 runs). A failed run opens a GitHub issue and the next good run closes it.",
      "Public read-only dashboard backed by a least-privilege Postgres role, showing run history, freshness and event-to-mart latency.",
    ],
    stack: ["Python", "dbt", "Great Expectations", "PostgreSQL", "Parquet", "GitHub Actions", "Next.js"],
    github: "https://github.com/darshpandya02/ecommerce-analytics-pipeline",
    demo: "https://ecommerce-analytics-pipeline.vercel.app",
  },
  {
    slug: "stock-clustering",
    name: "Stock Clustering",
    tagline: "K-means++ and DBSCAN over 499 S&P 500 stocks, refreshed every weekday.",
    year: "2026",
    featured: false,
    status: "shipped",
    description: [
      "Five years of daily prices for the S&P 500, turned into 14 features per stock and clustered two ways. The site shows the PCA projection, lets you switch models, search a ticker for its nearest neighbours, and re-cluster at any k in the browser.",
      "Rebuilt from scratch in 2026. The original 2024 project code was not preserved.",
    ],
    highlights: [
      "14 standardized features per stock: multi-window returns, volatility, moving-average ratios, beta vs SPY and max drawdown.",
      "K-means++ with k chosen by silhouette (k=4, score 0.260) and DBSCAN with eps from the k-distance knee. PCA to 2D keeps 67% of the variance.",
      "Measured honestly: clusters barely track GICS sectors (adjusted Rand 0.038), and a walk-forward next-week direction model scored 53.1% on 73,530 predictions against a 53.9% majority baseline, so it adds no signal.",
      "In-browser K-means++ matches the Python version label for label on a fixed seed, checked in CI. A weekday GitHub Actions job refreshes the data and redeploys.",
    ],
    stack: ["Python", "scikit-learn", "pandas", "yfinance", "JavaScript", "GitHub Actions"],
    github: "https://github.com/darshpandya02/stock-clustering",
    demo: "https://stock-clustering.vercel.app",
  },
  {
    slug: "raft-cluster-monitor",
    name: "Raft Cluster Monitor",
    tagline: "Raft consensus in C++20, from scratch, replicating a cluster health store.",
    year: "2026",
    featured: true,
    status: "shipped",
    description: [
      "Every node is its own process speaking a custom binary protocol over TCP. The replicated state machine is a key-value store of node health reports, so the cluster monitors itself through the same log it agrees on.",
      "Rebuilt from scratch in 2026. The original 2025 course-project code was not preserved.",
    ],
    highlights: [
      "Leader election, log replication with conflict backtracking, majority commit on current-term entries only, and fsync-persisted term, vote and CRC-checked log.",
      "Fault-injection suite kills, pauses and restarts leaders and followers under continuous writes. 36 of 36 safety checks pass under release, ThreadSanitizer and AddressSanitizer builds.",
      "Median leader election after a leader crash of 127 to 160 ms across 3, 5 and 21 nodes, with all 75 trials under 500 ms.",
      "About 23,600 writes per second on 3 nodes and 10,800 on 21 nodes on one machine, and 12 ms median commit latency with a forced disk flush.",
    ],
    stack: ["C++20", "TCP Sockets", "Raft", "Multithreading", "ThreadSanitizer", "Linux"],
    github: "https://github.com/darshpandya02/raft-cluster-monitor",
    demo: "https://project-demos-gamma.vercel.app/raft/",
  },
  {
    slug: "farepath",
    name: "FarePath",
    tagline: "Offline Mumbai rail routes and fares, with every fare traceable to a source.",
    year: "2026",
    featured: true,
    status: "shipped",
    description: [
      "Enter two stations, get the route and what it costs. No network access, no accounts, no ads, no data collection. The entire dataset ships inside the app.",
      "People spend real money on the numbers this app prints, so fare correctness comes ahead of features. Every fare carries a confidence flag, a source URL and a verification date, and anything merely estimated is labelled that way on screen.",
    ],
    highlights: [
      "Route queries run at p50 2.7 ms and p99 9.1 ms across 260 station pairs, with the graph built once at startup in 0.2 ms.",
      "Fare is not edge-additive, so Dijkstra alone gives wrong answers. Fare depends on total distance of a contiguous run on one operator, and each operator change restarts that operator's minimum. The engine runs Yen's K-shortest-paths on distance and then prices every candidate exactly.",
      "Distances are measured along real track geometry rather than straight lines, because on a distance-slab system a chord under-reports on curves and the measured distance is the fare.",
      "The build fails rather than shipping quietly: pinned OSM relations are asserted against ref, name, stop count and published length, and the network must be fully connected.",
      "218 stations and 300 edges fit in memory as one 95 KB JSON (14 KB gzipped), which is why there is no on-device SQLite costing 2 MB of native library for indexed queries nobody needs.",
      "36 core tests and 18 pipeline tests, running on Node's native TypeScript with no build step and no dependencies.",
    ],
    stack: ["TypeScript", "Expo", "React Native", "Node", "OpenStreetMap", "Graph Algorithms", "Android"],
  },
  {
    slug: "splitwit",
    name: "Splitwit",
    tagline: "Itemized bill splitting without the social network.",
    year: "2026",
    featured: true,
    status: "shipped",
    description: [
      "Photograph a receipt, tap what you ordered, get exact numbers. No accounts, no bank linking, no feed.",
      "Splitting locally makes zero network calls. The Cloudflare Worker is touched only for shared multi-device sessions and an opt-in cloud OCR fallback, so the common case never leaves the phone.",
    ],
    highlights: [
      "Money is always integer cents, never floats. Shares are apportioned by flooring every share and handing leftover cents to the largest fractional remainders, deterministically, so two phones in the same group never disagree about who owes the extra cent.",
      "Bad OCR degrades loudly instead of silently. The parser asserts items minus discount plus tax plus tip equals the total, and a mismatch is surfaced as low confidence with specific warnings before any money is computed.",
      "Cut the release APK from 59 MB to 25.4 MB with R8, resource shrinking and dropping unused ML Kit script models. What is left is almost entirely the React Native framework floor.",
      "Session polling runs only while the app is foregrounded and the screen is focused. It polls a single indexed version counter and fetches the full session only when that changes.",
      "The core split math is pure TypeScript with zero dependencies, so it runs identically in Node, in a Cloudflare Worker and in the app's JS engine, and is unit-tested accordingly. 26 integration checks run against a live Worker.",
    ],
    stack: ["React Native", "TypeScript", "Cloudflare Workers", "D1", "Wrangler", "On-device OCR", "Android", "iOS"],
  },
  {
    slug: "vate",
    name: "Vate",
    tagline: "Swipe-to-match restaurant picking with real-time group consensus.",
    year: "2026",
    featured: true,
    status: "shipped",
    description: [
      "Tinder, but the thing you're swiping on is dinner. Users join a private group, swipe through nearby restaurants, and the moment every member of the group has liked the same place, everyone gets a real-time match notification.",
      "The hard part isn't the swiping — it's the group consensus. Matches have to be evaluated as swipes land, pushed to every connected member immediately, and stay correct when someone joins mid-session or drops off the network.",
    ],
    highlights: [
      "NestJS backend with PostgreSQL and Prisma, Redis for hot session state, and Socket.IO for match fan-out.",
      "Angular 19 frontend with NgRx and RxJS, JWT auth, and a PWA-ready shell so it installs on a phone.",
      "Dockerized with Docker Compose for local Postgres/Redis, Nginx in front, and GitHub Actions running CI/CD.",
      "Swagger-documented API with bcrypt-hashed credentials and JWT session handling.",
    ],
    stack: ["Angular", "NestJS", "TypeScript", "PostgreSQL", "Prisma", "Redis", "Socket.IO", "Docker", "Nginx"],
    github: "https://github.com/darshpandya02/vate",
    demo: "https://vate-eta.vercel.app",
  },
  {
    slug: "bsds",
    name: "BSDS — Building Scalable Distributed Systems",
    tagline: "A replicated C++ robot-factory service over raw TCP sockets.",
    year: "2025",
    featured: true,
    status: "shipped",
    description: [
      "A robot-factory order service built up in stages in C++: first a multi-threaded client and server over raw TCP, then a worker pool with a shared expert queue, then primary-backup replication so orders survive the loss of a server.",
      "Each stage was load-tested with multi-threaded clients, and latency and throughput were plotted against client count, so design choices were measured rather than assumed.",
    ],
    highlights: [
      "Custom RPC over TCP sockets with hand-written marshalling in network byte order.",
      "One engineer thread per customer, handing special-module work to an expert pool through a mutex and condition-variable queue that returns results via std::promise/std::future.",
      "Primary-backup replication: the primary appends every write to a state-machine log, replicates it to the backups, and advances a committed index. Backups that fall behind are caught up from the log on reconnect.",
      "Multi-threaded load clients measured read and write latency and throughput across configurations, plotted with Python.",
    ],
    stack: ["C++", "TCP Sockets", "RPC", "Multithreading", "Replication", "Linux"],
    github: "https://github.com/darshpandya02/BSDS",
    demo: "https://project-demos-gamma.vercel.app/robot-factory/",
  },
  {
    slug: "ceekay-dashboard",
    name: "Ceekay Dashboard",
    tagline: "Production internal monitoring for enterprise sales and product data.",
    year: "2025",
    featured: true,
    status: "shipped",
    description: [
      "An internal monitoring dashboard for Ceekay Enterprise covering sales and product operations, shipped to both mobile and web from one codebase.",
      "Admins upload yearly sales CSVs, the backend parses and normalizes them, and the dashboard renders the result as live charts that the business development team actually uses.",
    ],
    highlights: [
      "Role-based authentication with JWT, separating admin and user capabilities.",
      "CSV ingestion pipeline with Multer and csv-parser, normalizing uploaded sales data by year.",
      "React Native + React Native Web via Expo, so mobile and web ship from a single codebase.",
      "Express + TypeScript backend on PostgreSQL with Prisma, bcrypt-hashed credentials, and Redux Toolkit on the client.",
    ],
    stack: ["React Native", "Expo", "TypeScript", "Redux Toolkit", "Express", "PostgreSQL", "Prisma", "JWT"],
    github: "https://github.com/darshpandya02/ceekay-dashboard",
    demo: "https://ceekay-dashboard.vercel.app",
  },
  {
    slug: "ceekay-chem",
    name: "Ceekay Chem",
    tagline: "AI-integrated inventory management, order tracking and purchasing.",
    year: "2025",
    featured: true,
    status: "shipped",
    description: [
      "An online inventory and purchasing platform for a chemicals business — stock levels, order tracking and purchasing in one place, with AI assistance layered over the catalogue so staff can query inventory in plain language.",
    ],
    highlights: [
      "Expo + TypeScript app with file-based routing, running on iOS, Android and web.",
      "Order tracking from purchase request through fulfilment, tied to live inventory counts.",
      "AI-assisted lookup over the product catalogue for non-technical staff.",
    ],
    stack: ["TypeScript", "React Native", "Expo", "Node.js"],
    github: "https://github.com/darshpandya02/ceekay-chem",
  },
  {
    slug: "health-dashboard",
    name: "Health Dashboard",
    tagline: "Streaming health records into regional and smoker-status analytics.",
    year: "2025",
    featured: false,
    status: "shipped",
    description: [
      "A Flask API and Plotly dashboard over patient health records. Locally the data flows through Kafka into Spark and lands in Hive, and the API aggregates it by region and smoker status.",
      "The hosted demo runs the same aggregate queries against Postgres over 400 sample records, since Kafka, Spark and Hive cannot run on serverless hosting.",
    ],
    highlights: [
      "Kafka producer and Spark job feeding Hive, orchestrated with docker-compose for local runs.",
      "Flask API serving average BMI by region and average charges by smoker status.",
      "Plotly charts in a static frontend served from the same origin as the API.",
    ],
    stack: ["Python", "Flask", "Kafka", "Spark", "Hive", "PostgreSQL", "Plotly"],
    github: "https://github.com/darshpandya02/health-dashboard",
    demo: "https://health-dashboard-darshpandya.vercel.app",
  },
  {
    slug: "footy",
    name: "Footy",
    tagline: "Local football community app for pickup matches and tournaments.",
    year: "2025",
    featured: false,
    status: "shipped",
    description: [
      "A cross-platform app for local football: find players, build teams, run tournaments, and schedule the weekly fixtures that normally live in a chaotic group chat.",
    ],
    highlights: [
      "Player profiles with goals, assists, matches, position and free-agent status.",
      "Team management with invitations, captain/manager roles and performance tracking.",
      "GPS-based tournament discovery, entry fees, rules and team invitations.",
      "Weekly fixture scheduling with live match updates, results, venue and referee info.",
    ],
    stack: ["React Native", "TypeScript", "Expo"],
    github: "https://github.com/darshpandya02/Footy",
    demo: "https://footy-cyan.vercel.app",
  },
  {
    slug: "image-processing-application",
    name: "Image Processing Application",
    tagline: "Java desktop image editor built around MVC and the SOLID principles.",
    year: "2023",
    featured: true,
    status: "shipped",
    description: [
      "A desktop image processing application with three ways in: a Swing GUI, an interactive text UI, and batch execution of command scripts. All three drive the same model.",
      "It was as much an exercise in design as in image processing — the Command and Command Callback patterns keep the controller and view from knowing anything about each other.",
    ],
    highlights: [
      "MVC architecture with a Swing view, Command Callback pattern for the view and Command pattern for the controller.",
      "Component extraction (red/green/blue/value/luma/intensity), flips, brightness, sepia, greyscale, blur and sharpen.",
      "Three interaction modes — GUI, interactive text commands, and scripted batch runs via `run <script>`.",
      "JUnit coverage across the model and controller, written against SOLID boundaries.",
    ],
    stack: ["Java", "Swing", "JUnit", "MVC", "Design Patterns"],
    github: "https://github.com/darshpandya02/image-processing-application",
    demo: "https://project-demos-gamma.vercel.app/image-processing/",
  },
  {
    slug: "rent-and-roll",
    name: "Rent & Roll",
    tagline: "Multi-tiered car booking platform on MERN, containerized onto AWS EKS.",
    year: "2023",
    featured: true,
    status: "shipped",
    description: [
      "An hourly car rental platform with three distinct user tiers — anonymous visitors who can browse, standard users who can book, subscription users who get a 40% discount, and admins who manage the fleet.",
      "The deployment side mattered as much as the app: containerized, pushed to a Kubernetes cluster on AWS, and instrumented so problems showed up in CloudWatch instead of in support tickets.",
    ],
    highlights: [
      "End-to-end multi-tiered solution with role-separated permissions and availability-aware booking.",
      "REST APIs with OAuth for authentication, plus a dynamic search bar across bookings.",
      "Docker image deployed to AWS Elastic Kubernetes Service with configured Kubernetes deployments.",
      "AWS CloudWatch wired in for application performance and reliability monitoring.",
    ],
    stack: ["React", "Node.js", "Express", "MongoDB", "OAuth", "Docker", "Kubernetes", "AWS EKS"],
    github: "https://github.com/darshpandya02/Rent-Roll",
    demo: "https://rent-and-roll.vercel.app",
  },
  {
    slug: "webook",
    name: "WeBook",
    tagline: "Hotel booking management system with custom GraphQL APIs.",
    year: "2023",
    featured: false,
    status: "shipped",
    description: [
      "A hotel booking management system with a Django backend and a React frontend, built around a GraphQL API rather than the usual pile of REST endpoints.",
    ],
    highlights: [
      "Django backend handling booking logic, with React driving an interactive UI.",
      "Graphene used to implement custom GraphQL APIs over the booking domain.",
      "MySQL as the datastore, integrated through Django ORM for manipulation and retrieval.",
    ],
    stack: ["Python", "Django", "Graphene", "GraphQL", "React", "MySQL"],
    github: "https://github.com/darshpandya02/Hotel-Booking-Management",
  },
  {
    slug: "fake-stack-overflow",
    name: "Fake Stack Overflow",
    tagline: "Q&A platform clone with tagging, voting and full-text search.",
    year: "2025",
    featured: false,
    status: "shipped",
    description: [
      "A Stack Overflow clone built to spec — questions, answers, tags, votes and search — with the test discipline of a production codebase.",
    ],
    highlights: [
      "Tag-based browsing and full-text search across questions and answers.",
      "MERN stack with an Express API and MongoDB persistence.",
      "Cypress E2E plus Jest unit coverage across the API surface.",
    ],
    stack: ["JavaScript", "React", "Express", "MongoDB", "Jest", "Cypress"],
    github: "https://github.com/darshpandya02/fake-stack-overflow",
    demo: "https://fake-stack-overflow.vercel.app",
  },
  {
    slug: "influencer-insight-dashboard",
    name: "Influencer Insight Dashboard",
    tagline: "GraphQL API and data grid for comparing influencer metrics.",
    year: "2025",
    featured: false,
    status: "shipped",
    description: [
      "A TypeScript monorepo with an Apollo GraphQL API, a shared schema package and a React dashboard, so creators can be sorted and compared in one table instead of read one report at a time.",
    ],
    highlights: [
      "Apollo Server on Express exposing influencer and insight queries, running as a serverless function.",
      "Shared GraphQL types package consumed by both the API and the dashboard.",
      "MUI DataGrid with sorting and filtering across followers, engagement and platform. Data is sample data.",
    ],
    stack: ["TypeScript", "GraphQL", "Apollo", "React", "MUI", "Node.js"],
    github: "https://github.com/darshpandya02/influencer-insight-dashboard",
    demo: "https://influencer-insight-dashboard-darshpandya.vercel.app",
  },
  {
    slug: "customer-support-app",
    name: "Customer Support Chatbot",
    tagline: "Web application fronting an NLP-driven support assistant.",
    year: "2024",
    featured: false,
    status: "shipped",
    description: [
      "A customer support web app backed by a chatbot, built while working through NLP coursework on summarization and generation.",
    ],
    highlights: [
      "Conversational interface over a support knowledge base.",
      "Companion work on text summarization and title generation models.",
    ],
    stack: ["Python", "NLP", "Flask"],
    github: "https://github.com/darshpandya02/CustomerSupportApp",
  },
];

export interface SkillGroup {
  name: string;
  key: string;
  items: string[];
}

export const skills: SkillGroup[] = [
  {
    name: "Languages",
    key: "languages",
    items: ["Python", "TypeScript", "JavaScript", "Java", "Kotlin", "C", "C++", "C#", "PHP", "Bash", "HTML", "CSS"],
  },
  {
    name: "Backend & Frameworks",
    key: "backend",
    items: ["Node.js", "Express", "NestJS", "Spring Boot", "Django", "Flask", "FastAPI", "GraphQL", "REST APIs", "WebSockets"],
  },
  {
    name: "Frontend",
    key: "frontend",
    items: ["React", "Next.js", "Angular", "React Native", "Redux", "NgRx", "RxJS", "TailwindCSS", "Vite"],
  },
  {
    name: "Data",
    key: "data",
    items: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Prisma", "Django ORM"],
  },
  {
    name: "Infrastructure",
    key: "infra",
    items: ["Docker", "Kubernetes", "AWS", "AWS EKS", "GCP", "Azure", "Nginx", "Linux", "CloudWatch"],
  },
  {
    name: "Messaging & Async",
    key: "messaging",
    items: ["Apache Kafka", "RabbitMQ", "Socket.IO", "Sharded Consumers", "Connection Pooling"],
  },
  {
    name: "Tooling & Practice",
    key: "tooling",
    items: ["Git", "GitHub Actions", "Jenkins", "Maven", "Gradle", "Jira", "Jest", "Cypress", "JUnit", "Postman", "Agile/SDLC"],
  },
  {
    name: "Applied ML",
    key: "ml",
    items: ["PyTorch", "TensorFlow", "NLP", "Regression", "Clustering", "Tableau"],
  },
];

export interface Publication {
  title: string;
  venue: string;
  year: string;
  note?: string;
}

export const publications: Publication[] = [
  {
    title: "Building SPHERE: A Public Research Infrastructure for Reproducible Cybersecurity Experimentation",
    venue: "Annual Computer Security Applications Conference (ACSAC 2026)",
    year: "2026",
    note: "Co-author. Describes the architecture and reproducibility guarantees behind SPHERE.",
  },
  {
    title: "Personalized Font Generation using Deep Learning Neural Networks",
    venue: "International Journal for Research in Applied Science and Engineering Technology (IJRASET)",
    year: "2023",
  },
  {
    title: "Classification of Machine and Deep Learning Techniques for Financial Fraud Detection in the Healthcare Industry",
    venue: "IEEE",
    year: "2023",
  },
  {
    title: "Implementation of Hierarchical Clustering Algorithm (HCA) to Displace People from High-Disaster Locations using Wireless Networks",
    venue: "IEEE",
    year: "2023",
  },
];

export interface Education {
  school: string;
  degree: string;
  location: string;
  start: string;
  end: string;
  gpa: string;
  coursework: string[];
}

export const education: Education[] = [
  {
    school: "Northeastern University",
    degree: "M.S. in Computer Science",
    location: "Boston, MA",
    start: "Sep 2023",
    end: "Dec 2025",
    gpa: "3.97 / 4.0",
    coursework: [
      "Program Design Paradigm",
      "Web Development",
      "Algorithms",
      "Mobile App Development",
      "Machine Learning",
      "DBMS",
      "Natural Language Processing",
    ],
  },
  {
    school: "K. J. Somaiya College of Engineering",
    degree: "B.Tech in Information Technology",
    location: "Mumbai, India",
    start: "Aug 2019",
    end: "May 2023",
    gpa: "3.65 / 4.0",
    coursework: [
      "Data Structures",
      "Software Engineering",
      "Cloud Computing",
      "Advanced Databases",
      "Operating Systems",
      "DevOps",
    ],
  },
];

export const featuredProjects = projects.filter((p) => p.featured);

export function projectBySlug(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export const SITE_URL = "https://darshpandya.vercel.app";
