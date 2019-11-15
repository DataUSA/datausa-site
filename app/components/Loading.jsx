import React, {Component} from "react";
import {connect} from "react-redux";
import {withNamespaces} from "react-i18next";
import {NonIdealState, ProgressBar} from "@blueprintjs/core";
import "./Loading.css";

/**
  This component is displayed when the needs of another component are being
  loaded into the redux store.
*/
class Loading extends Component {
  render() {
    const {progress, t, total} = this.props;
    return <NonIdealState
      className="loading"
      title={t("Loading.title")}
      description={t("Loading.description", {progress, total})}
      action={<ProgressBar value={progress / total} />} />;
  }
}

export default withNamespaces()(connect(
  (state, ownProps) => "total" in ownProps ? {
    total: ownProps.total,
    progress: ownProps.progress
  } : {
    total: state.loadingProgress.requests,
    progress: state.loadingProgress.fulfilled
  }
)(Loading));
