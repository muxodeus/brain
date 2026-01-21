const path = require("path");

/** Security Headers */
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: `
      default-src 'self';
      img-src 'self' data: https:;
      script-src 'self';
      style-src 'self' 'unsafe-inline';
      connect-src 'self' https:;
      font-src 'self';
      frame-ancestors 'none';
    `.replace(/\s{2,}/g, " ").trim(),
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,

  typescript: {
    ignoreBuildErrors: true,
  },

  turbopack: {
    resolveAlias: {
      "@core": path.resolve(__dirname, "src"),
      "@admin": path.resolve(__dirname, "tailadmin-templates/src"),
      "@icons": path.resolve(
        __dirname,
        "tailadmin-templates/src/icons/index.ts"
      ),
    },
  },

  /** Agregamos los headers aquí */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
