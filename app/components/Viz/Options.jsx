import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import "./Options.css";

import {select} from "d3-selection";
import {saveAs} from "file-saver";
import JSZip from "jszip";
import {saveElement} from "d3plus-export";
import axios from "axios";
import {formatAbbreviate} from "d3plus-format";

import {Checkbox, Dialog, Icon, NonIdealState, Spinner, Tab2, Tabs2} from "@blueprintjs/core";
import {Cell, Column, SelectionModes, Table} from "@blueprintjs/table";
import {Tooltip2} from "@blueprintjs/labs";
import {Object} from "es6-shim";
import {addToCart, removeFromCart} from "actions/cart";

const FORMATTERS = {
  Growth: d => `${formatAbbreviate(d * 100 || 0)}%`,
  Percentage: d => `${formatAbbreviate(d * 1 || 0)}%`,
  Rate: d => `${formatAbbreviate(d * 100 || 0)}%`,
  Ratio: d => `${formatAbbreviate(d * 1 || 0)} to 1`,
  USD: d => `$${formatAbbreviate(d * 1 || 0)}`,
  get Dollars() {
    return this.USD;
  },
  "Thousands of Dollars"(d) {
    return this.USD(d * 1e3);
  },
  "Millions of Dollars"(d) {
    return this.USD(d * 1e6);
  },
  "Billions of Dollars"(d) {
    return this.USD(d * 1e9);
  }
};

const cartMax = 5;

const geographyLevels = {
  "010": "Nation",
  "040": "State",
  "050": "County",
  "310": "MSA",
  "160": "Place",
  "860": "Zip",
  "140": "Tract",
  "795": "PUMA"
};

const slugMap = {
  cip: "CIP",
  geo: "Geography",
  naics: "PUMS Industry",
  napcs: "NAPCS",
  soc: "PUMS Occupation",
  university: "University"
};

const children = id => {
  const prefix = id.slice(0, 3);
  return prefix === "010" ? "State"
    : prefix === "040" ? "County"
      : prefix === "050" ? "Tract"
        : prefix === "310" ? "County"
          : prefix === "160" ? "Tract"
            : false;
};

const parents = id => id.slice(0, 3) === "040" ? "Nation" : "State";

class Options extends Component {

  constructor(props) {
    super(props);

    const sizeList = [
      {label: "Small 720 x 480", value: ["720px", "480px"]},
      {label: "Large 1440 x 1080", value: ["1440px", "1080px"]},
      {label: "Fullscreen", value: ["100%", "100%"]}
    ];

    const {data, slug, topic} = props;
    const {hierarchy} = this.props.variables;

    this.state = {
      cartSlug: `${slug}${hierarchy ? `_${hierarchy}` : ""}`,
      data: topic.cart || typeof data === "string" ? data.replace(/[&?]limit=[^&]+/g, "") : data,
      embedSize: sizeList[0],
      includeText: false,
      loading: false,
      openDialog: false,
      results: false,
      sizes: sizeList
    };
  }

  componentDidUpdate() {
    const {data, topic} = this.props;
    const newData = topic.cart || typeof data === "string" ? data.replace(/[&?]limit=[^&]+/g, "") : data;
    if (newData !== this.state.data) this.setState({data: newData, results: false});
  }

