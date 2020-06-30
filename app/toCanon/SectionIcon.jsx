import React, {Component} from "react";
import PropTypes from "prop-types";
import {AnchorLink} from "@datawheel/canon-core";

class SectionIcon extends Component {

  render() {
    const {active, slug, title} = this.props;
    const {stripP} = this.context.formatters;
    return <AnchorLink to={ slug } className={ `SectionIcon ${slug} ${active ? "active" : "" }` }>
      <img src={ `/icons/sections/${slug}.svg` } />
      <div className="section-icon-title">
        {stripP(title)}
      </div>
    </AnchorLink>;
  }

}


SectionIcon.contextTypes = {
  formatters: PropTypes.object
};

export default SectionIcon;
