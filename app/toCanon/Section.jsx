import React, {Component} from "react";
import Viz from "components/Viz/index";
import {AnchorLink} from "@datawheel/canon-core";
import "./Section.css";

class Section extends Component {

  render() {
    const {children, data: profile, comparisons} = this.props;
    const {slug, title} = profile;
    const data = [profile].concat(comparisons).filter(Boolean);

    return <div className={ `Section ${slug} ${ comparisons.length ? "compare" : "" }` }>
      <h2 className="section-title">
        <AnchorLink to={ slug } id={ slug } className="anchor" dangerouslySetInnerHTML={{__html: title}}></AnchorLink>
      </h2>
      <div className="section-body">
        <div className="section-content">
          { data.map((d, ii) => <div key={ii} className="section-description">{d.descriptions.map((content, i) => <div key={i} dangerouslySetInnerHTML={{__html: content.description}} />)}</div>) }
        </div>
        <div className="section-content">
          { data.map((d, ii) => d.visualizations ? d.visualizations.map((visualization, i) => <Viz variables={data[ii].variables} config={visualization} key={i} className="section-visualization" options={ false } />) : null) }
        </div>
      </div>
      <div className="section-topics">
        { children }
      </div>
    </div>;
  }

}

Section.defaultProps = {
  slug: "",
  visualizations: []
};

export default Section;
