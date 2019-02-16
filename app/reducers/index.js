/**
  The object exported by this file should contain reducers to be
  combined with the internal default canon reducers.
*/

export default {
  cart: (state = false, action) => {
    switch (action.type) {
      case "CART_FULFILLED":
        return action.data;
      default: return state;
    }
  }
};
