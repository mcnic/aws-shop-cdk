import * as esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['./src/handlers/**'],
  bundle: true,
  outdir: 'dist',
  outbase: './src/',
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  minify: true,
});
