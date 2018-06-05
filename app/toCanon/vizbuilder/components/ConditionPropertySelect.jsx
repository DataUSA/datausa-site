import React from "react";
import classnames from "classnames";
import escapeRegExp from "lodash/escapeRegExp";

import {Icon} from "@blueprintjs/core";
import BaseSelect from "./BaseSelect";

function ConditionPropertySelect(props) {
  let item;

  if (!props.value || typeof props.value !== "object") {
    item = props.defaultOption;
  }
  else {
    item =
      props.items.find(item => item.name === props.value.name) ||
      props.defaultOption;
  }

  const txt =
    "hierarchy" in item
      ? `${item.hierarchy.dimension.name} › ${item.name}`
      : item.name;

  return React.createElement(
    BaseSelect,
    props,
    <div className="select-option current" title={props.value.name}>
      <span className="value">{txt}</span>
      <Icon iconName={props.caret} />
    </div>
  );
}

ConditionPropertySelect.defaultProps = {
  ...BaseSelect.defaultProps,
  itemListPredicate(query, items) {
    query = query.trim();
    query = escapeRegExp(query);
    query = query.replace(/\s+/g, ".+");
    const tester = RegExp(query || ".", "i");
    return items.filter(item =>
      tester.test(
        "hierarchy" in item
          ? `${item.hierarchy.dimension.name} ${item.name}`
          : item.name
      )
    );
  },
  itemRenderer({handleClick, item, isActive}) {
    const txt =
      "hierarchy" in item
        ? `${item.hierarchy.dimension.name} › ${item.name}`
        : item.name;
    return (
      <li
        className={classnames("select-option", "select-property", {
          active: isActive,
          disabled: item.disabled
        })}
        onClick={handleClick}
        title={item.name}
      >
        <span className="select-option-label">{txt}</span>
      </li>
    );
  }
};

export default ConditionPropertySelect;
