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
  // Report metadata is streamed after the page shell for ordinary browsers and for crawlers that
  // run JavaScript. Crawlers that read only the first HTML need the tags in <head>: Next's own list
  // (search and social previews) plus the AI and link-preview fetchers it does not know about.
  htmlLimitedBots: /[\w-]+-Google|Google-[\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight|GPTBot|ChatGPT-User|OAI-SearchBot|ClaudeBot|Claude-User|Claude-SearchBot|anthropic-ai|PerplexityBot|Perplexity-User|meta-externalagent|meta-externalfetcher|Amazonbot|CCBot|Bytespider|DuckAssistBot|MistralAI-User|cohere-ai|YouBot|PetalBot|TelegramBot|Pinterestbot|Mastodon|Iframely|Embedly|SemrushBot|AhrefsBot|MJ12bot/i,
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
