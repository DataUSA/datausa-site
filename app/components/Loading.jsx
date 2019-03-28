import React, {Component} from "react";
import {NonIdealState, Spinner} from "@blueprintjs/core";
import "./Loading.css";

/**
  This component is displayed when the needs of another component are being
  loaded into the redux store.
*/
export default class Loading extends Component {

  constructor(props) {
    super(props);
    this.state = {
      interval: false,
      progress: -1
    };
  }

  componentDidUpdate() {
    const {progress, total} = this.props;
    const mod = 0.02;
    if (progress === total) {
      const {interval} = this.state;
      if (interval) clearInterval(interval);
    }
    else if (progress > this.state.progress) {
      const {interval} = this.state;
      if (interval) clearInterval(interval);
      let tempProg = progress;
      const newInterval = setInterval(() => {
        if (tempProg + mod < Math.floor(progress) + 1) {
          tempProg += mod;
          this.setState({progress: tempProg});
        }
        else {
          clearInterval(newInterval);
        }
      }, 100);
      this.setState({progress, interval: newInterval});
    }
  }

  render() {

    const {total} = this.props;
    const {progress} = this.state;

    const ratio = total ? (progress || 0) / total : 0;

    return <NonIdealState
      className="loading"
      title="Loading"
      description="Please Wait"
      visual={<Spinner value={ total && total !== progress && ratio > 0.05 ? ratio : undefined }/>} />;
  }

}
