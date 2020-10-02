import React, {Component} from "react";
import {hot} from "react-hot-loader/root";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {Helmet} from "react-helmet";

import {AnchorLink, fetchData} from "@datawheel/canon-core";
import slugify from "toCanon/slugify";
import Splash from "toCanon/Splash";
import Topic from "toCanon/Topic";
import {updateTitle} from "actions/title";

import "./Story.css";

class Story extends Component {

  componentDidMount() {
    const {formatters} = this.context;
    const {title} = this.props.story;
    this.props.updateTitle(formatters.stripHTML(title));
  }

  componentWillUnmount() {
    this.props.updateTitle(false);
  }

  render() {
    const {formatters} = this.context;
    const {origin, story} = this.props;
    const {authors, date, footnotes, image, title, topics} = story;

    authors.forEach(author => {
      if (author.about instanceof Array) {
        author.about = author.about
          .map(p => `<p>${p}</p>`)
          .join("");
      }
    });

    const metaTitle = formatters.stripHTML(title);
    const metaDesc = formatters.stripHTML(topics[0].descriptions[0].description);

    return (
      <div id="Story">
        <Helmet title={metaTitle}>
          <meta property="og:title" content={ `${metaTitle} | Data USA` } />
          <meta name="description" content={ metaDesc } />
          <meta property="og:image" content={ `${origin}${image}` } />
          <meta property="og:description" content={ metaDesc } />
        </Helmet>
        <Splash data={story} height="60vh" story={true} />
        <div className="meta-info dark intro">
          { authors.map((a, i) => <AnchorLink key={i} to={slugify(a.name)}><img className="image" src={a.image} /></AnchorLink>) }
          <div className="text">
            <p>Written by { formatters.list(authors.map(a => a.name)) }</p>
            <p>Published on { formatters.date(date) }</p>
          </div>
        </div>
        { topics.map((t, i) => <Topic contents={t} key={i} />) }
        { footnotes && <div className="meta-info">
          <ol className="footnotes">
            { footnotes.map((footnote, i) => <li key={`footnote-${i}`} className="footnote" id={`footnote${i}`} key={i} dangerouslySetInnerHTML={{__html: footnote}}></li>) }
          </ol>
        </div> }
        <div className="meta-info dark">
          { authors.map((a, i) =>
            <div key={i} id={slugify(a.name)} className="author">
              <img className="image" src={a.image} />
              <div className="text">
                <div className="name" dangerouslySetInnerHTML={{__html: a.name}}></div>
                <div className="bio" dangerouslySetInnerHTML={{__html: a.about}}></div>
              </div>
            </div>
          ) }
        </div>
      </div>
    );

  }

}

Story.contextTypes = {
  formatters: PropTypes.object
};

Story.need = [
  fetchData("story", "/api/storyLegacy/<sid>")
];

export default connect(state => ({
  origin: state.location.origin,
  story: state.data.story
}), dispatch => ({
  updateTitle: title => dispatch(updateTitle(title))
}))(hot(Story));
