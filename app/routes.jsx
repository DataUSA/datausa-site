import React from "react";
import {Route, IndexRoute, browserHistory} from "react-router";

import App from "./App";
import Home from "./pages/Home";

import Search from "./pages/Search";
import Profile from "./profile/index";

import Stories from "./pages/Stories";
import Story from "./pages/Story";

import Map from "./pages/Map";

import Cart from "./pages/Cart";

import About from "./pages/About";

import ProfileBuilder from "./admin/ProfileBuilder";

export default function RouteCreate() {

  return (
    <Route path="/" component={App} history={browserHistory}>

      <IndexRoute component={Home} />

      <Route path="/search" component={Search} />
      <Route path="/profile/:pslug/:pid" component={Profile} />

      <Route path="/story" component={Stories} />
      <Route path="/story/:sid" component={Story} />

      <Route path="/map" component={Map} />

      <Route path="/cart" component={Cart} />

      <Route path="/about(/:content)(/:show)(/:sumlevel)(/:page)" component={About} />

      <Route path="/admin/profilebuilder" component={ProfileBuilder} />

    </Route>
  );
}
