import React, {Component} from "react";
import "./App.css";

import {CanonComponent} from "datawheel-canon";
import "./helpers/d3plus.css";
import d3plus from "./helpers/d3plus";

import Nav from "components/Nav/index";

export default class App extends Component {

  render() {

    return (
      <CanonComponent d3plus={d3plus}>
        <Nav />
        { this.props.children }
      </CanonComponent>
    );

  }

}
