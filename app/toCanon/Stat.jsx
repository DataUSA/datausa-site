import React, {Component} from "react";

export default class Stat extends Component {

  render() {
    const {subtitle, title, value} = this.props.data;
    return <div className={`Stat ${ value.length - 7 > 15 ? "small-text" : "large-text" }`}>
      <div className="stat-title" dangerouslySetInnerHTML={{__html: title}} />
      <div className="stat-value" dangerouslySetInnerHTML={{__html: value}} />
      <div className="stat-subtitle" dangerouslySetInnerHTML={{__html: subtitle}} />
    </div>;
  }

}
