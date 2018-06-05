import union from "lodash/union";

function isTimeDimension(dimension) {
  return dimension.dimensionType === 1 || dimension.name === "Date";
}

export function getValidDrilldowns(cube) {
  return cube.dimensions.reduce(flattenDimensions, []);
}

export function flattenDimensions(container, dimension) {
  return isTimeDimension(dimension)
    ? container
    : dimension.hierarchies.reduce(flattenHierarchies, container);
}

export function flattenHierarchies(container, hierarchy) {
  return container.concat(hierarchy.levels.slice(1));
}

export function joinDrilldownList(array, drilldown) {
  array = array.filter(dd => dd.hierarchy !== drilldown.hierarchy);
  drilldown = [].concat(drilldown || []);
  return union(array, drilldown).sort(
    (a, b) =>
      a.hierarchy.dimension.dimensionType - b.hierarchy.dimension.dimensionType
  );
}

export function addTimeDrilldown(array, cube) {
  const timeDim = cube.timeDimension || cube.dimensionsByName.Date;
  if (timeDim) {
    const timeHie = timeDim.hierarchies.slice(-1).pop();
    if (timeHie) {
      const timeDrilldown = timeHie.levels.slice(1, 2);
      array = joinDrilldownList(array, timeDrilldown);
    }
  }
  return array;
}
