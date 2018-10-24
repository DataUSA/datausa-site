import React, {Component} from "react";
import {Link} from "react-router";
import Search from "toCanon/Search";

import "./SearchPage.css";

export default class SearchPage extends Component {

  render() {

    return (
      <div id="SearchPage">
        <Search
          placeholder={ "Find a profile..." }
          primary={ true }
          resultRender={d => <Link to={`/profile/${d.profile}/${d.slug || d.id}`}>
            <img src={ `/icons/dimensions/${d.dimension} - Color.svg` } />
            <div className="result-text">
              <div className="title">{ d.name }</div>
              <div className="sumlevel">{ d.hierarchy }</div>
            </div>
          </Link>}
          searchEmpty={ true }
          url={ "/api/search/" } />
      </div>
    );

  }

}
