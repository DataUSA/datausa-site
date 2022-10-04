import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {Helmet} from "react-helmet-async";
import {fetchData} from "@datawheel/canon-core";

import "./Embed.css";

import Topic from "toCanon/Topic";

class Embed extends Component {

  getChildContext() {
    const {formatters} = this.context;
    const {variables} = this.props.contents;
    return {formatters, variables};
  }

  render() {

    const {formatters} = this.context;
    const {stripHTML} = formatters;
    const {contents, origin, router} = this.props;
    const {title, variables} = contents;
    const name = variables.nameLower || variables.name;
    const {slug, id} = router.params;

    const joiner = contents.variables.Dimension === "Geography" ? "in" : "for";
    const metaTitle = `${stripHTML(title)} ${joiner} ${name}`;
    const metaDesc = contents.sections[0].descriptions.length ? stripHTML(contents.sections[0].descriptions[0].description) : false;

    return <div id="Embed">
      <Helmet>
        <title>{ metaTitle }</title>
        <meta property="og:title" content={ metaTitle } />
        { metaDesc ? <meta name="description" content={ metaDesc } /> : null }
        <meta property="og:image" content={ `${origin}/api/profile/${slug}/${id}/splash` } />
        { metaDesc ? <meta property="og:description" content={ metaDesc } /> : null }
      </Helmet>
      <Topic contents={contents.sections[0]} />
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
  fetchData("contents", "/api/profile?slug=<slug>&id=<id>&section=<tslug>")
];

export default connect(state => ({
  contents: state.data.contents,
  origin: state.location.origin
}))(Embed);
