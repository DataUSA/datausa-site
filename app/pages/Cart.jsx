import React, {Component} from "react";
// import PropTypes from "prop-types";
import {connect} from "react-redux";
import {Helmet} from "react-helmet-async";

import {fetchData} from "@datawheel/canon-core";
import {Checkbox, Icon, Tooltip} from "@blueprintjs/core";
import {Cell, Column, SelectionModes, Table} from "@blueprintjs/table";
import "@blueprintjs/table/lib/css/table.css";
import axios from "axios";
import {max, merge} from "d3-array";
import {nest} from "d3-collection";
import {formatAbbreviate} from "d3plus-format";
import JSZip from "jszip";
import {saveAs} from "file-saver";
import "./Cart.css";

import Loading from "components/Loading";
import {updateTitle} from "actions/title";
import {addToCart, clearCart, removeFromCart, toggleCartSetting} from "actions/cart";
// import libs from "../../utils/libs";

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

const title = "Cart";

class Cart extends Component {

  constructor(props) {
    super(props);
    this.state = {
      columns: [],
      intro: true,
      loading: false,
      moe: {},
      progress: 0,
      responses: false,
      results: false,
      stickies: [],
      total: 0,
      values: {}
    };
  }

  componentDidMount() {
    this.props.updateTitle(title);
    const {cart} = this.props;
    if (cart) this.reload.bind(this)();
  }

  componentWillUnmount() {
    this.props.updateTitle(false);
  }

  componentDidUpdate(prevProps) {

    const {cart} = this.props;
    const {loading, results} = this.state;

    if (!prevProps.cart || !results && !loading) {
      if (cart) this.reload.bind(this)();
    }
    else {

      const curr = cart.settings.reduce((obj, s) => (obj[s.key] = s.value, obj), {});
      const prev = prevProps.cart.settings.reduce((obj, s) => (obj[s.key] = s.value, obj), {});
      const pivots = Object.keys(curr).filter(key => key.includes("pivot"));
      const pivotChanges = pivots.map(s => curr[s]).join() !== pivots.map(s => prev[s]).join();

      if (prevProps.cart.data.length !== cart.data.length) {
        this.reload.bind(this)();
      }
      else if (pivotChanges) {
        const {responses, stickies} = this.state;
        this.formatData.bind(this)(responses, stickies);
      }
    }
  }

  reload() {

    // const {formatters} = this.context;
    const {cart} = this.props;

    const urls = Array.from(new Set(merge(cart.data.map(d => d.urls)).map(decodeURIComponent)));
    const stickies = merge(urls.map(url => {
      if (url.includes("/covid19/employment")) {
        return ["week_ended", "state_name"];
      }
      else if (url.includes("/covid19/")) {
        return ["Geography", "Date"];
      }
      else {
        const m = url.match(/drilldowns\=[^&]+/g);
        if (m) return m[0].split("=")[1].split(",");
        return [];
      }
    }));

    const promises = urls.map(url => axios.get(url)
      .then(resp => {
        this.setState({progress: this.state.progress + 1});
        const data = resp.data.data;
        // const format = cart.data.find(d => d.urls.includes(url) && d.format);
        // console.log(format.format.replace(/^[^\{]*\{/g, "").replace(/\}.*$/g, ""));
        // if (format) {
        //   const f = Function("n", "libs", "formatters", format.format.replace(/^[^\{]*\{/g, "").replace(/\}.*$/g, ""));
        //   data = f(resp.data, libs, formatters);
        // }
        return {url, data};
      })
      .catch(err => {
        console.error(err);
        this.setState({progress: this.state.progress + 1});
        return {url, data: false};
      }));

    this.setState({loading: true, results: false, progress: 0, total: promises.length + 1});
    Promise.all(promises)
      .then(responses => {
        this.formatData.bind(this)(responses.filter(resp => resp.data), stickies);
      });

  }

  formatData(responses, stickies) {

    const {cart, levels} = this.props;
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
          if (dimension !== level) {
            d[dimension] = d[level];
            delete d[level];
            d[`ID ${dimension}`] = d[`ID ${level}`];
            delete d[`ID ${level}`];
          }
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
    stickies.forEach(s => {
      const id = `ID ${s}`;
      if (!s.includes("ID ") && !stickies.includes(id)) stickies.push(id);
    });
    stickies = stickies.sort((a, b) => a.includes("Year") ? 1 : a.replace("ID ", "").localeCompare(b.replace("ID ", "")));
    columns = Array.from(new Set(columns));

    let results = nest()
      .key(d => stickies.map(key => d[key] || "undefined").join("-"))
      .rollup(leaves => Object.assign(...leaves))
      .entries(merge(responses.map(resp => resp.data)))
      .map(d => d.value);

    if (results.length && pivots.length) {
      const nonYearStickies = stickies.filter(d => !d.toLowerCase().includes("year"));
      const yearStickies = stickies.filter(d => d.toLowerCase().includes("year") && !d.includes("ID "));
      const nestKeys = nonYearStickies.filter(d => d.includes("ID "));
      const nonStickies = columns.filter(d => !stickies.includes(d));
      results = nest()
        .key(d => nestKeys.map(s => d[s]).join(" "))
        .entries(results)
        .map(group => {
          const obj = {};
          nonYearStickies.forEach(s => obj[s] = group.values[0][s]);
          group.values.forEach(d => {
            const year = yearStickies.map(s => d[s]).join(" ");
            nonStickies.forEach(s => {
              if (d.hasOwnProperty(s)) {
                const newColumn = `${s} (${year})`;
                obj[newColumn] = d[s];
                if (columns.includes(s)) columns.splice(columns.indexOf(s), 1);
                if (!columns.includes(newColumn)) columns.push(newColumn);
              }
            });
          });
          return obj;
        });
      columns = columns.filter(d => !yearStickies.includes(d));
    }

    columns = columns
      .sort((a, b) => {
        const sA = stickies.indexOf(a);
        const sB = stickies.indexOf(b);
        return sA < 0 && sB < 0 ? a.localeCompare(b) : sB - sA;
      });

    const moe = {};
    const lowColumns = columns.map(c => c.toLowerCase());
    lowColumns.forEach((c, index) => {
      if (c.includes(" moe")) {
        const match = columns.find((d, i) => {
          const name = lowColumns[i];
          return c.replace(" appx moe", "").replace(" moe", "") === name && c !== name;
        });
        if (match) moe[match] = columns[index];
      }
    });

    this.setState({columns, loading: false, moe, responses, results, stickies, intro: !results.length});

  }

