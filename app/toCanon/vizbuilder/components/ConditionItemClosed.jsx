import React from "react";
import {Button} from "@blueprintjs/core";

import {LABELS as OPERATOR_LABELS} from "../helpers/operators";

function ConditionItemClosed(props) {
  const property = props.property;
  const type = "hierarchy" in property ? "cut" : "filter";

  const operator =
    type === "filter" ? OPERATOR_LABELS[props.operator] : "is any of";

  let value = props.values;
  if (value.length > 1) {
    value = value.map(item => <span key={item.name}>{item.name}</span>);
  }

  return (
    <div className={`condition-item closed ${type}`}>
      <ul className="condition-content">
        <li className="condition-prop">{property.name}</li>
        <li className="condition-oper">{operator}</li>
        <li className="condition-value">{value}</li>
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
