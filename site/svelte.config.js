import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';
import { mdsvex } from 'mdsvex';

let base_url = ""

if ("BASE_URL" in process.env) {
	base_url = process.env["BASE_URL"]
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.svelte.md'],
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [
		mdsvex({ extensions: ['.svelte.md'] }),
		preprocess()
	],
	kit: {
		paths: {
			base: base_url
		},
		adapter: adapter(),
		prerender: {
			default: true
		},
	},
};

export default config;
