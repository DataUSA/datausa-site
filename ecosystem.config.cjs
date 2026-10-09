/**
 * PM2 configuration for the self-hosted deployment (cluster mode behind Nginx).
 *
 *   npm run build            # produces .next/standalone (+ static assets and data copied by scripts/package-standalone.sh)
 *   pm2 start ecosystem.config.cjs --env production
 *   pm2 reload datausa-site  # zero-downtime restart after a deploy
 *
 * The standalone server is self-contained: it needs only Node.js 24, the `.next/standalone`
 * folder (with `.next/static`, `public` and `data` inside it) and the runtime environment
 * variables listed in `.env.example`.
 */
module.exports = {
  apps: [
    {
      name: "datausa-site",
      cwd: __dirname + "/.next/standalone",
      script: "server.js",
      exec_mode: "cluster",
      instances: process.env.PM2_INSTANCES || "max",
      // Give the stale instances time to finish in-flight report requests before they are replaced.
      kill_timeout: 15000,
      wait_ready: false,
      listen_timeout: 20000,
      max_memory_restart: "1500M",
      env_production: {
        NODE_ENV: "production",
        PORT: 3301,
        HOSTNAME: "127.0.0.1"
      }
    }
  ]
};
