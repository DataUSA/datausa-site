//@ts-check
import {
  Button,
  Classes,
  Dialog,
  FormGroup,
  HTMLSelect,
  InputGroup,
  Intent,
  TextArea,
} from "@blueprintjs/core";
import React, {useState} from "react";

const US_STATES = [
  {value: "AL", label: "Alabama"}, {value: "AK", label: "Alaska"}, {value: "AZ", label: "Arizona"},
  {value: "AR", label: "Arkansas"}, {value: "CA", label: "California"}, {value: "CO", label: "Colorado"},
  {value: "CT", label: "Connecticut"}, {value: "DE", label: "Delaware"}, {value: "DC", label: "District of Columbia"},
  {value: "FL", label: "Florida"}, {value: "GA", label: "Georgia"}, {value: "HI", label: "Hawaii"},
  {value: "ID", label: "Idaho"}, {value: "IL", label: "Illinois"}, {value: "IN", label: "Indiana"},
  {value: "IA", label: "Iowa"}, {value: "KS", label: "Kansas"}, {value: "KY", label: "Kentucky"},
  {value: "LA", label: "Louisiana"}, {value: "ME", label: "Maine"}, {value: "MD", label: "Maryland"},
  {value: "MA", label: "Massachusetts"}, {value: "MI", label: "Michigan"}, {value: "MN", label: "Minnesota"},
  {value: "MS", label: "Mississippi"}, {value: "MO", label: "Missouri"}, {value: "MT", label: "Montana"},
  {value: "NE", label: "Nebraska"}, {value: "NV", label: "Nevada"}, {value: "NH", label: "New Hampshire"},
  {value: "NJ", label: "New Jersey"}, {value: "NM", label: "New Mexico"}, {value: "NY", label: "New York"},
  {value: "NC", label: "North Carolina"}, {value: "ND", label: "North Dakota"}, {value: "OH", label: "Ohio"},
  {value: "OK", label: "Oklahoma"}, {value: "OR", label: "Oregon"}, {value: "PA", label: "Pennsylvania"},
  {value: "RI", label: "Rhode Island"}, {value: "SC", label: "South Carolina"}, {value: "SD", label: "South Dakota"},
  {value: "TN", label: "Tennessee"}, {value: "TX", label: "Texas"}, {value: "UT", label: "Utah"},
  {value: "VT", label: "Vermont"}, {value: "VA", label: "Virginia"}, {value: "WA", label: "Washington"},
  {value: "WV", label: "West Virginia"}, {value: "WI", label: "Wisconsin"}, {value: "WY", label: "Wyoming"},
];

const CA_PROVINCES = [
  {value: "AB", label: "Alberta"}, {value: "BC", label: "British Columbia"}, {value: "MB", label: "Manitoba"},
  {value: "NB", label: "New Brunswick"}, {value: "NL", label: "Newfoundland and Labrador"},
  {value: "NS", label: "Nova Scotia"}, {value: "ON", label: "Ontario"}, {value: "PE", label: "Prince Edward Island"},
  {value: "QC", label: "Quebec"}, {value: "SK", label: "Saskatchewan"}, {value: "NT", label: "Northwest Territories"},
  {value: "NU", label: "Nunavut"}, {value: "YT", label: "Yukon"},
];

/** @type {Record<string, {label: string, value: string}[] | undefined>} */
const STATES_BY_COUNTRY = {
  US: US_STATES,
  CA: CA_PROVINCES,
};

const formGridStyles = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "15px",
  marginBottom: "15px",
};

/**
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {(form: object) => Promise<{ok: boolean; error?: string; issues?: Record<string, string[]>}>} props.onSubmit
 * @param {() => void} props.onClose
 * @returns
 */
export function PrismFormDialog(props) {
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
  });

  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState(/** @type {Record<string, string>} */({}));

  const isFormValid =
    formData.firstName.trim() &&
    formData.lastName.trim() &&
    formData.email.trim() &&
    formData.company.trim();

  /**
   * @param {string} field
   * @returns {(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void}
   */
  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (fieldErrors[field]) setFieldErrors({ ...fieldErrors, [field]: "" });
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
            <FormGroup label="Country" intent={fieldErrors.country ? Intent.DANGER : Intent.NONE} helperText={fieldErrors.country}>
              <HTMLSelect
                fill
                value={formData.country}
                onChange={handleChange("country")}
              >
                <option value="">Select</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                {/* TODO: what other countries are of main interest? */}
              </HTMLSelect>
            </FormGroup>
            <FormGroup label="State / Province" disabled={!formData.country} intent={fieldErrors.state ? Intent.DANGER : Intent.NONE} helperText={fieldErrors.state}>
              <HTMLSelect
                fill
                value={formData.state}
                onChange={handleChange("state")}
                disabled={!formData.country}
              >
                <option value="">Select</option>
                {(STATES_BY_COUNTRY[formData.country] || []).map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
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
              style={{ height: "80px", resize: "none" }}
              placeholder="Type here"
              value={formData.tellUsMore}
              onChange={handleChange("tellUsMore")}
              intent={fieldErrors.tellUsMore ? Intent.DANGER : Intent.NONE}
            />
          </FormGroup>
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
