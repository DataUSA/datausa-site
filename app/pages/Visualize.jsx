import React from "react";

import Vizbuilder from "../toCanon/vizbuilder/index";

import "./Visualize.css";

export default class Visualize extends React.Component {
  render() {
    return <Vizbuilder src="https://canon-api.datausa.io" />;
  }
}
