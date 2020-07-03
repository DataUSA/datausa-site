import React, {Component} from "react";
import {Link} from "react-router";
import {connect} from "react-redux";
import Search from "toCanon/Search";
import {fetchData} from "@datawheel/canon-core";
import {sum} from "d3-array";
import {format} from "d3-format";
const commas = format(",");

import "./SearchPage.css";

const rawUrl = "/api/searchLegacy/?limit=100";

const formatSubLabel = key => key
  .replace(/^Industry\s/g, "")
  .replace(/^CIP([0-9])/g, "$1 Digit Course")
  .replace(/\sOccupation\s/g, " ")
  .replace(/^NAPCS\s/g, "");

const SubList = ({active, onClick, totals}) => <ul>
  { Object.keys(totals)
    .sort((a, b) => totals[a] - totals[b])
    .filter(key => totals[key] > 1)
    .map(key => <li className={active === key ? "active" : ""} key={key} onClick={() => onClick(key)}>
      {formatSubLabel(key)}
      <span className="num">{commas(totals[key])}</span>
    </li>) }
</ul>;

class SearchPage extends Component {

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
      url
    };
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
    if (dimension !== prevState.dimension || hierarchy !== prevState.hierarchy || query !== prevState.query) {
      const {basename, pathname} = router.location;
      let url = `${basename}${pathname}`;
      url += `?q=${query}`;
      if (dimension) url += `&dimension=${dimension}`;
      if (hierarchy) url += `&hierarchy=${hierarchy}`;
      router.replace(url);
    }
  }

  render() {

    const {totals} = this.props;
    const {defaultQuery, dimension, hierarchy, url} = this.state;

    return (
      <div id="SearchPage">
        <Search
          limit={100}
          onChange={this.setQuery.bind(this)}
          defaultQuery={defaultQuery}
          placeholder={ "Find a profile..." }
          primary={ true }
          resultRender={d => <Link to={`/profile/${d.profile}/${d.slug || d.id}`}>
            <img src={ `/icons/dimensions/${d.dimension} - Color.svg` } />
            <div className="result-text">
              <div className="title">{ d.name }</div>
              <div className="sumlevel">{ d.hierarchy }</div>
            </div>
          </Link>}
          searchEmpty={ true }
          url={ url } />
        <div className="controls">
          { dimension && <div className="clear" onClick={this.clearFilters.bind(this)}><span className="x">×</span> Clear Filter</div> }
          <ul>
            <li>Profile Type <span className="num">Results</span></li>
            <li className="geo" onClick={this.setDimension.bind(this, "Geography")}>
              <img src="/icons/dimensions/Geography - Color.svg" />
              Locations
              <span className="num">{commas(sum(Object.values(totals.Geography)))}</span>
            </li>
            { dimension === "Geography" && <SubList active={hierarchy} totals={totals.Geography} onClick={this.setHierarchy.bind(this)} /> }
            <li className="naics" onClick={this.setDimension.bind(this, "PUMS Industry")}>
              <img src="/icons/dimensions/PUMS Industry - Color.svg" />
              Industries
              <span className="num">{commas(sum(Object.values(totals["PUMS Industry"])))}</span>
            </li>
            { dimension === "PUMS Industry" && <SubList active={hierarchy} totals={totals["PUMS Industry"]} onClick={this.setHierarchy.bind(this)} /> }
            <li className="soc" onClick={this.setDimension.bind(this, "PUMS Occupation")}>
              <img src="/icons/dimensions/PUMS Occupation - Color.svg" />
              Occupations
              <span className="num">{commas(sum(Object.values(totals["PUMS Occupation"])))}</span>
            </li>
            { dimension === "PUMS Occupation" && <SubList active={hierarchy} totals={totals["PUMS Occupation"]} onClick={this.setHierarchy.bind(this)} /> }
            <li className="cip" onClick={this.setDimension.bind(this, "CIP")}>
              <img src="/icons/dimensions/CIP - Color.svg" />
              Degrees
              <span className="num">{commas(sum(Object.values(totals.CIP)))}</span>
            </li>
            { dimension === "CIP" && <SubList active={hierarchy} totals={totals.CIP} onClick={this.setHierarchy.bind(this)} /> }
            <li className="university" onClick={this.setDimension.bind(this, "University")}>
              <img src="/icons/dimensions/University - Color.svg" />
              Universities
              <span className="num">{commas(sum(Object.values(totals.University)))}</span>
            </li>
            { dimension === "University" && <SubList active={hierarchy} totals={totals.University} onClick={this.setHierarchy.bind(this)} /> }
            <li className="napcs" onClick={this.setDimension.bind(this, "NAPCS")}>
              <img src="/icons/dimensions/NAPCS - Color.svg" />
              Products &amp; Services
              <span className="num">{commas(sum(Object.values(totals.NAPCS)))}</span>
            </li>
            { dimension === "NAPCS" && <SubList active={hierarchy} totals={totals.NAPCS} onClick={this.setHierarchy.bind(this)} /> }
          </ul>
        </div>
      </div>
    );

  }

}

SearchPage.need = [
  fetchData("searchTotals", "/api/search/totals")
];

export default connect(state => ({totals: state.data.searchTotals}))(SearchPage);
