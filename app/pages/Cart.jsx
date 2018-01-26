import React, {Component} from "react";

import {Cell, Column, Table} from "@blueprintjs/table";
import "@blueprintjs/table/dist/table.css";
import axios from "axios";
import {merge} from "d3-array";
import {nest} from "d3-collection";
import localforage from "localforage";
import "./Cart.css";

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
          .rollup(leaves => Object.assign(...leaves))
          .entries(merge(foldedData.map(d => d.data)))
          .map(d => d.value);
        this.setState({columns, results, stickies, values});
      })
      .catch(err => console.error(err));
  }

  render() {
    const {columns, results, stickies} = this.state;
    console.log(columns);
    console.log(stickies);
    console.log(results);
    const headers = Object.keys(columns)
      .sort((a, b) => {
        const sA = stickies.indexOf(a);
        const sB = stickies.indexOf(b);
        return sA < 0 && sB < 0 ? a.localeCompare(b) : sB - sA;
      });

    const renderCell = (rowIndex, columnIndex) => {
      return <Cell>{ results[rowIndex][headers[columnIndex]] }</Cell>;
    };

    return (
      <div id="Cart">
        { !results ? "Loading" : <div>
          <Table numRows={ results.length }>
            { headers.map(c => <Column id={ c } key={ c } name={ c } renderCell={ renderCell } />) }
          </Table>
        </div> }
      </div>
    );

  }

}
