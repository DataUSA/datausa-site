import React from "react";
import PropTypes from "prop-types";
import {SearchControl} from "./SearchControl";

/**
 * Legacy pass-through wrapper that maps presentational props to `SearchControl`.
 *
 * Maintains backward compat with older callers that pass `url` (→ `apiUrl`),
 * `primary` (→ `enableGlobalShortcut`), and `onChange` (→ `onQueryChange`).
 * @extends {React.Component<SearchProps>}
 */
class Search extends React.Component {
  render() {
    const props = this.props;
    return (
      <SearchControl
        className={props.className}
        apiUrl={props.url || "/api/searchLegacy/"}
        defaultQuery={props.defaultQuery}
        icon={props.icon}
        inactiveComponent={props.inactiveComponent}
        placeholder={props.placeholder}
        enableGlobalShortcut={props.primary}
        onQueryChange={props.onChange}
        resultRender={props.resultRender}
        searchEmpty={props.searchEmpty}
        router={this.context.router}
      />
    );
  }
}

/**
 * @typedef {Object} SearchProps
 * @property {string}  [url="/api/searchLegacy/"] -
 *   API endpoint URL. Appends `?q=…` before fetching.
 * @property {string}  [className="search"] - CSS class on the outer container.
 * @property {string}  [placeholder="Search"] - Input placeholder text.
 * @property {string}  [defaultQuery=""] - Initial query value on mount.
 * @property {string|boolean} [icon="search"] - BlueprintJS icon name or `false` to hide.
 * @property {boolean} [primary=false] -
 *   When `true`, enables the global `S` key shortcut to focus search.
 * @property {boolean} [searchEmpty=false] -
 *   Fetch results immediately on mount, even with an empty query.
 * @property {React.ComponentType|boolean} [inactiveComponent=false] -
 *   Optional toggle rendered left of the input, receives `active` + `onClick`.
 * @property {function(string): void} [onChange] - Called on every input change with the raw value.
 * @property {function(Object, Object): React.ReactNode} [resultRender] -
 *   Custom renderer for each result item.
 * @property {boolean} [buttonLink=false] - When set, renders an "All Results" link.
 * @property {string}  [buttonText="Search"] - Submit button text.
 */

Search.contextTypes = {
  router: PropTypes.object,
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
  resultRender: (d) => <span>{d.name}</span>,
  searchEmpty: false,
  url: false,
};

export default Search;
