import React, {Component} from "react";
import {NonIdealState, Spinner} from "@blueprintjs/core";
import "./Loading.css";

/**
  This component is displayed when the needs of another component are being
  loaded into the redux store.
*/
export default class Loading extends Component {
  render() {
    return <NonIdealState
      className="loading"
      title="Loading"
      description="Please Wait"
      visual={<Spinner />} />;
  }
}
