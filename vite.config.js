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
  build: {
    commonjsOptions: {
      esmExternals: ['cupertino-pane']
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
        'process.env': '{ "READABLE_STREAM": "disable" }'
      }
    }
  }
};

export default config;