  onClear() {
    this.props.clearCart();
  }

  onRemove(d) {
    this.props.removeFromCart(d);
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

  gotoExample(data) {

    const build = {
      format: "function(resp) { return resp.data; }",
      title: data.title,
      ...data.cart
    };

    this.props.addToCart(build);

  }

  toggleSetting(key) {
    this.props.toggleCartSetting(key);
  }

  render() {

    const {intro, loading, moe, progress, results, total} = this.state;
    const {cart, measures} = this.props;

    if (!cart || !results || loading) {
      return <div>
        <Helmet title={title}>
          <meta property="og:title" content={ `${title} | Data USA` } />
        </Helmet>
        <Loading progress={progress} total={total} />
      </div>;
    }

    const showMOE = cart.settings.find(d => d.key === "showMOE").value;
    const showID = cart.settings.find(d => d.key === "showID").value;

    const moes = Object.values(moe);
    const columns = this.state.columns
      .filter(c => !moes.includes(c) && (showID || !c.match(/^ID\s/)));

    const columnWidths = columns.map(key => {
      if (key === "ID Geography") return 130;
      else if (key.includes("ID ")) return max(key.split(" ").map(k => k.length * 10)) + 24;
      else if (key.includes("University") || key.includes("Insurance")) return 250;
      else if (["Geography", "PUMS Industry", "PUMS Occupation", "CIP", "NAPCS"].includes(key)) return 200;
      else if (["Gender", "Sex", "Race", "Date"].includes(key)) return 100;
      else return max(key.split(" ").map(k => k.length * 10)) + 25;
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
        <Helmet title={title}>
          <meta property="og:title" content={ `${title} | Data USA` } />
        </Helmet>
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
            className="bp3-card bp3-interactive">
            <Icon iconSize={80} icon={d.icon} />
            { d.title }
          </div>) }
        </div>
      </div>;
    }
    else {
      return <div id="Cart">
        <Helmet title={title}>
          <meta property="og:title" content={ `${title} | Data USA` } />
        </Helmet>
        <div className="controls">
          <div className="title">Data Cart</div>
          <div className="sub">
            { cart.data.length } Dataset{ cart.data.length > 1 ? "s" : "" }
          </div>
          { cart.data.map(d => <div key={d.slug} className="dataset">
            <div className="title">{d.title}</div>
            <Tooltip content="Remove from Cart">
              <img src="/images/viz/remove.svg" className="remove" onClick={this.onRemove.bind(this, d)} />
            </Tooltip>
          </div>) }
          { cart.settings.map(s => s.key !== "showMOE" || Object.keys(moe).length ? <Checkbox key={s.key} checked={s.value} label={s.label} onChange={this.toggleSetting.bind(this, s.key)} /> : null) }
          <div className="bp3-button bp3-fill bp3-icon-download" onClick={this.onCSV.bind(this)}>
            Download Full Table as CSV File
          </div>
          <div className="bp3-button bp3-fill bp3-icon-trash" onClick={this.onClear.bind(this)}>
            Remove All Items from Cart
          </div>
        </div>
        { !results ? null : <div className="cart-table">
          <Table
            key={ `${results.length}_${columns.length}_${showMOE}` }
            enableMultipleSelection={false}
            columnWidths={columnWidths}
            enableGhostCells={true}
            enableColumnResizing={false}
            enableRowResizing={false}
            numRows={ results.length }
            // numFrozenColumns={stickies.length}
            rowHeights={results.map(() => 30)}
            selectionModes={SelectionModes.NONE}>
            { columns.map(c => <Column id={ c } key={ c } name={ c } cellRenderer={ renderCell } />) }
          </Table>
        </div> }
      </div>;
    }

  }

}

// Cart.contextTypes = {
//   formatters: PropTypes.object
// };

Cart.need = [
  fetchData("levels", "/api/cart/levels/")
];

export default connect(state => ({
  cart: state.cart,
  levels: state.data.levels,
  measures: state.data.measures
}), dispatch => ({
  addToCart: build => dispatch(addToCart(build)),
  clearCart: () => dispatch(clearCart()),
  removeFromCart: build => dispatch(removeFromCart(build)),
  toggleCartSetting: setting => dispatch(toggleCartSetting(setting)),
  updateTitle: title => dispatch(updateTitle(title))
}))(Cart);
