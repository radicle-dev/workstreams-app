import { sveltekit } from '@sveltejs/kit/vite';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import path from 'path';

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit()],
  resolve: {
    alias: {
      $components: path.resolve('./src/lib/components')
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
        'process.env': '{ "READABLE_STREAM": "disable", "NODE_DEBUG": "" }'
      },
      plugins: [NodeModulesPolyfillPlugin()]
    }
  }
};

export default config;
