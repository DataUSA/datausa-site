import React from "react";
import classNames from "classnames";
import escapeRegExp from "lodash/escapeRegExp";

// import { Button } from "@blueprintjs/core";
import {Popover2} from "@blueprintjs/labs";
import VirtualList from "react-tiny-virtual-list";

class MultiLevelSelect extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
      query: ""
    };

    this.handleQueryInput = this.handleQueryInput.bind(this);
    this.handleQueryReset = this.handleQueryInput.bind(this, {
      target: {value: ""}
    });
  }

  handleQueryInput(evt) {
    this.setState({query: `${evt.target.value}`.trim()});
  }

  renderPopover() {
    const {
      getItemHeight,
      itemListComposer,
      itemListPredicate,
      itemRenderer,
      items,
      noResults,
      onItemSelect,
      value
    } = this.props;
    const {query} = this.state;

    const filteredItems = query ? itemListPredicate(query, items) : items;
    const composedItems = itemListComposer(filteredItems);

    return (
      <div>
        <div className="pt-input-group">
          <input
            className="pt-input pt-fill"
            type="text"
            placeholder="Type to filter elements..."
            dir="auto"
            value={query}
            onInput={this.handleQueryInput}
          />
          <button
            className="pt-button pt-minimal pt-icon-cross"
            onClick={this.handleQueryReset}
          />
        </div>

        <VirtualListWrapper
          items={composedItems}
          value={[].concat(value)}
          itemRenderer={itemRenderer}
          onItemClick={onItemSelect}
          noResults={noResults}
          getItemHeight={getItemHeight}
        />
      </div>
    );
  }

  renderSingle() {
    const props = this.props;
    const popContent = this.renderPopover.call(this);
    const item = props.value || props.defaultOption;

    return (
      <Popover2
        {...props.popoverProps}
        placement="bottom-start"
        content={popContent}
        className="select-box select-measure pt-fill"
      >
        <div
          className="select-option current"
          title={item.caption || item.name}
        >
          <span className="value">{item.caption || item.name}</span>
          <span className="pt-icon-standard pt-icon-double-caret-vertical" />
        </div>
      </Popover2>
    );
  }

  renderMulti() {
    return <span>Multi</span>;
  }

  render() {
    const {multiple} = this.props;
    const renderer = multiple ? this.renderMulti : this.renderSingle;
    return renderer.call(this);
  }
}

MultiLevelSelect.defaultProps = {
  filterable: true,
  caret: "double-caret-vertical",
  defaultOption: {name: "Select...", disabled: true},
  popoverProps: {
    modifiers: {
      preventOverflow: {
        boundariesElement: "viewport"
      }
    },
    popoverClassName:
      "pt-select-popover select-box select-box-popover select-measure pt-minimal"
  },
  getItemHeight(item) {
    return item._level ? item._level === 1 ? 22 : 28 : 42;
  },
  itemListPredicate(query, items) {
    query = query.trim();
    query = escapeRegExp(query);
    query = query.replace(/\s+/g, ".+");
    const queryTester = RegExp(query || ".", "i");
    return items.filter(item =>
      queryTester.test(item.annotations._selectorKey)
    );
  },
  itemListComposer(items) {
    return items.reduce((all, measure, i, array) => {
      const group = [measure];
      const prevMeasure = array[i - 1];

      const subtopic = measure.annotations._cb_subtopic;
      if (!i || subtopic !== prevMeasure.annotations._cb_subtopic) {
        group.unshift({_level: 2, name: subtopic});
      }

      const topic = measure.annotations._cb_topic;
      if (!i || topic !== prevMeasure.annotations._cb_topic) {
        group.unshift({_level: 1, name: topic});
      }

      return all.concat(group);
    }, []);
  },
  itemRenderer({style, handleClick, isActive, item, index}) {
    const props = {key: index, style};
    const child1 = <span className="select-option-label">{item.name}</span>;
    let child2 = null;
    const className = ["item-level", {active: isActive}];

    if (!item._level) {
      className.push("select-option");
      props.onClick = handleClick;
      child2 =
        <span className="select-option-label lead">
          {item.annotations._cb_sourceName}
        </span>
      ;
    }
    else {
      className.push(`level-${item._level}`);
    }

    props.className = classNames(className);
    return React.createElement("div", props, child1, child2);
  },
  noResults: <span className="select-noresults">No results</span>,
  value: []
};

export class VirtualListWrapper extends React.Component {
  constructor(props) {
    super(props);

    this.getItemHeight = this.getItemHeight.bind(this);
    this.renderItem = this.renderItem.bind(this);
  }

  getItemHeight(index) {
    const props = this.props;
    return props.getItemHeight(props.items[index]);
  }

  renderItem({index, style}) {
    const props = this.props;
    const item = props.items[index];
    return props.itemRenderer({
      handleClick: () => props.onItemClick(item),
      index,
      isActive: props.value.indexOf(item) > -1,
      item,
      style
    });
  }

  render() {
    const items = this.props.items;
    if (!items.length) return this.props.noResults;
    return (
      <VirtualList
        width={300}
        height={300}
        itemCount={items.length}
        itemSize={this.getItemHeight}
        renderItem={this.renderItem}
      />
    );
  }
}

export default MultiLevelSelect;
