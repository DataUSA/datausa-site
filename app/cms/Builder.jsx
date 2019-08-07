import React, {Component} from "react";
import {connect} from "react-redux";
import {Helmet} from "react-helmet";
import ProfileBuilder from "./profile/ProfileBuilder";
import {fetchData} from "@datawheel/canon-core";

import "./Builder.css";

class Builder extends Component {

  constructor(props) {
    super(props);
    this.state = {
      currentTab: "profile"
    };
  }

  componentDidMount() {
    const {isEnabled} = this.props;
    // The CMS is only accessible on localhost/dev. Redirect the user to root otherwise.
    if (!isEnabled && typeof window !== "undefined" && window.location.pathname !== "/") window.location = "/";
  }

  handleTabChange(e) {
    this.setState({currentTab: e});
  }

  render() {

    const {isEnabled} = this.props;
    if (!isEnabled) return null;

    return (
      <div id="builder">
        <Helmet title="CMS" />
        <ProfileBuilder />
      </div>
    );
  }
}

Builder.need = [
  fetchData("isEnabled", "/api/cms")
];

export default connect(state => ({
  isEnabled: state.data.isEnabled
}))(Builder);
