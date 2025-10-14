#!/usr/bin/env node
/**
 * Generate project cover images via AI
 *
 * - Reads MDX frontmatter from apps/web/content/projects
 * - Crafts a prompt per project (ES) using title/description/tags/slug
 * - Calls OpenAI Images (gpt-image-1) unless --dry-run is passed
 * - Writes cover.jpg to apps/web/public/images/projects/<slug>/cover.jpg
 *
 * Usage examples:
 *   node tooling/scripts/generate-project-covers.mjs --limit 5 --dry-run
 *   OPENAI_API_KEY=sk-... node tooling/scripts/generate-project-covers.mjs --limit 10
 *   OPENAI_API_KEY=sk-... node tooling/scripts/generate-project-covers.mjs --overwrite
 *
 * Flags:
 *   --limit <n>     Limit number of projects processed (default: all)
 *   --overwrite     Overwrite existing cover.jpg if present
 *   --dry-run       Do not call provider; print prompts only
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

const limit = Number(getArg('limit', '0')) || 0; // 0 => no limit
const overwrite = hasFlag('overwrite');
let dryRun = hasFlag('dry-run');
const useFallback = hasFlag('fallback');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
if (!OPENAI_API_KEY && !useFallback) {
  console.warn('[warn] OPENAI_API_KEY not set; running in --dry-run mode (or pass --fallback to synthesize simple covers)');
  dryRun = true;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function listProjectFiles() {
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith('.mdx'));
  return files.map((file) => ({ file, slug: file.replace(/\.mdx$/, '') }));
}

/** Parse minimal frontmatter from an MDX file (no external deps) */
function parseFrontmatter(mdx) {
  const fmMatch = mdx.match(/^---\s*\n([\s\S]*?)\n---/);
  const out = { title: '', description: '', tags: [], website: '', github: '', date: '' };
  if (!fmMatch) return out;
  const fm = fmMatch[1];
  const lines = fm.split(/\r?\n/);
  let inTags = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('tags:')) {
      inTags = true;
      continue;
    }
    if (inTags) {
      if (line.startsWith('- ')) {
        const m = line.match(/-\s*label:\s*(.+)$/);
        if (m) out.tags.push(m[1].trim());
        continue;
      } else if (/^[A-Za-z]/.test(line)) {
        inTags = false;
      }
    }
    if (line.startsWith('title:')) out.title = line.replace('title:', '').trim();
    else if (line.startsWith('description:')) out.description = line.replace('description:', '').trim();
    else if (line.startsWith('website:')) out.website = line.replace('website:', '').trim();
    else if (line.startsWith('github:')) out.github = line.replace('github:', '').trim();
    else if (line.startsWith('date:')) out.date = line.replace('date:', '').trim();
  }
  // strip optional quotes
  for (const k of ['title', 'description', 'website', 'github', 'date']) {
    if (out[k] && ((out[k].startsWith('"') && out[k].endsWith('"')) || (out[k].startsWith("'") && out[k].endsWith("'")))) {
      out[k] = out[k].slice(1, -1);
    }
  }
  return out;
}

function decideStyle(slug, tags) {
  const lower = (s) => (s || '').toLowerCase();
  const s = lower(slug);
  const t = (tags || []).map((x) => lower(x));
  const has = (...keys) => keys.some((k) => s.includes(k) || t.some((tt) => tt.includes(k)));
  if (has('front', 'client', 'cliente', 'ui', 'app', 'frontend')) return 'ui-screenshot';
  if (has('api', 'server', 'backend', 'micro', 'kubernetes', 'docker')) return 'diagram';
  return 'terminal';
}

