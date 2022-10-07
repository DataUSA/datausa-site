import React, {Component} from "react";
import {NonIdealState} from "@blueprintjs/core";
import "./NotFound.css";

/**
  This component is displayed when the needs of another component are being
  loaded into the redux store.
*/
class NotFound extends Component {
  render() {
    const {error, errorCode} = this.props;
    const errorMessages = {
      404: "Page Not Found"
    };
    return <NonIdealState
      className="notfound"
      title={errorMessages[errorCode] || error}
      description={errorCode}
      icon="error" />;
  }
}

NotFound.defaultProps = {
  error: "Page Not Found",
  errorCode: 404
};

export default NotFound;
