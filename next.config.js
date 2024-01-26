/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "data.1024tera.com",
        port: "",
        pathname: "**",
      },
    ],
  },
};
