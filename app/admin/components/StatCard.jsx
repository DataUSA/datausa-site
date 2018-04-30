import React, {Component} from "react";
import {Card} from "@blueprintjs/core";
import "./StatCard.css";

export default class StatCard extends Component {

  render() {
    const {onClick, vars} = this.props;
    return (
      <Card onClick={onClick} className="stat-card" interactive={true} elevation={1}>
        { Object.keys(vars).map(k => 
          !["id", "profile_id", "topic_id"].includes(k) && 
          typeof vars[k] === "string" && 
          <h4 dangerouslySetInnerHTML={{__html: vars[k]}}></h4>) 
        }
      </Card>
    );
  }

}
