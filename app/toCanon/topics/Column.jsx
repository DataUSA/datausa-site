import React, {Component} from "react";
import Viz from "components/Viz/index";
import "./topic.css";

export default class TextViz extends Component {

  render() {
    const {descriptions, slug, subtitles, title, visualizations} = this.props.contents;

    return <div className={ `topic ${slug} Column` }>
      <div className="topic-content">
        { title &&
          <h3 className="topic-title">
            <a href={ `#${ slug }`} id={ slug } className="anchor" dangerouslySetInnerHTML={{__html: title}}></a>
          </h3>
        }
        { subtitles.map((content, i) => <div key={i} className="topic-subtitle" dangerouslySetInnerHTML={{__html: content.subtitle}} />) }
        { descriptions.map((content, i) => <div key={i} className="topic-description" dangerouslySetInnerHTML={{__html: content.description}} />) }
      </div>
      { visualizations.map((visualization, ii) => <Viz config={visualization} key={ii} className="topic-visualization" title={ title } slug={ `${slug}_${ii}` } />) }
    </div>;
  }

}
