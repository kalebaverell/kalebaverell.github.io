/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: `npm run build` emits a fully static site to /out
  // (this is the "static export" that can be hosted anywhere or opened via a static server).
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  // Lets a verification build write somewhere other than .next, so it can run
  // safely while a dev server is using .next. Unset in normal use and in CI.
  ...(process.env.VP_DIST_DIR ? { distDir: process.env.VP_DIST_DIR } : {}),
  // Caps static-generation workers on memory-starved machines (spawn errors at
  // full parallelism). Unset in normal use and in CI.
  ...(process.env.VP_BUILD_CPUS ? { experimental: { cpus: Number(process.env.VP_BUILD_CPUS) } } : {}),
};

export default nextConfig;
