//@ts-check
import React from "react"
import TextViz from "../../toCanon/topics/TextViz"
import "./PrismSection.css";

export default class PrismSection extends React.Component {
  render() {
    return (
      <div className="prism-section-container">
        <div className="prism-section">
          <TextViz {...this.props} />
          <aside className="prism-notice">
            <img className="prism-notice-logo" src="/images/footer/deloitte_dark.png" alt="Deloitte." />
            <p className="prism-notice-call">Deloitte's PeoplePrism&trade; harnesses <strong>predictive and geospatial analytics and one of the largest population insights datasets</strong> to provide actionable information on the environmental and social factors that influence health and quality of life for people and communities. <a href="mailto:">Contact Deloitte</a> for additional PeoplePrism data features, including distance to primary and specialized care.</p>
            <a href="https://peopleprism.ai/" className="prism-notice-infobtn">More Info</a>
          </aside>
        </div>
      </div>
    );
  }
}
