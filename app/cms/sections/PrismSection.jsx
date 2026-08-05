import React, {Component} from "react";
import PropTypes from "prop-types";
import TextViz from "../../toCanon/topics/TextViz";
import {withPrismReferral} from "../../utils/prismReferral";
import {PrismUserContext} from "../../contexts/PrismUserContext";
import "./PrismSection.css";

/**
 * @augments {Component<{ textVizProps: object, dialog?: import("react").ReactNode, children?: import("react").ReactNode }>}
 */
export class PrismSectionLayout extends Component {

  renderNotice(userId) {
    const {textVizProps} = this.props;
    const {router} = this.context;
    const pathname = router?.location?.pathname || "";
    const sectionSlug = textVizProps?.contents?.slug || textVizProps?.slug || "";
    const prismUrl = withPrismReferral("https://peopleprism.ai/", {pathname, sectionSlug, userId});

    return (
      <aside className="prism-notice">
        <img
          className="prism-notice-logo"
          src="/images/footer/deloitte_dark.png"
          alt="Deloitte."
        />
        <p className="prism-notice-call">
          {"Deloitte's PeoplePrism™ harnesses "}
          <strong>predictive and geospatial analytics and one of the largest population insights datasets</strong>
          {" to provide actionable information on the environmental and social factors that influence health and quality of life for people and communities. "}
          <a href="mailto:PeoplePrism@deloitte.com">Contact Deloitte</a>
          {" for additional PeoplePrism data features, including distance to primary and specialized care."}
        </p>
        <a href={prismUrl} className="prism-notice-infobtn" target="_blank" rel="noopener noreferrer">More Info</a>
      </aside>
    );
  }

  render() {
    const {textVizProps, dialog, children} = this.props;

    return (
      <div className="prism-section-container">
        <div className="prism-section">
          {dialog}
          <TextViz {...textVizProps}>{children}</TextViz>
          <PrismUserContext.Consumer>
            {({userId}) => this.renderNotice(userId)}
          </PrismUserContext.Consumer>
        </div>
      </div>
    );
  }

}

PrismSectionLayout.contextTypes = {
  router: PropTypes.object
};

/** @param {object} props */
export default function PrismSection(props) {
  return <PrismSectionLayout textVizProps={props} />;
}
