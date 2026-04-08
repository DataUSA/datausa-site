import React, {Component} from "react";
import PropTypes from "prop-types";

import axios from "axios";

import {select} from "d3-selection";
import {uuid} from "d3plus-common";

class Search extends Component {

  constructor(props) {
    super(props);
    this.state = {
      active: false,
      fetching: false,
      id: uuid(),
      results: [],
      userQuery: props.defaultQuery
    };
    this._debounceTimer = null;
    this._fetchGeneration = 0;
  }

  componentWillUnmount() {
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = null;
    }
    this._fetchGeneration += 1;
  }

  runSearch(userQuery, generation) {
    const {url} = this.props;
    if (!url) {
      if (generation === this._fetchGeneration) {
        this.setState({fetching: false});
      }
      return;
    }

    axios.get(`${url}${ url.includes("?") ? "&" : "?" }q=${userQuery}`)
      .then(res => res.data)
      .then(data => {
        if (generation !== this._fetchGeneration) return;
        const results = Array.isArray(data.results) ? data.results : [];
        this.setState({active: true, results, userQuery, fetching: false});
      })
      .catch(() => {
        if (generation !== this._fetchGeneration) return;
        this.setState({fetching: false});
      });
  }

  onChange(e) {

    const userQuery = e ? e.target.value : this.state.userQuery;
    const {onChange, searchEmpty, url}  = this.props;
    if (onChange) onChange(userQuery);

    if (!searchEmpty && userQuery.length === 0) {
      if (this._debounceTimer) {
        clearTimeout(this._debounceTimer);
        this._debounceTimer = null;
      }
      this._fetchGeneration += 1;
      this.setState({active: true, results: [], userQuery, fetching: false});
    }
    else if (url) {
      if (this._debounceTimer) clearTimeout(this._debounceTimer);
      const generation = ++this._fetchGeneration;
      this.setState({fetching: true, userQuery});
      this._debounceTimer = setTimeout(() => {
        this._debounceTimer = null;
        this.runSearch(userQuery, generation);
      }, 250);
    }

  }

  onFocus() {
    this.setState({active: true});
  }

  onClear(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (this.input) this.input.value = "";
    this.onChange({target: {value: ""}});
    if (this.input) this.input.focus();
  }

  onClearKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.onClear(e);
    }
  }

  onToggle() {

    if (this.state.active) {
      this.input.blur();
      this.setState({active: false});
    }
    else this.input.focus();

  }

  componentDidMount() {

    const {primary, searchEmpty} = this.props;
    const {id} = this.state;

    select(document).on(`mousedown.${ id }`, event => {
      if (this.state.active && this.container && !this.container.contains(event.target)) {
        this.setState({active: false});
      }
    });

    select(document).on(`keydown.${ id }`, event => {

      const {router} = this.context;
      const {active} = this.state;
      const key = event.keyCode;
      const DOWN = 40,
            ENTER = 13,
            ESC = 27,
            S = 83,
            UP = 38;

      if (primary && !active && key === S && !["input", "textarea"].includes(event.target.tagName.toLowerCase()) && !event.target.className.includes("DraftEditor")) {
        event.preventDefault();
        this.onToggle.bind(this)();
      }
      else if (active && key === ESC && event.target === this.input) {
        event.preventDefault();
        this.onToggle.bind(this)();
      }
      else if (active && event.target === this.input) {

        const highlighted = document.querySelector(".highlighted");

        if (key === ENTER && highlighted) {
          const link = highlighted.querySelector("a");
          if (link) router.push(link.href);
          else highlighted.querySelector("*").click();
          this.setState({active: false});
        }
        else if (key === DOWN || key === UP) {

          if (!highlighted) {
            if (key === DOWN) document.querySelector(".results > li:first-child").classList.add("highlighted");
          }
          else {

            const results = document.querySelectorAll(".results > li");
            const currentIndex = [].indexOf.call(results, highlighted);

            let newHighlight = false;
            if (key === DOWN && currentIndex < results.length - 1) {
              newHighlight = results[currentIndex + 1];
              highlighted.classList.remove("highlighted");
            }
            else if (key === UP) {
              if (currentIndex > 0) newHighlight = results[currentIndex - 1];
              highlighted.classList.remove("highlighted");
            }

            if (newHighlight) {
              newHighlight.classList.add("highlighted");
              const parent = newHighlight.parentNode;
              const top = newHighlight.offsetTop;
              const height = newHighlight.offsetHeight;
              const pHeight = parent.offsetHeight;
              const pTop = parent.scrollTop;
              const diff = top + height - (pTop + pHeight);
              if (diff > 0) parent.scrollTop += diff;
              else if (top < pTop) parent.scrollTop = top;
            }

          }
        }

      }

    }, false);

    if (searchEmpty) this.onChange.bind(this)();

  }

  componentDidUpdate(prevProps) {
    const {searchEmpty, url} = this.props;
    const {userQuery} = this.state;
    if (searchEmpty && prevProps.url !== url) this.onChange.bind(this)({target: {value: userQuery}});
  }

  render() {

    const {
      buttonLink,
      buttonText,
      className,
      icon,
      inactiveComponent: InactiveComponent,
      placeholder,
      resultRender,
      searchEmpty
    } = this.props;
    const {active, fetching, results, userQuery} = this.state;

    const showResults = searchEmpty || (active && userQuery.length);

    return (
      <div ref={comp => this.container = comp} className={ `${className} ${ active ? "active" : "" }` }>
        <div className="bp3-control-group">
          { InactiveComponent && <InactiveComponent active={ active } onClick={ this.onToggle.bind(this) } /> }
          <div className={ `bp3-input-group bp3-fill ${ active ? "active" : "" }` }>
            { icon && <span className="bp3-icon bp3-icon-search"></span> }
            <input key="search-input" type="text" className="bp3-input" ref={ input => this.input = input } onChange={ this.onChange.bind(this) } onFocus={ this.onFocus.bind(this) } placeholder={placeholder} defaultValue={userQuery} />
            { userQuery.length > 0 && <span className="bp3-icon bp3-icon-trash" role="button" tabIndex={0} aria-label="Clear search" style={{cursor: "pointer"}} onClick={ this.onClear.bind(this) } onKeyDown={ this.onClearKeyDown.bind(this) } /> }
            { buttonLink && <a href={ `${buttonLink}?q=${userQuery}` } className="bp3-button">{ buttonText }</a> }
          </div>
        </div>
        <ul className={ "results" }>
          { fetching && <li className="no-results">Loading…</li> }
          { !fetching && !results.length && <li className="no-results">No Results Found</li> }
          { !fetching && results.length && results.map(result =>
            <li key={ result.key || `${result.dimension}-${result.id}` } className="result" onClick={this.onToggle.bind(this)}>
              { resultRender(result, this.props) }
            </li>
          )}
          { results.length && buttonLink ? <a className="all-results bp3-button bp3-fill" href={ `${buttonLink}?q=${userQuery}` }>Show All Results</a> : null }
        </ul>
      </div>
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
