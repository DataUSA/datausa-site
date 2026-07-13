# PrismMap viz config reference

The `PrismMap` viz type renders a Leaflet map with county boundaries and facility markers. All field accessors accept either a **field name string** (`"Latitude"`) or an **accessor function** (`d => d["Latitude"]`).

---

## Required

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | `"PrismMap"` | Identifies the viz type. |
| `data` | `string` | URL for the facility/point data. County and provider filters should be applied in the URL before the component fetches it. |
| `topojson` | `string` | URL for the county boundary TopoJSON file. |
| `county` | `string` | FIPS county ID (e.g. `"05000US06059"`) used to highlight the selected county on the map. |

---

## Field accessors

| Parameter | Default field | Description |
|-----------|---------------|-------------|
| `id` | `"Facility ID"` | Unique identifier for each data point. Used as the React key for markers. |
| `latitude` | `"Latitude"` | Latitude of the facility. |
| `longitude` | `"Longitude"` | Longitude of the facility. |
| `sortBy` | `"Avg estimated drive time (min)"` | Numeric field used to sort facilities. Determines marker render order (closest first). |
| `rankBy` | `"Rank Facility"` | Numeric rank from the data. Facilities with a rank get a numbered blue marker; `null` / `0` get a lock icon. |

---

## `tooltipConfig`

Controls the popup shown when hovering over a marker.

| Parameter | Type | Description |
|-----------|------|-------------|
| `title` | `string \| d => string` | Bold header of the popup. Defaults to `d["Facility"]`. |
| `subtitle` | `string \| d => string` | Uppercase line rendered below the title in the gray header. Optional. |
| `tbody` | `[label, string \| d => string][]` | Array of `[label, value]` pairs rendered as rows in the popup body. |

---

## Full example

```js
const {id, tesseract} = variables;

const selector = "[[healthServiceSelector3]]".replace("health_", "");

const dataURL = `${tesseract}tesseract/data.jsonrecords?cube=prism_facilities_by_households_served` +
  `&include=County+Facility:${id};Health+Provider:${selector}` +
  `&drilldowns=Facility,County+Facility,Health+Provider,Rank+Facility,County+Household` +
  `&locale=en&measures=Avg+estimated+drive+time+%28min%29` +
  `&properties=Latitude,Longitude,Address,Zip+Code`;

return {
  type: "PrismMap",

  // URLs
  data:     dataURL,
  topojson: `/topojson/Counties_2023.json`,
  county:   id,

  // Field accessors
  id:        d => d["Facility ID"],
  latitude:  d => d["Latitude"],
  longitude: d => d["Longitude"],
  sortBy:    d => d["Avg estimated drive time (min)"],
  rankBy:    d => d["Rank Facility"],

  // Popup
  tooltipConfig: {
    title:    d => d["Facility"],
    subtitle: d => d["County Facility"],
    tbody: [
      ["Drive time", d => `${d["Avg estimated drive time (min)"].toFixed(1)} min`],
      ["Address",    d => d["Address"]],
      ["Zip Code",   d => d["Zip Code"]],
    ]
  }
};
```
