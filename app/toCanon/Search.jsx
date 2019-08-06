import React, {Component} from "react";
import PropTypes from "prop-types";

import axios from "axios";

import {event, select} from "d3-selection";
import {uuid} from "d3plus-common";

let timeout;

class Search extends Component {

  constructor(props) {
    super(props);
    this.state = {
      active: false,
      id: uuid(),
      results: [],
      userQuery: props.defaultQuery
    };
  }

  onChange(e) {

    const userQuery = e ? e.target.value : this.state.userQuery;
    const {onChange, searchEmpty, url}  = this.props;
    if (onChange) onChange(userQuery);

    if (!searchEmpty && userQuery.length === 0) {
      this.setState({active: true, results: [], userQuery});
    }
    else if (url) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        axios.get(`${url}${ url.includes("?") ? "&" : "?" }q=${userQuery}`)
          .then(res => res.data)
          .then(data => {
            this.setState({active: true, results: data.results, userQuery});
          });
      }, 250);
    }

  }

  onFocus() {
    this.setState({active: true});
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

    select(document).on(`mousedown.${ id }`, () => {
      if (this.state.active && this.container && !this.container.contains(event.target)) {
        this.setState({active: false});
      }
    });

    select(document).on(`keydown.${ id }`, () => {

      const {router} = this.context;
      const {active} = this.state;
      const key = event.keyCode;
      const DOWN = 40,
            ENTER = 13,
            ESC = 27,
            S = 83,
            UP = 38;

      if (primary && !active && key === S && !["input", "textarea"].includes(event.target.tagName.toLowerCase()) && !event.target.className.includes("ql-editor")) {
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
    const {active, results, userQuery} = this.state;

    return (
      <div ref={comp => this.container = comp} className={ `pt-control-group ${className} ${ active ? "active" : "" }` }>
        { InactiveComponent && <InactiveComponent active={ active } onClick={ this.onToggle.bind(this) } /> }
        <div className={ `pt-input-group pt-fill ${ active ? "active" : "" }` }>
          { icon && <span className="pt-icon pt-icon-search"></span> }
          <input type="text" className="pt-input" ref={ input => this.input = input } onChange={ this.onChange.bind(this) } onFocus={ this.onFocus.bind(this) } placeholder={placeholder} defaultValue={userQuery} />
          { buttonLink && <a href={ `${buttonLink}?q=${userQuery}` } className="pt-button">{ buttonText }</a> }
        </div>
        { searchEmpty || active && userQuery.length
          ? <ul className={ active ? "results active" : "results" }>
            { results.map(result =>
              <li key={ result.key } className="result" onClick={this.onToggle.bind(this)}>
                { resultRender(result, this.props) }
              </li>
            )}
            { !results.length && <li className="no-results">No Results Found</li> }
            { results.length && buttonLink ? <a className="all-results pt-button pt-fill" href={ `${buttonLink}?q=${userQuery}` }>Show All Results</a> : null }
          </ul>
          : null }
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
