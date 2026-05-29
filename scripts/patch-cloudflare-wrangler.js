// Normalizes the assets.directory path in the adapter-generated wrangler.json
// to ensure it's relative to the server directory (dist/server -> dist/client).
// Do NOT delete assets.binding — it's required for env.ASSETS.fetch() in the Worker.
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname, relative } from 'path';

const path = 'dist/server/wrangler.json';
if (!existsSync(path)) process.exit(0);

const config = JSON.parse(readFileSync(path, 'utf8'));
if (config.assets?.directory) {
  // Resolve to absolute, then make relative from dist/server/ to dist/client/
  const serverDir = resolve('dist/server');
  const clientDir = resolve('dist/client');
  const rel = relative(serverDir, clientDir);
  if (config.assets.directory !== rel) {
    config.assets.directory = rel;
    writeFileSync(path, JSON.stringify(config, null, 2));
    console.log(`Patched dist/server/wrangler.json: assets.directory set to "${rel}"`);
  } else {
    console.log('dist/server/wrangler.json: assets.directory already correct, no patch needed');
  }
}
