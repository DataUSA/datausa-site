import React from "react";
import PropTypes from "prop-types";

import {addDrilldown, removeDrilldown, setMeasure} from "../actions/events";
import {fetchCubes, fetchQuery} from "../actions/fetch";

import ConditionManager from "./ConditionManager";
import ConditionalAnchor from "./ConditionalAnchor";
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

    const measureDetails = query.measure.annotations.details || "";

    return (
      <div className="area-sidebar">
        <div className="wrapper">
          <div className="group">
            <span className="label">Showing</span>
            <MeasureSelect
              items={options.measures}
              value={query.measure}
              onItemSelect={this.setMeasure}
            />
            <p className="details">{measureDetails}</p>
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
        {this.renderSourceBlock.call(this)}
      </div>
    );
  }

  renderSourceBlock() {
    const ann = this.props.query.cube.annotations;

    return (
      <div className="wrapper sources">
        <p hidden={!ann.source_name}>
          <span>Source: </span>
          <ConditionalAnchor className="source-link" href={ann.source_link}>
            {ann.source_name}
          </ConditionalAnchor>
        </p>
        <p hidden={!ann.source_description}>
          {ann.source_description}
        </p>
        <p hidden={!ann.dataset_name}>
          <span>Dataset: </span>
          <ConditionalAnchor className="source-link" href={ann.dataset_link}>
            {ann.dataset_name}
          </ConditionalAnchor>
        </p>
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
