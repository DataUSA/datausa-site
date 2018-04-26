import React, {Component} from "react";

function evalType(value) {
  let t = typeof value;
  if (t === "object") {
    if (value === null) return "undefined";
    else if (["Array"].includes(value.constructor.name)) t = "array";
    else if (["Error", "EvalError", "ReferenceError", "SyntaxError"].includes(value.constructor.name)) t = "error";
  }
  return t;
}

const colorMap = {
  number: "#2500CA",
  string: "#C40000",
  undefined: "#888888",
  error: "#ff0000"
};

export default class ConsoleVariable extends Component {

  render() {
    const {value} = this.props;

    const t = evalType(value);
    let v = value;
    if (t === "string") v = `"${v}"`;
    else if (t === "object") v = JSON.stringify(v);
    else if (t === "error") v = `Error: ${v.message}`;
    else if (t === "undefined") v = t;
    else if (v.toString) v = v.toString();

    return <span className={`variable ${t}`} style={{
      color: colorMap[t] || "inherit",
      fontFamily: "'Menlo', monospace",
      fontSize: "0.7rem",
      fontStyle: ["object", "array", "function"].includes(t) ? "italic" : "inherit",
      fontWeight: "500"
    }}>{v}</span>;

  }

}
