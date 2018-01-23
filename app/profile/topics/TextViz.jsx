import React, {Component} from "react";

export default class TextViz extends Component {

  render() {
    const {description, slug, title, visualizations} = this.props;
    return <div className={ `topic ${slug} TextViz` }>
      <h3 className="topic-title">
        <a href={ `#${ slug }`} id={ slug } className="anchor">
          { title }
        </a>
      </h3>
      <div className="topic-row">
        { description ? <div className="topic-description" dangerouslySetInnerHTML={{__html: description}}></div> : null }
        { visualizations.map((visualization, i) => <div key={i} className="topic-visualization"></div>) }
      </div>
    </div>;
  }

}

TextViz.defaultProps = {
  slug: "",
  visualizations: []
};
