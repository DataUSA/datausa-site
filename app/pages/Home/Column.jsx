import React from "react";
import {Link} from "react-router";
import SVG from "react-inlinesvg";
import Tile from "components/Tile/Tile";

import "./Column.css";

const Column = ({data}) => {

  return (
    <div className={ `column ${data.slug}` }>
      <h2 className={ `column-title ${ data.new ? "new" : "" }` }>
        <Link to={data.url} className="column-title-link">
          <div className="column-icon-container">
            <SVG className="column-icon" src={ data.icon } width={20} height="auto" />
          </div>
          { data.title }
        </Link>
      </h2>
      { data.tiles.map((tile, i) =>  <Tile key={i} {...tile} />)}
    </div>
  );

}

export default Column;
