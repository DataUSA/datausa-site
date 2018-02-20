import React, {Component} from "react";
import SubNav from "components/SubNav/index";
import NavLink from "components/NavLink";

import "./About.css";

export default class About extends Component {

  render() {

    return (
      <div id="About">
        <SubNav>
          <NavLink to="/about/">Background</NavLink>
          <NavLink to="/about/glossary/">Glossary</NavLink>
          <NavLink to="/about/usage/">Terms of Use</NavLink>
        </SubNav>
        <p>
          About Text
        </p>
      </div>
    );

  }

}
