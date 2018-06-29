import React, {Component} from "react";
import {Card, Icon} from "@blueprintjs/core";
import "./GeneratorCard.css";

import ConsoleVariable from "./ConsoleVariable";

class GeneratorCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      rawData: null,
      displayData: null
    };
  }

  componentDidMount() {
    const {rawData, variables, type} = this.props;
    let displayData = null;
    if (variables) {
      if (type === "generator") {
        displayData = variables._genStatus[rawData.id];
      }
      else if (type === "materializer") {
        displayData = variables._matStatus[rawData.id];
      }
      else {
        displayData = null;
      }
    }
    this.setState({rawData, displayData}); 
  }

  render() {
    const {name, onClick, type} = this.props;
    const {displayData} = this.state;

    return (
      <Card onClick={onClick} className="generator-card" interactive={true} elevation={1}>
        <h5><Icon className={type} iconName="th" />{name}</h5>
        <div className="table">
          <table className="pt-table pt-condensed pt-bordered">
            <tbody>
              { displayData && Object.keys(displayData).map(k =>
                <tr key={ k }>
                  <td><code>{ k }</code></td>
                  <td><ConsoleVariable value={ displayData[k] } /></td>
                </tr>
              ) }
            </tbody>
          </table>
        </div>
      </Card>
    );
  }

}

export default GeneratorCard;
