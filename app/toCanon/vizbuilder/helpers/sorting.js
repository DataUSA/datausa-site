import sort from "fast-sort";
import union from "lodash/union";
import {unique} from "shorthash";

/**
 * Checks if the dimension passed as argument is a time-type dimension.
 * @param {Dimension} dimension A mondrian-rest-client dimension object
 * @returns {boolean}
 */
export function isTimeDimension(dimension) {
  return (
    dimension.dimensionType === 1 ||
    dimension.name === "Date" ||
    dimension.name === "Year"
  );
}

/**
 * Prepares the array of cubes that will be used in the vizbuilder.
 * Specifically, filters the cubes that aren't for public use, and injects
 * information about the parent cube into the annotations of its measures
 * and levels.
 * @param {Cube[]} cubes An array of cubes. This array is modified in place.
 */
export function injectCubeInfoOnMeasure(cubes) {
  let nCbs = cubes.length;
  while (nCbs--) {
    const cube = cubes[nCbs];

    if (cube.annotations.hide_in_ui) {
      cubes.splice(nCbs, 1);
      continue;
    }

    const cbName = cube.caption || cube.name;
    const cbTopic = cube.annotations.topic;
    const cbSubtopic = cube.annotations.subtopic;
    const selectorKey = `${cbTopic}_${cbSubtopic}_`;
    const sortKey = sortSlice(selectorKey);
    const sourceName = cube.annotations.source_name;

    cube.annotations._key = unique(cbName);

    let nMsr = cube.measures.length;
    while (nMsr--) {
      const measure = cube.measures[nMsr];
      const annotations = measure.annotations;

      annotations._key = unique(`${cbName} ${measure.name}`);
      annotations._cb_name = cbName;
      annotations._cb_topic = cbTopic;
      annotations._cb_subtopic = cbSubtopic;
      annotations._cb_sourceName = sourceName;
      annotations._selectorKey =
        selectorKey + (measure.caption || measure.name);
      annotations._sortKey = `${sortKey}${measure.caption ||
        measure.name}`.toLowerCase();
    }

    let nDim = cube.dimensions.length;
    while (nDim--) {
      const dimension = cube.dimensions[nDim];
      const keyPrefix = `${cbName} ${dimension.name} `;

      let nHie = dimension.hierarchies.length;
      while (nHie--) {
        const hierarchy = dimension.hierarchies[nHie];

        let nLvl = hierarchy.levels.length;
        while (nLvl--) {
          const level = hierarchy.levels[nLvl];

          level.annotations._key = unique(keyPrefix + level.name);
        }
      }
    }
  }
}

/**
 * Reduces a list of cubes to the measures that will be used in the vizbuilder.
 * @param {Cube[]} cubes An array of the cubes to be reduced.
 * @returns {Measure[]}
 */
export function getValidMeasures(cubes) {
  cubes = [].concat(cubes);
  const measures = [];

  let nCbs = cubes.length;
  while (nCbs--) {
    const cube = cubes[nCbs];
    let nMsr = cube.measures.length;
    while (nMsr--) {
      const measure = cube.measures[nMsr];
      const key = measure.annotations.error_for_measure;
      if (key === undefined) {
        measures.push(measure);
      }
    }
  }

  return sort(measures).asc(a => a.annotations._selectorKey);
}

/**
 * Returns the MOE measure for a certain measure, in the full measure list
 * from the cube. If there's no MOE for the measure, returns undefined.
 * @param {Cube} cube The measure's parent cube
 * @param {*} measure The measure
 * @returns {Measure|undefined}
 */
export function getMeasureMOE(cube, measure) {
  const measureName = RegExp(measure.name, "i");

  if (cube.measures.indexOf(measure) > -1) {
    let nMsr = cube.measures.length;
    while (nMsr--) {
      const currentMeasure = cube.measures[nMsr];

      const key = currentMeasure.annotations.error_for_measure;
      if (key && measureName.test(key)) {
        return currentMeasure;
      }
    }
  }

  return undefined;
}

/**
 * Returns an array with non-time dimensions from a cube.
 * @param {Cube} cube The cube where the dimensions will be reduced from
 * @returns {Dimension[]}
 */
export function getValidDimensions(cube) {
  return cube.dimensions.filter(dim => !isTimeDimension(dim));
}

