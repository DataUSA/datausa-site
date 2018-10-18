import React, {Component} from "react";
import Vizbuilder from "@datawheel/canon-vizbuilder";
import localforage from "localforage";
import {Button, Dialog, Icon, Intent} from "@blueprintjs/core";
import "./Visualize.css";
import {badMeasures} from "d3plus.js";
import colors from "../../static/data/colors.json";

const measureConfig = {};
badMeasures.forEach(measure => {
  measureConfig[measure] = {
    colorScaleConfig: {
      color: colors.colorScaleBad
    }
  };
});

const StateTopojson = {
  projection: "geoAlbersUsa",
  ocean: "transparent",
  topojson: "/topojson/State.json"
};

const introKey = "datausa-visualize-intro";

export default class Visualize extends Component {

  constructor(props) {
    super(props);
    this.state = {intro: false};
  }

  componentDidMount() {
    localforage.getItem(introKey)
      .then(intro => {
        if (!intro) this.setState({intro: true});
      })
      .catch(err => console.error(err));
  }

  hideInfo() {
    this.setState({intro: false});
    localforage.setItem(introKey, true);
  }

  render() {
    const {intro} = this.state;
    return <div>
      <Vizbuilder
        src="https://canon-api.datausa.io"
        defaultGroup={["Geography.State", "Origin State.Origin State", "Gender.Gender", "Age.Age"]}
        defaultMeasure="Total Population"
        measureConfig={measureConfig}
        config={{
          colorScaleConfig: {
            color: colors.colorScaleGood
          }
        }}
        topojson={{
          "County": {
            topojson: "/topojson/County.json"
          },
          "Msa": {
            topojson: "/topojson/Msa.json"
          },
          "Puma": {
            topojson: "/topojson/Puma.json"
          },
          "State": StateTopojson,
          "Origin State": StateTopojson,
          "Destination State": StateTopojson
        }} />
      <Dialog isOpen={intro} className="visualize-intro">
        <div className="pt-dialog-header">
          <h5>Maps &amp; Charts</h5>
          <button aria-label="Close" className="pt-dialog-close-button pt-icon-small-cross" onClick={this.hideInfo.bind(this)}></button>
        </div>
        <div className="pt-dialog-body">
          <p className="icons">
            <Icon iconName="horizontal-bar-chart" />
            <Icon iconName="globe" />
            <Icon iconName="timeline-line-chart" />
            <Icon iconName="grid-view" />
            <Icon iconName="grouped-bar-chart" />
            <Icon iconName="timeline-area-chart" />
          </p>
          <p>
            Welcome to the custom visualization builder. This page allows you to view any indicator used throughout the site as a set of custom visualizations.
          </p>
          <p>
            Start by choosing an indicator from the dropdown list, and then add custom groupings and filters to narrow down your exploration.
          </p>
        </div>
        <div className="pt-dialog-footer">
          <Button className="pt-fill" text="Let's start!" intent={Intent.SUCCESS} onClick={this.hideInfo.bind(this)} />
        </div>
      </Dialog>;
    </div>;
  }

}
