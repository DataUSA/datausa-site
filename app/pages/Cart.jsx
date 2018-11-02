import React, {Component} from "react";
import {connect} from "react-redux";
import {Helmet} from "react-helmet";

import {fetchData} from "@datawheel/canon-core";
import {Tooltip2} from "@blueprintjs/labs";
import {Cell, Column, SelectionModes, Table} from "@blueprintjs/table";
import "@blueprintjs/table/dist/table.css";
import axios from "axios";
import {merge} from "d3-array";
import {nest} from "d3-collection";
import {formatAbbreviate} from "d3plus-format";
import localforage from "localforage";
import JSZip from "jszip";
import {saveAs} from "file-saver";
import "./Cart.css";

import Loading from "components/Loading";

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

class Cart extends Component {

  constructor(props) {
    super(props);
    this.state = {
      cart: [],
      columns: [],
      results: false,
      stickies: [],
      values: {}
    };
  }

  componentDidMount() {
    this.reload.bind(this)();
  }

  reload() {

    const {cartKey, levels} = this.props;
    const levelsFlat = Object.keys(levels);
    let stickies;

    localforage.getItem(cartKey)
      .then(cart => {
        if (!cart) cart = [];
        console.log(cart);
        const urls = merge(cart.map(d => d.urls));
        stickies = merge(urls.map(url => url
          .match(/drilldowns\=[A-z\,\s]+/g)[0]
          .split("=")[1].split(",")
        ));
        this.setState({cart, results: []});
        return Promise.all(urls.map(url => axios.get(url).then(resp => resp.data)));
      })
      .then(responses => {

        console.log("responses", responses);
        responses = responses.filter(resp => resp.data);

        let columns = [];
        responses.forEach(resp => {
          const keys = Object.keys(resp.data[0]);
          const presentLevels = keys.filter(key => levelsFlat.includes(key));
          const years = keys.filter(key => key.includes("Year") && !key.includes("ID "));
          const slugs = keys.filter(key => key.includes("Slug "));
          stickies = stickies.map(d => levelsFlat.includes(d) ? levels[d] : d);
          stickies = stickies.concat(years);
          resp.data.forEach(d => {
            presentLevels.forEach(level => {
              const dimension = levels[level];
              d[dimension] = d[level];
              delete d[level];
              d[`ID ${dimension}`] = d[`ID ${level}`];
              delete d[`ID ${level}`];
            });
            years.forEach(year => {
              delete d[`ID ${year}`];
            });
            slugs.forEach(slug => {
              delete d[slug];
            });
          });
          columns = columns.concat(Object.keys(resp.data[0]));
        });
        stickies = Array.from(new Set(stickies));
        columns = Array.from(new Set(columns))
          .sort((a, b) => {
            const sA = stickies.indexOf(a);
            const sB = stickies.indexOf(b);
            return sA < 0 && sB < 0 ? a.localeCompare(b) : sB - sA;
          });
        console.log("columns", columns);
        console.log("stickies", stickies);

        const results = nest()
          .key(d => stickies.map(key => d[key] || "undefined").join("-"))
          .rollup(leaves => Object.assign(...leaves))
          .entries(merge(responses.map(resp => resp.data)))
          .map(d => d.value);

        this.setState({columns, results, stickies});
      })
      .catch(err => console.error(err));
  }

  onClear() {
    const {cartKey} = this.props;
    localforage.setItem(cartKey, [])
      .then(() => this.reload.bind(this)())
      .catch(err => console.error(err));
  }

  onRemove(d) {
    const {cart} = this.state;
    const {cartKey} = this.props;
    const build = cart.find(c => c.slug === d.slug);
    cart.splice(cart.indexOf(build), 1);
    localforage.setItem(cartKey, cart)
      .then(() => this.reload.bind(this)())
      .catch(err => console.error(err));
  }

  onCSV() {
    const {columns, results} = this.state;

    const title = "Data USA Cart",
          zip = new JSZip();

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

    zip.file(`${title}.csv`, csv);
    zip.generateAsync({type: "blob"})
      .then(content => saveAs(content, `${title}.zip`));

  }

  render() {
    const {cart, columns, results, stickies} = this.state;
    const {measures} = this.props;
    console.log("results", results);

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
      const format = val === undefined ? d => ""
        : typeof val === "string" ? d => d
          : FORMATTERS[measures[key]] || formatAbbreviate;
      return <Cell wrapText={true}>{ format(val) }</Cell>;
    };

    return (
      <div id="Cart">
        <Helmet title="Cart" />
        <div className="controls">
          <div className="title">Data Cart</div>
          <div className="sub">
            { cart.length } Dataset{ cart.length > 1 ? "s" : "" }
          </div>
          { cart.map(d => <div key={d.slug} className="dataset">
            <div className="title">{d.title}</div>
            <Tooltip2 content="Remove from Cart">
              <img src="/images/viz/remove.svg" className="remove" onClick={this.onRemove.bind(this, d)} />
            </Tooltip2>
          </div>) }
          <div className="pt-button pt-fill pt-icon-download" onClick={this.onCSV.bind(this)}>
            Download Full Table as CSV File
          </div>
          <div className="pt-button pt-fill pt-icon-trash" onClick={this.onClear.bind(this)}>
            Remove All Items from Cart
          </div>
        </div>
        { !results ? null : <div>
          <Table allowMultipleSelection={false}
            columnWidths={columnWidths}
            fillBodyWithGhostCells={true}
            isColumnResizable={false}
            isRowResizable={false}
            numRows={ results.length }
            numFrozenColumns={stickies.length}
            rowHeights={results.map(() => 30)}
            selectionModes={SelectionModes.NONE}>
            { columns.map(c => <Column id={ c } key={ c } name={ c } renderCell={ renderCell } />) }
          </Table>
        </div> }
        { !results ? <Loading /> : null }
      </div>
    );

  }

}

Cart.need = [
  fetchData("levels", "/api/cart/levels/"),
  fetchData("measures", "/api/cubes/", resp => {
    const obj = {};
    for (const measure in resp.measures) {
      if ({}.hasOwnProperty.call(resp.measures, measure)) {
        const annotations = resp.measures[measure].annotations;
        const format = annotations.error_for_measure
          ? resp.measures[annotations.error_for_measure].annotations.units_of_measurement
          : annotations.units_of_measurement;
        obj[measure] = format;
      }
    }
    return obj;
  })
];

export default connect(state => ({
  cartKey: state.env.CART,
  levels: state.data.levels,
  measures: state.data.measures
}))(Cart);
