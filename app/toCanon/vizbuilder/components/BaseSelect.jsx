import React from "react";
import classnames from "classnames";
import escapeRegExp from "lodash/escapeRegExp";

import {Icon} from "@blueprintjs/core";
import {Select, MultiSelect} from "@blueprintjs/labs";

import "./BaseSelect.css";

/**
 * @template T
 * @typedef IProps
 * @prop {IconName} caret
 * @prop {T} defaultOption
 * @prop {Array} items
 * @prop {boolean} multiple
 * @prop {T} value
 */

/**
 * @class BaseSelect
 * @template T
 * @param {ISelectProps & IProps | IMultiSelectProps & IProps} props
 * @prop {ISelectProps & IProps | IMultiSelectProps & IProps} defaultProps
 */
function BaseSelect(props) {
  props = {
    ...props,
    className: classnames("select-box", "pt-fill", props.className, {
      disabled: props.disabled,
      multi: props.multiple
    })
  };

  if (props.multiple) {
    props.selectedItems = [].concat(props.value || []);
    props.tagInputProps.onRemove = props.onItemRemove;
    props.tagInputProps.placeholder = props.placeholder;

    return React.createElement(MultiSelect, props, props.children);
  }
  else {
    if (!props.value || typeof props.value !== "object") {
      props.value = props.defaultOption;
    }
    else {
      props.value =
        props.items.find(item => item.name === props.value.name) ||
        props.defaultOption;
    }

    props.children = props.children ||
      <div className="select-option current" title={props.value.name}>
        {props.value.icon && <Icon iconName={props.value.icon} />}
        <span className="value">{props.value.name}</span>
        <Icon iconName={props.caret} />
      </div>
    ;

    return React.createElement(Select, props, props.children);
  }
}

/** @type {ISelectProps & IProps | IMultiSelectProps & IProps} */
BaseSelect.defaultProps = {
  caret: "double-caret-vertical",
  defaultOption: {value: null, name: "Select...", disabled: true},
  items: [],
  itemListPredicate(query, items) {
    query = query.trim();
    const tester = RegExp(escapeRegExp(query) || ".", "i");
    return items.filter(item => tester.test(item.name));
  },
  itemRenderer({handleClick, item, isActive}) {
    return (
      <span
        className={classnames("select-option", {
          active: isActive,
          disabled: item.disabled
        })}
        onClick={item.disabled || handleClick}
        title={item.name}
      >
        {item.icon && <Icon iconName={item.icon} />}
        <span className="select-option-label">{item.name}</span>
      </span>
    );
  },
  multiple: false,
  noResults: <span className="select-noresults">No results</span>,
  popoverProps: {
    popoverClassName: "select-box select-box-popover pt-minimal"
  },
  resetOnSelect: true,
  tagRenderer: item => item.name,
  tagInputProps: {
    className: "input-area",
    inputProps: {
      className: "input-box"
    },
    rightElement: <Icon iconName="double-caret-vertical" />
  }
};

export default BaseSelect;
