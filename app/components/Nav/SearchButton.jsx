import React, {Component} from "react";
import {Icon} from "@blueprintjs/core";

import "./SearchButton.css";

import Search from "toCanon/Search";

class ClosedButton extends Component {

  render() {
    const {active, onClick} = this.props;
    return (
      <div className={`ClosedButton ${active ? "active" : ""}`} onClick={ onClick }>
        <Icon iconName="search" />
      </div>
    );
  }

}

ClosedButton.defaultProps = {
  active: false,
  onClick: false
};

export default class SearchButton extends Component {

  render() {
    return (
      <Search className="SearchButton"
        icon={ false }
        inactiveComponent={ ClosedButton }
        placeholder={ "Search profiles" }
        primary={true}
        resultLink={ d => `/profile/${d.type}/${d.id}` }
        resultRender={d => <div>
          <img src={ `/images/icons/${d.type}_c.svg` } />
          <div className="result-text">
            <div className="title">{ d.name }</div>
            <div className="sumlevel">{ d.sumlevel }</div>
          </div>
        </div>}
        url={ "/api/search/" } />
    );
  }

}
