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
  },
  {
    slug: "bsds",
    name: "BSDS — Building Scalable Distributed Systems",
    tagline: "Load-tested multi-threaded clients, message queues and sharded consumers.",
    year: "2025",
    featured: true,
    status: "shipped",
    description: [
      "A working lab for the question every backend engineer eventually hits: what actually breaks first when you point thousands of concurrent clients at a service?",
      "Multi-threaded load clients drive traffic at a server tier that buffers through a message queue into sharded consumers, so throughput and failure behaviour can be measured rather than guessed at.",
    ],
    highlights: [
      "Multi-threaded load-generating clients with instrumented latency percentiles and throughput reporting.",
      "RabbitMQ between the request tier and the consumer tier so bursts are absorbed instead of dropped.",
      "Sharded consumers to parallelize processing without contending on a single hot partition.",
      "Benchmarked across client counts to find the point where added concurrency stops buying throughput.",
    ],
    stack: ["C++", "Java", "RabbitMQ", "Multithreading", "Load Testing"],
    github: "https://github.com/darshpandya02/BSDS",
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
    tagline: "Full-stack dashboard surfacing metrics from health data streams.",
    year: "2025",
    featured: false,
    status: "shipped",
    description: [
      "A full-stack application that ingests health and wearable data and renders it as a dashboard of trends rather than a wall of raw readings.",
    ],
    highlights: [
      "Python backend handling ingestion, aggregation and time-windowed metric computation.",
      "Charted frontend for trend inspection across arbitrary date ranges.",
    ],
    stack: ["Python", "Django", "React", "PostgreSQL"],
    github: "https://github.com/darshpandya02/health-dashboard",
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
  },
  {
    slug: "influencer-insight-dashboard",
    name: "Influencer Insight Dashboard",
    tagline: "Analytics surface for influencer campaign performance.",
    year: "2025",
    featured: false,
    status: "shipped",
    description: [
      "A dashboard that pulls influencer campaign metrics into one view so the numbers can be compared across creators instead of read one report at a time.",
    ],
    highlights: [
      "TypeScript frontend with charted engagement and reach metrics.",
      "Comparative views across creators and campaigns.",
    ],
    stack: ["TypeScript", "React", "Node.js"],
    github: "https://github.com/darshpandya02/influencer-insight-dashboard",
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
