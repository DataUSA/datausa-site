import React, {Component} from "react";
import {Link} from "react-router";
import "./index.css";

export default class Nav extends Component {

  constructor(props) {
    super(props);
    this.state = {
      background: false
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
    const {background} = this.state;
    return <nav id="Nav" className={ background ? "background" : "" }>
      <Link to="/" className="home-btn">
        <img src="/img/logo_sm.png" alt="Data USA" />
      </Link>
    </nav>;
  }

}
