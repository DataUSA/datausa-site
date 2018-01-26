import React, {Component} from "react";
import {NonIdealState, Spinner} from "@blueprintjs/core";
import "./index.css";

export default class Loading extends Component {

  render() {

    return <NonIdealState
      className="Loading"
      title="Reticulating Splines..."
      visual={<Spinner />} />;
  }

}
