import React, {Component} from "react";
import PropTypes from "prop-types";

class Stat extends Component {

  render() {
    const {subtitle, title} = this.props.data;

    let {value} = this.props.data;
    let l = value.length - 7;
    if (value.includes("candidate-image")) {
      l += 5;
      value = value
        .replace("</span></span>", "</span></span></span><span class='candidate-name'>")
        .replace("</p>", "</span></p>");
    }

    const {stripP} = this.context.formatters;

    return <div className={`Stat ${ l > 15 ? "small" : l > 10 ? "medium" : "large" }-text`}>
      <div className="stat-title" dangerouslySetInnerHTML={{__html: stripP(title)}} />
      <div className="stat-value" dangerouslySetInnerHTML={{__html: stripP(value)}} />
      <div className="stat-subtitle" dangerouslySetInnerHTML={{__html: stripP(subtitle)}} />
    </div>;
  }

}

Stat.contextTypes = {
  formatters: PropTypes.object
};

export default Stat;
