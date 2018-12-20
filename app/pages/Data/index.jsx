import React, {Component} from "react";
import PropTypes from "prop-types";
import SubNav from "components/SubNav/index";
import NavLink from "components/NavLink";

import "../About/index.css";

class Data extends Component {

  getChildContext() {
    return {
      location: this.props.location
    };
  }

  render() {

    return (
      <div id="Data">
        <SubNav>
          <NavLink to="/about/datasets/">Data Sources</NavLink>
          <NavLink to="/about/api/">API</NavLink>
          <NavLink to="/about/classifications/">Classifications</NavLink>
        </SubNav>
        { this.props.children }
      </div>
    );

  }

}

Data.childContextTypes = {
  location: PropTypes.object
};

export default Data;
