import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {Helmet} from "react-helmet";

import {AnchorLink, fetchData} from "@datawheel/canon-core";
import slugify from "toCanon/slugify";
import Splash from "toCanon/Splash";
import TextViz from "toCanon/topics/TextViz";

import "./Story.css";

class Story extends Component {

  render() {
    const {formatters} = this.context;
    const {story} = this.props;
    const {authors, date, footnotes, title, topics} = story;

    topics.forEach(topic => {
      if (topic.description) {
        if (topic.description instanceof Array) {
          topic.description = topic.description
            .map(p => `<p>${p}</p>`)
            .join("");
        }
        topic.description = topic.description
          .replace(/\<\<foot note=([0-9]+)\>\>/g, (match, g1) =>
            `<a class="footnote" href="#footnote${g1}"><sup>${g1}</sup></a>`
          );
      }
    });
    authors.forEach(author => {
      if (author.about instanceof Array) {
        author.about = author.about
          .map(p => `<p>${p}</p>`)
          .join("");
      }
    });

    return (
      <div id="Story">
        <Helmet title={ formatters.stripHTML(title) } />
        <Splash data={story} height="80vh" />
        <div className="meta-info dark intro">
          { authors.map((a, i) => <AnchorLink key={i} to={slugify(a.name)}><img className="image" src={a.image} /></AnchorLink>) }
          <div className="text">
            <p>Written by { formatters.list(authors.map(a => a.name)) }</p>
            <p>Published on { formatters.date(date) }</p>
          </div>
        </div>
        { topics.map((t, i) => <TextViz contents={t} key={i} />) }
        <div className="meta-info">
          <ol className="footnotes">
            { footnotes.map((footnote, i) => <li className="footnote" id={`footnote${i}`} key={i} dangerouslySetInnerHTML={{__html: footnote}}></li>) }
          </ol>
        </div>
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
  fetchData("story", "/api/story/<sid>")
];

export default connect(state => ({story: state.data.story}))(Story);
