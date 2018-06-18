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
      year: "All years",
      type: null,
      annotations: {}
    };

    this.actions = {};
    this.resizeCall = undefined;
    this.scrollCall = undefined;

    this.scrollEnsure = this.scrollEnsure.bind(this);
    this.selectYear = this.selectYear.bind(this);
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

  selectYear(evt) {
    this.setState({
      year: evt.target.value
    });
  }

  getAction(type) {
    if (!(type in this.actions)) {
      this.actions[type] = this.selectChart.bind(this, type);
    }
    return this.actions[type];
  }

  renderFooter(itype) {
    const {type} = this.state;

    return (
      <footer>
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
      this.state.type !== nextState.type ||
      this.state.year !== nextState.year
    );
  }

  componentDidMount() {
    this.setState({
      year: "All years"
    });
  }

  render() {
    const {dataset, query} = this.props;
    const {type} = this.state;

    if (!dataset.length) {
      return (
        <div className="area-chart empty">
          <NonIdealState visual="square" title="Empty dataset" />
        </div>
      );
    }

    const aggregatorType = query.measure
      ? query.measure.annotations &&
        query.measure.annotations.aggregation_method
        ? query.measure.annotations.aggregation_method
        : query.measure.aggregatorType
      : "UNKNOWN";

    const name = query.measure && query.measure.name ? query.measure.name : "";

    const chartConfig = {
      type: type || "Treemap",
      colorScale: "value",
      measure: {
        name,
        aggregatorType
      },
      dimension: query.drilldown ? query.drilldown.name : "",
      groupBy: "",
      moe: query.moe || null
    };

    const timeDim = "Year" in dataset[0];
    const geoDim = ("ID State" || "ID County") in dataset[0] ? true : false;

    let yearSelector = null;
    if (timeDim) {
      const yearMap = dataset.reduce((all, item) => {
        all[item.Year] = true;
        return all;
      }, {});
      const yearOptions = Object.keys(yearMap)
        .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
        .map(item =>
          <option key={item} value={item}>
            {item}
          </option>
        );
      yearSelector =
        <select onChange={this.selectYear} value={this.state.year}>
          <option value="All years">All years</option>
          {yearOptions}
        </select>
      ;
    }

    return (
      <div className="area-chart" onScroll={this.scrollEnsure}>
        <div className="wrapper">
          <div className={`chart-wrapper ${type || "multi"}`}>
            {Object.keys(charts).map(itype => {
              // Check if measure can be displayed in a specific chart
              if (type && itype !== type) return null;
              if (/StackedArea|BarChart/.test(itype) && !timeDim) return null;
              if (/Geomap/.test(itype) && !geoDim) return null;
              if (
                /Pie|Donut|Treemap|StackedArea/.test(itype) &&
                chartConfig.measure.aggregatorType === "AVERAGE"
              ) {
                return null;
              }

              chartConfig.type = itype;
              const config = createConfig(chartConfig);

              config.data =
                this.state.year !== "All years" &&
                !(/LinePlot|BarChart|StackedArea/).test(itype)
                  ? dataset.filter(
                    item => item["ID Year"] === parseInt(this.state.year, 10)
                  )
                  : dataset;
              config.height = type ? 500 : 400;

              if (type === null) {
                config.colorScaleConfig = {
                  height: 0,
                  width: 0
                };
              }

              const cardTitle = `${itype} of ${chartConfig.measure.name} by ${
                chartConfig.dimension
              }`;

              return (
                <ChartCard
                  key={itype}
                  type={itype}
                  config={config}
                  header={
                    <header>
                      {cardTitle}
                      {!(/StackedArea|BarChart|LinePlot/).test(itype) &&
                        yearSelector}
                    </header>
                  }
                  footer={this.renderFooter.call(this, itype)}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default AreaChart;
