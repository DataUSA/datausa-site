import React from "react";
import {Redirect, Route, IndexRoute} from "react-router";

import App from "./App";
import Home from "./pages/Home/index";

import SearchPage from "./pages/SearchPage";
import Profile from "./profile/index";
import Embed from "./profile/Embed";

import MapPage from "./pages/Map";
import Visualize from "./pages/Visualize";
import Coronavirus from "./pages/Coronavirus";

import Cart from "./pages/Cart";

import About from "./pages/About/index";
import Background from "./pages/About/Background";
import Press from "./pages/About/Press";
import Team from "./pages/About/Team";
import Glossary from "./pages/About/Glossary";
import Usage from "./pages/About/Usage";

import Data from "./pages/Data/index";
import DataSources from "./pages/Data/DataSources";
import API from "./pages/Data/API";
import Classifications from "./pages/Data/Classifications";

import NotFound from "./pages/NotFound/NotFound";

import {Builder} from "@datawheel/canon-cms";

import napcs2sctg from "../static/data/nacps2sctg.json";
const sctg2napcs = Object.keys(napcs2sctg)
  .reduce((obj, napcs) => {
    napcs2sctg[napcs].forEach(sctg => {
      obj[sctg] = napcs;
    });
    return obj;
  }, {});

import oldGeos from "../static/data/oldgeos.json";

/** Handles all profile page crosswalk logic. */
function crosswalk(nextState, replace) {

  const {slug, id} = nextState.params;

  if (slug === "sctg") {
    const newId = sctg2napcs[id];
    const url = `/profile/napcs/${newId}/`;
    replace(url);
  }
  else if (slug === "geo" && oldGeos[id]) {
    const newId = oldGeos[id];
    const url = `/profile/geo/${newId}/`;
    replace(url);
  }

}

/** Hooks up page routes to the react-router instance. */
export default function RouteCreate() {

  return (
    <Route path="/" component={App}>

      <IndexRoute component={Home} />

      <Route path="/search" component={SearchPage} />
      <Route path="/profile/:slug/:id" isProfile={true} onEnter={crosswalk} component={Profile} />
      <Route path="/profile/:slug/:id/:sslug/:tslug" component={Embed} />

      {/* <Route path="/visualize" component={Visualize} />
      <Route path="/map" component={MapPage} />
      <Route path="/coronavirus" component={Coronavirus} /> */}

      {/* <Route path="/cart" component={Cart} /> */}

      <Redirect from="/about" to="/about/background" />
      <Route path="/about(/background|press|team|glossary|usage)" component={About}>
        <Route path="/about/background" component={Background} />
        <Route path="/about/press" component={Press} />
        <Route path="/about/team" component={Team} />
        <Route path="/about/glossary" component={Glossary} />
        <Route path="/about/usage" component={Usage} />
      </Route>

      <Route path="/about(/datasets|api|classifications)" component={Data}>
        <Route path="/about/datasets" component={DataSources} />
        <Route path="/about/api" component={API} />
        <Redirect from="/about/classifications" to="/about/classifications/Geography/State" />
        <Route path="/about/classifications/:dimension/:hierarchy" component={Classifications} />
      </Route>

      <Route path="/cms" component={Builder} />

      <Route path="*" component={NotFound} status={404} />

    </Route>
  );
}
