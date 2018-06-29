import React, {Component} from "react";
import {Card} from "@blueprintjs/core";
import varSwapRecursive from "../../../utils/varSwapRecursive";
import Loading from "components/Loading";
import PropTypes from "prop-types";
import "./StatCard.css";

class StatCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      rawData: null,
      displayData: null
    };
  }

  componentDidMount() {
    const {rawData, variables} = this.props;
    const {formatters} = this.context;
    const displayData = varSwapRecursive(rawData, formatters, variables);
    this.setState({rawData, displayData}); 
  }

  render() {
    const {onClick} = this.props;
    const {displayData} = this.state;

    if (!displayData) return <Loading />;

    return (
      <Card onClick={onClick} className="stat-card" interactive={true} elevation={1}>
        <h6 dangerouslySetInnerHTML={{__html: displayData.title}}></h6>
        <h4 dangerouslySetInnerHTML={{__html: displayData.value}}></h4>
        <h6 dangerouslySetInnerHTML={{__html: displayData.subtitle}}></h6>
      </Card>
    );
  }

}

StatCard.contextTypes = {
  formatters: PropTypes.object
};

export default StatCard;
