import * as esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['./lib/handlers/**'],
  bundle: true,
  outdir: 'dist',
  outbase: './lib/',
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  minify: false,
});
