import React, {Component} from "react";
import {Link} from "react-router";
import {LazyImage} from "@datawheel/canon-core";

import "./Tile.css";

class Contents extends Component {

  render() {

    const {image, subtitle, title} = this.props;

    return <>
      { image && <LazyImage imageProps={{className: "image", src: image, alt: title}} backgroundImage={true} /> }
      { image && <div className="overlay" /> }
      <div className="content">
        <div className="title">{ title }</div>
        { subtitle && <div className="subtitle">{ subtitle }</div> }
      </div>
    </>;

  }

}

export default class Tile extends Component {

  render() {

    const {onClick, url} = this.props;

    if (url) {
      return <Link className={ `usa-tile ${ this.props.new ? "new" : "" }` } to={url}>
        <Contents {...this.props} />
      </Link>;
    }
    else {
      return <div className={ `usa-tile ${ this.props.new ? "new" : "" }` } onClick={onClick}>
        <Contents {...this.props} />
      </div>;
    }

  }

}
