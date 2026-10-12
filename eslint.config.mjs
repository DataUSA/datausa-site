import nextConfig from "eslint-config-next";
import nextTs from "eslint-config-next/typescript";

export default [
  ...nextConfig,
  ...nextTs,
  {
    ignores: [".next/**", "node_modules/**", "scripts/legacy-export/raw/**", "public/_harness/**", "next-env.d.ts"]
  }
];
