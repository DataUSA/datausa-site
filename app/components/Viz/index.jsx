import React, {Component} from "react";
import * as d3plus from "d3plus-react";
import "./index.css";
import Options from "./Options";

export default class Viz extends Component {

  render() {
    const {config, className, options, title} = this.props;

    // clone config object to allow manipulation
    const configClone = {...config};

    // strip out the "dataFormat" and "type" and use it to lookup the correct component
    const {dataFormat, type} = configClone;
    delete configClone.dataFormat;
    delete configClone.type;
    if (!type) return null;
    const Visualization = d3plus[type];

    return <div className={ `visualization ${className}` }>
      { options ? <Options
        component={ this }
        title={ title } /> : null }
      <Visualization
        ref={ comp => this.viz = comp }
        config={configClone}
        className="d3plus"
        dataFormat={dataFormat} />
    </div>;
  }

}

Viz.defaultProps = {
  className: "",
  config: {},
  options: true
};
