/**
 * This is a workaround to make the Eleven Labs API key available on the client
 * The key is stored in the publicRuntimeConfig and is prefixed with NEXT_PUBLIC_
 * This is necessary because the key is not available on the client-side
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    ELEVEN_LABS_API_KEY: process.env.ELEVEN_LABS_API_KEY,
  },
  // Use publicRuntimeConfig to make the key available on the client
  publicRuntimeConfig: {
    ELEVEN_LABS_API_KEY: process.env.ELEVEN_LABS_API_KEY,
  },
};

module.exports = nextConfig;
