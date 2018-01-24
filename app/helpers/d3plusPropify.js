import {assign} from "d3plus-common";
import cubeFold from "./cubeFold";

export default config => {

  const configClone = {...config};

  // strip out the "dataFormat" from config
  let {dataFormat} = configClone;
  if (!dataFormat) dataFormat = data => cubeFold(data).data;
  delete configClone.dataFormat;

  // hides the non-discrete axis, if necessary
  const discrete = configClone.discrete || "x";
  const opposite = discrete === "x" ? "y" : "x";
  configClone[`${discrete}Config`] = assign({}, configClone[`${discrete}Config`] || {}, {
    gridConfig: {
      "stroke-width": 0
    },
    tickSize: 0
  });
  configClone[`${opposite}Config`] = assign({}, configClone[`${opposite}Config`] || {}, {
    barConfig: {
      "stroke-width": 0
    }
  });

  return {config: configClone, dataFormat};

};
