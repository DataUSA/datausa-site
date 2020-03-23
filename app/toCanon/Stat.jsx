import React, {Component} from "react";

export default class Stat extends Component {

  render() {
    const {subtitle, title} = this.props.data;
    let {value} = this.props.data;
    let l = value.length - 7;
    if (value.includes("candidate-image")) {
      l += 5;
      value = value.replace("</span></span>", "</span></span></span><span class='candidate-name'>").replace("</p>", "</span></p>");
    }
    return <div className={`Stat ${ l > 15 ? "small" : l > 10 ? "medium" : "large" }-text`}>
      <div className="stat-title" dangerouslySetInnerHTML={{__html: title}} />
      <div className="stat-value" dangerouslySetInnerHTML={{__html: value}} />
      <div className="stat-subtitle" dangerouslySetInnerHTML={{__html: subtitle}} />
    </div>;
  }

}
