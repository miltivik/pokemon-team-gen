import type { NextConfig } from "next";

const projectRoot = process.cwd();

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  outputFileTracingRoot: projectRoot,
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
    ],
  },
  turbopack: {
    root: projectRoot,
  },
  reactCompiler: false,
};

export default nextConfig;
