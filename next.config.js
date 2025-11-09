const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // Aliases alineados con tsconfig.json y estructura real
    config.resolve.alias["@core"] = path.resolve(__dirname, "src");
    config.resolve.alias["@admin"] = path.resolve(__dirname, "tailadmin-templates/src");
    config.resolve.alias["@icons"] = path.resolve(
      __dirname,
      "tailadmin-templates/src/icons/index.ts"
    );

    // Importar SVGs como componentes React
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};

module.exports = nextConfig;