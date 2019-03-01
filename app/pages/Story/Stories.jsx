import React, {Component} from "react";
import {connect} from "react-redux";
import {Helmet} from "react-helmet";

import {updateTitle} from "actions/title";
import {fetchData} from "@datawheel/canon-core";

import "./Stories.css";
import StoryTile from "./StoryTile";

const title = "Stories";

class Stories extends Component {

  componentDidMount() {
    this.props.updateTitle(title);
  }

  componentWillUnmount() {
    this.props.updateTitle(false);
  }

  render() {

    const {stories} = this.props;

    return (
      <div id="Stories">
        <Helmet title={title}>
          <meta property="og:title" content={ `${title} | Data USA` } />
        </Helmet>
        { stories.map(story => <StoryTile key={story.id} {...story} />)}
      </div>
    );

  }

}

Stories.need = [
  fetchData("stories", "/api/story")
];

export default connect(state => ({
  stories: state.data.stories
}), dispatch => ({
  updateTitle: title => dispatch(updateTitle(title))
}))(Stories);
