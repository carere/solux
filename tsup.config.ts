import { solidPlugin } from 'esbuild-plugin-solid'
import { defineConfig } from 'tsup'

export default defineConfig({
  name: 'solux',
  platform: 'browser',
  entry: ['src/index.tsx'],
  treeshake: true,
  dts: true,
  clean: true,
  minify: true,
  sourcemap: true,
  format: ['esm', 'cjs'],
  esbuildPlugins: [solidPlugin()],
})
