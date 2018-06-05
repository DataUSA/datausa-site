import React from "react";
import PropTypes from "prop-types";
import {Button} from "@blueprintjs/core";

import {
  addCondition,
  removeCondition,
  updateCondition
} from "../actions/events";
import {fetchQuery} from "../actions/fetch";
import {getValidDrilldowns} from "../helpers/sorting";

import ConditionItem from "./ConditionItem";

class ConditionManager extends React.Component {
  constructor(props) {
    super(props);

    this.fetchQuery = fetchQuery.bind(this);
    this.addCondition = addCondition.bind(this);
    this.updateCondition = updateCondition.bind(this);
    this.removeCondition = removeCondition.bind(this);
  }

  render() {
    const {conditions, cube} = this.props.query;
    const properties = [].concat(cube.measures, getValidDrilldowns(cube));

    return (
      <div className="group condition-manager">
        <span className="label">Filters/Cuts</span>
        <div className="condition-items">
          {conditions.map(function(condition) {
            return React.createElement(ConditionItem, {
              ...condition,
              key: condition.hash,
              properties,
              onUpdate: this.updateCondition,
              onRemove: this.removeCondition
            });
          }, this)}
        </div>
        <Button
          text="Add filter"
          className="pt-fill"
          iconName="insert"
          onClick={this.addCondition}
        />
      </div>
    );
  }
}

ConditionManager.contextTypes = {
  datasetUpdate: PropTypes.func,
  loadWrapper: PropTypes.func,
  stateUpdate: PropTypes.func
};

export default ConditionManager;
