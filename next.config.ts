import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  // Cache Components: enables `use cache`, cacheLife and cacheTag. Report pages stay fully
  // dynamic (no generateStaticParams); only data fetches and dimension lookups are cached.
  cacheComponents: true,
  cacheLife: {
    // Statistical data changes on scheduled dataset releases: serve for a day, refresh in the
    // background for a week, and never serve anything older than 30 days. POST /api/revalidate
    // purges these entries by tag immediately after a release.
    data: {stale: 60 * 60 * 24, revalidate: 60 * 60 * 24 * 7, expire: 60 * 60 * 24 * 30},
    // Dimension metadata and attribute lookups change rarely.
    dimensions: {stale: 60 * 60 * 24, revalidate: 60 * 60 * 24 * 7, expire: 60 * 60 * 24 * 30}
  },
  // Self-hosted PM2 deployment: standalone output bundles the server and its dependencies.
  output: "standalone",
  // Profile images are served from the legacy image host for now (see docs/architecture.md).
  images: {unoptimized: true},
  poweredByHeader: false,
  reactStrictMode: true,
  // Section landing URLs that only ever showed their first tab (legacy routes.jsx).
  async redirects() {
    return [
      {source: "/about", destination: "/about/background", permanent: true},
      {source: "/about/classifications", destination: "/about/classifications/Geography/State", permanent: true}
    ];
  }
};

export default nextConfig;
