// Generates a .webp sibling for every raster image under public/assets.
// Originals are kept (favicon + social/OG share images still reference them).
// Idempotent: skips files whose .webp is already newer than the source.
// Runs automatically before `vite build`; safe to run standalone.
//
// If sharp isn't installed (e.g. a minimal CI), this exits 0 without failing
// the build.
import { readdir, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.warn('[webp] sharp not installed — skipping WebP generation.');
  process.exit(0);
}

const ROOT = path.resolve(process.cwd(), 'public/assets');
const EXT = new Set(['.png', '.jpg', '.jpeg']);

async function walk(dir, acc = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(p, acc);
    else if (EXT.has(path.extname(entry.name).toLowerCase())) acc.push(p);
  }
  return acc;
}

async function isUpToDate(src, out) {
  if (!existsSync(out)) return false;
  const [s, o] = await Promise.all([stat(src), stat(out)]);
  return o.mtimeMs >= s.mtimeMs;
}

const files = await walk(ROOT);
let converted = 0;
let srcBytes = 0;
let outBytes = 0;

let failed = 0;
for (const src of files) {
  const out = src.replace(/\.(png|jpe?g)$/i, '.webp');
  if (await isUpToDate(src, out)) continue;
  try {
    // Cap huge source images to a sane web size (also sidesteps WebP's
    // 16383px dimension limit). Never upscales.
    const buf = await sharp(src)
      .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    await writeFile(out, buf);
    const s = await stat(src);
    srcBytes += s.size;
    outBytes += buf.length;
    converted += 1;
  } catch (err) {
    failed += 1;
    console.warn(`[webp] skipped ${path.relative(process.cwd(), src)}: ${err.message}`);
  }
}

if (converted === 0) {
  console.log(`[webp] up to date (${files.length} source images).`);
} else {
  const saved = srcBytes - outBytes;
  const pct = srcBytes > 0 ? Math.round((saved / srcBytes) * 100) : 0;
  console.log(`[webp] converted ${converted} image(s): ${(srcBytes / 1024).toFixed(0)} KB → ${(outBytes / 1024).toFixed(0)} KB (saved ${pct}%).`);
}
if (failed > 0) console.warn(`[webp] ${failed} image(s) could not be converted and will keep their original format.`);
