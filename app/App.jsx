import React, {Component} from "react";
import "./App.css";

import {CanonComponent} from "datawheel-canon";
import "./helpers/d3plus.css";
import d3plus from "./helpers/d3plus";

export default class App extends Component {

  render() {

    return (
      <CanonComponent d3plus={d3plus}>
        { this.props.children }
      </CanonComponent>
    );

  }

}
