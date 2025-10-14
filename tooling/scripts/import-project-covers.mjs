#!/usr/bin/env node
/**
 * Import project cover images from a folder.
 *
 * - Reads all project MDX files in apps/web/content/projects
 * - Matches provided images (by filename) to project slug/title
 * - Converts and writes to apps/web/public/images/projects/<slug>/cover.jpg
 * - Optionally updates MDX frontmatter: thumbnail: /images/projects/<slug>/cover.jpg
 *
 * Usage examples:
 *   node tooling/scripts/import-project-covers.mjs --from ./my-images
 *   node tooling/scripts/import-project-covers.mjs --from ./my-images --overwrite --update-frontmatter
 *   node tooling/scripts/import-project-covers.mjs --from ./my-images --dry-run
 */

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
function getArg(name, fallback = undefined) {
  const i = args.indexOf(`--${name}`);
  if (i !== -1 && args[i + 1] && !args[i + 1].startsWith('--')) return args[i + 1];
  return fallback;
}
const hasFlag = (name) => args.includes(`--${name}`);

const root = process.cwd();
const contentDir = path.join(root, 'apps/web/content/projects');
const imagesDir = path.join(root, 'apps/web/public/images/projects');

const fromDir = getArg('from');
const overwrite = hasFlag('overwrite');
const updateFrontmatter = hasFlag('update-frontmatter');
const dryRun = hasFlag('dry-run');
const defaultImageArg = getArg('default');

if (!fromDir) {
  console.error('Missing --from <folder-with-images>');
  process.exit(1);
}
if (!fs.existsSync(fromDir) || !fs.statSync(fromDir).isDirectory()) {
  console.error(`Provided --from path is not a directory: ${fromDir}`);
  process.exit(1);
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function readProjects() {
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith('.mdx'));
  const projects = [];
  for (const file of files) {
    const slug = file.replace(/\.mdx$/, '');
    const fp = path.join(contentDir, file);
    const txt = fs.readFileSync(fp, 'utf8');
    const m = txt.match(/^(\uFEFF)?---\s*\n([\s\S]*?)\n---/);
    let title = slug;
    if (m) {
      const fm = m[2] ?? m[1];
      const t = fm.split(/\r?\n/).find((l) => l.trim().startsWith('title:'));
      if (t) title = t.replace('title:', '').trim().replace(/^['"]|['"]$/g, '') || slug;
    }
    projects.push({ slug, title, filePath: fp });
  }
  return projects;
}

function normalizeHyphen(s) {
  return String(s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
function normalizeAlpha(s) {
  return String(s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function bestMatch(baseName, projects) {
  const baseH = normalizeHyphen(baseName);
  const baseA = normalizeAlpha(baseName);
  let best = null;
  function score(candidate, type) { return { candidate, score: type }; }

  for (const p of projects) {
    const slugH = normalizeHyphen(p.slug);
    const slugA = normalizeAlpha(p.slug);
    const titleH = normalizeHyphen(p.title);
    const titleA = normalizeAlpha(p.title);

    if (baseA && baseA === slugA) best = pickBest(best, score(p, 100));
    else if (baseA && baseA === titleA) best = pickBest(best, score(p, 98));
    else if (baseH && baseH === slugH) best = pickBest(best, score(p, 96));
    else if (baseH && baseH === titleH) best = pickBest(best, score(p, 94));
    else if (slugH.includes(baseH) || baseH.includes(slugH)) best = pickBest(best, score(p, 85));
    else if (titleH.includes(baseH) || baseH.includes(titleH)) best = pickBest(best, score(p, 80));
  }
  return best?.candidate || null;
}

function pickBest(prev, next) {
  if (!prev) return next;
  if (next.score > prev.score) return next;
  if (next.score === prev.score && next.candidate.slug !== prev.candidate.slug) {
    // ambiguous; keep previous but mark as ambiguous with lower score
    return { candidate: prev.candidate, score: prev.score - 1 };
  }
  return prev;
}

async function importOne(imagePath, destSlug, projectFile) {
  const { default: sharp } = await import('sharp');
  const outDir = path.join(imagesDir, destSlug);
  const outPath = path.join(outDir, 'cover.jpg');
  ensureDir(outDir);

  if (!overwrite && fs.existsSync(outPath)) {
    console.log(`skip (exists): ${outPath}`);
    return { outPath, updatedFrontmatter: false };
  }

  if (dryRun) {
    console.log(`[dry-run] -> ${outPath}`);
  } else {
    await sharp(imagePath)
      .resize({ width: 1280, height: 720, fit: 'cover', position: 'attention' })
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(outPath);
    console.log(`write: ${outPath}`);
  }

  let updatedFrontmatter = false;
  if (updateFrontmatter) {
    const rel = `/images/projects/${destSlug}/cover.jpg`;
    const mdx = fs.readFileSync(projectFile, 'utf8');
    const m = mdx.match(/^(\uFEFF)?---\s*\n([\s\S]*?)\n---/);
    if (m) {
      const fm = m[2] ?? m[1];
      let newFm = null;
      if (/^\s*thumbnail:\s*/m.test(fm)) {
        newFm = fm.replace(/^\s*thumbnail:\s*.*$/m, `thumbnail: ${rel}`);
      } else {
        // insert after description/title if present, else append before closing
        if (/^\s*description:\s*.*$/m.test(fm)) {
          newFm = fm.replace(/^\s*description:\s*.*$/m, (line) => `${line}\nthumbnail: ${rel}`);
        } else if (/^\s*title:\s*.*$/m.test(fm)) {
          newFm = fm.replace(/^\s*title:\s*.*$/m, (line) => `${line}\nthumbnail: ${rel}`);
        } else {
          newFm = `${fm}\nthumbnail: ${rel}`;
        }
      }
      if (newFm && !dryRun) {
        const updated = mdx.replace(/^(\uFEFF)?---\s*\n([\s\S]*?)\n---/, (_full, bom) => `${bom || ''}---\n${newFm}\n---`);
        fs.writeFileSync(projectFile, updated, 'utf8');
        updatedFrontmatter = true;
        console.log(`frontmatter: ${projectFile}`);
      }
    }
  }

  return { outPath, updatedFrontmatter };
}

async function main() {
  const projects = readProjects();
  const processed = new Set();
  const entries = fs.readdirSync(fromDir, { withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => d.name)
    .filter((n) => /\.(jpe?g|png|webp|bmp|tiff|gif)$/i.test(n));

  if (!entries.length) {
    console.warn(`No images found in: ${fromDir}`);
    return;
  }

  for (const name of entries) {
    const imagePath = path.join(fromDir, name);
    const base = name.replace(/\.[^.]+$/, '');
    const match = bestMatch(base, projects);
    if (!match) {
      console.warn(`no-match: ${name}`);
      continue;
    }
    await importOne(imagePath, match.slug, match.filePath);
    processed.add(match.slug);
  }

  // Handle defaults for missing projects
  let defaultImage = defaultImageArg || path.join(root, 'apps/web/public/images/hero.jpg');
  if (!fs.existsSync(defaultImage)) {
    console.warn(`[warn] Default image not found at ${defaultImage}. Skipping default assignment.`);
    defaultImage = null;
  }

  if (defaultImage) {
    for (const p of projects) {
      if (processed.has(p.slug)) continue;
      const outPath = path.join(imagesDir, p.slug, 'cover.jpg');
      // Default image should only fill missing covers; never overwrite existing ones
      if (fs.existsSync(outPath)) continue;
      await importOne(defaultImage, p.slug, p.filePath);
      console.log(`write (default): ${outPath}`);
    }
  }

  console.log('Done importing covers.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
