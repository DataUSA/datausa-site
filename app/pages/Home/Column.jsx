import React, {Component} from "react";
import {connect} from "react-redux";
import {Link} from "react-router";
import Tile from "components/Tile/Tile";

import "./Column.css";
import {PropTypes} from "prop-types";
import {addToCart} from "actions/cart";

class Column extends Component {

  onCart(data) {

    const {addToCart, cart} = this.props;

    const inCart = cart.data.find(c => c.slug === data.cart.slug);

    if (!inCart) {
      const build = {
        format: "function(resp) { return resp.data; }",
        title: data.title,
        ...data.cart
      };
      addToCart(build);
    }

  }

  render() {

    const {className, data} = this.props;

    return (
      <div className={ `column ${className} rank-${data.rank}` }>
        <h3 className={ `column-title ${ data.new ? "new" : "" }` }>
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

export default connect(state => ({
  cart: state.cart
}), dispatch => ({
  addToCart: build => dispatch(addToCart(build))
}))(Column);
