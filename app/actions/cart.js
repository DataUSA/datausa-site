import localforage from "localforage";
import {assign} from "d3plus-common";

const defaultCart = {
  settings: [
    {key: "pivotYear", value: true, label: "Pivot Years to Columns"},
    {key: "showMOE", value: false, label: "Show Margin of Error"}
  ],
  data: []
};

/** */
function updateCart(data) {
  return {type: "CART_FULFILLED", data};
}

/** */
export function fetchCart() {
  return function(dispatch, getState) {
    const cartKey = getState().env.CART;
    return localforage.getItem(cartKey)
      .then(cart => {
        if (!cart) cart = defaultCart;
        dispatch(updateCart(cart));
      });

  };
}

/** */
export function removeFromCart(d) {
  return function(dispatch, getState) {

    const state = getState();
    const cartKey = state.env.CART;
    const cart = assign({}, state.cart);

    const build = cart.data.find(c => c.slug === d.slug);
    cart.data.splice(cart.data.indexOf(build), 1);

    return localforage.setItem(cartKey, cart)
      .then(() => dispatch(updateCart(cart)));

  };
}

/** */
export function addToCart(build) {
  return function(dispatch, getState) {

    const state = getState();
    const cartKey = state.env.CART;
    const cart = assign({}, state.cart);

    cart.data.push(build);

    return localforage.setItem(cartKey, cart)
      .then(() => dispatch(updateCart(cart)));

  };
}

/** */
export function clearCart() {
  return function(dispatch, getState) {

    const state = getState();
    const cartKey = state.env.CART;
    const cart = assign({}, state.cart);

    const newCart = {...cart, data: []};

    return localforage.setItem(cartKey, newCart)
      .then(() => dispatch(updateCart(newCart)));

  };
}

/** */
export function toggleCartSetting(key) {
  return function(dispatch, getState) {

    const state = getState();
    const cartKey = state.env.CART;
    const cart = assign({}, state.cart);

    const setting = cart.settings.find(d => d.key === key);
    const newSetting = assign({}, setting);
    newSetting.value = !setting.value;
    cart.settings[cart.settings.indexOf(setting)] = newSetting;

    return localforage.setItem(cartKey, cart)
      .then(() => dispatch(updateCart(cart)));

  };
}
