import React from "react";
import {Route, Redirect, IndexRoute, browserHistory} from "react-router";

import App from "./App";
import Home from "./pages/Home";

export default function RouteCreate() {

  return (
    <Route path="/" component={App} history={browserHistory}>

      <IndexRoute component={Home} />

    </Route>
  );
}
