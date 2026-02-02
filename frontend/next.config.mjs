/** @type {import('next').NextConfig} */
import createNextIntlPlugin from "next-intl/plugin";
const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
    dangerouslyAllowSVG: true,
  },
};
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
