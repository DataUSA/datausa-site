import React from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {NonIdealState, ProgressBar} from "@blueprintjs/core";

class AreaLoading extends React.PureComponent {
  render() {
    const {done, total, t} = this.props;
    return (
      <NonIdealState
        className="area-loading"
        title={ t("Loading.title") }
        description={ t("Loading.description", {done, total}) }
        visual={<ProgressBar value={done / total} />}
      />
    );
  }
}

export default translate()(connect(state => ({
  total: state.loadingProgress.requests,
  progress: state.loadingProgress.fulfilled
}))(AreaLoading));
