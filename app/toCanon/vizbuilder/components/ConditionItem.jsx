import React from "react";
import PropTypes from "prop-types";
import {Button} from "@blueprintjs/core";
import unionBy from "lodash/unionBy";

import ConditionItemClosed from "./ConditionItemClosed";
import ConditionItemCut from "./ConditionItemCut";
import ConditionItemFilter from "./ConditionItemFilter";
import ConditionPropertySelect from "./ConditionPropertySelect";

class ConditionItem extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: true,
      previous: props
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
    this.setProperty = this.setProperty.bind(this);
  }

  render() {
    const {type, property, operator, values} = this.props;

    if (!property) {
      return this.renderConditionItemNoProperty.call(this);
    }

    const props = {operator, property, values};

    if (!this.state.isOpen) {
      props.onUpdate = this.editMode;
      props.onRemove = this.removeCondition;

      return React.createElement(ConditionItemClosed, props);
    }

    props.properties = this.props.properties;
    props.onSetProperty = this.setProperty;
    props.onSave = this.saveChanges;
    props.onReset = this.resetChanges;

    if (type === "filter") {
      props.onSetOperator = this.setFilterOperator;
      props.onSetValue = this.setFilterValue;

      return React.createElement(ConditionItemFilter, props);
    }

    if (type === "cut") {
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
            value={this.props.property}
            items={this.props.properties}
            onItemSelect={this.setProperty}
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
    return {
      hash: this.props.hash,
      type: this.props.type,
      operator: this.props.operator,
      property: this.props.property,
      values: this.props.values
    };
  }

  editMode() {
    this.setState({
      isOpen: true,
      previous: this.getConditionObject()
    });
  }

  resetChanges() {
    const previous = this.state.previous;

    if (previous) {
      this.props.onUpdate(previous);
      this.setState({isOpen: false, previous: null});
    }
    // else {
    //   this.props.onRemove(this.props.filter);
    // }
  }

  saveChanges() {
    this.setState({isOpen: false, previous: null});
  }

  removeCondition() {
    const condition = this.getConditionObject();
    this.props.onRemove(condition);
  }

  setProperty(property) {
    const condition = this.getConditionObject();
    condition.property = property;
    condition.type = "hierarchy" in property ? "cut" : "filter";
    condition.values = condition.type === "cut" ? [] : 0;
    this.props.onUpdate(condition);
  }

  setFilterOperator(evt) {
    const condition = this.getConditionObject();
    condition.operator = evt.target.value * 1 || 1;
    this.props.onUpdate(condition);
  }

  setFilterValue(value) {
    const condition = this.getConditionObject();
    condition.values = [value];
    this.props.onUpdate(condition);
  }

  addCutValue(value) {
    const condition = this.getConditionObject();
    condition.values = unionBy(condition.values, [value], member => member.key);
    this.props.onUpdate(condition);
  }

  removeCutValue(value) {
    const condition = this.getConditionObject();
    condition.values = condition.values.filter(item => item.caption !== value);
    this.props.onUpdate(condition);
  }
}

ConditionItem.contextTypes = {
  loadWrapper: PropTypes.func,
  stateUpdate: PropTypes.func
};

export default ConditionItem;
