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
      conditions: [],
      cube: null,
      dimension: null,
      drilldown: null,
      measure: null,
      moe: null,
      limit: undefined,
      locale: "en",
      offset: undefined,
      order: undefined,
      orderDesc: undefined,
      options: {
        nonempty: true,
        distinct: false,
        parents: false,
        debug: false,
        sparse: true
      },
      timeDrilldown: null
    },
    options: {
      cubes: [],
      dimensions: [],
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
  conditions: PropTypes.array,
  cube: PropTypes.any,
  dimension: PropTypes.any,
  drilldown: PropTypes.any,
  measure: PropTypes.any,
  moe: PropTypes.any,
  limit: PropTypes.number,
  locale: PropTypes.string,
  offset: PropTypes.number,
  options: PropTypes.any,
  order: PropTypes.any,
  orderDesc: PropTypes.bool,
  timeDrilldown: PropTypes.any
});

export const optionsTypes = PropTypes.shape({
  cubes: PropTypes.array,
  dimensions: PropTypes.array,
  levels: PropTypes.array,
  measures: PropTypes.array
});
