import React from "react";
import {Link} from "react-router";

import "./Column.css";

export default function Column({className, data}) {

  return (
    <div className={ `column ${className} rank-${data.rank}` }>
      <h3 className="column-title">
        <Link to={data.url}>
          <img className="icon" src={ data.icon } />
          { data.title }
        </Link>
      </h3>
      { data.tiles.map((tile, i) => <Link className={ `tile ${ tile.new ? "new" : "" }` } key={i} to={ tile.url }>
        <div className="contents">
          <div className="image" style={{backgroundImage: `url(${tile.image})`}}></div>
          <div className="title">{ tile.title }</div>
          <div className="subtitle">{ tile.subtitle }</div>
        </div>
      </Link>)}
      <Link className="column-footer" to={data.url}>{ data.footer }</Link>
    </div>
  );

}
