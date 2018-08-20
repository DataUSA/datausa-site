import React from "react";
import {Button, NumericInput} from "@blueprintjs/core";

import OPERATORS, {
  KIND_NUMBER as NUMBER_OPERATORS,
  LABELS as OPERATOR_LABELS
} from "../../../helpers/operators";

import ConditionPropertySelect from "./ConditionPropertySelect";

function FilterItemMeasure(props) {
  return (
    <div className="condition-item filter">
      <div className="group condition-property">
        <ConditionPropertySelect
          className="custom-select"
          value={props.property}
          items={props.properties}
          onItemSelect={props.onSetProperty}
        />
      </div>
      <div className="group condition-values pt-control-group">
        <div className="pt-select">
          <select value={props.operator} onChange={props.onSetOperator}>
            {NUMBER_OPERATORS.map(ms =>
              <option key={ms} value={OPERATORS[ms]}>
                {OPERATOR_LABELS[ms]}
              </option>
            )}
          </select>
        </div>
        <NumericInput
          className="pt-fill"
          value={props.values[0]}
          onValueChange={props.onSetValue}
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

export default FilterItemMeasure;
