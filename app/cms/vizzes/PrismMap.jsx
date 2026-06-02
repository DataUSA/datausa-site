import React, {Component} from "react";
import "./PrismMap.css";

const LOCK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white">
  <path d="M18 8h-1V6A5 5 0 0 0 7 6v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2zm-6 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm3.1-9H8.9V6a3.1 3.1 0 0 1 6.2 0v2z"/>
</svg>`;

function makeIcon(L, rank) {
  const isTop = rank !== null;
  const size = 24;
  const html = isTop
    ? `<div style="width:${size}px;height:${size}px;border-radius:50%;background:#83C0B4;border:2px solid #353535;display:flex;align-items:center;justify-content:center;color:#353535;font-weight:700;font-size:14px;font-family:sans-serif;">${rank}</div>`
    : `<div style="width:${size}px;height:${size}px;border-radius:50%;background:#64748b;border:2px solid #353535;display:flex;align-items:center;justify-content:center;">${LOCK_SVG}</div>`;

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
    countiesGeoJSON: null
  };

  componentDidMount() {
    const L = require("leaflet");
    require("leaflet/dist/leaflet.css");
    this.L = L;

    const {config = {}} = this.props;

    fetch(config.topojson)
      .then(r => r.json())
      .then(topo => {
        const {feature} = require("topojson-client");
        const key = Object.keys(topo.objects)[0];
        const geojson = feature(topo, topo.objects[key]);
        this.setState({countiesGeoJSON: geojson, isClient: true});
      })
      .catch(err => console.error("Failed to load counties", err));

    fetch(config.data)
      .then(r => r.json())
      .then(json => this.setState({facilities: json.data || []}))
      .catch(err => console.error("Failed to load facilities", err));
  }

  fitSelectedCounty(map) {
    const {config = {}} = this.props;
    if (!map || !this.state.countiesGeoJSON || !config.county) return;
    const {countiesGeoJSON} = this.state;
    const L = this.L;
    const selected = countiesGeoJSON.features.find(f => f.properties.id === config.county);
    if (selected) {
      const bounds = L.geoJSON(selected).getBounds();
      map.fitBounds(bounds, {padding: [40, 40]});
    }
  }

  render() {
    if (!this.state.isClient) return null;

    const {Map, TileLayer, Marker, Popup, GeoJSON} = require("react-leaflet");
    const {facilities, countiesGeoJSON} = this.state;
    const {config = {}} = this.props;
    const L = this.L;

    const getId   = config.id        || (d => d["Facility ID"]);
    const getLat  = config.latitude  || (d => d["Latitude"]);
    const getLng  = config.longitude || (d => d["Longitude"]);
    const sortBy  = config.sortBy    || (d => d["Avg estimated drive time (min)"]);
    const getRank = config.rankBy    || (d => d["Rank Facility"]);

    const resolve = (accessor, d) => typeof accessor === "function" ? accessor(d) : d[accessor];

    const sorted = [...facilities].sort((a, b) => resolve(sortBy, a) - resolve(sortBy, b));

    const countyStyle = feature => ({
      weight: 1,
      color: "#94a3b8",
      fillColor: feature.properties.id === config.county ? "#83C0B4" : "#e2e8f0",
      fillOpacity: feature.properties.id === config.county ? 0.25 : 0.4
    });

    return (
      <div className="prism-map">
        <Map
          center={[38.9, -95.7]}
          zoom={4}
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
              key={config.county}
              data={countiesGeoJSON}
              style={countyStyle}
            />
          )}

          {sorted.map(f => {
            const rank = resolve(getRank, f) || null;
            const {tooltipConfig = {}} = config;
            const title = tooltipConfig.title
              ? (typeof tooltipConfig.title === "function" ? tooltipConfig.title(f) : tooltipConfig.title)
              : f["Facility"];
            const subtitle = tooltipConfig.subtitle
              ? (typeof tooltipConfig.subtitle === "function" ? tooltipConfig.subtitle(f) : tooltipConfig.subtitle)
              : null;
            const rows = tooltipConfig.tbody || [
              ["Drive time", d => `${resolve(sortBy, d).toFixed(1)} min`],
              ["County", d => d["County Facility"]]
            ];
            return (
              <Marker
                key={resolve(getId, f)}
                position={[parseFloat(resolve(getLat, f)), parseFloat(resolve(getLng, f))]}
                icon={makeIcon(L, rank)}
                onMouseOver={e => e.target.openPopup()}
                onMouseOut={e => e.target.closePopup()}
              >
                <Popup className="prism-popup" closeButton={false}>
                  <div className="prism-popup-inner">
                    <div className="prism-popup-header">
                      <div className="prism-popup-title">{title}</div>
                      {subtitle && <div className="prism-popup-subtitle">{subtitle}</div>}
                    </div>
                    <div className="prism-popup-body">
                      {rows.map(([label, val]) => (
                        <div key={label} className="prism-popup-row">
                          <span className="prism-popup-label">{label}</span>
                          <span className="prism-popup-value">{typeof val === "function" ? val(f) : val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
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
