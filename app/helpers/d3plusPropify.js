import {assign} from "d3plus-common";
import {parse} from "utils/FUNC";

export default (logic, formatters = {}, variables = {}, id = false) => {

  let config;
  // The logic provided might be malformed. Wrap it in a try/catch to be sure we don't
  // crash / RSOD whatever page is making use of propify.
  try {
    config = parse({vars: ["variables"], logic}, formatters)(variables);
  }
  // If the javascript fails, return a special error object for the front-end to use.
  catch (e) {
    console.error(`Parsing Error in propify${id !== false ? ` (${id})` : ""}: ${e}`);
    return {error: `${e}`};
  }

  // strip out the "dataFormat" from config
  const dataFormat = config.dataFormat ? config.dataFormat : d => d.data;
  delete config.dataFormat;

  // hides the non-discrete axis, if necessary
  const discrete = config.discrete || "x";
  const opposite = discrete === "x" ? "y" : "x";

  config[`${discrete}Config`] = assign({
    gridConfig: {
      "stroke-width": 0
    },
    tickSize: 0
  }, config[`${discrete}Config`] || {});
  config[`${discrete}2Config`] = assign({},
    config[`${discrete}Config`],
    config[`${discrete}2Config`] || {});

  config[`${opposite}Config`] = assign({
    barConfig: {
      "stroke-width": 0
    }
  }, config[`${opposite}Config`] || {});
  config[`${opposite}2Config`] = assign({},
    config[`${opposite}Config`],
    config[`${opposite}2Config`] || {});

  return {config, dataFormat};

};
