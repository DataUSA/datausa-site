import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import queryString from "query-string";
import {Position, Toaster} from "@blueprintjs/core";

import {fetchCubes} from "./actions/fetch";
import {loadControl, setStatePromise} from "./actions/loadstate";
import ChartArea from "./components/ChartArea";
import LoadingScreen from "./components/Loading";
import Sidebar from "./components/Sidebar";
import * as api from "./helpers/api";
import initialState from "./state";

import "@blueprintjs/labs/dist/blueprint-labs.css";
import "./index.css";

const UIToaster =
  typeof window !== "undefined"
    ? Toaster.create({className: "area-toaster", position: Position.TOP})
    : null;

class Vizbuilder extends React.PureComponent {
  constructor(props) {
    super(props);

    api.resetClient(props.src);
    this.state = initialState();

    this.loadControl = loadControl.bind(this);
    this.firstLoad = this.firstLoad.bind(this);
    this.stateUpdate = this.stateUpdate.bind(this);
  }

  getChildContext() {
    return {
      loadControl: this.loadControl,
      stateUpdate: this.stateUpdate
    };
  }

  componentDidMount() {
    const locationQuery = queryString.parse(location.search);
    this.firstLoad(locationQuery);
  }

  componentDidUpdate(prevProps, prevState) {
    const {src} = this.props;
    const {load} = this.state;
    const {error, severity} = load;

    if (src && prevProps.src !== src) {
      api.resetClient(src);
      this.setState(initialState(), this.firstLoad);
    }

    if (error && prevState.load.error !== error) {
      console.warn(error.stack);
      UIToaster.show({intent: severity, message: error.message});
    }
  }

  render() {
    const {config, topojson, visualizations} = this.props;
    const {dataset, load, members, options, query, queryOptions} = this.state;
    return (
      <div className={classnames("vizbuilder", {loading: load.inProgress})}>
        <LoadingScreen {...load} />
        <Sidebar
          options={options}
          query={query}
          queryOptions={queryOptions}
        />
        <ChartArea
          dataset={dataset}
          members={members}
          query={query}
          topojson={topojson}
          userConfig={config}
          visualizations={visualizations}
        />
      </div>
    );
  }

  stateUpdate(newState) {
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

  firstLoad(locationQuery) {
    this.loadControl(fetchCubes.bind(this, locationQuery), () => {
      const {query, queryOptions} = this.state;
      return api.query({
        ...query,
        options: queryOptions
      });
    });
  }
}

Vizbuilder.childContextTypes = {
  loadControl: PropTypes.func,
  stateUpdate: PropTypes.func
};

Vizbuilder.propTypes = {
  // this config object will be applied to all charts
  config: PropTypes.object,
  src: PropTypes.string.isRequired,
  topojson: PropTypes.objectOf(
    // keys are the Level names where each object apply
    PropTypes.shape({
      // URL for the topojson file
      topojson: PropTypes.string.isRequired,
      // the key that relates each topojson shape with the dataset value
      topojsonId: PropTypes.string,
      // the key in the topojson file for the shapes to use
      topojsonKey: PropTypes.string
    })
  ),
  visualizations: PropTypes.arrayOf(PropTypes.string)
};

Vizbuilder.defaultProps = {
  config: {},
  topojson: {},
  visualizations: [
    "treemap",
    "barchart",
    "geomap",
    "histogram",
    "barchartyear",
    "lineplot",
    "stacked"
  ]
};

export default Vizbuilder;
