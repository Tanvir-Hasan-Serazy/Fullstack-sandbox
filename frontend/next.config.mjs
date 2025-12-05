/** @type {import('next').NextConfig} */
import createNextIntlPlugin from "next-intl/plugin";
const nextConfig = {
  /* config options here */
  reactCompiler: true,
};
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
