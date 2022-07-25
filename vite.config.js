import { sveltekit } from '@sveltejs/kit/vite';
import path from 'path';

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit()],
  resolve: {
    alias: {
      $components: path.resolve('./src/lib/components'),
      util: 'util',
      stream: 'stream-browserify'
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
        'process.env':
          '{ "READABLE_STREAM": "disable", "NODE_DEBUG": "disable" }'
      }
    }
  }
};

export default config;
