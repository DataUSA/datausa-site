import React, {Component} from "react";
import Viz from "components/Viz/index";
import "./topic.css";

export default class TextViz extends Component {

  render() {
    const {comparisons, data: profile} = this.props;
    const {slug, title} = profile;
    const data = [profile].concat(comparisons);

    return <div className={ `topic ${slug} ${ comparisons.length ? "compare" : "" } TextViz` }>
      <h3 className="topic-title">
        <a href={ `#${ slug }`} id={ slug } className="anchor">
          { title }
        </a>
      </h3>
      <div className="topic-body">
        <div className="topic-content">
          { data.map((d, i) => <div key={i} className="topic-text">
            { d.subtitle ? <div className="topic-subtitle" dangerouslySetInnerHTML={{__html: d.subtitle}} /> : null }
            { d.description ? <div className="topic-description" dangerouslySetInnerHTML={{__html: d.description}} /> : null }
          </div>) }
        </div>
        <div className="topic-content">
          { data.map(d => d.visualizations ? d.visualizations.map((visualization, ii) => <Viz config={visualization} key={ii} className="topic-visualization" title={ title } slug={ `${slug}_${ii}` } />) : null) }
        </div>
      </div>
    </div>;
  }

}

TextViz.defaultProps = {
  slug: "",
  visualizations: []
};
