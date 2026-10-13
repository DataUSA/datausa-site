import type {Metadata, Viewport} from "next";
import type {ReactNode} from "react";
import {pageImage, social} from "@/lib/seo/metadata";
import {SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL} from "@/lib/seo/site";
import "./globals.css";

/** Site-wide defaults; every page type sets its own title, description, canonical URL and share image. */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {default: `${SITE_NAME}: ${SITE_TAGLINE}`, template: `%s | ${SITE_NAME}`},
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  icons: {icon: "/images/favicon.ico"},
  // let search engines show the full snippet and the large share image
  robots: {index: true, follow: true, googleBot: {"index": true, "follow": true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1}},
  ...social({title: SITE_NAME, description: SITE_DESCRIPTION, image: pageImage("home"), imageAlt: `${SITE_NAME}: ${SITE_TAGLINE}`}),
  facebook: {appId: "1705281333093640"},
  appleWebApp: {capable: true, title: SITE_NAME, statusBarStyle: "black"},
  // iOS would otherwise turn long figures and FIPS codes into phone links
  formatDetection: {telephone: false}
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#00112C"
};

export default function RootLayout({children}: {children: ReactNode}) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com/" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com/" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato:300|Palanquin:300,400,500,600,700|Source+Sans+Pro:300,400|Pathway+Gothic+One" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
