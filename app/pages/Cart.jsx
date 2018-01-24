import React, {Component} from "react";

import axios from "axios";
import {merge} from "d3-array";
import {nest} from "d3-collection";
import localforage from "localforage";

import cubeFold from "helpers/cubeFold";

export default class Cart extends Component {

  constructor(props) {
    super(props);
    this.state = {
      cart: false,
      columns: {},
      results: false,
      stickies: [],
      values: {}
    };
  }

  componentDidMount() {
    localforage.getItem("datausa-cart")
      .then(cart => {
        if (!cart) cart = [];
        this.setState({cart});
        return Promise.all(cart.map(c => axios.get(c.data).then(resp => resp.data)));
      })
      .then(responses => {
        const foldedData = responses.map(cubeFold);
        let columns = {};
        const values = {};
        foldedData.forEach(data => {
          columns = {...columns, ...data.dimensions, ...data.measures};
          for (const key in data.values) {
            if ({}.hasOwnProperty.call(data.values, key)) {
              if (key in values) {
                values[key] = {...values[key], ...data.values[key]};
              }
              else values[key] = {...data.values[key]};
            }
          }
        });
        const stickies = Array.from(new Set(merge(foldedData.map(d => Object.keys(d.dimensions)))));
        const results = nest()
          .key(d => stickies.map(key => d[key] || "undefined").join("-"))
          .entries(merge(foldedData.map(d => d.data)));
        this.setState({columns, results, stickies, values});
      })
      .catch(err => console.error(err));
  }

  render() {
    const {results} = this.state;
    console.log(results);
    return (
      <div id="Cart">
        { !results ? "Loading" : <div>
          Data!
        </div> }
      </div>
    );

  }

}
