import {Suspense, type ReactNode} from "react";
import {SubNav} from "@/components/about/SubNav";
import "../about.css";

const LINKS = [
  {href: "/about/background", label: "Background"},
  {href: "/about/press", label: "In the Press"},
  {href: "/about/glossary", label: "Glossary"},
  {href: "/about/usage", label: "Terms of Use"}
];

export default function AboutLayout({children}: {children: ReactNode}) {
  return (
    <div id="About">
      <Suspense fallback={<nav id="SubNav" />}>
        <SubNav links={LINKS} />
      </Suspense>
      {children}
    </div>
  );
}
