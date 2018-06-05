import React from "react";
import PropTypes from "prop-types";

import {addDrilldown, removeDrilldown, setMeasure} from "../actions/events";
import {fetchCubes, fetchQuery} from "../actions/fetch";

import ConditionManager from "./ConditionManager";
import LevelSelect from "./LevelSelect";
import MeasureSelect from "./MeasureSelect";

import "./AreaSidebar.css";

class AreaSidebar extends React.PureComponent {
  constructor(props) {
    super(props);

    this.addDrilldown = addDrilldown.bind(this);
    this.fetchQuery = fetchQuery.bind(this);
    this.removeDrilldown = removeDrilldown.bind(this);
    this.setMeasure = setMeasure.bind(this);
  }

  componentDidMount() {
    this.context.loadWrapper(fetchCubes.bind(this), this.fetchQuery);
  }

  render() {
    const {query, options} = this.props;

    if (!query.cube) return null;

    return (
      <div className="area-sidebar">
        <div className="wrapper">
          <div className="group">
            <span className="label">Measure</span>
            <MeasureSelect
              items={options.measures}
              value={query.measure}
              onItemSelect={this.setMeasure}
            />
          </div>

          <div className="group">
            <span className="label">Level</span>
            <LevelSelect
              items={options.levels}
              value={query.drilldowns}
              onItemSelect={this.addDrilldown}
              onItemRemove={this.removeDrilldown}
            />
          </div>

          <ConditionManager query={query} />
        </div>
      </div>
    );
  }
}

AreaSidebar.contextTypes = {
  datasetUpdate: PropTypes.func,
  loadWrapper: PropTypes.func,
  stateUpdate: PropTypes.func
};

export default AreaSidebar;
