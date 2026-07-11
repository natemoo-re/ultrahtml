import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	oxc: {
		jsx: {
			runtime: 'automatic',
			importSource: 'ultrahtml',
			development: false,
		},
	},
	resolve: {
		alias: {
			'ultrahtml/jsx-runtime': fileURLToPath(
				new URL('./src/jsx-runtime/index.ts', import.meta.url),
			),
		},
	},
	test: {
		coverage: {
			provider: 'v8',
		},
	},
});
