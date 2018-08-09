import React from "react";
import classNames from "classnames";
import escapeRegExp from "lodash/escapeRegExp";

import MultiLevelSelect from "./MultiLevelSelect";

class MeasureSelect extends MultiLevelSelect {
  renderTarget(item) {
    return (
      <div className="select-option current" title={item.caption || item.name}>
        <span className="value">{item.caption || item.name}</span>
        <span className="pt-icon-standard pt-icon-double-caret-vertical" />
      </div>
    );
  }
}

MeasureSelect.displayName = "MeasureSelect";
MeasureSelect.defaultProps = {
  ...MultiLevelSelect.defaultProps,
  getItemHeight(item) {
    return item._level ? item._level === 1 ? 22 : 28 : 40;
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
    const nope = {
      annotations: {_cb_topic: "", _cb_subtopic: ""}
    };

    return items.reduce((all, measure, i, array) => {
      const topic = measure.annotations._cb_topic;
      const subtopic = measure.annotations._cb_subtopic;

      if (topic && subtopic) {
        const prevMeasure = array[i - 1] || nope;

        if (topic !== prevMeasure.annotations._cb_topic) {
          all.push({_level: 1, annotations: {_key: topic}, name: topic});
        }

        if (subtopic !== prevMeasure.annotations._cb_subtopic) {
          all.push({
            _level: 2,
            annotations: {_key: `${topic}-${subtopic}`},
            name: subtopic
          });
        }

        all.push(measure);
      }

      return all;
    }, []);
  },
  itemRenderer({style, handleClick, isActive, item}) {
    const props = {key: item.annotations._key, style};
    const child1 = <span className="select-label">{item.name}</span>;
    let child2 = null;
    const className = [];

    if (!item._level) {
      className.push("select-option");
      props.onClick = handleClick;
      child2 =
        <span className="select-label lead">
          {item.annotations._cb_sourceName}
        </span>
      ;
    }
    else {
      className.push("select-optgroup", `level-${item._level}`);
    }

    props.className = classNames(className, {active: isActive});
    return React.createElement("div", props, child1, child2);
  }
};

export default MeasureSelect;
