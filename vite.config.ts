import { defineConfig } from 'vitest/config'

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment'
  },
  test: {
    transformMode: {
      web: [/\.[jt]sx$/],
    },
  },
})
