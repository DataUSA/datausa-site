import React, {Component} from "react";
import "./ConsoleVariable.css";

function evalType(value) {
  let t = typeof value;
  if (t === "object") {
    if (value === null) return "undefined";
    else if (["Array"].includes(value.constructor.name)) t = "array";
    else if (["Error", "EvalError", "ReferenceError", "SyntaxError"].includes(value.constructor.name)) t = "error";
  }
  return t;
}

export default class ConsoleVariable extends Component {

  render() {
    const {value} = this.props;

    const t = evalType(value);
    let v = value;
    if (t === "string") v = `"${v}"`;
    else if (t === "object") v = JSON.stringify(v);
    else if (t === "error") v = `Error: ${v.message}`;
    else if (t === "undefined") v = t;
    else if (t === "array") {
      v = <span>[{v.map((l, i) => <span key={i}><ConsoleVariable value={l} />{ i < v.length - 1 ? ", " : "" }</span>)}]</span>;
    }
    else if (v.toString) v = v.toString();

    return <span className={`variable ${t}`}>{v}</span>;

  }

}
