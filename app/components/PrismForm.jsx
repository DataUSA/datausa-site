//@ts-check
import {
  Button,
  Checkbox,
  Classes,
  Dialog,
  FormGroup,
  HTMLSelect,
  InputGroup,
  Intent,
  TextArea,
} from "@blueprintjs/core";
import React, {useEffect, useState} from "react";

const formGridStyles = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "15px",
  marginBottom: "15px",
};

const PRISM_PRIVACY_NOTICE_URL = "https://www.deloitte.com/us/en/legal/privacy.html";

/**
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {(form: object) => Promise<{ok: boolean; error?: string; issues?: Record<string, string[]>}>} props.onSubmit
 * @param {() => void} props.onClose
 * @returns
 */
export function PrismFormDialog(props) {
  const [countries, setCountries] = useState(/** @type {{value: string, label: string}[]} */([]));
  const [states, setStates] = useState(/** @type {{value: string, label: string}[]} */([]));
  const [countryCode, setCountryCode] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    jobTitle: "",
    company: "",
    country: "",
    state: "",
    reason: "",
    otherReason: "",
    tellUsMore: "",
    consent: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState(/** @type {Record<string, string>} */({}));

  useEffect(() => {
    fetch("/api/prism/countries")
      .then(r => r.json())
      .then(setCountries)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!countryCode) { setStates([]); return; }
    fetch(`/api/prism/states/${countryCode}`)
      .then(r => r.json())
      .then(setStates)
      .catch(() => setStates([]));
  }, [countryCode]);

  const isFormValid =
    formData.firstName.trim() &&
    formData.lastName.trim() &&
    formData.email.trim() &&
    formData.company.trim() &&
    formData.country.trim() &&
    formData.consent;

  /**
   * @param {string} field
   * @returns {(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void}
   */
  const handleChange = (field) => (e) => {
    if (field === "country") {
      const selected = countries.find(c => c.value === e.target.value);
      setCountryCode(e.target.value);
      setFormData({ ...formData, country: selected ? selected.label : "", state: "" });
    } else {
      setFormData({ ...formData, [field]: e.target.value });
    }
    if (fieldErrors[field]) setFieldErrors({ ...fieldErrors, [field]: "" });
  };

  /**
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleConsentChange = (e) => {
    setFormData({ ...formData, consent: e.target.checked });
  };

  /**
   * @param {React.FormEvent} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || submitting) return;

    setSubmitting(true);
    setFieldErrors({});

    try {
      const result = await props.onSubmit(formData);
      if (result && result.issues) {
        /** @type {Record<string, string>} */
        const mapped = {};
        for (const [key, msgs] of Object.entries(result.issues)) {
          if (Array.isArray(msgs) && msgs.length) mapped[key] = msgs[0];
        }
        setFieldErrors(mapped);
      }
    }
    finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={props.isOpen}
      onClose={props.onClose}
      title="SHOW ME THE DATA"
      icon={null}
      style={{ width: "650px", padding: "20px" }}
      backdropProps={{style: {backgroundColor: "rgba(51,51,51,0.4)!important"}}}
    >
      <div className={Classes.DIALOG_BODY} style={{overflow: "hidden", paddingInline: "0.25rem" }}>
        <form onSubmit={handleSubmit}>
          <div style={formGridStyles}>
            <FormGroup label="First name" labelInfo="*" intent={fieldErrors.firstName ? Intent.DANGER : Intent.NONE} helperText={fieldErrors.firstName}>
              <InputGroup
                placeholder="Type here"
                value={formData.firstName}
                onChange={handleChange("firstName")}
                required
                intent={fieldErrors.firstName ? Intent.DANGER : Intent.NONE}
              />
            </FormGroup>
            <FormGroup label="Last Name" labelInfo="*" intent={fieldErrors.lastName ? Intent.DANGER : Intent.NONE} helperText={fieldErrors.lastName}>
              <InputGroup
                placeholder="Type here"
                value={formData.lastName}
                onChange={handleChange("lastName")}
                required
                intent={fieldErrors.lastName ? Intent.DANGER : Intent.NONE}
              />
            </FormGroup>
          </div>

          <div style={formGridStyles}>
            <FormGroup label="Email" labelInfo="*" intent={fieldErrors.email ? Intent.DANGER : Intent.NONE} helperText={fieldErrors.email}>
              <InputGroup
                type="email"
                placeholder="Type here"
                value={formData.email}
                onChange={handleChange("email")}
                required
                intent={fieldErrors.email ? Intent.DANGER : Intent.NONE}
              />
            </FormGroup>
            <FormGroup label="Job Title" intent={fieldErrors.jobTitle ? Intent.DANGER : Intent.NONE} helperText={fieldErrors.jobTitle}>
              <InputGroup
                placeholder="Type here"
                value={formData.jobTitle}
                onChange={handleChange("jobTitle")}
                intent={fieldErrors.jobTitle ? Intent.DANGER : Intent.NONE}
              />
            </FormGroup>
          </div>

          <FormGroup
            label="Company / Organization"
            labelInfo="*"
            style={{ marginBottom: "15px" }}
            intent={fieldErrors.company ? Intent.DANGER : Intent.NONE}
            helperText={fieldErrors.company}
          >
            <InputGroup
              placeholder="Type here"
              value={formData.company}
              onChange={handleChange("company")}
              required
              intent={fieldErrors.company ? Intent.DANGER : Intent.NONE}
            />
          </FormGroup>

          <div style={formGridStyles}>
            <FormGroup label="Country" labelInfo="*" intent={fieldErrors.country ? Intent.DANGER : Intent.NONE} helperText={fieldErrors.country}>
              <HTMLSelect
                fill
                value={countryCode}
                onChange={handleChange("country")}
              >
                <option value="">Select</option>
                {countries.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </HTMLSelect>
            </FormGroup>
            <FormGroup label="State / Province" disabled={!countryCode || states.length === 0} intent={fieldErrors.state ? Intent.DANGER : Intent.NONE} helperText={fieldErrors.state}>
              <HTMLSelect
                fill
                value={formData.state}
                onChange={handleChange("state")}
                disabled={!countryCode || states.length === 0}
              >
                <option value="">Select</option>
                {states.map(s => (
                  <option key={s.value} value={s.label}>{s.label}</option>
                ))}
              </HTMLSelect>
            </FormGroup>
          </div>

          <div style={formGridStyles}>
            <FormGroup label="Primary reason for your visit" intent={fieldErrors.reason ? Intent.DANGER : Intent.NONE} helperText={fieldErrors.reason}>
              <HTMLSelect
                fill
                value={formData.reason}
                onChange={handleChange("reason")}
              >
                <option value="">Select</option>
                <option value="personal">Personal Interest</option>
                <option value="research">Academic / Journalistic Research</option>
                <option value="management">Organizational Program Management</option>
                <option value="planning">Business Strategic Planning</option>
                <option value="other">Other (please specify)</option>
              </HTMLSelect>
            </FormGroup>
            <FormGroup label="Other" disabled={formData.reason !== "other"} intent={fieldErrors.otherReason ? Intent.DANGER : Intent.NONE} helperText={fieldErrors.otherReason}>
              <InputGroup
                placeholder="Type here"
                value={formData.otherReason}
                onChange={handleChange("otherReason")}
                disabled={formData.reason !== "other"}
                intent={fieldErrors.otherReason ? Intent.DANGER : Intent.NONE}
              />
            </FormGroup>
          </div>

          <FormGroup
            label="Tell us more"
            labelInfo="(use case, project context, additional details, etc.)"
            style={{ marginBottom: "25px" }}
            intent={fieldErrors.tellUsMore ? Intent.DANGER : Intent.NONE}
            helperText={fieldErrors.tellUsMore}
          >
            <TextArea
              growVertically={false}
              style={{ height: "80px", resize: "none", width: "100%" }}
              placeholder="Type here"
              value={formData.tellUsMore}
              onChange={handleChange("tellUsMore")}
              intent={fieldErrors.tellUsMore ? Intent.DANGER : Intent.NONE}
            />
          </FormGroup>
          <Checkbox
            checked={formData.consent}
            onChange={handleConsentChange}
            style={{fontSize: 12, color: "rgba(0, 0, 0, 0.65)"}}
            labelElement={
              <span>
                By submitting this form, I agree Deloitte may use and share my personal information and responses
                with Datawheel to understand user interest and behavior, improve Data USA and Deloitte's products
                (including, for example, PeoplePrism/HealthPrism), and contact you using the information you
                provide, in accordance with{" "}
                <a href={PRISM_PRIVACY_NOTICE_URL} target="_blank" rel="noopener noreferrer">
                  Deloitte's Privacy Notice
                </a>
                . You can opt out of future outreach at any time.
              </span>
            }
          />
        </form>
      </div>

      <div className={Classes.DIALOG_FOOTER}>

        <div
          className={Classes.DIALOG_FOOTER_ACTIONS}
          style={{ display: "flex", justifyContent: "space-between", width: "100%"}}
        >
          <Button
            onClick={props.onClose}
            disabled={submitting}
            style={{
              width: "150px",
              height: "40px",
              background: "none",
              border: "1px solid #106ba3",
              color: "#106ba3",
            }}
          >
            CANCEL
          </Button>
          <Button
            type="submit"
            intent={Intent.PRIMARY}
            onClick={handleSubmit}
            disabled={!isFormValid || submitting}
            style={{
              width: "200px",
              height: "40px",
              backgroundColor: "#3372A6",
            }}
          >
            {submitting ? "SUBMITTING..." : "UNBLUR THE DATA"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
