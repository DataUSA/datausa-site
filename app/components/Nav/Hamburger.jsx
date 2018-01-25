import React from "react";
import "./Hamburger.css";

const Hamburger = props => <div id="Hamburger" className={ props.isOpen ? "open" : "" } onClick={ props.onClick }>
  <span></span><span></span><span></span><span></span>
</div>;

export default Hamburger;
