import React from "react";
import PropTypes from "prop-types";
import {Button} from "@blueprintjs/core";
import unionBy from "lodash/unionBy";

import ConditionItemClosed from "./ConditionItemClosed";
import ConditionItemCut from "./ConditionItemCut";
import ConditionItemFilter from "./ConditionItemFilter";
import ConditionPropertySelect from "./ConditionPropertySelect";
import {isValidCut, isValidFilter} from "../helpers/validation";

class ConditionItem extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: true,
      diff: {}
    };

    this.addCutValue = this.addCutValue.bind(this);
    this.getConditionObject = this.getConditionObject.bind(this);
    this.editMode = this.editMode.bind(this);
    this.removeCondition = this.removeCondition.bind(this);
    this.removeCutValue = this.removeCutValue.bind(this);
    this.resetChanges = this.resetChanges.bind(this);
    this.saveChanges = this.saveChanges.bind(this);
    this.setFilterOperator = this.setFilterOperator.bind(this);
    this.setFilterValue = this.setFilterValue.bind(this);
    this.setInitialProperty = this.setInitialProperty.bind(this);
    this.setProperty = this.setProperty.bind(this);
  }

  render() {
    const isValidCondition =
      isValidCut(this.props) || isValidFilter(this.props);
    const props = this.getConditionObject();

    if (!props.property) {
      return this.renderConditionItemNoProperty.call(this);
    }

    props.disabled = !Array.isArray(props.values) || props.values.length === 0;

    if (!this.state.isOpen) {
      props.onUpdate = this.editMode;
      props.onRemove = this.removeCondition;

      return React.createElement(ConditionItemClosed, props);
    }

    props.properties = this.props.properties;
    props.onSetProperty = this.setProperty;
    props.onSave = this.saveChanges;
    props.onReset = isValidCondition ? this.resetChanges : this.removeCondition;

    if (props.type === "filter") {
      props.onSetOperator = this.setFilterOperator;
      props.onSetValue = this.setFilterValue;

      return React.createElement(ConditionItemFilter, props);
    }

    if (props.type === "cut") {
      props.onAddValue = this.addCutValue;
      props.onRemoveValue = this.removeCutValue;

      return React.createElement(ConditionItemCut, props);
    }

    return null;
  }

  renderConditionItemNoProperty() {
    return (
      <fieldset className="condition-item">
        <div className="group">
          <span className="label">Select a Property</span>
          <ConditionPropertySelect
            items={this.props.properties}
            value={this.props.property}
            onItemSelect={this.setInitialProperty}
          />
        </div>
        <div className="group filter-actions">
          <Button
            text="Cancel"
            className="pt-small"
            onClick={this.removeCondition}
          />
          <Button
            text="Apply"
            className="pt-small pt-intent-primary"
            disabled={true}
          />
        </div>
      </fieldset>
    );
  }

  getConditionObject() {
    const diff = this.state.diff;
    return {
      hash: this.props.hash,
      type: diff.type || this.props.type,
      operator: diff.operator || this.props.operator,
      property: diff.property || this.props.property,
      values: diff.values || this.props.values
    };
  }

  editMode() {
    this.setState({isOpen: true, diff: {}});
  }

  resetChanges() {
    this.setState({isOpen: false, diff: {}});
  }

  saveChanges() {
    const condition = this.getConditionObject();
    this.props.onUpdate(condition);
    this.setState({isOpen: false, diff: {}});
  }

  removeCondition() {
    const condition = this.getConditionObject();
    this.props.onRemove(condition);
  }

  setInitialProperty(property) {
    const condition = this.getConditionObject();
    condition.property = property;
    condition.type = "hierarchy" in property ? "cut" : "filter";
    condition.values = [];
    this.props.onUpdate(condition);
  }

  setProperty(property) {
    const condition = this.getConditionObject();
    condition.property = property;
    condition.type = "hierarchy" in property ? "cut" : "filter";
    condition.values = [];
    this.setState({diff: condition});
  }

  setFilterOperator(evt) {
    const condition = this.getConditionObject();
    condition.operator = evt.target.value * 1 || 1;
    this.setState({diff: condition});
  }

  setFilterValue(value) {
    const condition = this.getConditionObject();
    condition.values = [value];
    this.setState({diff: condition});
  }

  addCutValue(value) {
    const condition = this.getConditionObject();
    condition.values = unionBy(condition.values, [value], member => member.key);
    this.setState({diff: condition});
  }

  removeCutValue(value) {
    const condition = this.getConditionObject();
    condition.values = condition.values.filter(item => item.caption !== value);
    this.setState({diff: condition});
  }
}

ConditionItem.contextTypes = {
  loadWrapper: PropTypes.func,
  stateUpdate: PropTypes.func
};

export default ConditionItem;
