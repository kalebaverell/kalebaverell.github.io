// Self-host the site's fonts and icons.
// 1. Google Fonts: fetch the css2 stylesheet with a modern UA (returns woff2),
//    keep only latin + latin-ext subsets, download each file, rewrite URLs.
// 2. Tabler icons: fetch the minified CSS, download the woff2, rebuild the
//    @font-face block to point at the local file.
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "fonts");
mkdirSync(join(ROOT, "g"), { recursive: true });
mkdirSync(join(ROOT, "tabler"), { recursive: true });

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36";

const CSS2 = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=IBM+Plex+Mono:wght@400;500;600&display=swap";

const gcss = await (await fetch(CSS2, { headers: { "User-Agent": UA } })).text();

// css2 output: comment lines name the subset, then a @font-face block.
const blocks = gcss.split(/\/\*\s*([a-z-]+)\s*\*\//).slice(1); // [subset, css, subset, css, ...]
let out = "/* Self-hosted Google Fonts (latin + latin-ext). Generated; do not hand-edit. */\n";
let n = 0, downloaded = 0;
for (let i = 0; i < blocks.length; i += 2) {
  const subset = blocks[i].trim();
  if (subset !== "latin" && subset !== "latin-ext") continue;
  let css = blocks[i + 1];
  const fam = (css.match(/font-family:\s*'([^']+)'/) || [])[1] || "f";
  const wght = (css.match(/font-weight:\s*([\d ]+)/) || [])[1]?.replace(/\s+/g, "-") || "w";
  const style = /font-style:\s*italic/.test(css) ? "i" : "n";
  const url = (css.match(/url\((https:[^)]+)\)/) || [])[1];
  if (!url) continue;
  const fname = `${fam.toLowerCase().replace(/\s+/g, "")}-${wght}${style}-${subset}-${n++}.woff2`;
  const buf = Buffer.from(await (await fetch(url, { headers: { "User-Agent": UA } })).arrayBuffer());
  if (buf.length < 1000) throw new Error(`suspiciously small font: ${url} -> ${buf.length}B`);
  writeFileSync(join(ROOT, "g", fname), buf);
  downloaded++;
  css = css.replace(url, `/fonts/g/${fname}`);
  out += `/* ${subset} */\n${css.trim()}\n`;
}
writeFileSync(join(ROOT, "fonts.css"), out);
console.log(`google: ${downloaded} files, fonts.css ${out.length}B`);

// ---- Tabler icons ----
const TB = "https://cdnjs.cloudflare.com/ajax/libs/tabler-icons/3.34.0";
let tcss = await (await fetch(`${TB}/tabler-icons.min.css`)).text();
const woff2 = Buffer.from(await (await fetch(`${TB}/fonts/tabler-icons.woff2`)).arrayBuffer());
if (woff2.length < 100000) throw new Error(`tabler woff2 too small: ${woff2.length}B`);
writeFileSync(join(ROOT, "tabler", "tabler-icons.woff2"), woff2);

// Replace the original @font-face (multi-format, CDN-relative paths) with a
// clean local woff2-only block.
const face = `@font-face{font-family:"tabler-icons";font-style:normal;font-weight:400;font-display:block;src:url(/fonts/tabler/tabler-icons.woff2) format("woff2")}`;
const replaced = tcss.replace(/@font-face\{[^}]*\}/, face);
if (replaced === tcss) throw new Error("tabler @font-face not found/replaced");
writeFileSync(join(ROOT, "tabler-icons.css"), replaced);
console.log(`tabler: woff2 ${woff2.length}B, css ${replaced.length}B, face swapped`);
