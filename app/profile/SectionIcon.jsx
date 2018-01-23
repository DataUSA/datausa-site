import React, {Component} from "react";
import {AnchorLink} from "datawheel-canon";

export default class SectionIcon extends Component {

  render() {
    const {slug, title} = this.props;
    return <AnchorLink to={ slug } className="SectionIcon">
      <img src={ `/img/icons/${slug}.svg` } />
      { title }
    </AnchorLink>;
  }

}
