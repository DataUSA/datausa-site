import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {Helmet} from "react-helmet";
import {fetchData} from "@datawheel/canon-core";

import "./Embed.css";

import Topic from "./Topic";

class Embed extends Component {

  getChildContext() {
    const {formatters} = this.context;
    const {variables} = this.props.contents;
    return {formatters, variables};
  }

  render() {

    const {formatters} = this.context;
    const {contents} = this.props;
    const {title, variables} = contents;
    const name = variables.nameLower || variables.name;

    return <div id="Embed">
      <Helmet>
        <title>{ `${formatters.stripHTML(title)} in ${name}` }</title>
      </Helmet>
      <Topic contents={contents} />
    </div>;

  }

}

Embed.childContextTypes = {
  formatters: PropTypes.object,
  variables: PropTypes.object
};

Embed.contextTypes = {
  formatters: PropTypes.object
};

Embed.need = [
  fetchData("contents", "/api/topic/<pslug>/<pid>/<tslug>")
];

export default connect(state => ({
  contents: state.data.contents
}))(Embed);
