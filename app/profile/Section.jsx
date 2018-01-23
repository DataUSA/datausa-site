import React, {Component} from "react";
import Viz from "components/Viz/index";

export default class Section extends Component {

  render() {
    const {children, description, slug, title, visualizations} = this.props;
    return <div className={ `section ${slug}` }>
      <h2 className="section-title">
        <a href={ `#${ slug }`} id={ slug } className="anchor">
          { title }
        </a>
      </h2>
      <div className="section-row">
        { description ? <div className="section-description" dangerouslySetInnerHTML={{__html: description}}></div> : null }
        { visualizations.map((visualization, i) => <Viz config={visualization} key={i} className="section-visualization" options={ false } />) }
      </div>
      { children }
    </div>;
  }

}

Section.defaultProps = {
  slug: "",
  visualizations: []
};
