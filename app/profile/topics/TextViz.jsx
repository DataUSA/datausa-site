import React, {Component} from "react";
import Viz from "components/Viz";

export default class TextViz extends Component {

  render() {
    const {description, slug, title, visualizations} = this.props;
    console.log(visualizations);
    return <div className={ `topic ${slug} TextViz` }>
      <h3 className="topic-title">
        <a href={ `#${ slug }`} id={ slug } className="anchor">
          { title }
        </a>
      </h3>
      <div className="topic-row">
        { description ? <div className="topic-description" dangerouslySetInnerHTML={{__html: description}}></div> : null }
        { visualizations.map((visualization, i) => <Viz config={visualization} key={i} className="topic-visualization" />) }
      </div>
    </div>;
  }

}

TextViz.defaultProps = {
  slug: "",
  visualizations: []
};
