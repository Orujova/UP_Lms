import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bravoadmin.uplms.org',
      },
      {
        protocol: 'http',
        hostname: '100.42.179.27',
        port: '7198',
        pathname: '/appuser/**', // Match the path for specific images
      },
    ],
  },
  webpack(config) {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
};
