import type {Metadata} from "next";
import {press} from "@/content/about/press";

export const metadata: Metadata = {title: "In the Press", alternates: {canonical: "/about/press"}};

export default function PressPage() {
  return (
    <div id="Press">
      <h1>In the Press</h1>
      {press.map(source => (
        <div key={source.link}>
          <h2 className="title"><a href={source.link} target="_blank" rel="noopener noreferrer">{source.title}</a></h2>
          <h3 className="source">{source.source}</h3>
          <div className="quote">&#34;{source.quote}&#34;</div>
        </div>
      ))}
    </div>
  );
}
