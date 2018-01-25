import React, {Component} from "react";
import * as d3plus from "d3plus-react";
import "./index.css";
import Options from "./Options";
import propify from "helpers/d3plusPropify";

class Viz extends Component {

  render() {
    const {config, className, options, slug, title} = this.props;

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
        data={ vizProps.config.data }
        slug={ slug }
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

export default Viz;
