import React from "react";
import {Link} from "react-router";
import {connect} from "react-redux";
import {SearchControl} from "toCanon/SearchControl";
import {fetchData} from "@datawheel/canon-core";
import SVG from "react-inlinesvg";
import {sum} from "d3-array";
import {format} from "d3-format";
const commas = format(",");

import "./style.css";

const rawUrl = "/api/searchLegacy/?limit=100";

const formatSubLabel = (key) =>
  key
    .replace(/^Industry\s/g, "")
    .replace(/^CIP([0-9])/g, "$1 Digit Course")
    .replace(/\sOccupation\s/g, " ")
    .replace(/^NAPCS\s/g, "");

const DIMENSIONS = [
  {key: "Geography", label: "Locations", icon: "Geography", cls: "geo"},
  {key: "PUMS Industry", label: "Industries", icon: "PUMS Industry", cls: "naics"},
  {key: "PUMS Occupation", label: "Occupations", icon: "PUMS Occupation", cls: "soc"},
  {key: "CIP", label: "Degrees", icon: "CIP", cls: "cip"},
  {key: "University", label: "Universities", icon: "University", cls: "university"},
  {key: "NAPCS", label: "Products & Services", icon: "NAPCS", cls: "napcs"},
];

const SubList = ({active, onClick, totals}) => (
  <ul>
    {Object.keys(totals)
      .sort((a, b) => totals[a] - totals[b])
      .filter((key) => totals[key] > 1)
      .map((key) => (
        <li className={active === key ? "active" : ""} key={key} onClick={() => onClick(key)}>
          {formatSubLabel(key)}
          <span className="num">{commas(totals[key])}</span>
        </li>
      ))}
  </ul>
);

/**
 * Main search page with a search bar, dimension filter sidebar, and result totals.
 *
 * Reads initial state from URL query params (`q`, `dimension`, `hierarchy`)
 * and syncs filter changes back to the URL via `router.replace`.
 *
 * Props are injected via Redux connect (see bottom of file). Fetches totals
 * server-side through the `need` array for SSR.
 *
 * @typedef {Object} SearchPageState
 * @property {string|undefined} dimension - Active dimension filter (e.g. "Geography").
 * @property {string|undefined} hierarchy - Active hierarchy within the dimension.
 * @property {string}           defaultQuery - Initial query from URL `?q=` param.
 * @property {string}           query - Current search input value.
 * @property {string}           url - API URL built from current filters.
 *
 * @typedef {Object} SearchPageProps
 * @property {Object}  totals - Dimension → hierarchy → count mapping from `/api/search/totals`.
 * @property {Object}  router - React Router injected via `canon-core` context.
 * @property {Object}  router.location - Current location object.
 * @property {string}  router.location.basename - Base path of the app.
 * @property {string}  router.location.pathname - Current route path.
 * @property {Object}  router.location.query - Parsed query string params.
 * @property {function} router.replace - Navigate without history entry.
 */

/**
 * @extends {React.Component<SearchPageProps, SearchPageState>}
 */
class SearchPage extends React.Component {
  constructor(props) {
    super(props);
    const {dimension, hierarchy, q} = this.props.router.location.query;
    let url = rawUrl;
    if (dimension) url += `&dimension=${dimension}`;
    if (hierarchy) url += `&hierarchy=${hierarchy}`;
    this.state = {
      dimension,
      defaultQuery: q,
      hierarchy,
      query: "",
      url,
    };
    this.setQuery = this.setQuery.bind(this);
    this.setHierarchy = this.setHierarchy.bind(this);
    this.clearFilters = this.clearFilters.bind(this);
  }

  setQuery(query) {
    this.setState({query});
  }

  setDimension(dimension) {
    let url = rawUrl;
    if (dimension) url += `&dimension=${dimension}`;
    this.setState({dimension, hierarchy: false, url});
  }

  setHierarchy(hierarchy) {
    const {dimension} = this.state;
    let url = rawUrl;
    url += `&dimension=${dimension}`;
    if (hierarchy) url += `&hierarchy=${hierarchy}`;
    this.setState({hierarchy, url});
  }

  clearFilters() {
    this.setState({dimension: false, hierarchy: false, url: rawUrl});
  }

  componentDidUpdate(prevProps, prevState) {
    const {dimension, hierarchy, query} = this.state;
    const {router} = this.props;
    if (
      dimension !== prevState.dimension ||
      hierarchy !== prevState.hierarchy ||
      query !== prevState.query
    ) {
      const {basename, pathname} = router.location;
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (dimension) params.set("dimension", dimension);
      if (hierarchy) params.set("hierarchy", hierarchy);
      const qs = params.toString();
      router.replace(`${basename}${pathname}${qs ? `?${qs}` : ""}`);
    }
  }

  render() {
    const {totals} = this.props;
    const {defaultQuery, dimension, hierarchy, url} = this.state;

    return (
      <div id="SearchPage">
        <SearchControl
          apiUrl={url}
          defaultQuery={defaultQuery}
          enableGlobalShortcut={true}
          onQueryChange={this.setQuery}
          placeholder={"Find a report..."}
          resultRender={(d) => (
            <Link to={`/profile/${d.profile}/${d.slug || d.id}`}>
              <SVG
                width={26}
                className={`dim-icon ${d.profile}`}
                src={`/icons/dimensions/${d.dimension}.svg`}
              />
              <div className="result-text">
                <div className="title">{d.name}</div>
                <div className="sumlevel">{d.hierarchy}</div>
              </div>
            </Link>
          )}
          router={this.props.router}
          searchEmpty={true}
        />
        <div className="controls">
          {dimension && (
            <div className="clear" onClick={this.clearFilters}>
              <span className="x">×</span> Clear Filter
            </div>
          )}
          <ul>
            <li>
              Report Type<span hidden>:</span> <span className="num">Results</span>
            </li>
            {DIMENSIONS.map(({key, label, icon, cls}) => {
              const totalsForDim = totals?.[key] ?? {};
              return (
                <React.Fragment key={key}>
                  <li className={cls} onClick={() => this.setDimension(key)}>
                    <SVG className="dim-icon" src={`/icons/dimensions/${icon}.svg`} />
                    {label}
                    <span className="num">{commas(sum(Object.values(totalsForDim)))}</span>
                  </li>
                  {dimension === key && (
                    <SubList active={hierarchy} totals={totalsForDim} onClick={this.setHierarchy} />
                  )}
                </React.Fragment>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }
}

SearchPage.need = [fetchData("searchTotals", "/api/search/totals")];

export default connect((state) => ({totals: state.data.searchTotals}))(SearchPage);
