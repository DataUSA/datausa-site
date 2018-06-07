import React from "react";
import classnames from "classnames";
import escapeRegExp from "lodash/escapeRegExp";
import {Icon} from "@blueprintjs/core";

import BaseSelect from "./BaseSelect";
import {composePropertyName} from "../helpers/sorting";

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

  props = {
    ...props,
    value: item
  };

  const name = composePropertyName(item);

  return React.createElement(
    BaseSelect,
    props,
    <div className="select-option current" title={name}>
      <span className="value">{name}</span>
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
    return items.filter(item => tester.test(composePropertyName(item)));
  },
  itemRenderer({handleClick, item, isActive}) {
    const name = composePropertyName(item);
    return (
      <li
        className={classnames("select-option", "select-property", {
          active: isActive,
          disabled: item.disabled
        })}
        onClick={handleClick}
        title={name}
      >
        <span className="select-option-label">{name}</span>
      </li>
    );
  }
};

export default ConditionPropertySelect;
