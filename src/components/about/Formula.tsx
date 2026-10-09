/** Block formula rendered with native MathML (the legacy page used KaTeX). `math` is MathML markup. */
export function Formula({math, inline = false}: {math: string; inline?: boolean}) {
  const Tag = inline ? "span" : "div";
  return <Tag className={inline ? "formula inline" : "formula"} dangerouslySetInnerHTML={{__html: `<math display="${inline ? "inline" : "block"}">${math}</math>`}} />;
}
