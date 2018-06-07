import PropTypes from "prop-types";

export default function initialStateFactory() {
  return {
    load: {
      inProgress: false,
      total: 0,
      done: 0,
      error: undefined
    },
    query: {
      cube: null,
      measure: null,
      moe: null,
      drilldowns: [],
      conditions: [],
      options: {
        nonempty: true,
        distinct: false,
        parents: false,
        debug: false,
        sparse: true
      },
      locale: "en",
      limit: undefined,
      offset: undefined,
      order: undefined,
      orderDesc: undefined
    },
    options: {
      cubes: [],
      levels: [],
      measures: []
    },
    dataset: []
  };
}

export const loadTypes = PropTypes.shape({
  inProgress: PropTypes.bool,
  total: PropTypes.number,
  done: PropTypes.number,
  error: PropTypes.instanceOf(Error)
});

export const queryTypes = PropTypes.shape({
  cube: PropTypes.any,
  measure: PropTypes.any,
  drilldowns: PropTypes.any,
  filters: PropTypes.any,
  cuts: PropTypes.any,
  options: PropTypes.any,
  locale: PropTypes.string,
  limit: PropTypes.number,
  offset: PropTypes.number,
  order: PropTypes.any,
  orderDesc: PropTypes.bool
});

export const optionsTypes = PropTypes.shape({
  cubes: PropTypes.array,
  levels: PropTypes.array,
  measures: PropTypes.array
});
