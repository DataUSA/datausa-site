import React, {Component} from "react";

import axios from "axios";
import {merge} from "d3-array";
import localforage from "localforage";

import cubeFold from "helpers/cubeFold";

export default class Cart extends Component {

  constructor(props) {
    super(props);
    this.state = {
      cart: false,
      columns: {},
      results: false,
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
        const results = merge(foldedData.map(d => d.data));
        this.setState({columns, results, values});
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
