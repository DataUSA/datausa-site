import type {ReactNode} from "react";

/** Heading text that links to its own anchor, with a link icon on hover (legacy `components/Anchor`). */
export function Anchor({slug, children}: {slug: string; children: ReactNode}) {
  return (
    <span className="anchor">
      <img className="anchor-icon" src="/images/link.svg" alt="" aria-hidden="true" />
      <a href={`#${slug}`}>{children}</a>
    </span>
  );
}
