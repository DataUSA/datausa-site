import React, {Component} from "react";
import {connect} from "react-redux";
import {Link} from "react-router";
import {Dialog, Popover, PopoverInteractionKind} from "@blueprintjs/core";
import "./index.css";

import Hamburger from "./Hamburger";

import SearchButton from "./SearchButton";
import {clearCart, removeFromCart} from "actions/cart";

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

  onClear() {
    this.props.clearCart();
  }

  onRemove(d) {
    this.props.removeFromCart(d);
  }

  render() {
    const {background, menu} = this.state;
    const {cart, location, title} = this.props;
    const {pathname} = location;

    const home = pathname === "/";

    const toggleMenu = () => this.setState({menu: !this.state.menu});

    const search = !(home ||
                   pathname.indexOf("search") === 0);

    const splash = home ||
                   pathname.indexOf("profile") === 0 ||
                   pathname.indexOf("coronavirus") === 0 ||
                   pathname.indexOf("story") === 0 && pathname.length > 10;

    const dark = !splash;

    const Cart = () => <div className="cart-nav-controls">
      <div className="title">Data Cart</div>
      { cart && cart.data.length
        ? <div>
          <div className="sub">
            { cart.data.length } Dataset{ cart.data.length > 1 ? "s" : "" }
          </div>
          { cart.data.map(d => <div key={d.slug} className="dataset">
            <div className="title">{d.title}</div>
            <img src="/images/viz/remove.svg" className="remove" onClick={this.onRemove.bind(this, d)} />
          </div>) }
          <a href="/cart" className="bp3-button bp3-fill bp3-icon-download">
            View Data
          </a>
          <div className="bp3-button bp3-fill bp3-icon-trash" onClick={this.onClear.bind(this)}>
            Clear Cart
          </div>
        </div>
        : <div className="body">Put data into your cart as you browse to merge data from multiple sources.</div> }
    </div>;

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

      { title && (dark || background)
        ? <span className="nav-subtitle">{ title }</span>
        : null }

      <div className="right-buttons">
        <Popover
          hoverOpenDelay={0}
          hoverCloseDelay={150}
          interactionKind={PopoverInteractionKind.HOVER}
          placement="bottom-end"
          content={<Cart />}>
          <a href="/cart" key={ `cart-size-${cart ? cart.data.length : 0}` } className={ `cart-icon cart-size-${cart ? cart.data.length : 0}` }>
            { cart && cart.data.length ? <span className="cart-size">{cart.data.length}</span> : null }
            <img src={ `/images/cart${cart && cart.data.length ? "-red" : ""}.svg` } />
          </a>
        </Popover>
        { search && <SearchButton /> }
      </div>

      <Dialog className="nav-menu" lazy={false} isOpen={ menu } onClose={ toggleMenu } transitionName={ "slide" }>
        <div className="menu-content">
          <ul>
            { !home && <li>
              <Link to="/">Home</Link>
            </li> }
            <li>
              <Link className="new" to="/coronavirus">Coronavirus</Link>
            </li>
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
              <Link to="/visualize">Viz Builder</Link>
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
            <a target="_blank" rel="noopener noreferrer" href="http://www.datawheel.us/"><img id="datawheel" src="/images/footer/datawheel.png" /></a>
          </div> : null }
        </div>
      </Dialog>
    </nav>;
  }

}

export default connect(state => ({
  cart: state.cart,
  title: state.title
}), dispatch => ({
  clearCart: () => dispatch(clearCart()),
  removeFromCart: build => dispatch(removeFromCart(build))
}))(Nav);
