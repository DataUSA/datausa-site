import React from "react";
import {Button} from "@blueprintjs/core";

import {LABELS as OPERATOR_LABELS} from "../helpers/operators";

const renderCutValue = item => <span key={item.name}>{item.name}</span>;
const renderFilterValue = (item, i) => i === 0 ? item : "";

function ConditionItemClosed(props) {
  const property = props.property;
  const isCut = "hierarchy" in property;

  const operator = isCut ? "is any of" : OPERATOR_LABELS[props.operator];
  const values = props.values.map(isCut ? renderCutValue : renderFilterValue);

  const cnDisabled = props.disabled ? "disabled" : "enabled";
  const cnType = isCut ? "cut" : "filter";

  return (
    <div className={`condition-item closed ${cnType} ${cnDisabled}`}>
      <ul className="condition-content">
        <li className="condition-prop">{property.name}</li>
        <li className="condition-oper">{operator}</li>
        <li className="condition-value">{values}</li>
      </ul>
      <Button
        className="condition-action remove pt-small pt-intent-danger pt-minimal"
        iconName="trash"
        title="Remove filter"
        onClick={props.onRemove}
      />
      <Button
        className="condition-action update pt-small pt-intent-primary pt-minimal"
        iconName="settings"
        title="Edit filter"
        onClick={props.onUpdate}
      />
    </div>
  );
}

export default ConditionItemClosed;
