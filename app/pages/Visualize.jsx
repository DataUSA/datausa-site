import React from "react";

import Vizbuilder from "../toCanon/vizbuilder/index";

import "./Visualize.css";

export default class Visualize extends React.Component {
  render() {
    return <Vizbuilder src="https://canon-api.datausa.io"
      topojson={{
        County: {
          topojson: "topojson/County.json"
        },
        Msa: {
          topojson: "topojson/Msa.json"
        },
        Puma: {
          topojson: "topojson/Puma.json"
        },
        State: {
          projection: "geoAlbersUsa",
          ocean: "transparent",
          topojson: "topojson/State.json"
        }
      }} />;
  }
}
