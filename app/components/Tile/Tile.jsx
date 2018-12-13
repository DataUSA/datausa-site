import React, {Component} from "react";
import {Link} from "react-router";

import "./Tile.css";

class Contents extends Component {

  render() {

    const {image, subtitle, title} = this.props;

    return <div className="contents">
      <div className="image" style={{backgroundImage: `url(${image})`}}></div>
      <div className="title">{ title }</div>
      { subtitle && <div className="subtitle">{ subtitle }</div> }
    </div>;

  }

}

export default class Tile extends Component {

  render() {

    const {onClick, url} = this.props;

    if (url) {
      return <Link className={ `tile ${ this.props.new ? "new" : "" }` } to={url}>
        <Contents {...this.props} />
      </Link>;
    }
    else {
      return <div className={ `tile ${ this.props.new ? "new" : "" }` } onClick={onClick}>
        <Contents {...this.props} />
      </div>;
    }

  }

}
