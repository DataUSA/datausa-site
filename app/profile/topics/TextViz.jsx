import React, {Component} from "react";
import Viz from "components/Viz/index";
import "./topic.css";

export default class TextViz extends Component {

  render() {

    const {description, slug, title, visualizations} = this.props;

    return <div className={ `topic ${slug} TextViz` }>
      <div className="topic-text">
        <h3 className="topic-title">
          <a href={ `#${ slug }`} id={ slug } className="anchor">
            { title }
          </a>
        </h3>
        { description ? <div className="topic-description" dangerouslySetInnerHTML={{__html: description}}></div> : null }
      </div>
      { visualizations.map((visualization, i) => <Viz config={visualization} key={i} className="topic-visualization" title={ title } />) }
    </div>;
  }

}

TextViz.defaultProps = {
  slug: "",
  visualizations: []
};
