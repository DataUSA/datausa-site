"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";

/** Fixed secondary navigation under the main bar on About/Data pages (legacy `components/SubNav`). */
export function SubNav({links}: {links: {href: string; label: string}[]}) {
  const pathname = usePathname();
  return (
    <nav id="SubNav" aria-label="Section">
      <div className="container">
        {links.map(link => (
          <Link key={link.href} href={link.href} className={pathname.startsWith(link.href) ? "active" : ""}>{link.label}</Link>
        ))}
      </div>
    </nav>
  );
}
