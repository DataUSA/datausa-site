"use client";

import {useEffect, useRef, useState} from "react";
import type * as Leaflet from "leaflet";
import {feature} from "topojson-client";
import type {Topology} from "topojson-specification";
import {usePrism} from "./PrismProvider";
import styles from "./Prism.module.css";
import "leaflet/dist/leaflet.css";

type AnyRecord = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
type Accessor = string | ((d: AnyRecord) => unknown);

const LOCK_SVG_MARKER = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#353535" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><rect x="4" y="11" width="16" height="10" rx="2" ry="2"/><path d="M8 11V6a4 4 0 0 1 8 0v5"/></svg>`;
const LOCK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="-1.5 -1.5 27 27" fill="none" stroke="#ef6145" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><path d="M 12 1.75 C 19.79 1.75 22.25 4.21 22.25 12 C 22.25 19.79 19.79 22.25 12 22.25 C 4.21 22.25 1.75 19.79 1.75 12 C 1.75 4.21 4.21 1.75 12 1.75 Z"/><rect x="8" y="12" width="8" height="5" rx="1.5" ry="1.5"/><path d="M10 12V9a2 2 0 0 1 4 0v3"/></svg>`;

const resolve = (accessor: Accessor | undefined, d: AnyRecord, fallback: string) =>
  typeof accessor === "function" ? accessor(d) : d[accessor ?? fallback];

function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;"}[c] as string));
}

/**
 * PeoplePrism facilities map (legacy `PrismMap.jsx`), rebuilt on plain Leaflet: county outlines from
 * a topojson file, one ranked marker per facility with a hover/click popup, and a blurred blocker
 * with the registration call-to-action while the visitor has not unlocked the data.
 */
export function PrismMap({config}: {config: AnyRecord}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const leafletRef = useRef<typeof Leaflet | null>(null);
  const layersRef = useRef<{counties?: Leaflet.GeoJSON; markers?: Leaflet.LayerGroup}>({});
  const [counties, setCounties] = useState<GeoJSON.FeatureCollection | null>(null);
  const [facilities, setFacilities] = useState<AnyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const pinnedRef = useRef<string | null>(null);
  const {unlocked, openForm} = usePrism();

  // Leaflet needs the DOM; load it on the client only.
  useEffect(() => {
    let cancelled = false;
    import("leaflet").then(L => {
      if (cancelled || !containerRef.current || mapRef.current) return;
      leafletRef.current = L;
      const map = L.map(containerRef.current, {center: [38.9, -95.7], zoom: 4, attributionControl: false});
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=cb1_2h0m_1_893ce8e35ef09eaf402c1fa2", {subdomains: "abcd", maxZoom: 19}).addTo(map);
      mapRef.current = map;
    });
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!config.topojson) return;
    fetch(config.topojson).then(r => r.json()).then((topo: Topology) => {
      const key = Object.keys(topo.objects)[0];
      setCounties(feature(topo, topo.objects[key]) as GeoJSON.FeatureCollection);
    }).catch(err => console.error("Failed to load counties", err));
  }, [config.topojson]);

  useEffect(() => {
    if (!config.data || !unlocked) { setFacilities([]); return; }
    setLoading(true);
    fetch(config.data).then(r => r.json()).then(json => {
      if (typeof config.dataFormat === "function") config.dataFormat(json);
      setFacilities(Array.isArray(json.data) ? json.data : []);
    }).catch(err => console.error("Failed to load facilities", err)).finally(() => setLoading(false));
  }, [config.data, config.dataFormat, unlocked]);

  // County outlines and viewport
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map || !counties) return;
    layersRef.current.counties?.remove();
    const layer = L.geoJSON(counties, {
      style: f => ({
        weight: 1,
        color: "#94a3b8",
        fillColor: f?.properties?.id === config.county ? "#83C0B4" : "#e2e8f0",
        fillOpacity: f?.properties?.id === config.county ? 0.25 : 0.4
      })
    }).addTo(map);
    layersRef.current.counties = layer;
    const selected = counties.features.find(f => f.properties?.id === config.county);
    if (selected) map.fitBounds(L.geoJSON(selected).getBounds(), {padding: [40, 40]});
  }, [counties, config.county]);

  // Facility markers
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;
    layersRef.current.markers?.remove();
    const group = L.layerGroup().addTo(map);
    layersRef.current.markers = group;
    const sortBy = config.sortBy as Accessor | undefined;
    const sorted = [...facilities].sort((a, b) => Number(resolve(sortBy, a, "Avg estimated drive time (min)")) - Number(resolve(sortBy, b, "Avg estimated drive time (min)")));
    const tooltip = (config.tooltipConfig ?? {}) as AnyRecord;
    sorted.forEach(f => {
      const id = String(resolve(config.id, f, "Facility ID"));
      const lat = parseFloat(String(resolve(config.latitude, f, "Latitude")));
      const lng = parseFloat(String(resolve(config.longitude, f, "Longitude")));
      if (Number.isNaN(lat) || Number.isNaN(lng)) return;
      const rank = Number(resolve(config.rankBy, f, "Rank Facility")) || null;
      const isTop = rank !== null && rank <= 5;
      const size = 24;
      const html = isTop
        ? `<div style="width:${size}px;height:${size}px;border-radius:50%;background:#83C0B4;border:2px solid #353535;display:flex;align-items:center;justify-content:center;color:#353535;font-weight:700;font-size:14px;font-family:sans-serif;">${rank}</div>`
        : `<div style="width:${size}px;height:${size}px;border-radius:50%;background:#C5C5C5;border:2px solid #353535;display:flex;align-items:center;justify-content:center;">${LOCK_SVG_MARKER}</div>`;
      const icon = L.divIcon({html, className: "", iconSize: [size, size], iconAnchor: [size / 2, size / 2], popupAnchor: [0, -(size / 2)]});
      const title = tooltip.title ? (typeof tooltip.title === "function" ? tooltip.title(f) : tooltip.title) : f.Facility;
      const subtitle = tooltip.subtitle ? (typeof tooltip.subtitle === "function" ? tooltip.subtitle(f) : tooltip.subtitle) : null;
      const rows: [string, unknown][] = (typeof tooltip.tbody === "function" ? tooltip.tbody(f) : tooltip.tbody) || [
        ["Drive time", (d: AnyRecord) => `${Number(resolve(sortBy, d, "Avg estimated drive time (min)")).toFixed(1)} min`],
        ["County", (d: AnyRecord) => d["County Facility"]]
      ];
      const body = rows.map(([label, val]) => {
        const locked = label.includes("[lock_icon]");
        const value = typeof val === "function" ? (val as (d: AnyRecord) => unknown)(f) : val;
        return `<div class="${styles.popupRow}"${locked ? " data-locked=\"true\"" : ""}><span class="${styles.popupLabel}">${label.replace("[lock_icon]", LOCK_SVG)}</span><span class="${styles.popupValue}">${value}</span></div>`;
      }).join("");
      const popupHtml = `<div class="${styles.popupInner}"><div class="${styles.popupHeader}"><div class="${styles.popupTitle}">${escapeHtml(title)}</div>${subtitle ? `<div class="${styles.popupSubtitle}">${escapeHtml(subtitle)}</div>` : ""}</div><div class="${styles.popupBody}">${body}</div></div>`;
      const marker = L.marker([lat, lng], {icon}).addTo(group);
      marker.bindPopup(popupHtml, {className: styles.popup, closeButton: false});
      marker.on("mouseover", () => marker.openPopup());
      marker.on("mouseout", () => { if (pinnedRef.current !== id) marker.closePopup(); });
      marker.on("click", () => {
        if (pinnedRef.current === id) { pinnedRef.current = null; marker.closePopup(); }
        else { pinnedRef.current = id; marker.openPopup(); }
      });
    });
  }, [facilities, config]);

  return (
    <div className={styles.map}>
      {loading && <div className={styles.mapLoader}><div className={styles.mapSpinner} /></div>}
      {!unlocked && (
        <div className={styles.blocker}>
          <div className={styles.blockerOverlay}>
            <div className={styles.blockerDialog}>
              <h3>Unlock this data</h3>
              <p>Enter your contact information to unblur results and get the full view.</p>
              <ul>
                <li>✓ View facility names and addresses</li>
                <li>✓ View census tracts numbers</li>
              </ul>
              <button type="button" className={styles.primaryButton} onClick={openForm}>Show me the data</button>
            </div>
          </div>
        </div>
      )}
      <div ref={containerRef} className={styles.leaflet} />
    </div>
  );
}
