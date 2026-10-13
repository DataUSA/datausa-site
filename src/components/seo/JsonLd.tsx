/**
 * Structured data for search engines, rendered as a JSON-LD script. `<` is escaped so no value
 * (member names come from the dimensions database) can close the script element.
 */
export function JsonLd({data}: {data: Record<string, unknown>}) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(data).replace(/</g, "\\u003c")}} />;
}
