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

  const measures = response.axes[0].members
    .reduce((obj, member) => (obj[member.name] = member, obj), {});

  const dimensions = response.axis_dimensions.slice(1)
    .reduce((obj, dimension) => (obj[dimension.level] = dimension, obj), {});

  const values = response.axes.map(d => d.members)
    .reduce((obj, members) => {
      obj[members[0].level_name] = members
        .reduce((obj2, member) => (obj2[member.name] = member, obj2), {});
      return obj;
    }, {});

  return {data, dimensions, measures, values};

};
