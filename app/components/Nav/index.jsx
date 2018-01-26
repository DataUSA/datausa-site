import React, {Component} from "react";
import {Link} from "react-router";
import {Dialog} from "@blueprintjs/core";
import "./index.css";

import Hamburger from "./Hamburger";

class Nav extends Component {

  constructor(props) {
    super(props);
    this.state = {
      background: false,
      menu: false
    };
    this.scrollBind = this.handleScroll.bind(this);
  }

  componentDidMount() {
    window.addEventListener("scroll", this.scrollBind);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.scrollBind);
  }

  handleScroll() {
    const {background} = this.state;
    const newBackground = window.scrollY > 45;

    if (background !== newBackground) {
      this.setState({background: newBackground});
    }
  }

  render() {
    const {background, menu} = this.state;
    const {dark} = this.props;
    const {pathname} = this.props.location;
    const logo = !["/"].includes(pathname);
    const toggleMenu = () => this.setState({menu: !this.state.menu});

    return <nav id="Nav" className={ background || dark ? "background" : "" }>
      <div className="menu-btn" onClick={ toggleMenu }>
        <Hamburger isOpen={ menu } />
        <span className={ menu ? "label open" : "label" }>Menu</span>
      </div>
      { logo ? <Link to="/" className="home-btn">
        <img src="/img/logo_sm.png" alt="Data USA" />
      </Link> : null }
      <Dialog className="nav-menu" isOpen={ menu } onClose={ toggleMenu } transitionName={ "slide" }>
        <Hamburger isOpen={ true } onClick={ toggleMenu } />
        <div className="menu-content">
          <ul>
            <li>
              <Link to="/search/">Explore</Link>
              <ul>
                <li><Link to="/search/?kind=geo">Locations</Link></li>
                <li><Link to="/search/?kind=naics">Industries</Link></li>
                <li><Link to="/search/?kind=soc">Occupations</Link></li>
                <li><Link to="/search/?kind=cip">Majors</Link></li>
                <li><Link to="/search/?kind=university">Universities</Link></li>
              </ul>
            </li>
            <li>
              <Link to="/story/">Stories</Link>
            </li>
            <li>
              <Link to="/map/">Maps</Link>
            </li>
            <li>
              <Link to="/cart/">Data Cart</Link>
            </li>
            <li>
              <Link to="/about/">About</Link>
            </li>
            <li>
              <Link to="/about/datasets/">Data Sources</Link>
            </li>
          </ul>
        </div>
      </Dialog>
    </nav>;
  }

}

Nav.defaultProps = {
  dark: false
};

export default Nav;
