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
      defaultDimension={["Geography", "Gender", "Age"]}
      defaultLevel={["State"]}
      defaultMeasure="Millions Of Dollars"
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
