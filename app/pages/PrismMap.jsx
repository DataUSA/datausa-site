import React, {Component} from "react";

const DEFAULT_COUNTY = "05000US05005";
const TOPOJSON_URL = "https://la.datausa.io/topojson/Counties_2023.json";
const API_URL = county =>
  // `https://api-la.datausa.io/tesseract/data.jsonrecords?cube=prism_facilities_by_households_served&drilldowns=Facility%2CCounty+Facility&include=County+Facility%3A${county}&locale=en&measures=Avg+estimated+drive+time+%28min%29&properties=Latitude%2CLongitude`;
     `https://api-la.datausa.io/tesseract/data.jsonrecords?cube=prism_facilities_by_households_served&drilldowns=Facility%2CCounty+Facility%2CHealth+Provider%2CRank+Facility%2CCounty+Household&include=County+Household%3A${county}%3BHealth+Provider%3A1&locale=en&measures=Avg+estimated+drive+time+%28min%29&properties=Latitude%2CLongitude`

const LOCK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white">
  <path d="M18 8h-1V6A5 5 0 0 0 7 6v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2zm-6 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm3.1-9H8.9V6a3.1 3.1 0 0 1 6.2 0v2z"/>
</svg>`;

function makeIcon(L, rank) {
  const isTop = rank !== null;
  const size = 32;
  const html = isTop
    ? `<div style="width:${size}px;height:${size}px;border-radius:50%;background:#2563eb;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;font-family:sans-serif;">${rank}</div>`
    : `<div style="width:${size}px;height:${size}px;border-radius:50%;background:#64748b;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;">${LOCK_SVG}</div>`;

  return L.divIcon({
    html,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)]
  });
}

class PrismMap extends Component {
  state = {
    isClient: false,
    facilities: [],
    county: DEFAULT_COUNTY,
    countiesGeoJSON: null
  };

  componentDidMount() {
    const L = require("leaflet");
    require("leaflet/dist/leaflet.css");
    this.L = L;

    fetch(TOPOJSON_URL)
      .then(r => r.json())
      .then(topo => {
        const {feature} = require("topojson-client");
        const key = Object.keys(topo.objects)[0];
        const geojson = feature(topo, topo.objects[key]);
        this.setState({countiesGeoJSON: geojson, isClient: true});
      })
      .catch(err => console.error("Failed to load counties", err));

    this.fetchFacilities(this.state.county);
  }

  fetchFacilities(county) {
    fetch(API_URL(county))
      .then(r => r.json())
      .then(json => this.setState({facilities: json.data || []}))
      .catch(err => console.error("Failed to load facilities", err));
  }

  handleCountyChange(e) {
    const county = e.target.value;
    this.setState({county, facilities: []});
    this.fetchFacilities(county);
  }

  fitSelectedCounty(map) {
    if (!map || !this.state.countiesGeoJSON) return;
    const {county, countiesGeoJSON} = this.state;
    const L = this.L;
    const selected = countiesGeoJSON.features.find(f => f.properties.id === county);
    if (selected) {
      const bounds = L.geoJSON(selected).getBounds();
      map.fitBounds(bounds, {padding: [40, 40]});
    }
  }

  render() {
    if (!this.state.isClient) return null;

    const {Map, TileLayer, Marker, Popup, GeoJSON} = require("react-leaflet");
    const {facilities, county, countiesGeoJSON} = this.state;
    const L = this.L;

    const sorted = [...facilities].sort(
      (a, b) => a["Avg estimated drive time (min)"] - b["Avg estimated drive time (min)"]
    );

    const countyStyle = feature => ({
      weight: 1,
      color: "#94a3b8",
      fillColor: feature.properties.id === county ? "#3b82f6" : "#e2e8f0",
      fillOpacity: feature.properties.id === county ? 0.25 : 0.4
    });

    return (
      <div style={{display: "flex", flexDirection: "column", height: "100vh"}}>
        <div style={{padding: "8px 12px", background: "#fff", borderBottom: "1px solid #ddd", display: "flex", alignItems: "center", gap: 8}}>
          <label htmlFor="county-input" style={{fontWeight: 600, fontSize: 13}}>County ID:</label>
          <input
            id="county-input"
            type="text"
            defaultValue={county}
            style={{fontFamily: "monospace", fontSize: 13, padding: "4px 8px", border: "1px solid #ccc", borderRadius: 4, width: 200}}
            onBlur={e => this.handleCountyChange(e)}
            onKeyDown={e => e.key === "Enter" && this.handleCountyChange(e)}
          />
          <span style={{fontSize: 12, color: "#666"}}>{sorted.length} facilities loaded</span>
        </div>

        <Map
          center={[38.9, -95.7]}
          zoom={4}
          key={county}
          style={{flex: 1}}
          attributionControl={false}
          ref={map => { if (map) this.fitSelectedCounty(map.leafletElement); }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={19}
          />

          {countiesGeoJSON && (
            <GeoJSON
              key={county}
              data={countiesGeoJSON}
              style={countyStyle}
            />
          )}

          {sorted.map((f, i) => {
            const rank = i < 5 ? i + 1 : null;
            return (
              <Marker
                key={f["Facility ID"]}
                position={[parseFloat(f["Latitude"]), parseFloat(f["Longitude"])]}
                icon={makeIcon(L, rank)}
              >
                <Popup>
                  <strong>{f["Facility"]}</strong><br />
                  Drive time: {f["Avg estimated drive time (min)"].toFixed(1)} min<br />
                  {f["County Facility"]}
                </Popup>
              </Marker>
            );
          })}
        </Map>
      </div>
    );
  }
}

export default PrismMap;
