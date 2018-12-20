import React, {Component} from "react";
import {PropTypes} from "prop-types";
import {Link} from "react-router";

class NavLink extends Component {

  render() {

    const {children, to} = this.props;
    const {basename, pathname} = this.context.router.location;

    return <Link to={to} className={ `${basename}${pathname}`.includes(to) ? "active" : "" }>{ children }</Link>;

  }

}

NavLink.contextTypes = {
  router: PropTypes.object
};

export default NavLink;
