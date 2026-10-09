"use client";

import {useEffect, useRef, useState, type RefObject} from "react";
import {saveElement} from "@d3plus/export";
import {abbreviate} from "@/content/formatters";
import {normalizeTesseractUrl} from "@/lib/api/urls";
import styles from "./Options.module.css";

type AnyRecord = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

interface OptionsProps {
  config: AnyRecord;
  title: string;
  sectionSlug: string;
  containerRef: RefObject<HTMLDivElement | null>;
}

type Panel = "view-table" | "save-image" | "share" | null;

const STICKY_COLUMNS = ["Year", "Geography", "PUMS Industry", "PUMS Occupation", "CIP", "University", "Gender"].reverse();

function dataUrls(data: unknown): string[] {
  if (Array.isArray(data)) return data.every(d => typeof d === "string") ? data as string[] : [];
  return typeof data === "string" ? [data] : [];
}

async function loadRows(urls: string[], dataFormat?: (resp: unknown) => unknown): Promise<AnyRecord[]> {
  const responses = await Promise.all(urls.map(u => fetch(normalizeTesseractUrl(u)).then(r => r.json())));
  const raw = urls.length === 1 ? responses[0] : responses;
  const formatted = dataFormat ? dataFormat(raw) : raw;
  if (Array.isArray(formatted)) return formatted as AnyRecord[];
  if (formatted && typeof formatted === "object" && Array.isArray((formatted as AnyRecord).data)) return (formatted as AnyRecord).data;
  return [];
}

function toCsv(rows: AnyRecord[], columns: string[]): string {
  const escape = (val: unknown) => typeof val === "number" ? String(val) : val === undefined || val === null ? "" : `"${String(val).replace(/"/g, "\"\"")}"`;
  return [columns.join(","), ...rows.map(row => columns.map(c => escape(row[c])).join(","))].join("\n");
}

