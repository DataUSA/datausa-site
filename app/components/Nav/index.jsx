import React, {Component} from "react";
import {Link} from "react-router";
import {Dialog} from "@blueprintjs/core";
import "./index.css";

import Hamburger from "./Hamburger";

import SearchButton from "./SearchButton";

export default class Nav extends Component {

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
    const {location} = this.props;
    const {pathname} = location;

    const home = pathname === "/";

    const toggleMenu = () => this.setState({menu: !this.state.menu});

    const search = !(home ||
                   pathname.indexOf("search") === 0);

    const splash = home ||
                   pathname.indexOf("profile") === 0 ||
                   pathname.indexOf("story") === 0 && pathname.length > 10;

    const dark = !splash;

    const pageTitle = typeof window !== "undefined" ? document.title : "";
    const subtitle = pageTitle.includes(" | ") ? pageTitle.split(" | ")[0] : false;

    return <nav id="Nav" className={ `${background || dark ? "background" : ""} ${menu ? "menu" : ""}` }>

      <div className="menu-btn" onClick={ toggleMenu }>
        <Hamburger isOpen={ menu } />
        <span className={ menu ? "label open" : "label" }>Menu</span>
      </div>

      { !home || (dark || background)
        ? <Link to="/" className="home-btn">
          <img src="/images/logo_sm.png" alt="Data USA" />
        </Link>
        : null }

      { subtitle && (dark || background)
        ? <span className="nav-subtitle">{ subtitle }</span>
        : null }

      { search
        ? <SearchButton />
        : null }

      <Dialog className="nav-menu" lazy={false} isOpen={ menu } onClose={ toggleMenu } transitionName={ "slide" }>
        <div className="menu-content">
          <ul>
            { !home && <li>
              <Link to="/">Home</Link>
            </li> }
            <li>
              <Link to="/search">Explore</Link>
              <ul>
                <li><Link to="/search/?dimension=Geography">Locations</Link></li>
                <li><Link to="/search/?dimension=PUMS Industry">Industries</Link></li>
                <li><Link to="/search/?dimension=PUMS Occupation">Occupations</Link></li>
                <li><Link to="/search/?dimension=CIP">Degrees</Link></li>
                <li><Link to="/search/?dimension=Universities">Universities</Link></li>
                <li><Link to="/search/?dimension=NAPCS">Products &amp; Services</Link></li>
              </ul>
            </li>
            <li>
              <Link className="new" to="/visualize">Viz Builder</Link>
            </li>
            <li>
              <Link to="/map">Maps</Link>
            </li>
            <li>
              <Link to="/story">Stories</Link>
            </li>
            <li>
              <Link to="/cart">Data Cart</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/about/datasets">Data Sources</Link>
            </li>
          </ul>
          { !home ? <div className="menu-collab">
            <a target="_blank" rel="noopener noreferrer" href="http://www2.deloitte.com/us/en.html"><img id="deloitte" src="/images/footer/deloitte.png" /></a>
            <a target="_blank" rel="noopener noreferrer" href="http://macro.media.mit.edu/"><img id="mit" src="/images/footer/mit.png" /></a>
            <a target="_blank" rel="noopener noreferrer" href="http://www.datawheel.us/"><img id="datawheel" src="/images/footer/datawheel.png" /></a>
          </div> : null }
        </div>
      </Dialog>
    </nav>;
  }

}