/**
 * Extracts the levels from non-time dimensions, to be used as drilldowns.
 * @param {Dimension[]} dimensions The dimensions where to extract levels from.
 * @returns {Level[]}
 */
export function getValidDrilldowns(dimensions) {
  return dimensions.reduce(reduceLevelsFromDimension, []);
}

/**
 * Modifies the `array`, removing the Level elements that would cause an
 * incompatibility problem in a cut if queried with the `interestLevel` as
 * a drilldown.
 * @param {Level[]} array An array of mondrian-rest-client Levels
 * @param {Level} interestLevel The Level to test by hierarchy incompatibility
 */
export function preventHierarchyIncompatibility(array, interestLevel) {
  const interestHierarchy = interestLevel.hierarchy;

  let n = array.length;
  while (n--) {
    const level = array[n];
    if (
      level.hierarchy === interestHierarchy &&
      level.depth > interestLevel.depth
    ) {
      array.splice(n, 1);
    }
  }
}

/**
 * A function to be reused in the `Array.prototype.reduce` method, to obtain
 * the valid Level elements from an array of Dimension elements.
 * @param {Dimension[]} container The target array to save the reduced elements
 * @param {Dimension} dimension The current Dimension in the iteration
 * @returns {Dimension[]}
 */
export function reduceLevelsFromDimension(container, dimension) {
  return isTimeDimension(dimension)
    ? container
    : dimension.hierarchies.reduce((container, hierarchy) => container.concat(hierarchy.levels.slice(1)), container);
}

/**
 * Adds a Level object to a list of Level objects, and removes duplicate elements.
 * @param {Level[]} array Target Level array
 * @param {Level} drilldown Level object to add
 */
export function joinDrilldownList(array, drilldown) {
  array = array.filter(dd => dd.hierarchy !== drilldown.hierarchy);
  drilldown = [].concat(drilldown || []);
  return sort(union(array, drilldown)).asc(
    a => a.hierarchy.dimension.dimensionType
  );
}

/**
 * Extracts a time-type Dimension from a Cube object. If not found,
 * returns undefined.
 * @param {Cube} cube The Cube object to extract the time Dimension from
 * @returns {Dimension|undefined}
 */
export function getTimeDrilldown(cube) {
  const timeDim =
    cube.timeDimension ||
    cube.dimensionsByName.Date ||
    cube.dimensionsByName.Year;
  if (timeDim) {
    const timeHie = timeDim.hierarchies.slice(-1).pop();
    if (timeHie) {
      return timeHie.levels.slice(1, 2).pop();
    }
  }
  return undefined;
}

/**
 * For a drilldown, generates a standard name format to use in selectors.
 * @param {Level|Measure} item A Level or Measure object
 * @returns {string}
 */
export function composePropertyName(item) {
  let txt = item.name;
  if ("hierarchy" in item) {
    const hname = item.hierarchy.name;
    const dname = item.hierarchy.dimension.name;
    if (hname !== item.name && hname !== dname) {
      txt = `${item.hierarchy.name} › ${txt}`;
    }
    if (dname !== item.name) {
      txt = `${dname} › ${txt}`;
    }
  }
  return txt;
}

/**
 * Returns an object where the keys are the current query's drilldowns
 * and its values are arrays with the values available in the current dataset.
 * @param {Query} query A mondrian-rest-client Query object
 * @param {Array<any>} dataset The result dataset for the query object passed along.
 */
export function getIncludedMembers(query, dataset) {
  if (dataset.length) {
    return query.getDrilldowns().reduce((members, dd) => {
      const key = dd.name;
      const set = {};

      let n = dataset.length;
      while (n--) {
        const value = dataset[n][key];
        set[value] = 0;
      }

      members[key] = Object.keys(set).sort();
      return members;
    }, {});
  }
  else {
    return {};
  }
}

/**
 * Generates a string that can be used as index to sort elements.
 * @param {string} string The string to slice
 * @returns {string}
 */
export function sortSlice(string) {
  string = `${string}`.replace(/\W/g, "").toLowerCase();
  return `${string.slice(0, 5)}-----`.slice(0, 6);
}

/**
 * Generates a sorting function to be used in `Array.prototype.sort`,
 * based on a certain key.
 * @param {string} key The key to the property to be used as comparison string
 */
export function sortByCustomKey(key) {
  return (a, b) => `${a[key]}`.localeCompare(`${b[key]}`);
}
