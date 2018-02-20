import React, {Component} from "react";
import "./index.css";

class SubNav extends Component {

  render() {

    return (
      <div id="SubNav">
        <div className="container">
          { this.props.children }
        </div>
      </div>
    );

  }

}

SubNav.defaultProps = {
  className: ""
};

export default SubNav;
