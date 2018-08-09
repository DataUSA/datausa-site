import React from "react";
import classnames from "classnames";
import escapeRegExp from "lodash/escapeRegExp";

import {Icon} from "@blueprintjs/core/dist/esm/components/icon/icon";
import {MultiSelect} from "@blueprintjs/labs/dist/esm/components/select/multiSelect";
import {Select} from "@blueprintjs/labs/dist/esm/components/select/select";

import "./BaseSelect.css";

/**
 * @typedef IBaseSelectProps
 * @template T
 * @prop {Icon.IconName} caret The arrow used in the selector, from blueprint's icon gallery.
 * @prop {T} defaultOption A default option, based on the structure of the items.
 * @prop {boolean} filterable Sets if a filter/search input should be available.
 * @prop {(query: string, items: T) => T[]} itemListPredicate A function to filter items to show.
 * @prop {({handleClick, item, isActive}) => JSX.Element} itemRenderer A function to render elements individually.
 * @prop {T[]} items The items available in the selector.
 * @prop {boolean} multiple Sets if it should be able to select more than one element.
 * @prop {JSX.Element} noResults An element to render when there's no items or no results for a filter.
 * @prop {object} popoverProps Properties to pass to the Popover component
 * @prop {boolean} resetOnSelect Sets if the filter input should be reset after selecting an item
 * @prop {object} tagInputProps Properties to pass to the TagInput labels, when multiple is enabled
 * @prop {(T) => string} tagRenderer A function to set the content of the TagInput labels, when multiple is enabled
 * @prop {T|T[]} value The current value of the selector
 */

/**
 * The BaseSelect base component.
 *
 * @namespace BaseSelect
 * @extends React.Component<IBaseSelectProps>
 */
function BaseSelect(props) {
  props = {
    ...props,
    className: classnames("select-box", "pt-fill", props.className, {
      disabled: props.disabled,
      multi: props.multiple
    })
  };

  props.tagInputProps.onRemove = props.multiple ? props.onItemRemove : null;
  props.tagInputProps.placeholder = props.multiple ? props.placeholder : null;

  if (props.multiple) {
    props.selectedItems = [].concat(props.value || []);

    return React.createElement(MultiSelect, props, props.children);
  }
  else {
    let item = props.value;

    if (props.items.indexOf(item) === -1) {
      console.log("nope", item);
      if (!item || typeof item !== "object") {
        item = props.defaultOption;
      }
      else {
        item =
          props.items.find(i => i.name === item.name) || props.defaultOption;
      }

      props.value = item;
    }

    props.children = props.children ||
      <div className="select-option current" title={item.name}>
        {item.icon && <Icon iconName={item.icon} />}
        <span className="value">{item.name}</span>
        <Icon iconName={props.caret} />
      </div>
    ;

    return React.createElement(Select, props, props.children);
  }
}

/** @type {Partial<IBaseSelectProps>} */
BaseSelect.defaultProps = {
  caret: "double-caret-vertical",
  defaultOption: {value: null, name: "Select...", disabled: true},
  filterable: true,
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
        <span className="select-label">{item.name}</span>
      </span>
    );
  },
  multiple: false,
  noResults: <span className="select-noresults">No results</span>,
  popoverProps: {
    modifiers: {
      preventOverflow: {
        boundariesElement: "viewport"
      }
    },
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
