import React, {Component} from "react";
import {Tab2, Tabs2} from "@blueprintjs/core";
import ProfileBuilder from "./ProfileBuilder";
import StoryBuilder from "./StoryBuilder";

import "./Builder.css";

class Builder extends Component {

  constructor(props) {
    super(props);
    this.state = {
      currentTab: "profile"
    };
  }

  handleTabChange(e) {
    this.setState({currentTab: e});
  }

  render() {

    return (
      <div id="builder">
        <Tabs2 id="tabs" onChange={this.handleTabChange.bind(this)} selectedTabId={this.state.currentTab}>
          <Tab2 id="profile" title="Profiles" panel={<ProfileBuilder />} />
          <Tab2 id="story" title="Stories" panel={<StoryBuilder />} />
        </Tabs2>
      </div>
    );
  }
}

export default Builder;
