import React, {Component} from "react";
import PropTypes from "prop-types";
import * as d3plus from "d3plus-react";
import "./index.css";
import Options from "./Options";
import propify from "helpers/d3plusPropify";

class Viz extends Component {

  render() {
    const {formatters, variables} = this.context;

    const {config, configOverride, className, options, slug} = this.props;

    // clone config object to allow manipulation
    const vizProps = propify(config.logic, formatters, variables);
    vizProps.config = Object.assign(vizProps.config, configOverride);

    // strip out the "type" from config
    const {type} = vizProps.config;
    delete vizProps.config.type;
    if (!type) return null;
    const Visualization = d3plus[type];

    const title = this.props.title || config.title;

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

Viz.contextTypes = {
  formatters: PropTypes.object,
  variables: PropTypes.object
};

Viz.defaultProps = {
  className: "",
  config: {},
  configOverride: {},
  options: true,
  title: undefined
};

export default Viz;
