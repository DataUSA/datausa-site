import React from "react";
import classnames from "classnames";
import escapeRegExp from "lodash/escapeRegExp";

import {composePropertyName} from "../helpers/sorting";
import BaseSelect from "./BaseSelect";

function LevelSelect(props) {
  return React.createElement(BaseSelect, props);
}

LevelSelect.defaultProps = {
  ...BaseSelect.defaultProps,
  itemListPredicate(query, items) {
    query = query.trim();
    query = escapeRegExp(query);
    query = query.replace(/\s+/g, ".+");
    const tester = RegExp(query || ".", "i");
    return items.filter(item =>
      tester.test(
        `${item.caption || item.name} ${item.hierarchy.dimension.name}`
      )
    );
  },
  itemRenderer({handleClick, item, isActive}) {
    return (
      <li
        className={classnames("select-option", "select-level", {
          active: isActive,
          disabled: item.disabled
        })}
        onClick={item.disabled || handleClick}
        title={item.name}
      >
        <span className="select-option-label">{item.name}</span>
        <span className="select-option-label lead">
          {item.hierarchy.dimension.name}
        </span>
      </li>
    );
  },
  tagRenderer: composePropertyName
};

export default LevelSelect;
