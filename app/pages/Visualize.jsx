import React from "react";

import Vizbuilder from "../toCanon/vizbuilder/index";

import "./Visualize.css";

export default class Visualize extends React.Component {
  render() {
    return <Vizbuilder src="https://canon-api.datausa.io"
      config={{
        shapeConfig: {
          labelConfig: {
            fontFamily: () => "Palanquin"
          }
        },
        titleConfig: {
          fontFamily: "Palanquin",
          fontSize: () => 14
        }
      }}
      topojson={{
        County: {
          topojson: "/topojson/County.json"
        },
        Msa: {
          topojson: "/topojson/Msa.json"
        },
        Puma: {
          topojson: "/topojson/Puma.json"
        },
        State: {
          projection: "geoAlbersUsa",
          ocean: "transparent",
          topojson: "/topojson/State.json"
        }
      }} />;
  }
}
