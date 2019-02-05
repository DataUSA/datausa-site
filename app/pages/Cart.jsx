import React, {Component} from "react";
import {connect} from "react-redux";
import {Helmet} from "react-helmet";

import {fetchData} from "@datawheel/canon-core";
import {Checkbox, Icon} from "@blueprintjs/core";
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

const examples = [
  {
    icon: "office",
    title: "Federal Agency Spending by State",
    cart: {
      urls: ["/api/data?measures=Obligation%20Amount&drilldowns=Agency,State"],
      slug: "cart_agency_state"
    }
  },
  {
    icon: "dollar",
    title: "Average Wage for Jobs",
    cart: {
      urls: ["/api/data?measures=Average%20Wage,Average%20Wage%20Appx%20MOE&drilldowns=Detailed%20Occupation"],
      slug: "cart_wage_soc"
    }
  },
  {
    icon: "person",
    title: "Population by County",
    cart: {
      urls: ["/api/data?measures=Population&drilldowns=County"],
      slug: "cart_population_county"
    }
  }
];

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

export const defaultCart = {
  settings: [
    {key: "pivotYear", value: true, label: "Pivot Years to Columns"},
    {key: "showMOE", value: false, label: "Show Margin of Error"}
  ],
  data: []
};

class Cart extends Component {

  constructor(props) {
    super(props);
    this.state = {
      cart: defaultCart,
      columns: [],
      intro: true,
      moe: {},
      results: false,
      stickies: [],
      values: {}
    };
  }

  componentDidMount() {
    this.reload.bind(this)();
  }

  reload() {

    const {cartKey} = this.props;
    let stickies;

    localforage.getItem(cartKey)
      .then(cart => {
        if (!cart) cart = defaultCart;
        const urls = merge(cart.data.map(d => d.urls)).map(decodeURIComponent);
        stickies = merge(urls.map(url => url
          .match(/drilldowns\=[^&]+/g)[0]
          .split("=")[1].split(",")
        ));
        this.setState({cart, results: false});
        return Promise.all(urls.map(url => axios.get(url).then(resp => resp.data)));
      })
      .then(responses => this.formatData.bind(this)(responses.filter(resp => resp.data), stickies))
      .catch(err => console.error(err));
  }

  formatData(responses, stickies) {

    const {cart} = this.state;
    const {levels} = this.props;
    if (!stickies) stickies = this.state.stickies;
    const pivots = cart.settings.filter(d => d.value && d.key.includes("pivot"));
    const levelsFlat = Object.keys(levels);

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
    stickies = stickies.concat(stickies.map(d => `ID ${d}`))
      .sort((a, b) => a.includes("Year") ? 1 : a.replace("ID ", "").localeCompare(b.replace("ID ", "")));
    columns = Array.from(new Set(columns))
      .sort((a, b) => {
        const sA = stickies.indexOf(a);
        const sB = stickies.indexOf(b);
        return sA < 0 && sB < 0 ? a.localeCompare(b) : sB - sA;
      });

    const results = nest()
      .key(d => stickies.map(key => d[key] || "undefined").join("-"))
      .rollup(leaves => Object.assign(...leaves))
      .entries(merge(responses.map(resp => resp.data)))
      .map(d => d.value);

    const moe = {};
    columns.forEach(c => {
      if (c.toLowerCase().includes(" moe")) {
        const match = columns.find(d => c.includes(d) && c !== d);
        if (match) moe[match] = c;
      }
    });

    // if (pivots.length) {
    //   const newData =
    // }
    console.log(pivots);
    console.log(stickies);
    console.log(columns);
    console.log(results);
    // console.log(newData);

    this.setState({columns, moe, results, stickies, intro: !results.length});

  }

  onClear() {
    const {cartKey} = this.props;
    const {cart} = this.state;
    localforage.setItem(cartKey, {...cart, data: []})
      .then(() => this.reload.bind(this)())
      .catch(err => console.error(err));
  }

