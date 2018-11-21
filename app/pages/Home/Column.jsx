import React, {Component} from "react";
import {connect} from "react-redux";
import {Link} from "react-router";
import localforage from "localforage";

import "./Column.css";
import {PropTypes} from "prop-types";

class Tile extends Component {

  render() {

    const {image, subtitle, title} = this.props;

    return <div className="contents">
      <div className="image" style={{backgroundImage: `url(${image})`}}></div>
      <div className="title">{ title }</div>
      <div className="subtitle">{ subtitle }</div>
    </div>;

  }

}

class Column extends Component {

  async onCart(data) {

    const {cartKey} = this.props;
    const {router} = this.context;

    const cartObj = {
      format: "function(resp) { return resp.data; }",
      title: data.title,
      ...data.cart
    };

    const cart = await localforage.getItem(cartKey) || [];
    const inCart = cart.find(c => c.slug === cartObj.slug);

    if (!inCart) {
      cart.push(cartObj);
      await localforage.setItem(cartKey, cart);
    }

    router.push("/cart");

  }

  render() {

    const {className, data} = this.props;

    return (
      <div className={ `column ${className} rank-${data.rank}` }>
        <h3 className="column-title">
          <Link to={data.url}>
            <img className="icon" src={ data.icon } />
            { data.title }
          </Link>
        </h3>
        { data.tiles.map((tile, i) => {
          const {cart} = tile;

          if (cart) {
            return <div className={ `tile ${ tile.new ? "new" : "" }` } key={i} onClick={this.onCart.bind(this, tile)}>
              <Tile {...tile} />
            </div>;
          }
          else {
            return <Link className={ `tile ${ tile.new ? "new" : "" }` } key={i} to={ tile.url }>
              <Tile {...tile} />
            </Link>;
          }
        })}
        <Link className="column-footer" to={data.url}>{ data.footer }</Link>
      </div>
    );

  }

}

Column.contextTypes = {
  router: PropTypes.object
};

export default connect(state => ({cartKey: state.env.CART}))(Column);
