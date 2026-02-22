import type { NextConfig } from "next";

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
    ],
  },
  reactCompiler: true,
};

export default nextConfig;
