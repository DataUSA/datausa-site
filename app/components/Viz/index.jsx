import React, {Component} from "react";
import * as d3plus from "d3plus-react";
import "./index.css";
import Options from "./Options";
import propify from "helpers/d3plusPropify";

export default class Viz extends Component {

  render() {
    const {config, className, options, title} = this.props;

    // clone config object to allow manipulation
    const vizProps = propify(config);

    // strip out the "type" from config
    const {type} = vizProps.config;
    delete vizProps.config.type;
    if (!type) return null;
    const Visualization = d3plus[type];

    return <div className={ `visualization ${className}` }>
      { options ? <Options
        component={ this }
        title={ title } /> : null }
      <Visualization
        ref={ comp => this.viz = comp }
        className="d3plus"
        {...vizProps} />
    </div>;
  }

}

Viz.defaultProps = {
  className: "",
  config: {},
  options: true
};
