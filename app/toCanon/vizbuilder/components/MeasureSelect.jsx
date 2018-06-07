import React from "react";
import classnames from "classnames";
import escapeRegExp from "lodash/escapeRegExp";
import {Icon} from "@blueprintjs/core";

import BaseSelect from "./BaseSelect";

function MeasureSelect(props) {
  // props.items = props.items.slice(0, 500);
  return React.createElement(BaseSelect, props);
}

MeasureSelect.defaultProps = {
  ...BaseSelect.defaultProps,
  itemListPredicate(query, items) {
    query = query.trim();
    query = escapeRegExp(query);
    query = query.replace(/\s+/g, ".+");
    const tester = RegExp(query || ".", "i");
    return items.filter(item =>
      tester.test(`${item.caption || item.name} ${item.annotations._cube}`)
    );
  },
  itemRenderer({handleClick, item, isActive}) {
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
          {item.annotations._source_name}
        </span>
      </li>
    );
  }
};

export default MeasureSelect;
