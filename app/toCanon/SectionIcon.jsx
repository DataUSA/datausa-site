import React, {Component} from "react";
import {AnchorLink} from "@datawheel/canon-core";

export default class SectionIcon extends Component {

  render() {
    const {active, slug, title} = this.props;
    return <AnchorLink to={ slug } className={ `SectionIcon ${slug} ${active ? "active" : "" }` }>
      <img src={ `/icons/sections/${slug}.svg` } />
      <div className="section-icon-title" dangerouslySetInnerHTML={{__html: title}}></div>
    </AnchorLink>;
  }

}
