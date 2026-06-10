//@ts-check
import {useState} from "react";
import {PrismFormDialog} from "../../components/PrismForm";
import {PrismSectionLayout} from "./PrismSection";
import {PrismContext} from "../vizzes/PrismContext";
import {useEffect} from "react";

/** @param {object} props */
export default function PrismSectionForm(props) {
  const [showForm, setShowForm] = useState(false);
  const [isVerified, setVerified] = useState(false);

  useEffect(() => {
    window.fetch("/api/prism/status").then((res) => setVerified(res.ok));
  }, []);

  const dialog = (
    <PrismFormDialog
      isOpen={showForm}
      onClose={() => { setShowForm(false); }}
      onSubmit={(data) => window.fetch("/api/prism/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }).then(async (res) => {
        const body = await res.json();
        if (res.ok) {
          setVerified(true);
          setShowForm(false);
        }
        return body;
      })}
    />
  );

  return (
    <PrismContext.Provider value={{openForm: () => setShowForm(true), unlocked: isVerified}}>
      <PrismSectionLayout textVizProps={{...props, locked: !isVerified}} dialog={dialog} />
    </PrismContext.Provider>
  );
}
