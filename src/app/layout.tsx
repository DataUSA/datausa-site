import type {Metadata, Viewport} from "next";
import type {ReactNode} from "react";
import "./globals.css";

const description = "The most comprehensive visualization of U.S. public data. Data USA provides an open, easy-to-use platform that turns data into knowledge.";

export const metadata: Metadata = {
  title: {default: "Data USA", template: "%s | Data USA"},
  description,
  metadataBase: new URL(process.env.SITE_URL ?? "https://datausa.io"),
  icons: {icon: "/images/favicon.ico"},
  openGraph: {title: "Data USA", type: "article", description, siteName: "Data USA"},
  other: {"fb:app_id": "1705281333093640", "mobile-web-app-capable": "yes", "apple-mobile-web-app-capable": "yes", "apple-mobile-web-app-status-bar-style": "black", "apple-mobile-web-app-title": "Data USA"}
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
};

export default function RootLayout({children}: {children: ReactNode}) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com/" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato:300|Palanquin:300,400,500,600,700|Source+Sans+Pro:300,400|Pathway+Gothic+One" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
