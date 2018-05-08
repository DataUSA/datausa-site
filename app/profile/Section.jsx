import React, {Component} from "react";
import Viz from "components/Viz/index";
import "./Section.css";

class Section extends Component {

  render() {
    const {children, data: profile, comparisons} = this.props;
    const {slug, title} = profile;
    const data = [profile].concat(comparisons);

    return <div className={ `Section ${slug} ${ comparisons.length ? "compare" : "" }` }>
      <h2 className="section-title">
        <a href={ `#${ slug }`} id={ slug } className="anchor" dangerouslySetInnerHTML={{__html: title}}></a>
      </h2>
      <div className="section-body">
        <div className="section-content">
          { data.map((d, i) => d.description ? <div key={i} className="section-description" dangerouslySetInnerHTML={{__html: d.description}} /> : null) }
        </div>
        <div className="section-content">
          { data.map(d => d.visualizations ? d.visualizations.map((visualization, ii) => <Viz config={visualization} key={ii} className="section-visualization" options={ false } />) : null) }
        </div>
      </div>
      { children }
    </div>;
  }

}

Section.defaultProps = {
  slug: "",
  visualizations: []
};

export default Section;
