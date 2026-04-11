import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/PokeAPI/sprites/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/msikma/pokesprite/**',
      },
      {
        protocol: 'https',
        hostname: 'play.pokemonshowdown.com',
        port: '',
        pathname: '/sprites/**',
      },
      {
        protocol: 'https',
        hostname: 'img.pokemondb.net',
        port: '',
        pathname: '/artwork/large/**',
      },
    ],
  },
  turbopack: {
    root: projectRoot,
  },
  reactCompiler: false,
};

export default nextConfig;
