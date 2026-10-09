"use client";

import {useEffect, useRef, useState} from "react";
import styles from "./Prism.module.css";

interface Option {value: string; label: string}

const PRIVACY_URL = "https://www.deloitte.com/us/en/legal/privacy.html";

const initial = {
  firstName: "", lastName: "", email: "", jobTitle: "", company: "", country: "", state: "",
  reason: "", otherReason: "", tellUsMore: "", consent: false
};

interface PrismFormProps {
  open: boolean;
  onClose: () => void;
  onRegistered: () => Promise<void>;
}

/** "Show me the data" registration dialog (legacy `PrismFormDialog`). */
export function PrismForm({open, onClose, onRegistered}: PrismFormProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [countries, setCountries] = useState<Option[]>([]);
  const [states, setStates] = useState<Option[]>([]);
  const [countryCode, setCountryCode] = useState("");
  const [form, setForm] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open || countries.length) return;
    fetch("/api/prism/countries").then(r => r.json()).then(setCountries).catch(() => {});
  }, [open, countries.length]);

  useEffect(() => {
    if (!countryCode) { setStates([]); return; }
    fetch(`/api/prism/states/${countryCode}`).then(r => r.json()).then(setStates).catch(() => setStates([]));
  }, [countryCode]);

  const valid = form.firstName.trim() && form.lastName.trim() && form.email.trim() && form.company.trim() && form.country.trim() && form.consent;

  const set = (field: keyof typeof initial) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (field === "country") {
      const selected = countries.find(c => c.value === value);
      setCountryCode(value);
      setForm(f => ({...f, country: selected ? selected.label : "", state: ""}));
    }
    else setForm(f => ({...f, [field]: value}));
    if (errors[field]) setErrors(err => ({...err, [field]: ""}));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setErrors({});
    try {
      const res = await fetch("/api/prism/register", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(form)});
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        await onRegistered();
        onClose();
      }
      else if (body && body.issues) {
        const mapped: Record<string, string> = {};
        Object.entries(body.issues as Record<string, string[]>).forEach(([k, msgs]) => { if (msgs?.length) mapped[k] = msgs[0]; });
        setErrors(mapped);
      }
      else setErrors({form: body?.error ?? "Registration failed"});
    }
    finally {
      setSubmitting(false);
    }
  };

  const field = (label: string, key: keyof typeof initial, required = false, type = "text", disabled = false) => (
    <label className={`${styles.field} ${errors[key] ? styles.fieldError : ""}`}>
      <span className={styles.fieldLabel}>{label}{required && <em>*</em>}</span>
      <input type={type} placeholder="Type here" value={form[key] as string} onChange={set(key)} required={required} disabled={disabled} />
      {errors[key] && <span className={styles.fieldHelp}>{errors[key]}</span>}
    </label>
  );

  return (
    <dialog ref={dialogRef} className={styles.dialog} onClose={onClose} aria-label="Register for PeoplePrism data">
      <div className={styles.dialogHeader}>
        <h3>SHOW ME THE DATA</h3>
        <button type="button" className={styles.dialogClose} aria-label="Close" onClick={onClose}>×</button>
      </div>
      <form onSubmit={submit} className={styles.form}>
        <div className={styles.grid}>
          {field("First name", "firstName", true)}
          {field("Last Name", "lastName", true)}
        </div>
        <div className={styles.grid}>
          {field("Email", "email", true, "email")}
          {field("Job Title", "jobTitle")}
        </div>
        {field("Company / Organization", "company", true)}
        <div className={styles.grid}>
          <label className={`${styles.field} ${errors.country ? styles.fieldError : ""}`}>
            <span className={styles.fieldLabel}>Country<em>*</em></span>
            <select value={countryCode} onChange={set("country")}>
              <option value="">Select</option>
              {countries.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            {errors.country && <span className={styles.fieldHelp}>{errors.country}</span>}
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>State / Province</span>
            <select value={form.state} onChange={set("state")} disabled={!countryCode || !states.length}>
              <option value="">Select</option>
              {states.map(s => <option key={s.value} value={s.label}>{s.label}</option>)}
            </select>
          </label>
        </div>
        <div className={styles.grid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Primary reason for your visit</span>
            <select value={form.reason} onChange={set("reason")}>
              <option value="">Select</option>
              <option value="personal">Personal Interest</option>
              <option value="research">Academic / Journalistic Research</option>
              <option value="management">Organizational Program Management</option>
              <option value="planning">Business Strategic Planning</option>
              <option value="other">Other (please specify)</option>
            </select>
          </label>
          {field("Other", "otherReason", false, "text", form.reason !== "other")}
        </div>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Tell us more <small>(use case, project context, additional details, etc.)</small></span>
          <textarea placeholder="Type here" value={form.tellUsMore} onChange={set("tellUsMore")} rows={3} />
        </label>
        <label className={styles.consent}>
          <input type="checkbox" checked={form.consent} onChange={e => setForm(f => ({...f, consent: e.target.checked}))} required />
          <span>I agree to be contacted by Deloitte about PeoplePrism and have read the <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer">privacy notice</a>.<em>*</em></span>
        </label>
        {errors.form && <p className={styles.fieldHelp}>{errors.form}</p>}
        <div className={styles.actions}>
          <button type="button" className={styles.secondaryButton} onClick={onClose}>Cancel</button>
          <button type="submit" className={styles.primaryButton} disabled={!valid || submitting}>{submitting ? "Submitting…" : "Submit"}</button>
        </div>
      </form>
    </dialog>
  );
}
