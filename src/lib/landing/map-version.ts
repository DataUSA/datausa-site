/**
 * Part of every landing map's address (`/api/landing/map?…&v=2`). Browsers keep a map's data for
 * an hour: raise this whenever what a map address answers changes shape (a state's universities
 * went from a map of states to points), so a page never reads the old answer.
 */
export const LANDING_MAP_VERSION = 4;
