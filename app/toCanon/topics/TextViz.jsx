import React, {Component} from "react";
import {sum} from "d3-array";
import Viz from "components/Viz/index";
import "./topic.css";

export default class TextViz extends Component {

  render() {
    const {comparisons, data: primary} = this.props;
    const {slug, title} = primary;
    const data = [primary].concat(comparisons);

    const visualizations = sum(data.map(d => d.visualizations ? d.visualizations.length : 0));

    return <div className={ `topic ${slug} ${ comparisons.length ? "compare" : "" } TextViz` }>
      { title &&
        <h3 className="topic-title">
          <a href={ `#${ slug }`} id={ slug } className="anchor" dangerouslySetInnerHTML={{__html: title}}></a>
        </h3>
      }
      <div className="topic-body">
        <div className="topic-content">
          { data.map((d, i) => <div key={i} className="topic-text">
            { d.subtitles.map((content, i) => <div key={i} className="topic-subtitle" dangerouslySetInnerHTML={{__html: content.subtitle}} />) }
            { d.descriptions.map((content, i) => <div key={i} className="topic-description" dangerouslySetInnerHTML={{__html: content.description}} />) }
          </div>) }
        </div>
        { visualizations
          ? <div className="topic-content">
            { data.map(d => d.visualizations && d.visualizations.map((visualization, ii) => <Viz config={visualization} key={ii} className="topic-visualization" title={ title } slug={ `${slug}_${ii}` } />)) }
          </div>
          : null }
      </div>
    </div>;
  }

}

TextViz.defaultProps = {
  comparisons: []
};
