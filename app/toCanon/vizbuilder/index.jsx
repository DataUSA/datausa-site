import React from "react";
import PropTypes from "prop-types";
import {Intent} from "@blueprintjs/core";
import classnames from "classnames";

import {datasetUpdate, loadWrapper, stateUpdate} from "./actions/mutations";
import AreaChart from "./components/AreaChart";
import AreaLoading from "./components/AreaLoading";
import AreaSidebar from "./components/AreaSidebar";
import {ErrorToaster} from "./components/ErrorToaster";
import {initClient} from "./helpers/api";
import initialState, {loadTypes, optionsTypes, queryTypes} from "./state";

import "@blueprintjs/labs/dist/blueprint-labs.css";
import "./index.css";

class Vizbuilder extends React.PureComponent {
  constructor(props) {
    super(props);

    initClient(props.src);
    this.state = initialState();

    this.datasetUpdate = datasetUpdate.bind(this);
    this.loadWrapper = loadWrapper.bind(this);
    this.stateUpdate = stateUpdate.bind(this);
  }

  getChildContext() {
    return {
      datasetUpdate: this.datasetUpdate,
      loadWrapper: this.loadWrapper,
      stateUpdate: this.stateUpdate
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const {error} = this.state.load;
    if (error && prevState.load.error !== error) {
      console.error(error.stack);
      ErrorToaster.show({intent: Intent.WARNING, message: error.message});
    }
  }

  render() {
    const {options, query, dataset} = this.state;
    const inProgress = this.state.load.inProgress;
    return (
      <div className={classnames("vizbuilder", {loading: inProgress})}>
        <AreaLoading {...this.state.load} />
        <AreaSidebar options={options} query={query} />
        <AreaChart dataset={dataset} query={query} />
      </div>
    );
  }
}

Vizbuilder.childContextTypes = {
  dataset: PropTypes.array,
  load: loadTypes,
  options: optionsTypes,
  query: queryTypes,
  datasetUpdate: PropTypes.func,
  loadWrapper: PropTypes.func,
  stateUpdate: PropTypes.func
};

export default Vizbuilder;
