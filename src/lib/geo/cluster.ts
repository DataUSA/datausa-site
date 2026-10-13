/**
 * Greedy clustering for point maps (the search page's places and school districts). The heaviest
 * unclaimed point becomes a seed and claims every unclaimed point within `radius` of it; a seed with
 * enough of them is a cluster, drawn where the seed is, and the rest stay single points. Seeding by
 * weight puts a cluster on its largest member (the city, not the middle of its suburbs) and keeps
 * the result free of the lattice a plain grid produces. The outcome depends only on the points and
 * the radius, so it can be computed once per zoom step and reused while panning.
 */
export interface PointCluster {
  /** Index of the point the cluster is drawn on: its heaviest member. */
  seed: number;
  /** Indices of every member, the seed included. */
  members: number[];
}

export interface Clustered {
  singles: number[];
  clusters: PointCluster[];
}

const OFFSET = 1 << 20;
const cellKey = (gx: number, gy: number) => (gx + OFFSET) * (OFFSET * 2) + gy + OFFSET;

/**
 * @param xs,ys positions; points with a NaN coordinate are left out of the result
 * @param weights what makes a point a better seed (population); without, points in crowded spots seed first
 * @param radius how far a seed reaches, in the units of `xs`/`ys`; zero or less keeps every point single
 * @param keep a seed with at most this many points in reach, itself included, stays a single point
 */
export function clusterPoints(xs: ArrayLike<number>, ys: ArrayLike<number>, weights: ArrayLike<number | null> | null | undefined, radius: number, keep = 3): Clustered {
  const order: number[] = [];
  for (let i = 0; i < xs.length; i++) if (!Number.isNaN(xs[i]) && !Number.isNaN(ys[i])) order.push(i);
  if (!(radius > 0)) return {singles: order, clusters: []};

  // cells as wide as the reach: everything a seed can claim is in its cell or one of the eight around it
  const cells = new Map<number, number[]>();
  const gx = (i: number) => Math.floor(xs[i] / radius), gy = (i: number) => Math.floor(ys[i] / radius);
  for (const i of order) {
    const key = cellKey(gx(i), gy(i));
    const cell = cells.get(key);
    if (cell) cell.push(i);
    else cells.set(key, [i]);
  }
  const weight = weights
    ? (i: number) => weights[i] ?? 0
    : (i: number) => (cells.get(cellKey(gx(i), gy(i))) as number[]).length;
  order.sort((a, b) => weight(b) - weight(a) || a - b);

  const claimed = new Uint8Array(xs.length);
  const singles: number[] = [];
  const clusters: PointCluster[] = [];
  const reach = radius * radius;
  for (const seed of order) {
    if (claimed[seed]) continue;
    const members = [seed];
    const cx = gx(seed), cy = gy(seed);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const cell = cells.get(cellKey(cx + dx, cy + dy));
        if (!cell) continue;
        for (const i of cell) {
          if (i !== seed && !claimed[i] && (xs[i] - xs[seed]) ** 2 + (ys[i] - ys[seed]) ** 2 <= reach) members.push(i);
        }
      }
    }
    claimed[seed] = 1;
    if (members.length <= keep) { singles.push(seed); continue; }
    for (const i of members) claimed[i] = 1;
    clusters.push({seed, members});
  }
  return {singles, clusters};
}
