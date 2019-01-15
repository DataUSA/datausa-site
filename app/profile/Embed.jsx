import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {Helmet} from "react-helmet";
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
    const {contents, origin, router} = this.props;
    const {title, variables} = contents;
    const name = variables.nameLower || variables.name;
    const {pslug, pid} = router.params;

    const joiner = contents.variables.Dimension === "Geography" ? "in" : "for";
    const metaTitle = `${formatters.stripHTML(title)} ${joiner} ${name}`;
    const metaDesc = formatters.stripHTML(contents.descriptions.length ? contents.descriptions[0].description : "");

    return <div id="Embed">
      <Helmet>
        <title>{ metaTitle }</title>
        <meta property="og:title" content={ metaTitle } />
        { metaDesc.length ? <meta name="description" content={ metaDesc } /> : null }
        <meta property="og:image" content={ `${origin}/api/profile/${pslug}/${pid}/splash` } />
        { metaDesc.length ? <meta property="og:description" content={ metaDesc } /> : null }
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
  contents: state.data.contents,
  origin: state.location.origin
}))(Embed);
