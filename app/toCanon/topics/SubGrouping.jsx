import React, {Component} from "react";
import PropTypes from "prop-types";
import {AnchorLink} from "@datawheel/canon-core";
import {nest} from "d3-collection";
import {NonIdealState, Spinner} from "@blueprintjs/core";
import "./topic.css";
import StatGroup from "../components/StatGroup";

class SubGrouping extends Component {

  render() {
    const {formatters} = this.context;
    const {stripP} = formatters;
    const {contents} = this.props;
    const {descriptions, slug, stats, subtitles, title, titleCompare} = contents;

    const statGroups = nest().key(d => d.title).entries(stats);

    return <div className={ `topic ${slug || ""} SubGrouping cp-section cp-sub-grouping-section` }>
      <div className="topic-content">
        { title &&
          <h3 id={ slug } className="topic-title">
            <AnchorLink to={ slug } className="anchor" dangerouslySetInnerHTML={{__html: stripP(titleCompare || title)}}></AnchorLink>
          </h3>
        }
        { subtitles.map((content, i) => <div key={i} className="topic-subtitle" dangerouslySetInnerHTML={{__html: stripP(content.subtitle)}} />) }
        <div className="topic-stats">
          { statGroups.map(({key, values}) => <StatGroup key={key} title={key} stats={values} />) }
        </div>
        <div className="topic-descriptions">
          { descriptions.map((content, i) => <div key={i} className="topic-description" dangerouslySetInnerHTML={{__html: content.description}} />) }
        </div>
      </div>
    </div>;
  }

}

SubGrouping.contextTypes = {
  formatters: PropTypes.object
};

export default SubGrouping;
