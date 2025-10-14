#!/usr/bin/env node
// Generate MDX project files from a GitHub account
// Usage: node tooling/scripts/generate-projects.mjs --user <username> [--token <gh_pat>] [--limit <n>] [--overwrite]

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
function getArg(name, fallback = undefined) {
  const i = args.indexOf(`--${name}`);
  if (i !== -1 && args[i + 1] && !args[i + 1].startsWith('--')) return args[i + 1];
  return fallback;
}
const hasFlag = (name) => args.includes(`--${name}`);

const username = getArg('user', process.env.GITHUB_USERNAME);
const org = getArg('org', process.env.GITHUB_ORG);
const token = getArg('token', process.env.GITHUB_TOKEN);
const limit = Number(getArg('limit', '100'));
const overwrite = hasFlag('overwrite');

if (!username && !org) {
  console.error('Missing --user <github-username> or --org <github-org>');
  process.exit(1);
}

const headers = {
  'Accept': 'application/vnd.github+json',
};
if (token) headers['Authorization'] = `Bearer ${token}`;

const root = process.cwd();
const contentDir = path.join(root, 'apps/web/content/projects');
const imagesDir = path.join(root, 'apps/web/public/images/projects');
const placeholder = path.join(root, 'apps/web/public/images/hero.jpg');

/** Create directory recursively */
function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function toTitle(name) {
  return name.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').replace(/^.|\s./g, (m) => m.toUpperCase());
}

function mdxFrontmatter(data) {
  const tagsLines = (data.tags || []).map((t) => `  - label: ${t}`).join('\n');
  const tagsBlock = (data.tags && data.tags.length)
    ? `tags:\n${tagsLines}\n`
    : '';
  return (
    `---\n` +
    `title: ${data.title}\n` +
    `description: ${data.description}\n` +
    `date: ${data.date}\n` +
    (data.website ? `website: ${data.website}\n` : '') +
    `github: ${data.github}\n` +
    tagsBlock +
    `---\n\n` +
    `${data.body}\n`
  );
}

async function fetchJson(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

async function main() {
  ensureDir(contentDir);
  ensureDir(imagesDir);

  const owner = org || username;
  const listUrl = org
    ? `https://api.github.com/orgs/${owner}/repos?per_page=100&type=all&sort=updated`
    : `https://api.github.com/users/${owner}/repos?per_page=100&type=owner&sort=updated`;
  const repos = await fetchJson(listUrl);
  const selected = repos
    .filter((r) => !r.fork)
    .slice(0, limit);

  for (const repo of selected) {
    const name = repo.name;
    const slug = name.toLowerCase();
    const title = toTitle(name);
    const description = repo.description || `Proyecto ${title}`;
    const date = (repo.pushed_at || repo.created_at || new Date().toISOString()).slice(0, 10);
    const website = repo.homepage || '';
    const github = repo.html_url;

    // languages
    let languages = [];
    try {
      const langs = await fetchJson(`https://api.github.com/repos/${owner}/${name}/languages`);
      languages = Object.keys(langs || {});
    } catch {}

    // topics
    let topics = [];
    try {
      const t = await fetchJson(`https://api.github.com/repos/${owner}/${name}/topics`);
      topics = Array.isArray(t.names) ? t.names : [];
    } catch {}

    // README patterns
    let detected = [];
    try {
      const readme = await fetchJson(`https://api.github.com/repos/${owner}/${name}/readme`);
      if (readme && readme.content) {
        const buff = Buffer.from(readme.content, 'base64');
        const txt = buff.toString('utf8').toLowerCase();
        const patterns = [
          ['Clean Architecture', /clean\s+architecture|arquitectura\s+limpia/],
          ['DDD', /\bddd\b|domain-?driven|orientada\s+al\s+dominio/],
          ['Hexagonal', /hexagonal\s+architecture|arquitectura\s+hexagonal/],
          ['Microservicios', /microservices|microservicios/],
          ['N‑capas', /n[-\s]?layer|n[-\s]?capas/],
          ['CQRS', /\bcqrs\b/],
          ['Event Sourcing', /event\s+sourcing/],
          ['Monorepo', /monorepo/],
          ['Docker', /docker/],
          ['Kubernetes', /kubernetes/],
          ['CI/CD', /ci\/?cd|github\s+actions|azure\s+devops/],
          ['Testing', /jest|vitest|testing\s+library|pruebas?\s+unitarias?/],
        ];
        for (const [label, rx] of patterns) if (rx.test(txt)) detected.push(label);
      }
    } catch {}

    const tags = [...new Set([...languages, ...topics, ...detected])];
    const body = `Este proyecto forma parte de mi trabajo en GitHub. \n\n` +
      `- Código fuente: ${github}\n` +
      (website ? `- Sitio: ${website}\n` : '') +
      (languages.length ? `- Lenguajes: ${languages.join(', ')}\n` : '') +
      (detected.length ? `- Patrones: ${detected.join(', ')}\n` : '');

    const mdx = mdxFrontmatter({ title, description, date, website, github, tags, body });

    // write MDX
    const filePath = path.join(contentDir, `${slug}.mdx`);
    if (fs.existsSync(filePath) && !overwrite) {
      console.log(`skip (exists): ${filePath}`);
    } else {
      // Write with BOM for Windows tooling compatibility
      fs.writeFileSync(filePath, `\uFEFF${mdx}`, 'utf8');
      console.log(`write: ${filePath}`);
    }

    // ensure placeholder cover image
    const coverDir = path.join(imagesDir, slug);
    const coverPath = path.join(coverDir, 'cover.jpg');
    if (!fs.existsSync(coverPath)) {
      ensureDir(coverDir);
      try {
        fs.copyFileSync(placeholder, coverPath);
        console.log(`cover: ${coverPath}`);
      } catch {
        // ignore if placeholder not found
      }
    }
  }

  console.log(`Done. Proyectos generados en ${contentDir}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
