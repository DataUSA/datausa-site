import React, {Component} from "react";
import "./App.css";

export default class App extends Component {

  render() {

    return (
      <div id="App">
        { this.props.children }
      </div>
    );

  }

}
