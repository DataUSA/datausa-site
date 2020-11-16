import {cmsReducer} from "@datawheel/canon-cms";
import {vizbuilderMiddleware, vizbuilderReducer} from "@datawheel/canon-vizbuilder";

export const reducers = {
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
  vizbuilder: vizbuilderReducer
};

export const middleware = [vizbuilderMiddleware];

export const initialState = {};
