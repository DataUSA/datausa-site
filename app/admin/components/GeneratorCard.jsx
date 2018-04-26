import React, {Component} from "react";
import {Card, Icon} from "@blueprintjs/core";
import "./GeneratorCard.css";

export default class GeneratorCard extends Component {

  render() {
    const {name, onClick, type, vars} = this.props;
    return (
      <Card onClick={onClick} className="generator-card" interactive={true} elevation={1}>
        <h5><Icon className={type} iconName="th" />{name}</h5>
        <div className="table">
          <table className="pt-table pt-condensed pt-bordered">
            <tbody>
              { Object.keys(vars).map(k =>
                <tr key={ k }>
                  <td><code>{ k }</code></td>
                  <td>{ vars[k] }</td>
                </tr>
              ) }
            </tbody>
          </table>
        </div>
      </Card>
    );
  }

}
