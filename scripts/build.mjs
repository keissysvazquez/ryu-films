import { cp, rm, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
await access(new URL('dist/index.html', root));
await rm(new URL('build/', root), { recursive: true, force: true });
await cp(fileURLToPath(new URL('dist/', root)), fileURLToPath(new URL('build/', root)), { recursive: true });
console.log('Production files ready in build/. Upload its contents to your static host.');
