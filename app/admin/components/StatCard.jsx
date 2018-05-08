import React, {Component} from "react";
import {Card} from "@blueprintjs/core";
import "./StatCard.css";

export default class StatCard extends Component {

  render() {
    const {onClick, vars} = this.props;
    const {title, subtitle, value} = vars;
    return (
      <Card onClick={onClick} className="stat-card" interactive={true} elevation={1}>
        <h6 dangerouslySetInnerHTML={{__html: title}}></h6>
        <h4 dangerouslySetInnerHTML={{__html: value}}></h4>
        <h6 dangerouslySetInnerHTML={{__html: subtitle}}></h6>
      </Card>
    );
  }

}
