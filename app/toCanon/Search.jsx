import React, {Component} from "react";
import {browserHistory} from "react-router";

import axios from "axios";

import {event, select} from "d3-selection";
import {uuid} from "d3plus-common";
import {strip} from "d3plus-text";

class Search extends Component {

  constructor(props) {
    super(props);
    this.state = {
      active: false,
      id: uuid(),
      results: [],
      userQuery: ""
    };
  }

  onBlur() {
    const {shouldBlur} = this.state;
    if (!shouldBlur) {
      this.setState({shouldBlur: true});
    }
    else {
      this.setState({active: false});
    }
  }


  onChange(e) {

    const userQuery = e.target.value;
    const {limit, url}  = this.props;

    if (userQuery.length === 0) this.setState({active: true, results: [], userQuery});
    else if (url) {
      axios.get(`${url}?q=${strip(userQuery)}`)
        .then(res => res.data)
        .then(data => {
          let results = data.results;
          if (limit) results = results.slice(0, limit);
          this.setState({active: true, results, userQuery});
        });
    }

  }

  onClick(d) {
    const {resultLink} = this.props;
    browserHistory.push(resultLink(d));
    this.setState({active: false, shouldBlur: false});
  }

  onFocus() {
    this.setState({active: true});
  }

  onToggle() {

    if (this.state.active) this.input.blur();
    else this.input.focus();

  }

  componentDidMount() {

    const {primary} = this.props;
    const {id} = this.state;

    select(document).on(`keydown.${ id }`, () => {

      const {active} = this.state;
      const key = event.keyCode;
      const DOWN = 40,
            ENTER = 13,
            ESC = 27,
            S = 83,
            UP = 38;

      if (primary && !active && key === S && event.target.tagName.toLowerCase() !== "input") {
        event.preventDefault();
        this.onToggle();
      }
      else if (active && key === ESC && event.target === this.input) {
        event.preventDefault();
        this.onToggle();
      }
      else if (active && event.target === this.input) {

        const highlighted = document.querySelector(".highlighted");

        if (key === ENTER && highlighted) {
          this.setState({active: false});
          browserHistory.push(highlighted.querySelector("a").href);
        }
        else if (key === DOWN || key === UP) {

          if (!highlighted) {
            if (key === DOWN) document.querySelector(".results > li:first-child").classList.add("highlighted");
          }
          else {

            const results = document.querySelectorAll(".results > li");

            const currentIndex = [].indexOf.call(results, highlighted);

            if (key === DOWN && currentIndex < results.length - 1) {
              results[currentIndex + 1].classList.add("highlighted");
              highlighted.classList.remove("highlighted");
            }
            else if (key === UP) {
              if (currentIndex > 0) results[currentIndex - 1].classList.add("highlighted");
              highlighted.classList.remove("highlighted");
            }
          }
        }

      }

    }, false);

  }

  render() {

    const {
      buttonLink,
      buttonText,
      className,
      icon,
      inactiveComponent: InactiveComponent,
      placeholder,
      resultRender
    } = this.props;
    const {active, results, userQuery} = this.state;

    return (
      <div className={ `pt-control-group ${className} ${ active ? "active" : "" }` }  onBlur={ this.onBlur.bind(this) }>
        { InactiveComponent && <InactiveComponent active={ active } onClick={ this.onToggle.bind(this) } /> }
        <div className={ `pt-input-group pt-fill ${ active ? "active" : "" }` }>
          { icon && <span className="pt-icon pt-icon-search"></span> }
          <input type="text" className="pt-input" ref={ input => this.input = input } onChange={ this.onChange.bind(this) } onFocus={ this.onFocus.bind(this) } placeholder={placeholder} />
          { buttonLink && <a href={ `${buttonLink}?q=${userQuery}` } className="pt-button">{ buttonText }</a> }
        </div>
        { active && userQuery.length
          ? <ul className={ active ? "results active" : "results" }>
            { results.map(result =>
              <li key={ result.id } className="result" onClick={this.onClick.bind(this, result)}>
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

Search.defaultProps = {
  buttonLink: false,
  buttonText: "Search",
  className: "search",
  icon: "search",
  inactiveComponent: false,
  placeholder: "Search",
  primary: false,
  resultLink: d => d.url,
  resultName: d => d.name,
  resultRender: (d, props) => <span>{ props.resultName(d) }</span>,
  url: false
};

export default Search;
