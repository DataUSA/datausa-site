import React from "react";
import {AnchorLink} from "@datawheel/canon-core";

export default function Anchor({children, slug}) {
  return <span>
    <span className="bp3-icon-standard bp3-icon-link"></span>
    <AnchorLink to={slug}>{children}</AnchorLink>
  </span>;
}
