import React, {Component} from "react";
import {hot} from "react-hot-loader/root";
import Viz from "components/Viz/index";
import {Link} from "react-router";
import {AnchorLink} from "@datawheel/canon-core";
import {Icon} from "@blueprintjs/core";
import "./Section.css";

class Section extends Component {

  render() {
    const {children, data: profile, comparisons, breadcrumbs, photo} = this.props;
    const {slug, title} = profile;
    const data = [profile].concat(comparisons).filter(Boolean);
    console.log("section", profile);

    return <div className={ `Section ${slug} ${ comparisons.length ? "compare" : "" }` }>
      <h2 className="section-title">
        <AnchorLink to={ slug } id={ slug } className="anchor" dangerouslySetInnerHTML={{__html: title}}></AnchorLink>
      </h2>
      <div className="section-body">
        { data.map((d, i) => <div className="section-content" key={i}>
          <div className="section-description">
            { d.descriptions.map((content, ii) => <div key={ii} dangerouslySetInnerHTML={{__html: content.description}} />) }
            { photo && d.image && d.image.meta ? <div className="image-meta">About the photo: <span>{ d.image.meta }</span></div> : null }
          </div>
          { d.visualizations || photo || breadcrumbs ? <div className="section-visualizations">
            { photo && d.image
              ? <a className="photo-attribution" href={d.image.url} target="_blank" rel="noopener noreferrer">
                <Icon iconSize={12} icon="camera" />Photo by {d.image.author}
              </a>
              : null }
            { breadcrumbs && d.breadcrumbs && d.breadcrumbs.length
              ? <div className="breadcrumbs">
                <img src="/images/go-to-link.svg" />
                <div className="links">
                  { d.breadcrumbs.map(bread => <Link key={bread.slug || bread.id} className="bread" to={`/profile/${d.profileSlug || d.slug}/${bread.slug || bread.id}`}>
                    { bread.name }
                  </Link>) }
                </div>
              </div>
              : null }
            { (d.visualizations || []).map((visualization, ii) => <Viz variables={d.variables} config={visualization} key={ii} className="section-visualization" options={ false } />) }
          </div> : null }
        </div>) }
      </div>
      <div className="section-topics">
        { children }
      </div>
    </div>;
  }

}

Section.defaultProps = {
  breadcrumbs: false,
  photo: false,
  slug: "",
  visualizations: []
};

export default hot(Section);
