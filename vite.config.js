import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import fs from 'fs';

export default defineConfig(({ mode }) => {

  const env = loadEnv(mode, process.cwd());
  
  const useHttps = env.VITE_USE_HTTPS === 'true';

  return {
    plugins: [
      react(),
      nodePolyfills({
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
      }),
    ],
    resolve: {
      alias: {
        stream: 'stream-browserify',
      },
    },
    server: {
      ...(useHttps ? {
        https: {
          key: fs.readFileSync('./cert/key.pem'),
          cert: fs.readFileSync('./cert/cert.pem'),
        }
      } : {})
    },
  };
});