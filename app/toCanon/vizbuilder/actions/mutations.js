/* HELPER FUNCTIONS */

/**
 * Promisified `this.setState` function.
 *
 * Useful to trigger context updates and renderings after an state update,
 * all keeping a tidy promise chain.
 * Should always be handled with `Function.bind` and `Function.call` calls.
 * @param {object|Function} newState
 * @returns {Promise<void>}
 */
function setStatePromise(newState) {
  return new Promise(resolve => {
    this.setState(newState, resolve);
  });
}

/**
 * Promisified rejection catcher for the loadCycle helper.
 *
 * @param {number} n The number of loading elements this error covers.
 * @param {Error} err The catched error object.
 */
function setStateFetchError(n, err) {
  return setStatePromise.call(this, state => {
    const stillLoading = state.load.done + n !== state.load.total;
    return {
      load: {
        inProgress: stillLoading,
        total: stillLoading ? state.load.total : 0,
        done: stillLoading ? state.load.done + n : 0,
        error: err
      }
    };
  });
}

/*
 * These functions belong to the Vizbuilder component.
 * Treat them as they were defined within the component itself.
 * The `this` element is the active instance of Vizbuilder.
 */

export function loadCycle(n) {
  n = n || 1;
  return {
    start: setStatePromise.bind(this, state => ({
      load: {
        ...state.load,
        inProgress: true,
        total: state.load.total + n
      }
    })),
    resolved: setStatePromise.bind(this, state => ({
      load: {
        ...state.load,
        done: state.load.done + 1
      }
    })),
    rejected: setStateFetchError.bind(this, n),
    finish: setStatePromise.bind(this, state => ({
      load: {
        ...state.load,
        inProgress: false,
        total: 0,
        done: 0,
        error: null
      }
    }))
  };
}

export function loadWrapper(...funcs) {
  const load = loadCycle.call(this, funcs.length);
  let promise = load.start();

  for (const func of funcs) {
    promise = promise.then(func).then(load.resolved);
  }

  return promise.then(null, load.rejected).then(load.finish);
}

export function stateUpdate(newState) {
  return setStatePromise.call(this, state => {
    const finalState = {};
    const keys = Object.keys(newState);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      finalState[key] = {
        ...state[key],
        ...newState[key]
      };
    }

    return finalState;
  });
}

export function loadUpdate(newLoad) {
  return setStatePromise.call(this, state => ({
    load: {
      ...state.load,
      ...newLoad
    }
  }));
}

export function queryUpdate(newQuery) {
  return setStatePromise.call(this, state => ({
    query: {
      ...state.query,
      ...newQuery
    }
  }));
}

export function optionsUpdate(newOptions) {
  return setStatePromise.call(this, state => ({
    options: {
      ...state.options,
      ...newOptions
    }
  }));
}

export function datasetUpdate(newDataset) {
  return setStatePromise.call(this, {dataset: [].concat(newDataset || [])});
}
