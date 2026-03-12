import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // alasql bundles React Native modules that don't exist in Node.js
      config.resolve.alias = {
        ...config.resolve.alias,
        "react-native-fetch-blob": false,
        "react-native-fs": false,
      };
    }
    return config;
  },
};

export default nextConfig;
