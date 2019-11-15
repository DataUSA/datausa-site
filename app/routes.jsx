import React from "react";
import {Route, IndexRoute, browserHistory} from "react-router";
import {Builder, Profile} from "@datawheel/canon-cms";

import App from "./App";
import Home from "./pages/Home";

/** */
export default function RouteCreate() {
  return (
    <Route path="/" component={App} history={browserHistory}>
      <IndexRoute component={Home} />
      <Route path="/cms" component={Builder} />
      <Route path="/profile/(:slug)/(:id)" component={Profile} />
    </Route>
  );
}
