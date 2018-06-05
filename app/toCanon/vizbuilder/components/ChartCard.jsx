import React from "react";

import {charts} from "../helpers/chartconfig";

import "./ChartCard.css";

class ChartCard extends React.Component {
  render() {
    const {type, config, header, footer} = this.props;
    const ChartComponent = charts[type];

    return (
      <div className="chart-card">
        <div className="wrapper">
          {header}
          <ChartComponent config={config} />
          {footer}
        </div>
      </div>
    );
  }
}

ChartCard.defaultProps = {
  header: null,
  footer: null
};

export default ChartCard;
