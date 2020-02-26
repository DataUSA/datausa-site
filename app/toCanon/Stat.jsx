import React, {Component} from "react";

export default class Stat extends Component {

  render() {
    const {subtitle, title, value} = this.props.data;
    const l = value.length - 7;
    return <div className={`Stat ${ l > 15 ? "small" : l > 10 ? "medium" : "large" }-text`}>
      <div className="stat-title" dangerouslySetInnerHTML={{__html: title}} />
      <div className="stat-value" dangerouslySetInnerHTML={{__html: value}} />
      <div className="stat-subtitle" dangerouslySetInnerHTML={{__html: subtitle}} />
    </div>;
  }

}
