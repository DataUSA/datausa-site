import nextConfig from "eslint-config-next";
import nextTs from "eslint-config-next/typescript";

export default [
  ...nextConfig,
  ...nextTs,
  {
    ignores: [".next/**", "node_modules/**", "scripts/legacy-export/raw/**", "next-env.d.ts"]
  }
];
