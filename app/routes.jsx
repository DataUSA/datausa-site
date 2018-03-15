import React from "react";
import {Route, IndexRoute, browserHistory} from "react-router";

import App from "./App";
import Home from "./pages/Home/index";

import Search from "./pages/Search";
import Profile from "./profile/index";

import Stories from "./pages/Stories";
import Story from "./pages/Story";

import Map from "./pages/Map";

import Cart from "./pages/Cart";

import About from "./pages/About/index";
import Background from "./pages/About/Background";
import Press from "./pages/About/Press";
import Team from "./pages/About/Team";
import Glossary from "./pages/About/Glossary";
import Usage from "./pages/About/Usage";

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

      <Route path="/about" component={About}>
        <IndexRoute component={Background} />
        <Route path="/about/press" component={Press} />
        <Route path="/about/team" component={Team} />
        <Route path="/about/glossary" component={Glossary} />
        <Route path="/about/usage" component={Usage} />
      </Route>

      <Route path="/about(/:content)(/:show)(/:sumlevel)(/:page)" component={About} />

      <Route path="/admin/profilebuilder" component={ProfileBuilder} />

    </Route>
  );
}
