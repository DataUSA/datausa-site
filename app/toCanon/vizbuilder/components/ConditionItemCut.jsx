import React from "react";
import {Button} from "@blueprintjs/core";

import {fetchMembers} from "../actions/fetch";

import ConditionPropertySelect from "./ConditionPropertySelect";
import MemberSelect from "./MemberSelect";

class FilterItemLevel extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      members: []
    };
  }

  componentDidMount() {
    fetchMembers.call(this, this.props.property);
  }

  componentDidUpdate(prevProps) {
    const {property} = this.props;

    if (prevProps.property !== property) {
      fetchMembers.call(this, property);
    }
  }

  render() {
    const props = this.props;

    return (
      <div className="condition-item cut">
        <div className="group condition-property">
          <ConditionPropertySelect
            value={props.property}
            items={props.properties}
            onItemSelect={props.onSetProperty}
          />
        </div>
        <div className="group condition-values">
          <MemberSelect
            items={this.state.members}
            selectedItems={props.values}
            onItemSelect={props.onAddValue}
            onItemRemove={props.onRemoveValue}
          />
        </div>
        <div className="group condition-actions">
          <Button text="Cancel" className="pt-small" onClick={props.onReset} />
          <Button
            text="Apply"
            className="pt-small pt-intent-primary"
            onClick={props.onSave}
          />
        </div>
      </div>
    );
  }
}

export default FilterItemLevel;
