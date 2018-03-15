import React, {Component} from "react";
import {connect} from "react-redux";
import {fetchData} from "datawheel-canon";
import "./Press.css";

class Press extends Component {

  render() {

    const {press} = this.props;

    return (
      <div id="Press">
        <h1>In the Press</h1>
        { press.map((source, i) => <div key={i}>
          <h2 className="title">
            <a href={ source.link } target="_blank" rel="noopener noreferrer">{ source.title }</a>
          </h2>
          <h3 className="source">{ source.source }</h3>
          <div className="quote">&#34;{ source.quote }&#34;</div>
        </div>)}
      </div>
    );

  }

}

Press.need = [
  fetchData("press", "/api/press")
];

export default connect(state => ({press: state.data.press}))(Press);
