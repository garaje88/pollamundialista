// Removes the 'assets' binding from the adapter-generated wrangler.json.
// Cloudflare Pages reserves the ASSETS binding name and provides it automatically;
// redefining it in the config causes a deployment error.
import { readFileSync, writeFileSync, existsSync } from 'fs';

const path = 'dist/server/wrangler.json';
if (!existsSync(path)) process.exit(0);

const config = JSON.parse(readFileSync(path, 'utf8'));
if (config.assets) {
  delete config.assets;
  writeFileSync(path, JSON.stringify(config, null, 2));
  console.log('Patched dist/server/wrangler.json: removed reserved ASSETS binding');
}
