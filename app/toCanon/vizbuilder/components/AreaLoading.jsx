import React from "react";
import {NonIdealState, ProgressBar} from "@blueprintjs/core";

import "./AreaLoading.css";

class AreaLoading extends React.PureComponent {
  render() {
    const {done, total} = this.props;
    return (
      <NonIdealState
        className="area-loading"
        title={"loading.title"}
        description={"loading.description"}
        visual={<ProgressBar value={done / total} />}
      />
    );
  }
}

export default AreaLoading;
