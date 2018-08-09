import React from "react";
import {NonIdealState} from "@blueprintjs/core";

import createChartConfig, {charts} from "../../helpers/chartconfig";
import ChartCard from "./ChartCard";

import "./style.css";

class ChartArea extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeType: null
    };

    this.actions = Object.keys(charts).reduce((box, type) => {
      box[type] = this.selectChart.bind(this, type);
      return box;
    }, {});

    this.resizeCall = undefined;
    this.scrollCall = undefined;

    this.scrollEnsure = this.scrollEnsure.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.dataset !== nextProps.dataset ||
      this.props.visualizations !== nextProps.visualizations ||
      this.state.activeType !== nextState.activeType
    );
  }

  dispatchScroll() {
    // TODO: Discuss how could we implement IntersectionObserver
    window.dispatchEvent(new CustomEvent("scroll"));
  }

  dispatchResize() {
    window.dispatchEvent(new CustomEvent("resize"));
  }

  scrollEnsure() {
    clearTimeout(this.scrollCall);
    this.scrollCall = setTimeout(this.dispatchScroll, 400);
  }

  selectChart(type) {
    this.setState(
      state => ({
        activeType: !state.activeType ? type : null
      }),
      () => {
        requestAnimationFrame(this.dispatchResize);
        requestAnimationFrame(this.dispatchScroll);
      }
    );
  }

  render() {
    const {
      dataset,
      members,
      query,
      topojson,
      userConfig,
      visualizations
    } = this.props;
    const {activeType} = this.state;
    const actions = this.actions;

    if (!dataset.length) {
      return (
        <div className="area-chart empty">
          <NonIdealState visual="error" title="Empty dataset" />
        </div>
      );
    }

    const chartConfig = createChartConfig({
      activeType,
      members,
      query,
      topojson,
      userConfig,
      visualizations
    });

    const chartElements = chartConfig.map(chart =>
      <ChartCard
        key={chart.type}
        active={chart.type === activeType}
        config={chart.config}
        dataset={dataset}
        onSelect={actions[chart.type]}
        type={chart.type}
      />
    );

    return (
      <div className="area-chart" onScroll={this.scrollEnsure}>
        <div className="wrapper">
          <div className={`chart-wrapper ${activeType || "multi"}`}>
            {chartElements}
          </div>
        </div>
      </div>
    );
  }
}

export default ChartArea;
