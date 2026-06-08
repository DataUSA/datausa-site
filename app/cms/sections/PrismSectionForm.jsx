//@ts-check
import React from "react";
import { Button, Icon, IconSize } from "@blueprintjs/core";
import { useState } from "react";
import { PrismFormDialog } from "../../components/PrismForm";
import { PrismSectionLayout } from "./PrismSection";

/** @param {object} props */
export default function PrismSectionForm(props) {
  const [showForm, setShowForm] = useState(false);
  const [formSent, setFormSent] = useState(false);

  const dialog = (
    <PrismFormDialog
      isOpen={showForm}
      onClose={() => { setShowForm(false); setFormSent(false); }}
      onSubmit={(/** @type {object} */ data) => {
        window.fetch("/api/prism/submit", { method: "POST", body: JSON.stringify(data) })
          .then(() => { setShowForm(false); setFormSent(true); });
      }}
    />
  );

  const blocker = !formSent && (
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
          <Button intent="primary" onClick={() => setShowForm(true)}>
            Show me the data
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <PrismSectionLayout
      textVizProps={{...props, locked: true}}
      dialog={dialog}
    >
      {blocker}
    </PrismSectionLayout>
  );
}
