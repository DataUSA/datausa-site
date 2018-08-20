import React from "react";
import PropTypes from "prop-types";
import {Button} from "@blueprintjs/core";
import classNames from "classnames";
import {uuid} from "d3plus-common";

import {fetchQuery} from "../../../actions/fetch";
import OPERATORS from "../../../helpers/operators";

import ConditionItem from "./ConditionItem";

import "./style.css";

class ConditionManager extends React.Component {
  constructor(props) {
    super(props);

    this.fetchQuery = fetchQuery.bind(this);
    this.addCondition = this.addCondition.bind(this);
    this.updateCondition = this.updateCondition.bind(this);
    this.removeCondition = this.removeCondition.bind(this);
  }

  addCondition() {
    const {conditions} = this.props.query;
    const {stateUpdate} = this.context;

    const newConditions = [].concat(conditions, {
      hash: uuid(),
      operator: OPERATORS.EQUAL,
      property: "",
      type: "cut",
      values: []
    });
    return stateUpdate({query: {conditions: newConditions}});
  }

  updateCondition(condition) {
    const {conditions} = this.props.query;
    const {loadControl} = this.context;

    const index = conditions.findIndex(cond => cond.hash === condition.hash);

    if (index > -1) {
      loadControl(() => {
        const newConditions = conditions.slice();
        newConditions.splice(index, 1, condition);
        return {query: {conditions: newConditions}};
      }, this.fetchQuery);
    }
  }

  removeCondition(condition) {
    const {conditions} = this.props.query;
    const {loadControl} = this.context;

    const newConditions = conditions.filter(cond => cond.hash !== condition.hash);

    if (newConditions.length < conditions.length) {
      loadControl(() => ({query: {conditions: newConditions}}), this.fetchQuery);
    }
  }

  render() {
    const props = this.props;
    const {conditions, cube} = props.query;
    const {drilldowns} = props.options;
    const properties = [].concat(cube.measures, drilldowns);

    return (
      <div className={classNames(props.className, "condition-manager")}>
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
  loadControl: PropTypes.func,
  stateUpdate: PropTypes.func
};

export default ConditionManager;
