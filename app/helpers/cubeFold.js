import {zip} from "d3-array";

function flattenDrilldowns(levels, values) {
  levels = levels.slice();
  const level = levels.pop().members;
  if (levels.length > 0) {
    // DRILLDOWNS
    return zip(level, values)
      .reduce((arr, member) => {

        let axis = member[0];
        const value = flattenDrilldowns(levels, member[1]);

        value.forEach(item => {
          item[axis.level_name] = axis.name;
        });

        axis = null;

        return arr.concat(value);

      }, []);
  }
  else {
    // MEASURES
    return [
      values
        .reduce((all, value, index) => {
          if (!isNaN(value)) {
            const key = level[index].name;
            all[key] = value;
          }
          return all;
        }, {})
    ];
  }
}

export default response => {
  const data = flattenDrilldowns(response.axes, response.values);
  return {data};
};
