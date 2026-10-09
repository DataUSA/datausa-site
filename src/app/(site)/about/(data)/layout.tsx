import {Suspense, type ReactNode} from "react";
import {SubNav} from "@/components/about/SubNav";
import "../about.css";

const LINKS = [
  {href: "/about/datasets", label: "Data Sources"},
  {href: "/about/api", label: "API"},
  {href: "/about/classifications", label: "Classifications"}
];

export default function DataLayout({children}: {children: ReactNode}) {
  return (
    <div id="Data">
      <Suspense fallback={<nav id="SubNav" />}>
        <SubNav links={LINKS} />
      </Suspense>
      {children}
    </div>
  );
}
