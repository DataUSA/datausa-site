import * as api from "../helpers/api";
import {
  reduceLevelsFromDimension,
  getMeasureMOE,
  getTimeDrilldown,
  getValidMeasures,
  injectCubeInfoOnMeasure,
  getValidDimensions
} from "../helpers/sorting";

/**
 * These functions should be handled/called with `this`
 * as the component where they are used.
 */

export function fetchCubes() {
  return api
    .cubes()
    .then(cubes => {
      injectCubeInfoOnMeasure(cubes);

      const measures = getValidMeasures(cubes);
      const firstMeasure = measures.find(d => d.name === "Millions Of Dollars");
      const firstCubeName = firstMeasure.annotations._cb_name;
      const firstCube = cubes.find(cube => cube.name === firstCubeName);
      const firstMoe = getMeasureMOE(firstCube, firstMeasure);
      const timeDrilldown = getTimeDrilldown(firstCube);

      const dimensions = getValidDimensions(firstCube);
      const firstDimension = dimensions[0];

      const levels = reduceLevelsFromDimension([], firstDimension);
      const drilldown = levels[0];

      return {
        options: {cubes, measures, dimensions, levels},
        query: {
          cube: firstCube,
          measure: firstMeasure,
          moe: firstMoe,
          dimension: firstDimension,
          drilldown,
          timeDrilldown,
          conditions: []
        }
      };
    })
    .then(this.context.stateUpdate);
}

export function fetchMembers(level) {
  return api.members(level).then(members => this.setState({members}));
}

export function fetchQuery() {
  const {query} = this.props;
  const {datasetUpdate} = this.context;

  return api.query(query).then(result => {
    const data = result.data || {};
    return datasetUpdate(data.data);
  });
}
