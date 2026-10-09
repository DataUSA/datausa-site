import type {Metadata} from "next";
import {Suspense} from "react";
import {caveats, usage} from "@/content/about/datasets";
import {getDatasetSources, sourceSlug} from "@/lib/about/datasets";

export const metadata: Metadata = {title: "Data Sources", alternates: {canonical: "/about/datasets"}};

async function Sources() {
  const sources = await getDatasetSources();
  return (
    <div id="DataSources">
      {sources.map(source => {
        const slug = sourceSlug(source.title);
        const use = usage[slug] ?? [];
        const caveat = caveats[slug] ?? [];
        return (
          <details key={source.title} className="dataset">
            <summary>{source.title}</summary>
            <div className="dataset-body">
              {source.desc.map((d, i) => <p key={i} dangerouslySetInnerHTML={{__html: d}} />)}
              {use.length > 0 && <div className="sub-title">Where is it used?</div>}
              {use.map((d, i) => <p key={i} dangerouslySetInnerHTML={{__html: d}} />)}
              {caveat.length > 0 && <div className="sub-title">Caveats</div>}
              {caveat.map((d, i) => <p key={i} dangerouslySetInnerHTML={{__html: d}} />)}
              {source.datasets.length > 0 && <div className="sub-title">Source Link{source.datasets.length > 1 ? "s" : ""}</div>}
              {source.datasets.length > 0 && (
                <ul>
                  {source.datasets.map(d => <li key={d.title}><a href={d.link} target="_blank" rel="noopener noreferrer">{d.title}</a></li>)}
                </ul>
              )}
            </div>
          </details>
        );
      })}
      {!sources.length && <p>The list of data sources is temporarily unavailable.</p>}
    </div>
  );
}

/** Data sources grouped from the Tesseract cube annotations (legacy `Data/DataSources.jsx`). */
export default function DatasetsPage() {
  return (
    <Suspense fallback={<div id="DataSources" />}>
      <Sources />
    </Suspense>
  );
}
