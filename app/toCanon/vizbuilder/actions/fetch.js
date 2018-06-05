import * as api from "../helpers/api";
import {getValidDrilldowns, addTimeDrilldown} from "../helpers/sorting";

/**
 * These functions should be handled/called with `this`
 * as the component where they are used.
 */

export function fetchCubes() {
  return api
    .cubes()
    .then(cubes => {
      const firstCube = cubes.find(cube => cube.name === "usa_spending_v2");
      const measures = cubes.reduce((sum, cube) => {
        for (const measure of cube.measures) {
          measure.annotations._cube = cube.name;
          measure.annotations._cubeName = cube.annotations.source_name || cube.name;
          sum.push(measure);
        }
        return sum;
      }, []);
      const levels = getValidDrilldowns(firstCube);
      const drilldowns = addTimeDrilldown(levels.slice(0, 1), firstCube);

      return {
        options: {cubes, measures, levels},
        query: {
          cube: firstCube,
          measure: firstCube.measures[0],
          drilldowns
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
