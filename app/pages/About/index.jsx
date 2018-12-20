import React, {Component} from "react";
import PropTypes from "prop-types";
import SubNav from "components/SubNav/index";
import NavLink from "components/NavLink";

import "./index.css";

class About extends Component {

  getChildContext() {
    return {
      location: this.props.location
    };
  }

  render() {

    return (
      <div id="About">
        <SubNav>
          <NavLink to="/about/background">Background</NavLink>
          <NavLink to="/about/press">In the Press</NavLink>
          <NavLink to="/about/team">Team</NavLink>
          <NavLink to="/about/glossary">Glossary</NavLink>
          <NavLink to="/about/usage">Terms of Use</NavLink>
        </SubNav>
        { this.props.children }
      </div>
    );

  }

}

About.childContextTypes = {
  location: PropTypes.object
};

export default About;
