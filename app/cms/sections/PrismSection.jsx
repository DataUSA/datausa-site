//@ts-check
import { Button, Icon, IconSize } from "@blueprintjs/core";
import React from "react";
import TextViz from "../../toCanon/topics/TextViz";
import "./PrismSection.css";
import { PrismFormDialog } from "../../components/PrismForm";

export default class PrismSection extends React.Component {
  state = {
    showForm: false,
    formSent: false,
  };

  render() {
    const formDialogClose = () => {
      this.setState({ showForm: false, formSent: false });
    };

    /**
     * @param {object} data
     */
    const formDialogSubmit = (data) => {
      console.log("Submitted Data:", data);
      window.fetch("/api/prism/submit", { body: data }).then((res) => {
        this.setState({ showForm: false, formSent: true });
      });
    };

    return (
      <div className="prism-section-container">
        <div className="prism-section">
          <PrismFormDialog
            isOpen={this.state.showForm}
            onClose={formDialogClose}
            onSubmit={formDialogSubmit}
          />

          <TextViz {...this.props}>
            {!this.state.formSent && (
              <div className="prism-viz-blocker">
                <div className="prism-viz-overlay">
                  <div className="prism-viz-dialog">
                    <h3>Unlock this data</h3>
                    <p>Enter your email to unblur results and get the full view.</p>
                    <ul>
                      <li>
                        <Icon icon="tick-circle" size={IconSize.STANDARD} />{" "}
                        View facility names and addresses
                      </li>
                      <li>
                        <Icon icon="tick-circle" size={IconSize.STANDARD} />{" "}
                        View census tracts numbers
                      </li>
                    </ul>
                    <Button
                      intent="primary"
                      onClick={() => this.setState({ showForm: true })}
                    >
                      Show me the data
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TextViz>

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
              <a href="mailto:">Contact Deloitte</a>
              {" for additional PeoplePrism data features, including distance to primary and specialized care."}
            </p>
            <a href="https://peopleprism.ai/" className="prism-notice-infobtn">More Info</a>
          </aside>
        </div>
      </div>
    );
  }
}
