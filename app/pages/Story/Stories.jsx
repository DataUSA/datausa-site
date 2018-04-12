import React, {Component} from "react";
import {connect} from "react-redux";

import {fetchData} from "datawheel-canon";

import "./Stories.css";
import StoryTile from "./StoryTile";

class Stories extends Component {

  render() {

    const {stories} = this.props;

    return (
      <div id="Stories">
        { stories.map(story => <StoryTile key={story.id} {...story} />)}
      </div>
    );

  }

}

Stories.need = [
  fetchData("stories", "/api/story")
];

export default connect(state => ({stories: state.data.stories}))(Stories);
