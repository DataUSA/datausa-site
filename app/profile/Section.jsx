import React, {Component} from "react";

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
        { visualizations.map((visualization, i) => <div key={i} className="section-visualization"></div>) }
      </div>
      { children }
    </div>;
  }

}

Section.defaultProps = {
  slug: "",
  visualizations: []
};
