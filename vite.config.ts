import { defineConfig } from 'vitest/config';

export default defineConfig({
	oxc: {
		jsx: {
			runtime: 'classic',
			pragma: 'h',
			pragmaFrag: 'Fragment',
			development: false,
		},
	},
	test: {
		coverage: {
			provider: 'v8',
		},
	},
});
