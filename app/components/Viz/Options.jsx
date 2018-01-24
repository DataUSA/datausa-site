import React, {Component} from "react";
import "./Options.css";

import {select} from "d3-selection";
import {saveAs} from "file-saver";
import {text} from "d3-request";
import {saveElement} from "d3plus-export";
import localforage from "localforage";

import {Dialog, Icon, Position, Tooltip} from "@blueprintjs/core";

class Options extends Component {

  constructor(props) {
    super(props);
    this.state = {
      cartSize: 0,
      inCart: false,
      openDialog: false
    };
  }

  componentDidMount() {

    const {slug} = this.props;
    if (!slug) return;

    localforage.getItem("datausa-cart")
      .then(cart => {
        const inCart = cart && cart.find(c => c.slug === slug);
        this.setState({cartSize: cart ? cart.length : 0, inCart});
      })
      .catch(err => console.error(err));
  }

  onCart() {

    const {data, slug, title} = this.props;

    const {inCart} = this.state;
    if (!inCart) {
      localforage.getItem("datausa-cart")
        .then(cart => {
          if (!cart) cart = [];
          cart.push({data, slug, title});
          return localforage.setItem("datausa-cart", cart);
        })
        .then(() => this.setState({cartSize: this.state.cartSize + 1, inCart: true}))
        .catch(err => console.error(err));
    }
    else {
      localforage.getItem("datausa-cart")
        .then(cart => {
          const build = cart.find(c => c.slug === slug);
          cart.splice(cart.indexOf(build), 1);
          return localforage.setItem("datausa-cart", cart);
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
    const {data, slug, title} = this.props;
    const {cartSize, inCart, openDialog} = this.state;

    const cartEnabled = data && slug && title;

    // const profile = "test";
    // const url = `https://dataafrica.io/profile/${profile}/${slug}`;
    // <div className="option" onClick={this.onFocus.bind(this)} onMouseLeave={this.onBlur.bind(this)}>
    //   <img src="/img/viz/share.svg" />
    //   <input type="text" value={url} ref={input => this.input = input} readOnly="readonly" />
    // </div>




    // <div className="option view-table" onClick={this.onCSV.bind(this)}>
    //   <span className="option-label">View Data</span>
    // </div>

    const DialogHeader = props => <div className="pt-dialog-header">
      <img src={ `/img/viz/${ props.slug }.svg` } />
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

      { cartEnabled ? <Tooltip position={Position.TOP_RIGHT}>
        <div className={ `option add-to-cart ${ cartSize >= 5 ? "disabled" : "" }` } onClick={this.onCart.bind(this)}>
          <span className="option-label">{ cartSize === 0 ? "Loading Cart" : inCart ? "Remove from Cart" : "Add Data to Cart" }</span>
        </div>
        <span>
          { inCart ? "Remove this dataset from the cart."
            : cartSize >= 5 ? `Cart limit of ${cartSize} has been reached. Please visit the cart page to download the current cart and/or remove data.`
              : "Add the underlying data to the cart, and merge with any existing cart data." }
        </span>
      </Tooltip> : null }

    </div>;

  }
}

export default Options;
