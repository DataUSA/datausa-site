import React from "react";
import PropTypes from "prop-types";

import {fetchQuery} from "../../actions/fetch";
import {
  getMeasureMOE,
  getTimeDrilldown,
  getValidDimensions,
  getValidDrilldowns,
  preventHierarchyIncompatibility,
  reduceLevelsFromDimension
} from "../../helpers/sorting";

import ConditionManager from "./ConditionManager";
import ConditionalAnchor from "./ConditionalAnchor";
import LevelSelect from "./LevelSelect";
import MeasureSelect from "./MeasureSelect";

import "./style.css";
import BaseSelect from "../BaseSelect";

class Sidebar extends React.PureComponent {
  constructor(props) {
    super(props);

    this.fetchQuery = fetchQuery.bind(this);
    this.setDimension = this.setDimension.bind(this);
    this.setDrilldown = this.setDrilldown.bind(this);
    this.setMeasure = this.setMeasure.bind(this);
  }

  setDimension(dimension) {
    const {dimensions} = this.props.options;
    const {loadControl} = this.context;

    return loadControl(() => {
      const levels = reduceLevelsFromDimension([], dimension);
      const drilldown = levels[0];

      const drilldowns = getValidDrilldowns(dimensions);
      preventHierarchyIncompatibility(drilldowns, drilldown);

      return {
        options: {drilldowns, levels},
        query: {dimension, drilldown},
        queryOptions: {
          parents: drilldown.depth > 1
        }
      };
    }, this.fetchQuery);
  }

  setDrilldown(drilldown) {
    const {dimensions, levels} = this.props.options;
    const {loadControl} = this.context;

    if (levels.indexOf(drilldown) > -1) {
      return loadControl(() => {
        const drilldowns = getValidDrilldowns(dimensions);
        preventHierarchyIncompatibility(drilldowns, drilldown);

        return {
          options: {drilldowns},
          query: {drilldown},
          queryOptions: {
            parents: drilldown.depth > 1
          }
        };
      }, this.fetchQuery);
    }

    return undefined;
  }

  setMeasure(measure) {
    const {options, query} = this.props;
    const {loadControl} = this.context;

    return loadControl(() => {
      const cubeName = measure.annotations._cb_name;
      const cube = options.cubes.find(cube => cube.name === cubeName);
      const moe = getMeasureMOE(cube, measure);
      const timeDrilldown = getTimeDrilldown(cube);

      const dimensions = getValidDimensions(cube);
      const drilldowns = getValidDrilldowns(dimensions);

      const dimension = dimensions[0];
      const levels = reduceLevelsFromDimension([], dimension);
      const drilldown = levels[0];

      preventHierarchyIncompatibility(drilldowns, drilldown);

      const conditions = query.cube === cube ? query.conditions : [];

      return {
        options: {dimensions, drilldowns, levels},
        query: {
          cube,
          measure,
          moe,
          dimension,
          drilldown,
          timeDrilldown,
          conditions
        },
        queryOptions: {
          parents: drilldown.depth > 1
        }
      };
    }, this.fetchQuery);
  }

  render() {
    const {query, options} = this.props;

    if (!query.cube) return null;

    const measureDetails = query.measure.annotations.details || "";

    return (
      <div className="area-sidebar">
        <div className="wrapper">
          <div className="control">
            <p className="label">Showing</p>
            <MeasureSelect
              className="custom-select"
              items={options.measures}
              value={query.measure}
              onItemSelect={this.setMeasure}
            />
            <p className="details">{measureDetails}</p>
          </div>

          <div className="control">
            <p className="label">Grouped by</p>
            <BaseSelect
              className="custom-select"
              filterable={false}
              items={options.dimensions}
              value={query.dimension}
              onItemSelect={this.setDimension}
            />
          </div>

          <div className="control">
            <p className="label">At depth level</p>
            <LevelSelect
              className="custom-select"
              filterable={false}
              items={options.levels}
              value={query.drilldown}
              onItemSelect={this.setDrilldown}
            />
          </div>

          <ConditionManager
            className="control"
            query={query}
            options={options}
          />

          {this.renderSourceBlock.call(this)}
        </div>
      </div>
    );
  }

  renderSourceBlock() {
    const ann = this.props.query.cube.annotations;

    return (
      <div className="control sources">
        <p hidden={!ann.source_name}>
          <span>Source: </span>
          <ConditionalAnchor className="source-link" href={ann.source_link}>
            {ann.source_name}
          </ConditionalAnchor>
        </p>
        <p hidden={!ann.source_description}>{ann.source_description}</p>
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

Sidebar.contextTypes = {
  loadControl: PropTypes.func
};

export default Sidebar;
