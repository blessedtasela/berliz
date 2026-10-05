// Run after BOTH builds in `npm run prerender`:
//   1. ng build --prerender=false --output-path=dist/csr-shell   -> a plain client-side index.html (empty <app-root>)
//   2. ng build                                                  -> prerenders the public routes; its index.html is the prerendered "/"
//
// Angular 17's application builder has no separate client-side shell: dist/berliz/browser/index.html IS the
// prerendered landing page. Netlify's catch-all (`/* -> ...`) must serve a generic shell for every route that is
// NOT prerendered (dashboard, login, dynamic /trainers/:id, ...), otherwise those URLs get the landing page's
// title / canonical / JSON-LD in their raw HTML. This copies the build-1 shell next to the prerendered output as
// index.csr.html, which netlify.toml points the catch-all at.
//
// The shell references hashed bundles (main-XXXX.js ...). Both builds compile the same browser code so the
// hashes normally match, but if they ever drift the shell would point at files that do not exist and every
// non-prerendered route would be a blank page -- so this fails the build instead of shipping that.
import { cpSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const shellDir = 'dist/csr-shell/browser';
const outDir = 'dist/berliz/browser';

const fail = (msg) => { console.error('finalize-prerender: ' + msg); process.exit(1); };

if (!existsSync(join(shellDir, 'index.html'))) fail(`${shellDir}/index.html missing -- did the no-prerender build run?`);
if (!existsSync(join(outDir, 'index.html'))) fail(`${outDir}/index.html missing -- did the prerender build run?`);

const shell = readFileSync(join(shellDir, 'index.html'), 'utf8');

if (/ng-server-context|<app-root[^>]*>\s*<[a-z]/i.test(shell)) fail('the shell already contains server-rendered content; expected an empty <app-root>');

const refs = [...shell.matchAll(/(?:src|href)="([^"#?]+\.(?:js|css|mjs|ico|png|webmanifest))"/g)].map((m) => m[1]);
const missing = refs.filter((r) => !r.startsWith('http') && !existsSync(join(outDir, r.replace(/^\//, ''))));
if (refs.length === 0) fail('found no asset references in the shell -- refusing to publish it');
if (missing.length) fail('the shell references files that are not in the prerendered output (hash drift between the two builds):\n  ' + missing.join('\n  '));

cpSync(join(shellDir, 'index.html'), join(outDir, 'index.csr.html'));
rmSync('dist/csr-shell', { recursive: true, force: true });
console.log(`finalize-prerender: wrote ${outDir}/index.csr.html (${refs.length} asset references verified)`);