// Normalize tags to canonical brand names and provide brand colors
function normalizeTags(tags = []) {
  const list = Array.isArray(tags) ? tags : [];
  const lower = (s) => String(s || '').toLowerCase();
  const out = [];
  const push = (name) => { if (!out.includes(name)) out.push(name); };

  for (const raw of list) {
    const t = lower(raw);
    if (/(^|\b)angular(\b|$)|\bngx\b/.test(t)) push('Angular');
    else if (/(^|\b)nest(js)?(\b|$)/.test(t)) push('NestJS');
    else if (/(^|\b)typescript|\bts\b/.test(t)) push('TypeScript');
    else if (/(^|\b)node(\.js)?|nodejs(\b|$)/.test(t)) push('Node.js');
    else if (/(^|\b)express(\b|$)/.test(t)) push('Express');
    else if (/(^|\b)react(\b|$)/.test(t)) push('React');
    else if (/(^|\b)next(js)?(\b|$)/.test(t)) push('Next.js');
    else if (/(^|\b)\.net|dotnet(\b|$)/.test(t)) push('.NET');
    else if (/(^|\b)c#|csharp(\b|$)/.test(t)) push('C#');
    else if (/(^|\b)sql\s*server|mssql(\b|$)/.test(t)) push('SQL Server');
    else if (/(^|\b)mongodb|mongo(\b|$)/.test(t)) push('MongoDB');
    else if (/(^|\b)postgres(ql)?(\b|$)/.test(t)) push('PostgreSQL');
    else if (/(^|\b)mysql(\b|$)/.test(t)) push('MySQL');
    else if (/(^|\b)azure\s*devops|ado(\b|$)/.test(t)) push('Azure DevOps');
    else if (/(^|\b)docker(\b|$)/.test(t)) push('Docker');
    else if (/(^|\b)kubernetes|k8s(\b|$)/.test(t)) push('Kubernetes');
    else if (/(^|\b)jwt(\b|$)/.test(t)) push('JWT');
    else if (/(^|\b)swagger(\b|$)/.test(t)) push('Swagger');
    else if (/(^|\b)azure(\b|$)/.test(t)) push('Azure');
    else push(raw);
  }
  return out;
}

function brandColor(name) {
  switch (name) {
    case 'Angular': return '#DD0031';
    case 'NestJS': return '#E0234E';
    case 'TypeScript': return '#3178C6';
    case 'Node.js': return '#3C873A';
    case 'Express': return '#444444';
    case 'React': return '#61DAFB';
    case 'Next.js': return '#111111';
    case '.NET': return '#512BD4';
    case 'C#': return '#2E7D32';
    case 'SQL Server': return '#CC2927';
    case 'MongoDB': return '#47A248';
    case 'PostgreSQL': return '#336791';
    case 'MySQL': return '#4479A1';
    case 'Azure DevOps': return '#0078D7';
    case 'Docker': return '#2496ED';
    case 'Kubernetes': return '#326CE5';
    case 'JWT': return '#000000';
    case 'Swagger': return '#85EA2D';
    case 'Azure': return '#0078D4';
    default: return 'rgba(255,255,255,0.12)';
  }
}

function styleToText(style) {
  if (style === 'ui-screenshot') {
    return 'mockup realista de interfaz de aplicación web, tarjetas y paneles, estética limpia y moderna, luz suave';
  }
  if (style === 'diagram') {
    return 'diagrama isométrico de arquitectura de software (servicios, API, base de datos, colas), líneas claras, iconos de componentes';
  }
  return 'escena abstracta de terminal/código, monitores con líneas de código difuminadas, estilo desarrollador moderno';
}

function buildPrompt({ title, description, tags, slug }) {
  const style = decideStyle(slug, tags);
  const styleText = styleToText(style);
  const tagsText = (tags && tags.length) ? `Tecnologías/palabras clave: ${tags.join(', ')}. ` : '';
  const logosHint = (tags && tags.length)
    ? `Incluye los logotipos o iconos representativos de estas tecnologías (por ejemplo, ${tags.slice(0,3).join(', ')}), dispuestos como insignias pequeñas y limpias.`
    : '';
  const base = `Genera una imagen 16:9 que represente el proyecto "${title}". Contexto: ${description}. ${tagsText}Estilo: ${styleText}. ${logosHint} Paleta sobria, fondo sutil, enfoque profesional.`;
  return { prompt: base, style };
}

async function generateOpenAI(prompt) {
  const resp = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      size: '1024x1024',
      response_format: 'b64_json',
    }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OpenAI error ${resp.status}: ${text}`);
  }
  const data = await resp.json();
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) throw new Error('No image data received');
  return Buffer.from(b64, 'base64');
}

async function main() {
  ensureDir(imagesDir);
  const list = listProjectFiles();
  const selected = limit > 0 ? list.slice(0, limit) : list;

  const prompts = [];
  for (const { file, slug } of selected) {
    const mdxPath = path.join(contentDir, file);
    const mdx = fs.readFileSync(mdxPath, 'utf8');
    const fm = parseFrontmatter(mdx);
    const { prompt, style } = buildPrompt({ ...fm, slug });
    prompts.push({ slug, title: fm.title, style, prompt });

    const outDir = path.join(imagesDir, slug);
    const outPath = path.join(outDir, 'cover.jpg');
    const exists = fs.existsSync(outPath);

    if (exists && !overwrite) {
      console.log(`skip (exists): ${outPath}`);
      continue;
    }

    if (dryRun && !useFallback) {
      console.log(`[dry-run] ${slug}: ${prompt}`);
      continue;
    }

    try {
      ensureDir(outDir);
      if (useFallback && !OPENAI_API_KEY) {
        const buf = await synthesizeCover({ title: fm.title, slug, style, tags: fm.tags });
        fs.writeFileSync(outPath, buf);
        console.log(`write (fallback): ${outPath}`);
      } else {
        const buf = await generateOpenAI(prompt);
        fs.writeFileSync(outPath, buf);
        console.log(`write: ${outPath}`);
      }
    } catch (e) {
      console.error(`fail: ${slug} -> ${(e && e.message) || e}`);
    }
  }

  // also save prompts snapshot for manual use
  const promptsPath = path.join(imagesDir, 'prompts.json');
  fs.writeFileSync(promptsPath, JSON.stringify(prompts, null, 2), 'utf8');
  console.log(`prompts: ${promptsPath}`);
}

// --- Fallback generator (no AI): simple 16:9 cover with gradient + icon ---
async function synthesizeCover({ title, slug, style, tags = [] }) {
  const { default: sharp } = await import('sharp');
  const width = 1280, height = 720;
  const safeTitle = (title || slug || 'Proyecto').replace(/&/g, '&amp;').replace(/</g, '&lt;').slice(0, 64);
  const styleIcon = (() => {
    if (style === 'ui-screenshot') {
      return `<g opacity="0.85">
        <rect x="0" y="0" width="110" height="74" rx="8" fill="rgba(0,0,0,0.30)"/>
        <rect x="8" y="10" width="94" height="12" rx="3" fill="white" opacity="0.9"/>
        <rect x="8" y="28" width="82" height="8" rx="2" fill="white" opacity="0.9"/>
        <rect x="8" y="42" width="56" height="8" rx="2" fill="white" opacity="0.9"/>
      </g>`;
    }
    if (style === 'diagram') {
      return `<g opacity="0.9">
        <rect x="0" y="0" width="34" height="22" rx="4" fill="white"/>
        <rect x="40" y="0" width="34" height="22" rx="4" fill="white"/>
        <rect x="20" y="32" width="34" height="22" rx="4" fill="white"/>
        <line x1="17" y1="22" x2="30" y2="32" stroke="white" stroke-width="2"/>
        <line x1="57" y1="22" x2="44" y2="32" stroke="white" stroke-width="2"/>
      </g>`;
    }
    // terminal
    return `<g opacity="0.85">
      <rect x="0" y="0" width="110" height="74" rx="8" fill="rgba(0,0,0,0.35)"/>
      <rect x="10" y="16" width="70" height="6" rx="2" fill="white"/>
      <rect x="10" y="30" width="54" height="6" rx="2" fill="white"/>
      <rect x="10" y="44" width="40" height="6" rx="2" fill="white"/>
    </g>`;
  })();

  // Build tech badges (simple chips using tag labels)
  const chipY = height - 190;
  const chipXStart = 60;
  let chips = '';
  const maxChips = 5;
  const shown = normalizeTags(tags || []).slice(0, maxChips);
  let cx = chipXStart;
  for (const tag of shown) {
    const t = String(tag).slice(0, 18).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const w = 18 + (t.length * 10);
    const col = brandColor(tag);
    const stroke = 'rgba(255,255,255,0.28)';
    chips += `<g transform="translate(${cx}, ${chipY})">
      <rect x="0" y="0" rx="12" ry="12" width="${w}" height="34" fill="${col}" stroke="${stroke}" />
      <text x="12" y="22" font-size="16" fill="#ffffff" font-weight="700">${t}</text>
    </g>`;
    cx += w + 12;
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#111827"/>
        <stop offset="50%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#0b1020"/>
      </linearGradient>
      <pattern id="p" patternUnits="userSpaceOnUse" width="12" height="12">
        <rect width="12" height="12" fill="rgba(255,255,255,0.02)"/>
        <path d="M0 12 L12 0" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect width="100%" height="100%" fill="url(#p)"/>

    <g transform="translate(${Math.floor(width*0.80)}, ${Math.floor(height*0.22)})">${styleIcon}</g>

    <g font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji'" fill="#ffffff" opacity="0.98">
      <text x="60" y="${height-120}" font-size="48" font-weight="700">${safeTitle}</text>
    </g>
    ${chips}
  </svg>`;

  const buf = await sharp(Buffer.from(svg))
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();
  return buf;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
