/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: `npm run build` emits a fully static site to /out
  // (this is the "static export" that can be hosted anywhere or opened via a static server).
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
