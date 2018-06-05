import React from "react";
import classnames from "classnames";
import escapeRegExp from "lodash/escapeRegExp";
import {Icon} from "@blueprintjs/core";

import BaseSelect from "./BaseSelect";

function MeasureSelect(props) {
  // props.items = props.items.slice(0, 100);
  return React.createElement(BaseSelect, props);
}

MeasureSelect.defaultProps = {
  itemListPredicate(query, items) {
    query = query.trim();
    query = escapeRegExp(query);
    query = query.replace(/\s+/g, ".+");
    const tester = RegExp(query || ".", "i");
    return items.filter(item =>
      tester.test(`${item.caption || item.name} ${item.annotations._cubeName}`)
    );
  },
  itemRenderer({handleClick, item, isActive}) {
    if (item.name === "Obligation Amount") console.log(item);
    return (
      <li
        className={classnames("select-option", "select-measure", {
          active: isActive,
          disabled: item.disabled
        })}
        onClick={item.disabled || handleClick}
        title={item.name}
      >
        {item.icon && <Icon iconName={item.icon} />}
        <span className="select-option-label">{item.name}</span>
        <span className="select-option-label lead">
          {item.annotations._cubeName}
        </span>
      </li>
    );
  }
};

export default MeasureSelect;
