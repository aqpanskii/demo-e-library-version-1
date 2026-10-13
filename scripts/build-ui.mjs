import {build} from 'esbuild';
import {existsSync} from 'node:fs';
const output=existsSync('dist/index.html')?'dist/assets/ui-enhancements.js':'assets/ui-enhancements.js';
await build({entryPoints:['src/enhancements.jsx'],bundle:true,minify:true,format:'iife',target:['es2020'],outfile:output,jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},legalComments:'external'});
console.log('UI bundle ready:',output);
