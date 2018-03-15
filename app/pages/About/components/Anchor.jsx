import React from "react";
import {AnchorLink} from "datawheel-canon";

export default function Anchor({children, slug}) {
  return <span>
    <span className="pt-icon-standard pt-icon-link"></span>
    <AnchorLink to={slug}>{children}</AnchorLink>
  </span>;
}
