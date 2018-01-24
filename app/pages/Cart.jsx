import React, {Component} from "react";
import localforage from "localforage";
import axios from "axios";

export default class Cart extends Component {

  constructor(props) {
    super(props);
    this.state = {
      cart: false,
      results: false
    };
  }

  componentDidMount() {
    localforage.getItem("datausa-cart")
      .then(cart => {
        if (!cart) cart = [];
        this.setState({cart});
        return Promise.all(cart.map(c => axios.get(c.data).then(resp => resp.data)));
      })
      .then(results => {
        console.log(results);
      })
      .catch(err => console.error(err));
  }

  render() {
    const {cart} = this.state;
    console.log(cart);
    return (
      <div id="Cart">
        { !cart ? "Loading" : <div>
          Data!
        </div> }
      </div>
    );

  }

}