  async onCart() {

    const {addToCart, cart, removeFromCart, topic} = this.props;
    const {cartSlug} = this.state;
    const inCart = cart.data.find(c => c.slug === cartSlug);

    if (!inCart) {

      const {config, dataFormat} = this.props;
      const {data} = this.state;
      const {list} = this.context.formatters;
      console.log(cartSlug);
      console.log(data);
      console.log(config);
      const [base, query] = data.split("?");
      const params = query ? decodeURIComponent(query).split("&")
        .reduce((obj, d) => {
          const [key, val] = d.split("=");
          obj[key] = val
            .split(/\,([A-z])/g)
            .reduce((arr, d) => {
              if (arr.length && arr[arr.length - 1].length === 1) arr[arr.length - 1] += d;
              else if (d.length) arr.push(d);
              return arr;
            }, []);
          return obj;
        }, {}) : {};

      console.log(params);
      delete params.sort;
      delete params.order;
      delete params.limit;
      delete params["Completions>"];
      delete params["Record Count>"];
      if (params.required) {
        params.measures = params.required;
        delete params.required;
      }
      if (params.measure) {
        params.measures = params.measure;
        delete params.measure;
      }
      if (!params.measures) params.measures = [];
      Object.keys(slugMap).forEach(slug => {
        if (params[slug]) {
          params[slugMap[topic.profile]] = params[slug];
          delete params[slug];
        }
      });

      params.measures = params.measures
        .filter(d => !["Completions Share Of University"].includes(d));

      let slices = [];
      if (!params.drilldowns) params.drilldowns = [];

      if (params.CIP2) {
        delete params.CIP2;
        params.drilldowns.push("CIP2");
      }

      const dimension = slugMap[topic.profile];
      const {hierarchy} = this.props.variables;
      if (params[dimension] && hierarchy) {
        delete params[dimension];
        if (dimension === "CIP") {
          if (!params.drilldowns.includes("University")) {
            params.drilldowns.push(hierarchy);
          }
        }
        else {
          params.drilldowns.push(hierarchy);
        }
      }

      params.drilldowns.forEach(drilldown => {
        delete params[drilldown];
      });

      const groupBy = config.groupBy instanceof Array ? config.groupBy : [config.groupBy];
      for (let i = 0; i < groupBy.length; i++) {
        const group = groupBy[i];
        if (typeof group === "string") {
          if (params[group]) {

            if (group === "Geography") {
              const levels = params[group]
                .reduce((arr, d) => {
                  if (d.includes(":")) {
                    if (d.includes("parents")) arr.push(parents(d));
                    if (d.includes("children")) arr.push(children(d));
                    if (d.includes("neighbors")) arr.push(geographyLevels[d.slice(0, 3)]);
                  }
                  else {
                    arr.push(geographyLevels[d.slice(0, 3)]);
                  }
                  return arr;
                }, []);
              delete params[group];
              const uniques = Array.from(new Set(levels));
              slices = slices.concat(uniques);
            }
            else {
              const levels = await axios.get(`/api/cart/levels/${group}`);
              delete params[group];
              slices = slices.concat(levels);
            }

          }
        }
      }

      // TODO check axes groupings
      // TODO check stats
      // TODO check dropdowns

      const urls = [];
      const drilldowns = params.drilldowns.concat(slices);

      if (slices.length) {
        slices.forEach(slice => {
          params.drilldowns.push(slice);
          const url = `${base}?${Object.entries(params).map(([key, val]) => `${key}=${val.join(",")}`).join("&")}`;
          console.log(url);
          urls.push(url);
          params.drilldowns.pop();
        });
      }
      else {
        if (!params.drilldowns.length) delete params.drilldowns;
        const url = `${base}?${Object.entries(params).map(([key, val]) => `${key}=${val.join(",")}`).join("&")}`;
        console.log(url);
        urls.push(url);
      }

      const format = `${dataFormat}`;
      let measures = params.measures
        .map(measure => {
          const d = measure.toLowerCase();
          if (d.includes("tuition")) return "Tuition";
          else if (d.includes("graduate")) return "Graduates";
          else if (d.includes(" moe") || d.includes(" rca") || d === "record count") return false;
          else return measure;
        });
      measures = list(Array.from(new Set(measures.filter(Boolean))));
      const cartTitle =
        urls.some(d => d.includes("covid19/employment")) ? "Unemployment Claims by State"
          : urls.some(d => d.includes("covid19")) ? "COVID-19 by State"
            : `${measures}${drilldowns ? ` by ${list(drilldowns)}` : ""}`;
      console.log(cartTitle);

      addToCart({urls, format, slug: cartSlug, title: cartTitle});

    }
    else {
      const build = cart.data.find(c => c.slug === cartSlug);
      removeFromCart(build);
    }

  }

  onCSV() {
    const {title} = this.props;
    const {results} = this.state;

    const columns = Object.keys(results[0]);
    let csv = columns.join(",");

    for (let i = 0; i < results.length; i++) {
      const data = results[i];

      csv += "\n";
      csv += columns.map(key => {

        const val = data[key];

        return typeof val === "number" ? val
          : val ? `\"${val}\"` : "";

      }).join(",");

    }

    const zip = new JSZip();
    zip.file(`${title}.csv`, csv);
    zip.generateAsync({type: "blob"})
      .then(content => saveAs(content, `${title}.zip`));
  }

  onSave(type) {
    const {component, title} = this.props;
    if (component.viz) {
      const elem = component.viz.container || component.viz._reactInternalInstance._renderedComponent._hostNode;
      saveElement(select(elem).select("svg").node(), {filename: title, type});
    }
  }

