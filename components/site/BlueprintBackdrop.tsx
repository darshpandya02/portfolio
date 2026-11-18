/**
 * Backdrop for the Writing section: a blueprint grid with a small cluster
 * topology drawn on it. FxRuntime scales the wrapper as the section scrolls,
 * so the zoom heads into the dense cluster near the centre.
 */

type Node = { x: number; y: number; r: number; hub: boolean };

const W = 1600;
const H = 1000;

// Small seeded PRNG so server and client render the same picture.
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

function buildTopology() {
  const rand = rng(7);
  const nodes: Node[] = [];
  // Outer ring of sparse nodes, then a tighter cluster around the zoom origin.
  for (let i = 0; i < 46; i++) {
    nodes.push({ x: 40 + rand() * (W - 80), y: 40 + rand() * (H - 80), r: 2, hub: false });
  }
  const cx = W * 0.5;
  const cy = H * 0.46;
  for (let i = 0; i < 26; i++) {
    const a = rand() * Math.PI * 2;
    const d = 30 + Math.pow(rand(), 0.8) * 240;
    nodes.push({ x: cx + Math.cos(a) * d * 1.4, y: cy + Math.sin(a) * d, r: 2.2, hub: false });
  }
  // Five "leader" hubs in the middle.
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.4;
    nodes.push({ x: cx + Math.cos(a) * 70, y: cy + Math.sin(a) * 48, r: 4, hub: true });
  }

  // Link every node to its two nearest neighbours, hubs to each other.
  const seen = new Set<string>();
  const links: [Node, Node][] = [];
  const add = (a: number, b: number) => {
    const k = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (a === b || seen.has(k)) return;
    seen.add(k);
    links.push([nodes[a], nodes[b]]);
  };
  nodes.forEach((n, i) => {
    nodes
      .map((m, j) => ({ j, d: (m.x - n.x) ** 2 + (m.y - n.y) ** 2 }))
      .sort((p, q) => p.d - q.d)
      .slice(1, 3)
      .forEach(({ j }) => add(i, j));
  });
  const hubStart = nodes.length - 5;
  for (let i = 0; i < 5; i++) add(hubStart + i, hubStart + ((i + 1) % 5));
  return { nodes, links };
}

const { nodes, links } = buildTopology();

export default function BlueprintBackdrop() {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      aria-hidden
    >
      <defs>
        <pattern id="bp-minor" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="rgb(156 195 255 / 0.06)" strokeWidth="1" />
        </pattern>
        <pattern id="bp-major" width="100" height="100" patternUnits="userSpaceOnUse">
          <rect width="100" height="100" fill="url(#bp-minor)" />
          <path d="M100 0H0V100" fill="none" stroke="rgb(156 195 255 / 0.12)" strokeWidth="1" />
        </pattern>
        <radialGradient id="bp-glow" cx="50%" cy="46%" r="40%">
          <stop offset="0%" stopColor="rgb(110 168 254 / 0.22)" />
          <stop offset="100%" stopColor="rgb(110 168 254 / 0)" />
        </radialGradient>
      </defs>

      <rect width={W} height={H} fill="url(#bp-major)" />
      <rect width={W} height={H} fill="url(#bp-glow)" />

      {/* Registration marks, like a drafting sheet. */}
      <g stroke="rgb(156 195 255 / 0.25)" strokeWidth="1">
        <path d={`M${W / 2} ${H * 0.46 - 14}V${H * 0.46 + 14}M${W / 2 - 14} ${H * 0.46}H${W / 2 + 14}`} />
        <circle cx={W / 2} cy={H * 0.46} r="150" fill="none" strokeDasharray="3 6" />
        <circle cx={W / 2} cy={H * 0.46} r="320" fill="none" strokeDasharray="2 10" opacity="0.6" />
      </g>

      <g stroke="rgb(156 195 255 / 0.22)" strokeWidth="1">
        {links.map(([a, b], i) => (
          <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
        ))}
      </g>
      <g>
        {nodes.map((n, i) =>
          n.hub ? (
            <g key={i}>
              <circle cx={n.x} cy={n.y} r={n.r + 5} fill="none" stroke="rgb(156 195 255 / 0.35)" />
              <circle cx={n.x} cy={n.y} r={n.r} fill="#c7dcff" />
            </g>
          ) : (
            <circle key={i} cx={n.x} cy={n.y} r={n.r} fill="rgb(156 195 255 / 0.55)" />
          ),
        )}
      </g>
    </svg>
  );
}
