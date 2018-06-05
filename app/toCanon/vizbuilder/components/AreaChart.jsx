import React from "react";
import {Button, NonIdealState} from "@blueprintjs/core";

import createConfig from "../helpers/chartconfig";
import {charts} from "../helpers/chartconfig";
import ChartCard from "./ChartCard";

import "./AreaChart.css";

class AreaChart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      chartConfig: {},
      type: null,
      annotations: {
        source_link: "about:blank",
        source_name: "MINSAL"
      }
    };

    this.actions = {};
    this.resizeCall = undefined;
    this.scrollCall = undefined;

    this.scrollEnsure = this.scrollEnsure.bind(this);
  }

  toggleDialog(type = false) {
    if (type) {
      this.setState({
        chartConfig: {
          type,
          colorScale: "value",
          measure: "value",
          dimension: "parent"
        }
      });
    }
  }

  dispatchScroll() {
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
    this.setState(state => ({
      type: !state.type ? type : null
    }));

    clearTimeout(this.resizeCall);
    this.resizeCall = setTimeout(this.dispatchResize, 500);
  }

  getAction(type) {
    if (!(type in this.actions)) {
      this.actions[type] = this.selectChart.bind(this, type);
    }
    return this.actions[type];
  }

  renderFooter(itype) {
    const {type, annotations} = this.state;

    return (
      <footer>
        {type 
          ? <span className="source-note">
            <span className="source-note-txt">{"Source: "}</span>
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="source-note-link"
              href={annotations.source_link}
            >
              {annotations.source_name}
            </a>
          </span>
          : null}
        <Button
          className="pt-minimal"
          iconName={type ? "cross" : "zoom-in"}
          text={type ? "CLOSE" : "ENLARGE"}
          onClick={this.getAction.call(this, itype)}
        />
      </footer>
    );
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.dataset !== nextProps.dataset ||
      this.state.type !== nextState.type
    );
  }

  render() {
    const {dataset, query} = this.props;
    const {type} = this.state;

    const aggregatorType = query.measure
      ? query.measure.annotations &&
        query.measure.annotations.aggregation_method
        ? query.measure.annotations.aggregation_method
        : query.measure.aggregatorType
      : "UNKNOWN";

    const name = query.measure && query.measure.name ? query.measure.name : "";

    const chartConfig = {
      type: type || "TreemapS",
      colorScale: "value",
      measure2: query.measure ? query.measure.name : "",
      measure: {
        name,
        aggregatorType
      },
      dimension: query.drilldowns[0] ? query.drilldowns[0].name : "",
      groupBy: ""
    };

    if (!dataset.length) {
      return (
        <div className="area-chart empty">
          <NonIdealState visual="square" title="Empty dataset" />
        </div>
      );
    }

    const timeDim = "Year" in dataset[0];

    chartConfig.type = "TreemapS";

    return (
      <div className="area-chart" onScroll={this.scrollEnsure}>
        <div className="wrapper">
          <div className={`chart-wrapper ${type || "multi"}`}>
            {Object.keys(charts).map(itype => {
              if (type && itype !== type) return null;
              if (/StackedArea|BarChart/.test(itype) && !timeDim) return null;

              if (
                /Pie|Donut|Treemap|StackedArea/.test(itype) &&
                chartConfig.measure.aggregatorType === "AVERAGE"
              ) {
                return null; 
              }

              chartConfig.type = itype;
              const config = createConfig(chartConfig);
              config.data = dataset;
              config.height = type ? 500 : 400;

              return (
                <ChartCard
                  key={itype}
                  type={itype}
                  config={config}
                  header={
                    <header>{`${itype} of ${chartConfig.measure.name} by ${
                      chartConfig.dimension
                    }`}</header>
                  }
                  footer={this.renderFooter.call(this, itype)}
                />
              );
            })}

            {/* Object.keys(icharts).map(itype => {
              if (type && itype !== type) return null;
              if (/StackedArea|BarChart/.test(itype) && !timeDim) return null;
              if (
                /Treemap|Donut|Pie/.test(itype) &&
                chartConfig.measure.aggregatorType === "AVERAGE"
              ) {
                return null;
              }

              const ChartComponent = icharts[itype];

              chartConfig.type = itype;
              const config = createConfig(chartConfig);
              config.data = dataset;
              config.height = type ? 500 : 400;
              
              return <ChartComponent config={config} />;
            })*/}
          </div>
        </div>
      </div>
    );
  }
}

export default AreaChart;

/* <ChartComponent
    key={itype}
    type={itype}
    config={config}
    header={
      
    }
    footer={}
  />*/
