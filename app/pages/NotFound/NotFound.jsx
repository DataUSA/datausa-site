import React, {Component} from "react";
import {NonIdealState} from "@blueprintjs/core";
import "./NotFound.css";

/**
  This component is displayed when the needs of another component are being
  loaded into the redux store.
*/
export default class NotFound extends Component {
  render() {
    return <NonIdealState
      className="notfound"
      title="404"
      description="Page Not Found"
      visual="error" />;
  }
}
