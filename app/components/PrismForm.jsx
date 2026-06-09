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
import "../cms/sections/PrismSection.css";

const formGridStyles = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "15px",
  marginBottom: "15px",
};

/**
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {(form: object) => void} props.onSubmit
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
  };

  /**
   * @param {React.FormEvent} e
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    if (isFormValid) props.onSubmit(formData);
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
            <FormGroup label="First name" labelInfo="*">
              <InputGroup
                placeholder="Type here"
                value={formData.firstName}
                onChange={handleChange("firstName")}
                required
              />
            </FormGroup>
            <FormGroup label="Last Name" labelInfo="*">
              <InputGroup
                placeholder="Type here"
                value={formData.lastName}
                onChange={handleChange("lastName")}
                required
              />
            </FormGroup>
          </div>

          <div style={formGridStyles}>
            <FormGroup label="Email" labelInfo="*">
              <InputGroup
                type="email"
                placeholder="Type here"
                value={formData.email}
                onChange={handleChange("email")}
                required
              />
            </FormGroup>
            <FormGroup label="Job Title">
              <InputGroup
                placeholder="Type here"
                value={formData.jobTitle}
                onChange={handleChange("jobTitle")}
              />
            </FormGroup>
          </div>

          <FormGroup
            label="Company / Organization"
            labelInfo="*"
            style={{ marginBottom: "15px" }}
          >
            <InputGroup
              placeholder="Type here"
              value={formData.company}
              onChange={handleChange("company")}
              required
            />
          </FormGroup>

          <div style={formGridStyles}>
            <FormGroup label="Country">
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
            <FormGroup label="State" disabled={!formData.country}>
              <HTMLSelect
                fill
                value={formData.state}
                onChange={handleChange("state")}
                disabled={!formData.country}
              >
                <option value="">Select</option>
                <option value="NY">New York</option>
                <option value="CA">California</option>
                <option value="TX">Texas</option>
                {/* TODO: add states for the defined countries */}
              </HTMLSelect>
            </FormGroup>
          </div>

          <div style={formGridStyles}>
            <FormGroup label="Primary reason for your visit">
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
            <FormGroup label="Other" disabled={formData.reason !== "other"}>
              <InputGroup
                placeholder="Type here"
                value={formData.otherReason}
                onChange={handleChange("otherReason")}
                disabled={formData.reason !== "other"}
              />
            </FormGroup>
          </div>

          <FormGroup
            label="Tell us more"
            labelInfo="(use case, project context, additional details, etc.)"
            style={{ marginBottom: "25px" }}
          >
            <TextArea
              growVertically={false}
              style={{ height: "80px", resize: "none" }}
              placeholder="Type here"
              value={formData.tellUsMore}
              onChange={handleChange("tellUsMore")}
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
            disabled={!isFormValid}
            style={{
              width: "200px",
              height: "40px",
              backgroundColor: "#3372A6",
            }}
          >
            UNBLUR THE DATA
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
