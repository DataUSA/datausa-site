import React, {Component} from "react";
import * as d3plus from "d3plus-react";

export default class Viz extends Component {

  render() {
    const {config, className} = this.props;

    // clone config object to allow manipulation
    const configClone = {...config};

    // strip out the "type" and use it to lookup the correct component
    const {type} = configClone;
    delete config.type;
    if (!type) return null;
    const Visualization = d3plus[type];

    return <Visualization config={configClone}
      className={ `visualization ${className}` } />;
  }

}

Viz.defaultProps = {
  className: "",
  config: {}
};
