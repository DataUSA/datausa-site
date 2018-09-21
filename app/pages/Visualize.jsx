import React from "react";

import Vizbuilder from "@datawheel/canon-vizbuilder";

import "./Visualize.css";

const StateTopojson = {
  projection: "geoAlbersUsa",
  ocean: "transparent",
  topojson: "/topojson/State.json"
};

export default class Visualize extends React.Component {
  render() {
    return <Vizbuilder
      src="https://canon-api.datausa.io"
      defaultDimension={["Geography", "Origin State", "Gender", "Age"]}
      defaultLevel={["State", "Origin State"]}
      defaultMeasure="Opioid Overdose Death Rate Per 100,000 Age-Adjusted"
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
      }} />;
  }
}