  onRemove(d) {
    const {cart} = this.state;
    const {cartKey} = this.props;
    const build = cart.data.find(c => c.slug === d.slug);
    cart.data.splice(cart.data.indexOf(build), 1);
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

  async gotoExample(data) {

    const {cartKey} = this.props;
    const {cart} = this.state;

    const d = [{
      format: "function(resp) { return resp.data; }",
      title: data.title,
      ...data.cart
    }];

    await localforage.setItem(cartKey, {...cart, data: d});
    this.reload.bind(this)();

  }

  toggleSetting(key) {
    const {cart} = this.state;
    const {cartKey} = this.props;
    const setting = cart.settings.find(d => d.key === key);
    setting.value = !setting.value;
    localforage.setItem(cartKey, cart);
    this.setState({cart});
  }

  render() {
    const {cart, intro, moe, results, stickies} = this.state;
    const {measures} = this.props;
    const showMOE = cart.settings.find(d => d.key === "showMOE").value;

    const moes = Object.values(moe);
    const columns = this.state.columns.filter(c => !moes.includes(c));

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
      const error = showMOE && moe[key] ? format(results[rowIndex][moe[key]]) : false;
      return <Cell wrapText={true}>
        { format(val) }{ error ? <span className="moe">± {error}</span> : null }
      </Cell>;
    };

    if (results !== false && intro) {
      return <div id="Cart" className="cart-intro">
        <h1>Data Cart</h1>
        <p>
          The Data USA data cart allows you to download only the data you need. Datasets added to the data cart will be automatically merged together, and can then be downloaded as a CSV for further offline analysis.
        </p>
        <p>
          Every visualization on the site has an &quot;Add Data to Cart&quot; button above it that allows you to add the data from that visualization to the data cart. To get started, here are three example datasets:
        </p>
        <div className="examples">
          { examples.map((d, i) => <div key={i}
            onClick={this.gotoExample.bind(this, d)}
            className="pt-card pt-interactive">
            <Icon iconName={d.icon} />
            { d.title }
          </div>) }
        </div>
      </div>;
    }
    else {
      return <div id="Cart">
        <Helmet title="Cart" />
        <div className="controls">
          <div className="title">Data Cart</div>
          <div className="sub">
            { cart.data.length } Dataset{ cart.length > 1 ? "s" : "" }
          </div>
          { cart.data.map(d => <div key={d.slug} className="dataset">
            <div className="title">{d.title}</div>
            <Tooltip2 content="Remove from Cart">
              <img src="/images/viz/remove.svg" className="remove" onClick={this.onRemove.bind(this, d)} />
            </Tooltip2>
          </div>) }
          { cart.settings.map(s => <Checkbox key={s.key} checked={s.value} label={s.label} onChange={this.toggleSetting.bind(this, s.key)} />) }
          <div className="pt-button pt-fill pt-icon-download" onClick={this.onCSV.bind(this)}>
            Download Full Table as CSV File
          </div>
          <div className="pt-button pt-fill pt-icon-trash" onClick={this.onClear.bind(this)}>
            Remove All Items from Cart
          </div>
        </div>
        { !results ? null : <div className="cart-table">
          <Table allowMultipleSelection={false}
            columnWidths={columnWidths}
            fillBodyWithGhostCells={true}
            isColumnResizable={false}
            isRowResizable={false}
            numRows={ results.length }
            // numFrozenColumns={stickies.length}
            rowHeights={results.map(() => 30)}
            selectionModes={SelectionModes.NONE}>
            { columns.map(c => <Column id={ c } key={ c } name={ c.indexOf("ID") === 0 ? `${c.replace("ID ", "")} ID` : c } renderCell={ renderCell } />) }
          </Table>
        </div> }
        { results === false ? <Loading /> : null }
      </div>;
    }

  }

}

Cart.need = [
  fetchData("levels", "/api/cart/levels/")
];

export default connect(state => ({
  cartKey: state.env.CART,
  levels: state.data.levels,
  measures: state.data.measures
}))(Cart);
