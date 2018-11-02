import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import "./Options.css";

import {select} from "d3-selection";
import {saveAs} from "file-saver";
import {text} from "d3-request";
import {saveElement} from "d3plus-export";
import localforage from "localforage";
import axios from "axios";

import {Dialog, Icon} from "@blueprintjs/core";
import {Tooltip2} from "@blueprintjs/labs";

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
    this.state = {
      cartSize: undefined,
      inCart: false,
      openDialog: false
    };
  }

  componentDidMount() {

    const {cartKey, slug} = this.props;

    if (cartKey && slug) {
      localforage.getItem(cartKey)
        .then(cart => {
          const inCart = cart && cart.find(c => c.slug === slug);
          this.setState({cartSize: cart ? cart.length : 0, inCart});
        })
        .catch(err => console.error(err));
    }
  }

  async onCart() {

    const {cartKey, slug} = this.props;

    const {inCart} = this.state;
    if (!inCart) {

      const {config, data, dataFormat, title} = this.props;
      const {list, stripHTML} = this.context.formatters;

      let cart = await localforage.getItem(cartKey)
        .catch(err => console.error(err));

      if (!cart) cart = [];

      console.log(slug);
      console.log(data);
      console.log(config);
      const [base, query] = data.split("?");
      const params = decodeURIComponent(query).split("&")
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
        }, {});

      console.log(params);
      delete params.sort;
      delete params.order;
      delete params.limit;

      let slices = [];
      if (!params.drilldowns) params.drilldowns = [];

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
      const cartTitle = `${stripHTML(title)}${drilldowns ? ` by ${list(drilldowns)}` : ""}`;
      console.log(cartTitle);

      cart.push({urls, format, slug, title: cartTitle});
      localforage.setItem(cartKey, cart);
      this.setState({cartSize: this.state.cartSize + 1, inCart: true});

    }
    else {
      localforage.getItem(cartKey)
        .then(cart => {
          const build = cart.find(c => c.slug === slug);
          cart.splice(cart.indexOf(build), 1);
          return localforage.setItem(cartKey, cart);
        })
        .then(() => this.setState({cartSize: this.state.cartSize - 1, inCart: false}))
        .catch(err => console.error(err));
    }

  }

  onCSV() {
    const {title, url} = this.props;
    text(url, (err, data) => {
      if (!err) saveAs(new Blob([data], {type: "text/plain;charset=utf-8"}), `${title}.csv`);
    });
  }

  onSave(type) {
    const {component, title} = this.props;
    if (component.viz) {
      const elem = component.viz.container || component.viz._reactInternalInstance._renderedComponent._hostNode;
      saveElement(select(elem).select("svg").node(), {filename: title, type});
    }
  }

  onBlur() {
    this.input.blur();
  }

  onFocus() {
    this.input.select();
  }

  toggleDialog(slug) {
    this.setState({openDialog: slug});
  }

  render() {

    const {cartKey, data, slug, title} = this.props;
    const {cartSize, inCart, openDialog} = this.state;

    const cartEnabled = cartKey && data && slug && title;

    // const profile = "test";
    // const url = `https://dataafrica.io/profile/${profile}/${slug}`;
    // <div className="option" onClick={this.onFocus.bind(this)} onMouseLeave={this.onBlur.bind(this)}>
    //   <img src="/images/viz/share.svg" />
    //   <input type="text" value={url} ref={input => this.input = input} readOnly="readonly" />
    // </div>




    // <div className="option view-table" onClick={this.onCSV.bind(this)}>
    //   <span className="option-label">View Data</span>
    // </div>

    const DialogHeader = props => <div className="pt-dialog-header">
      <img src={ `/images/viz/${ props.slug }.svg` } />
      <h5>{ props.title }</h5>
      <button aria-label="Close" className="pt-dialog-close-button pt-icon-small-cross" onClick={this.toggleDialog.bind(this, false)}></button>
    </div>;

    return <div className="Options">

      <div className="option save-image" onClick={this.toggleDialog.bind(this, "save-image")}>
        <span className="option-label">Save Image</span>
      </div>

      <Dialog className="options-dialog" isOpen={openDialog === "save-image"} onClose={this.toggleDialog.bind(this, false)}>
        <DialogHeader slug="save-image" title="Save Image" />
        <div className="pt-dialog-body">
          <div className="save-image-btn" onClick={this.onSave.bind(this, "png")}>
            <Icon iconName="media" />PNG
          </div>
          <div className="save-image-btn" onClick={this.onSave.bind(this, "svg")}>
            <Icon iconName="code-block" />SVG
          </div>
        </div>
      </Dialog>

      { cartEnabled ? <Tooltip2 placement="top-end">
        <div className={ `option add-to-cart ${ cartSize >= cartMax ? "disabled" : "" }` } onClick={this.onCart.bind(this)}>
          <span className="option-label">{ cartSize === undefined ? "Loading Cart" : inCart ? "Remove from Cart" : "Add Data to Cart" }</span>
        </div>
        <span>
          { inCart ? "Remove this dataset from the cart."
            : cartSize !== undefined && cartSize >= cartMax ? `Cart limit of ${cartSize} has been reached. Please visit the cart page to download the current cart and/or remove data.`
              : "Add the underlying data to the cart, and merge with any existing cart data." }
        </span>
      </Tooltip2> : null }

    </div>;

  }
}

Options.contextTypes = {
  formatters: PropTypes.object
};

export default connect(state => ({cartKey: state.env.CART}))(Options);
