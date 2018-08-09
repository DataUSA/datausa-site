import * as api from "../helpers/api";
import {
  getMeasureMOE,
  getTimeDrilldown,
  getValidDimensions,
  getValidDrilldowns,
  getValidMeasures,
  injectCubeInfoOnMeasure,
  reduceLevelsFromDimension,
  preventHierarchyIncompatibility
} from "../helpers/sorting";

/**
 * Returns the first element in the `haystack` whose `_key` annotation
 * matches the `needle` param. If none found, returns the first element
 * from the `haystack`.
 * @param {string} needle The key to match
 * @param {any[]} haystack The array where to search for the object.
 */
export function findByKeyOrFirst(needle, haystack) {
  return needle
    ? haystack.find(item => item.annotations._key === needle) || haystack[0]
    : haystack[0];
}

/**
 * Retrieves the cube list and prepares the initial state for the first query
 * @param {object} locationQuery An object made from key-string pairs, from the parsing of the current Location.search
 */
export function fetchCubes(locationQuery) {
  return api.cubes().then(cubes => {
    locationQuery = locationQuery || {};
    injectCubeInfoOnMeasure(cubes);

    const measures = getValidMeasures(cubes);
    const firstMeasure = findByKeyOrFirst(locationQuery.ms, measures);
    const firstCubeName = firstMeasure.annotations._cb_name;
    const firstCube = cubes.find(cube => cube.name === firstCubeName);
    const firstMoe = getMeasureMOE(firstCube, firstMeasure);
    const timeDrilldown = getTimeDrilldown(firstCube);

    const dimensions = getValidDimensions(firstCube);
    const drilldowns = getValidDrilldowns(dimensions);

    let drilldown, firstDimension, levels;
    if ("dd" in locationQuery) {
      drilldown = findByKeyOrFirst(locationQuery.dd, drilldowns);
      firstDimension = drilldown.hierarchy.dimension;
      levels = reduceLevelsFromDimension([], firstDimension);
    }
    else {
      firstDimension = dimensions[0];
      levels = reduceLevelsFromDimension([], firstDimension);
      drilldown = levels[0];
    }

    preventHierarchyIncompatibility(drilldowns, drilldown);

    return {
      options: {cubes, measures, dimensions, drilldowns, levels},
      query: {
        cube: firstCube,
        measure: firstMeasure,
        moe: firstMoe,
        dimension: firstDimension,
        drilldown,
        timeDrilldown,
        conditions: []
      },
      queryOptions: {
        parents: drilldown.depth > 1
      }
    };
  });
}

/**
 * Retrieves all the members for a certain Level.
 * @param {Level} level A mondrian-rest-client Level object
 */
export function fetchMembers(level) {
  this.setState({loading: true, members: []}, () =>
    api.members(level).then(members => this.setState({loading: false, members}))
  );
}

/**
 * Retrieves the dataset for the query in the current Vizbuilder state.
 */
export function fetchQuery() {
  const {query, queryOptions} = this.props;
  return api.query({
    ...query,
    options: queryOptions
  });
}
