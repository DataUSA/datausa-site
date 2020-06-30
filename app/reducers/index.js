import {cmsReducer} from "@datawheel/canon-cms";
// import {vizbuilderReducer} from "@datawheel/canon-vizbuilder";
import {vbStateReducer} from "@datawheel/canon-vizbuilder";

export default {
  cart: (state = false, action) => {
    switch (action.type) {
      case "CART_FULFILLED":
        return action.data;
      default: return state;
    }
  },
  cms: cmsReducer,
  title: (state = false, action) => {
    switch (action.type) {
      case "TITLE_UPDATE":
        return action.data;
      default: return state;
    }
  },
  vizbuilder: vbStateReducer
};
