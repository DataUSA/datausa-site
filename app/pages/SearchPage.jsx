import React, {Component} from "react";

import Search from "toCanon/Search";

import "./SearchPage.css";

export default class SearchPage extends Component {

  render() {

    return (
      <div id="SearchPage">
        <Search
          placeholder={ "Find a profile..." }
          primary={ true }
          resultLink={ d => `/profile/${d.type}/${d.id}` }
          resultRender={d => <div>
            <img src={ `/icons/dimensions/${d.dimension} - Color.svg` } />
            <div className="result-text">
              <div className="title">{ d.name }</div>
              <div className="sumlevel">{ d.hierarchy }</div>
            </div>
          </div>}
          searchEmpty={ true }
          url={ "/api/search/" } />
      </div>
    );

  }

}
