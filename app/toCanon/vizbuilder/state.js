/**
 * Generates a new, empty initial state for the whole Vizbuilder.
 */
export default function initialStateFactory() {
  return {
    load: {
      inProgress: false,
      total: 0,
      done: 0,
      error: undefined,
      severity: -1
    },
    query: {
      conditions: [],
      cube: null,
      dimension: null,
      drilldown: null,
      measure: null,
      moe: null,
      limit: undefined,
      locale: "en",
      offset: undefined,
      order: undefined,
      orderDesc: undefined,
      timeDrilldown: null
    },
    // This object is later combined into `query` as part of the query building
    queryOptions: {
      nonempty: true,
      distinct: false,
      parents: false,
      debug: false,
      sparse: true
    },
    options: {
      // All cubes retrieved initially
      cubes: [],
      // All non-time Dimensions for the cube which owns the current measure
      dimensions: [],
      // All valid levels from the `dimensions` array
      levels: [],
      // All non-time Levels that can be used as Cuts for the current query
      drilldowns: [],
      // All valid measures (not MoEs) from all the cubes retrieved
      measures: [],
      // ??
      members: []
    },
    dataset: [],
    members: {},
    meta: {}
  };
}
