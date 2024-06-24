import * as esbuild from 'esbuild';

const options = {
  format: 'esm',
  bundle: true,
  platform: 'node',
  packages: 'external',
  sourcemap: false,
  minify: false,
};

// getProductsList lambda
await esbuild.build({
  entryPoints: ['lambda/getProductsList.ts'],
  outfile: 'dist/lambda/getProductsList/getProductsList.mjs',
  ...options,
});

// getProductsById lambda
await esbuild.build({
  entryPoints: ['lambda/getProductsById.ts'],
  outfile: 'dist/lambda/getProductsById/getProductsById.mjs',
  ...options,
});
