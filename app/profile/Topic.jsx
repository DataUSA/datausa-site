import React, {Component} from "react";
import PropTypes from "prop-types";

import TextViz from "toCanon/topics/TextViz";
import Column from "toCanon/topics/Column";
const topicTypes = {Column, TextViz};

class Topic extends Component {

  constructor(props) {
    super(props);
    this.state = {sources: []};
  }

  updateSource(newSources) {
    const {sources} = this.state;
    newSources.forEach(source => {
      if (!sources.find(s => s.name === source.name)) sources.push(source);
    });
    this.setState({sources});
  }

  getChildContext() {
    const {formatters, variables} = this.context;
    return {
      formatters,
      updateSource: this.updateSource.bind(this),
      variables
    };
  }

  render() {

    const {sources} = this.state;
    const {contents} = this.props;
    const Comp = topicTypes[contents.type] || TextViz;

    return <Comp contents={contents} sources={sources} />;

  }

}

Topic.contextTypes = {
  formatters: PropTypes.object,
  variables: PropTypes.object
};

Topic.childContextTypes = {
  formatters: PropTypes.object,
  updateSource: PropTypes.func,
  variables: PropTypes.object
};

export default Topic;
