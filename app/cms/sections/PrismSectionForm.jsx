//@ts-check
import {useState} from "react";
import {PrismFormDialog} from "../../components/PrismForm";
import {PrismSectionLayout} from "./PrismSection";
import {PrismContext} from "../vizzes/PrismContext";

/** @param {object} props */
export default function PrismSectionForm(props) {
  const [showForm, setShowForm] = useState(false);
  const [formSent, setFormSent] = useState(false);

  const dialog = (
    <PrismFormDialog
      isOpen={showForm}
      onClose={() => { setShowForm(false); setFormSent(false); }}
      onSubmit={(/** @type {object} */ data) => {
        window.fetch("/api/prism/submit", {method: "POST", body: JSON.stringify(data)})
          .then(() => { setShowForm(false); setFormSent(true); })
          .catch(() => { setShowForm(false); setFormSent(true); });
      }}
    />
  );

  return (
    <PrismContext.Provider value={{openForm: () => setShowForm(true), unlocked: formSent}}>
      <PrismSectionLayout textVizProps={{...props, locked: !formSent}} dialog={dialog} />
    </PrismContext.Provider>
  );
}
