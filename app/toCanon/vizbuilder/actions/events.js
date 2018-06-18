import OPERATORS from "../helpers/operators";
import {makeRandomId} from "../helpers/random";
import {
  getMeasureMOE,
  getTimeDrilldown,
  getValidDimensions,
  reduceLevelsFromDimension
} from "../helpers/sorting";

/*
 * These functions are event handlers for multiple components.
 * Treat them as they were defined within the component itself.
 * The `this` element is the active instance of said component.
 */

export function setMeasure(measure) {
  const {options, query} = this.props;
  const {loadWrapper, stateUpdate} = this.context;

  return loadWrapper(() => {
    const cubeName = measure.annotations._cb_name;
    const cube = options.cubes.find(cube => cube.name === cubeName);
    const moe = getMeasureMOE(cube, measure);
    const timeDrilldown = getTimeDrilldown(cube);

    const dimensions = getValidDimensions(cube);
    const dimension = dimensions[0];

    const levels = reduceLevelsFromDimension([], dimension);
    const drilldown = levels[0];

    const conditions = query.cube === cube ? query.conditions : [];

    return stateUpdate({
      options: {dimensions, levels},
      query: {cube, measure, moe, dimension, drilldown, timeDrilldown, conditions}
    });
  }, this.fetchQuery);
}

export function setDimension(dimension) {
  const {loadWrapper, stateUpdate} = this.context;

  return loadWrapper(() => {
    const levels = reduceLevelsFromDimension([], dimension);
    const drilldown = levels[0];

    return stateUpdate({
      options: {levels},
      query: {dimension, drilldown}
    });
  }, this.fetchQuery);
}

// export function addDrilldown(level) {
//   const {options, query} = this.props;
//   const {loadWrapper, stateUpdate} = this.context;

//   if (options.levels.indexOf(level) > -1) {
//     return loadWrapper(() => {
//       const drilldowns = joinDrilldownList(query.drilldowns, level);
//       return stateUpdate({query: {drilldowns}});
//     }, this.fetchQuery);
//   }

//   return undefined;
// }

export function setDrilldown(level) {
  const {options} = this.props;
  const {loadWrapper, stateUpdate} = this.context;

  if (options.levels.indexOf(level) > -1) {
    return loadWrapper(() => {
      const drilldown = level;
      return stateUpdate({query: {drilldown}});
    }, this.fetchQuery);
  }

  return undefined;
}

// export function removeDrilldown(levelName) {
//   const {options, query} = this.props;
//   const {stateUpdate} = this.context;

//   levelName = levelName.split(" › ").pop();
//   const level = options.levels.find(lvl => lvl.name === levelName);

//   if (level && !(/\[date\]/i).test(level.fullName)) {
//     const drilldowns = query.drilldowns.filter(lvl => lvl !== level);
//     stateUpdate({query: {drilldowns}}).then(this.fetchQuery);
//   }
// }

export function addCondition() {
  const {conditions} = this.props.query;
  const {loadWrapper, stateUpdate} = this.context;

  loadWrapper(() => {
    const newConditions = [].concat(conditions, {
      hash: makeRandomId(),
      operator: OPERATORS.EQUAL,
      property: "",
      type: "cut",
      values: []
    });
    return stateUpdate({query: {conditions: newConditions}});
  }, this.fetchQuery);
}

export function updateCondition(condition) {
  const {conditions} = this.props.query;
  const {loadWrapper, stateUpdate} = this.context;

  const index = conditions.findIndex(cond => cond.hash === condition.hash);

  if (index > -1) {
    loadWrapper(() => {
      const newConditions = conditions.slice();
      newConditions.splice(index, 1, condition);
      return stateUpdate({query: {conditions: newConditions}});
    }, this.fetchQuery);
  }
}

export function removeCondition(condition) {
  const {conditions} = this.props.query;
  const {loadWrapper, stateUpdate} = this.context;

  const newConditions = conditions.filter(cond => cond.hash !== condition.hash);

  if (newConditions.length < conditions.length) {
    loadWrapper(
      () => stateUpdate({query: {conditions: newConditions}}),
      this.fetchQuery
    );
  }
}
