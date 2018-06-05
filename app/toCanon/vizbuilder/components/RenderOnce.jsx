import React from "react";

export default class RenderOnce extends React.Component {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    const Chart = this.props.components[this.props.chart];
    return React.createElement(Chart, {config: this.props.config});
  }
}
