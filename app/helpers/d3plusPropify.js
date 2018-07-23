import {assign} from "d3plus-common";
import {parse} from "utils/FUNC";

export default (logic, formatters = {}, variables = {}) => {

  const config = parse({vars: ["variables"], logic}, formatters)(variables);

  // strip out the "dataFormat" from config
  const dataFormat = config.dataFormat ? config.dataFormat : d => d.data;
  delete config.dataFormat;

  // hides the non-discrete axis, if necessary
  const discrete = config.discrete || "x";
  const opposite = discrete === "x" ? "y" : "x";
  config[`${discrete}Config`] = assign({}, config[`${discrete}Config`] || {}, {
    gridConfig: {
      "stroke-width": 0
    },
    tickSize: 0
  });
  config[`${opposite}Config`] = assign({}, config[`${opposite}Config`] || {}, {
    barConfig: {
      "stroke-width": 0
    }
  });

  return {config, dataFormat};

};
