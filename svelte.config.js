import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      external: [],
      precompress: true,
      polyfill: true
    })
  }
};

export default config;