import React from "react";
import PropTypes from "prop-types";
import {SearchControl} from "./SearchControl";

class Search extends React.Component {
  render() {
    const props = this.props;
    return (
      <SearchControl
        className={props.className}
        apiUrl={props.url || "/api/searchLegacy/"}
        icon={props.icon}
        inactiveComponent={ props.inactiveComponent }
        placeholder={props.placeholder}
        enableGlobalShortcut={props.primary}
        resultRender={props.resultRender}
        router={this.context.router}
      />
    );
  }
}

Search.contextTypes = {
  router: PropTypes.object
};

Search.defaultProps = {
  buttonLink: false,
  buttonText: "Search",
  className: "search",
  defaultQuery: "",
  icon: "search",
  inactiveComponent: false,
  placeholder: "Search",
  primary: false,
  resultRender: d => <span>{ d.name }</span>,
  searchEmpty: false,
  url: false
};

export default Search;
