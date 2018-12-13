import React, {Component} from "react";
import {connect} from "react-redux";
import {Link} from "react-router";
import localforage from "localforage";
import Tile from "components/Tile/Tile";

import "./Column.css";
import {PropTypes} from "prop-types";

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
          if (tile.cart) return <Tile key={i} {...tile} onClick={this.onCart.bind(this, tile)} />;
          else return <Tile key={i} {...tile} />;
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