function download(filename: string, content: Blob) {
  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * The "View Data / Save Image / Share" toolbar above each chart, with its dialog (legacy
 * `Options.jsx`). The data cart feature of the legacy site was already disabled and is not ported.
 */
export function Options({config, title, sectionSlug, containerRef}: OptionsProps) {
  const [panel, setPanel] = useState<Panel>(null);
  const [rows, setRows] = useState<AnyRecord[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [includeText, setIncludeText] = useState(false);
  const [embedSize, setEmbedSize] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const urls = dataUrls(config.data).map(d => d.replace(/[&?]limit=[^&]+/g, ""));
  const sizes = [
    {label: "Small 720 x 480", value: ["720px", "480px"]},
    {label: "Large 1440 x 1080", value: ["1440px", "1080px"]},
    {label: "Fullscreen", value: ["100%", "100%"]}
  ];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (panel && !dialog.open) dialog.showModal();
    if (!panel && dialog.open) dialog.close();
  }, [panel]);

  useEffect(() => {
    if (panel === "view-table" && rows === null && !loading && urls.length) {
      setLoading(true);
      loadRows(urls, config.dataFormat).then(setRows).catch(err => { console.error(err); setRows([]); }).finally(() => setLoading(false));
    }
  }, [panel, rows, loading, urls, config.dataFormat]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const baseURL = `${origin}${pathname.split("/").slice(0, 4).join("/")}`;
  const profileURL = `${baseURL}#${sectionSlug}`;
  const embedURL = `${baseURL}/${sectionSlug}`;
  const embedCode = `<iframe width="${sizes[embedSize].value[0]}" height="${sizes[embedSize].value[1]}" src="${embedURL}?viz=${includeText ? "false" : "true"}" frameborder="0" ></iframe>`;

  const onSave = async (type: "png" | "svg") => {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return;
    if (type === "svg") {
      const serialized = new XMLSerializer().serializeToString(svg);
      download(`${title}.svg`, new Blob([serialized], {type: "image/svg+xml"}));
    }
    else {
      saveElement(svg, {filename: title, type: "png"});
    }
  };

  const columns = rows && rows.length ? Object.keys(rows[0]).filter(d => !d.includes(" ID") && !d.includes("Slug ")).sort((a, b) => STICKY_COLUMNS.indexOf(b) - STICKY_COLUMNS.indexOf(a)) : [];

  const onCsv = () => {
    if (!rows) return;
    download(`${title}.csv`, new Blob([toCsv(rows, columns)], {type: "text/csv"}));
  };

  return (
    <div className={styles.options}>
      <button type="button" className={`${styles.option} ${styles.viewTable}`} onClick={() => setPanel("view-table")} title="View and download the underlying dataset used to create this visualization.">
        <span className={styles.label}>View Data</span>
      </button>
      <button type="button" className={`${styles.option} ${styles.saveImage}`} onClick={() => setPanel("save-image")} title="Download this visualization as a PNG image or SVG code.">
        <span className={styles.label}>Save Image</span>
      </button>
      {sectionSlug && (
        <button type="button" className={`${styles.option} ${styles.share}`} onClick={() => setPanel("share")} title="Share this visualization on Twitter, Facebook, or on your personal website.">
          <span className={styles.label}>Share / Embed</span>
        </button>
      )}
      <dialog ref={dialogRef} className={styles.dialog} onClose={() => setPanel(null)} aria-label={`${title} options`}>
        <div className={styles.tabs} role="tablist">
          {(["view-table", "save-image", "share"] as const).filter(p => p !== "share" || sectionSlug).map(p => (
            <button key={p} type="button" role="tab" aria-selected={panel === p} className={`${styles.tab} ${panel === p ? styles.tabActive : ""}`} onClick={() => setPanel(p)}>
              {p === "view-table" ? "View Data" : p === "save-image" ? "Save Image" : "Share / Embed"}
            </button>
          ))}
          <button type="button" className={styles.close} aria-label="Close" onClick={() => setPanel(null)}>×</button>
        </div>
        {panel === "view-table" && (
          <div className={`${styles.body} ${styles.vertical}`}>
            {rows === null ? <div className={styles.loading}>Loading Data</div> : (
              <>
                <div className={`${styles.download} ${urls.length > 1 ? styles.vertical : ""}`}>
                  <button type="button" className={styles.downloadButton} onClick={onCsv}>Download as CSV</button>
                  {urls.map(u => <input key={u} type="text" readOnly value={u.startsWith("http") ? normalizeTesseractUrl(u) : `${origin}${u}`} onClick={e => e.currentTarget.select()} />)}
                </div>
                <div className={styles.table}>
                  <table>
                    <thead><tr>{columns.map(c => <th key={c}>{c}</th>)}</tr></thead>
                    <tbody>
                      {rows.slice(0, 500).map((row, i) => (
                        <tr key={i}>{columns.map(c => <td key={c}>{typeof row[c] === "number" ? abbreviate(row[c]) : String(row[c] ?? "")}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                  {rows.length > 500 && <p className={styles.note}>Showing the first 500 of {rows.length} rows; download the CSV for the full dataset.</p>}
                </div>
              </>
            )}
          </div>
        )}
        {panel === "save-image" && (
          <div className={`${styles.body} ${styles.saveImagePanel}`}>
            <button type="button" className={styles.saveButton} onClick={() => onSave("png")}><img src="/images/viz/save-image.svg" alt="" />PNG</button>
            <button type="button" className={styles.saveButton} onClick={() => onSave("svg")}><img src="/images/viz/save-image.svg" alt="" />SVG</button>
          </div>
        )}
        {panel === "share" && (
          <div className={`${styles.body} ${styles.vertical} ${styles.sharePanel}`}>
            <div className={styles.social}>
              <div className={styles.networks}>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileURL)}`} target="_blank" rel="noopener noreferrer"><img className={styles.facebook} src="/images/viz/facebook.svg" alt="Share on Facebook" /></a>
                <a href={`https://twitter.com/home?status=${encodeURIComponent(profileURL)}`} target="_blank" rel="noopener noreferrer"><img className={styles.twitter} src="/images/viz/twitter.svg" alt="Share on Twitter" /></a>
              </div>
              <input type="text" readOnly value={profileURL} onClick={e => e.currentTarget.select()} />
            </div>
            <div className={styles.horizontal}>
              <img className={styles.preview} src={`/images/viz/mini-viz${includeText ? "-text" : ""}.png`} alt="" />
              <div className={styles.info}>
                <p>Copy and paste the following code to place an interactive version of this visualization on your website.</p>
                <label><input type="checkbox" checked={includeText} onChange={e => setIncludeText(e.target.checked)} /> Include paragraph and stats</label>
                <select value={embedSize} onChange={e => setEmbedSize(Number(e.target.value))} aria-label="Embed size">
                  {sizes.map((s, i) => <option key={s.label} value={i}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div className={styles.embedLink}>
              <input type="text" readOnly value={embedCode} onClick={e => e.currentTarget.select()} />
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
