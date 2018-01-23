import React, {Component} from "react";

export default class Stat extends Component {

  render() {
    const {subtitle, title, value} = this.props.data;
    return <div className="Stat">
      <div className="stat-title">{ title }</div>
      <div className="stat-value">{ value }</div>
      <div className="stat-subtitle">{ subtitle }</div>
    </div>;
  }

}
