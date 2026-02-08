import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  // output: 'export', // Commented out to enable Middleware (Auth) on Vercel
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'fumadocs-ui', 'date-fns', 'framer-motion'],
  },
};

export default withMDX(config);