  toggleDialog(slug) {
    this.setState({openDialog: slug});
    const {results, loading} = this.state;
    if (slug === "view-table" && !results && !loading) {
      const {dataFormat} = this.props;
      const {data} = this.state;
      this.setState({loading: true});
      axios.get(data)
        .then(resp => {
          const results = dataFormat(resp.data);
          this.setState({loading: false, results});
        });
    }
  }

  toggleText() {
    const {includeText} = this.state;
    this.setState({includeText: !includeText});
  }

  changeSize(e) {
    const {sizes} = this.state;
    this.setState({embedSize: sizes[e.target.value]});
  }

  onBlur(ref) {
    this[ref].blur();
  }

  onFocus(ref) {
    this[ref].select();
  }

  render() {

    const {cart, location, measures, slug, title, topic} = this.props;
    const {cartSlug, data, embedSize, includeText, openDialog, results, sizes} = this.state;

    const cartSize = cart ? cart.data.length : 0;
    const inCart = cart ? cart.data.find(c => c.slug === cartSlug) : false;

    const cartEnabled = data && slug && title;
    const shareEnabled = topic.slug;
    const baseURL = (typeof window === "undefined" ? location : window.location).href.split("#")[0].split("/").slice(0, 6).join("/");
    const profileURL = `${baseURL}#${topic.slug}`;
    const embedURL = `${baseURL}/${topic.section}/${topic.slug}`;

    const ImagePanel = () => <div className="pt-dialog-body save-image">
      <div className="save-image-btn" onClick={this.onSave.bind(this, "png")}>
        <Icon iconName="media" />PNG
      </div>
      <div className="save-image-btn" onClick={this.onSave.bind(this, "svg")}>
        <Icon iconName="code-block" />SVG
      </div>
    </div>;

    const SharePanel = () => <div className="pt-dialog-body share vertical">
      <div className="horizontal social">
        <div className="networks">
          <a href={ `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileURL)}` } target="_blank" rel="noopener noreferrer">
            <img className="network facebook" src="/images/viz/facebook.svg" />
          </a>
          <a href={ `https://twitter.com/home?status=${encodeURIComponent(profileURL)}` } target="_blank" rel="noopener noreferrer">
            <img className="network twitter" src="/images/viz/twitter.svg" />
          </a>
        </div>
        <input type="text" ref={input => this.shareLink = input} onClick={this.onFocus.bind(this, "shareLink")} onMouseLeave={this.onBlur.bind(this, "shareLink")} readOnly="readonly" value={profileURL} />
      </div>
      <div className="horizontal">
        <img className="preview" src={ `/images/viz/mini-viz${includeText ? "-text" : ""}.png` } />
        <div className="info">
          <p>Copy and paste the following code to place an interactive version of this visualization on your website.</p>
          <Checkbox checked={includeText} label="Include paragraph and stats" onChange={this.toggleText.bind(this)} />
          <div className="pt-select">
            <select value={sizes.indexOf(embedSize)} onChange={this.changeSize.bind(this)}>
              { sizes.map((size, i) => <option key={i} value={i}>{size.label}</option>) }
            </select>
          </div>
        </div>
      </div>
      <div className="embed-link">
        <input type="text" ref={input => this.embedLink = input} onClick={this.onFocus.bind(this, "embedLink")} onMouseLeave={this.onBlur.bind(this, "embedLink")} readOnly="readonly" value={ `<iframe width="${embedSize.value[0]}" height="${embedSize.value[1]}" src="${embedURL}?viz=${includeText ? "false" : "true"}" frameborder="0" ></iframe>` } />
      </div>
    </div>;

    const columns = results ? Object.keys(results[0]).filter(d => d.indexOf("ID ") === -1 && d.indexOf("Slug ") === -1) : [];
    const stickies = ["Year", "Geography", "PUMS Industry", "PUMS Occupation", "CIP", "University", "Gender"].reverse();
    columns.sort((a, b) => stickies.indexOf(b) - stickies.indexOf(a));

    const columnWidths = columns.map(key => {
      if (key === "Year") return 60;
      else if (key.includes("Year")) return 150;
      else if (key.includes("ID ")) return 120;
      else if (key.includes("University") || key.includes("Insurance")) return 250;
      else if (key.includes("Gender") || key.includes("Sex")) return 100;
      else if (stickies.includes(key)) return 200;
      else return 150;
    });

    const renderCell = (rowIndex, columnIndex) => {
      const key = columns[columnIndex];
      const val = results[rowIndex][key];
      const format = val === undefined ? () => ""
        : typeof val === "string" ? d => d
          : FORMATTERS[measures[key]] || formatAbbreviate;
      return <Cell wrapText={true}>{ format(val) }</Cell>;
    };

    const DataPanel = () => results
      ? <div className="pt-dialog-body view-table vertical">
        <div className="horizontal download">
          <button type="button" className="pt-button pt-icon-download pt-minimal" onClick={this.onCSV.bind(this)}>
            Download as CSV
          </button>
          <input type="text" ref={input => this.dataLink = input} onClick={this.onFocus.bind(this, "dataLink")} onMouseLeave={this.onBlur.bind(this, "dataLink")} readOnly="readonly" value={`${location.origin}${data}`} />
        </div>
        <div className="table">
          <Table allowMultipleSelection={false}
            columnWidths={columnWidths}
            fillBodyWithGhostCells={true}
            isColumnResizable={false}
            isRowResizable={false}
            numRows={ results.length }
            rowHeights={results.map(() => 30)}
            selectionModes={SelectionModes.NONE}>
            { columns.map(c => <Column id={ c } key={ c } name={ c } renderCell={ renderCell } />) }
          </Table>
        </div>
      </div>
      : <div className="pt-dialog-body view-table vertical">
        <NonIdealState title="Loading Data" visual={<Spinner />} />
      </div>;

    return <div className="Options">

      <Tooltip2 tooltipClassName="option-tooltip" placement="top-end">
        <div className="option view-table" onClick={this.toggleDialog.bind(this, "view-table")}>
          <span className="option-label">View Data</span>
        </div>
        <span>View and download the underlying dataset used to create this visualization.</span>
      </Tooltip2>

      <Tooltip2 tooltipClassName="option-tooltip" placement="top-end">
        <div className="option save-image" onClick={this.toggleDialog.bind(this, "save-image")}>
          <span className="option-label">Save Image</span>
        </div>
        <span>Download this visualization as a PNG image or SVG code.</span>
      </Tooltip2>

      { shareEnabled ? <Tooltip2 tooltipClassName="option-tooltip" placement="top-end">
        <div className="option share" onClick={this.toggleDialog.bind(this, "share")}>
          <span className="option-label">Share / Embed</span>
        </div>
        <span>Share this visualization on Twitter, Facebook, or on your personal website.</span>
      </Tooltip2> : null }

      { cartEnabled ? <Tooltip2 tooltipClassName="option-tooltip" placement="top-end">
        <div className={ `option add-to-cart ${ cartSize >= cartMax ? "disabled" : "" }` } onClick={this.onCart.bind(this)}>
          <span className="option-label">{ cartSize === undefined ? "Loading Cart" : inCart ? "Remove from Cart" : "Add Data to Cart" }</span>
        </div>
        <span>
          { inCart ? "Remove this dataset from the cart."
            : cartSize !== undefined && cartSize >= cartMax ? `Cart limit of ${cartSize} has been reached. Please visit the cart page to download the current cart and/or remove data.`
              : "Add the underlying data to the cart, and merge with any existing cart data." }
        </span>
      </Tooltip2> : null }

      <Dialog className="options-dialog" isOpen={openDialog} onClose={this.toggleDialog.bind(this, false)}>
        <Tabs2 onChange={this.toggleDialog.bind(this)} selectedTabId={openDialog}>
          <Tab2 id="view-table" title="View Data" panel={<DataPanel />} />
          <Tab2 id="save-image" title="Save Image" panel={<ImagePanel />} />
          { shareEnabled ? <Tab2 id="share" title="Share / Embed" panel={<SharePanel />} /> : null }
          <button aria-label="Close" className="close-button pt-dialog-close-button pt-icon-small-cross" onClick={this.toggleDialog.bind(this, false)}></button>
        </Tabs2>
      </Dialog>

    </div>;

  }
}

Options.defaultProps = {
  variables: {}
};

Options.contextTypes = {
  formatters: PropTypes.object
};

export default connect(state => ({
  cart: state.cart,
  location: state.location,
  measures: state.data.measures
}), dispatch => ({
  addToCart: build => dispatch(addToCart(build)),
  removeFromCart: build => dispatch(removeFromCart(build))
}))(Options);
