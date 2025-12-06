const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,

  typescript: {
    ignoreBuildErrors: true,
  },

  // Configuración válida para Turbopack
  turbopack: {
    resolveAlias: {
      "@core": path.resolve(__dirname, "src"),
      "@admin": path.resolve(__dirname, "tailadmin-templates/src"),
      "@icons": path.resolve(__dirname, "tailadmin-templates/src/icons/index.ts"),
    },
    // loaders eliminado: Turbopack ya maneja CSS y SVG de forma nativa
  },
};

module.exports = nextConfig;