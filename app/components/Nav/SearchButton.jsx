import React, {Component} from "react";
import {Link} from "react-router";
import {Icon} from "@blueprintjs/core";

import "./SearchButton.css";

import Search from "toCanon/Search";

class ClosedButton extends Component {

  render() {
    const {active, onClick} = this.props;
    return (
      <div className={`ClosedButton ${active ? "active" : ""}`} onClick={ onClick }>
        <Icon icon="search" />
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
        resultRender={d => <Link to={`/profile/${d.profile}/${d.slug || d.id}`} className="result-container">
          <img className="result-icon" src={ `/icons/dimensions/${d.dimension} - Color.svg` } />
          <div className="result-text">
            <div className="title">{ d.name }</div>
            <div className="sumlevel">{ d.hierarchy }</div>
          </div>
        </Link>}
        url={ "/api/search/" } />
    );
  }

}
