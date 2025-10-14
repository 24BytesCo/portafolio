#!/usr/bin/env node
// Enrich all MDX projects with Spanish structured content

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dir = path.join(root, 'apps/web/content/projects');

const KNOWN_PATTERNS = new Set([
  'Clean Architecture', 'DDD', 'Microservicios', 'N‑capas', 'Hexagonal',
  'CQRS', 'Event Sourcing', 'Monorepo', 'Docker', 'Kubernetes', 'CI/CD', 'Testing'
]);

function extractFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { head: '', body: text, meta: {} };
  const head = m[1];
  const body = m[2] ?? '';
  const meta = {};
  for (const line of head.split(/\r?\n/)) {
    const kv = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (kv) {
      const key = kv[1];
      const val = kv[2];
      meta[key] = val.replace(/^['"]|['"]$/g, '');
    }
  }
  const tags = [];
  const tagRegex = /^\s*-\s*label:\s*(.+)$/;
  let inTags = false;
  for (const line of head.split(/\r?\n/)) {
    if (/^tags:\s*$/.test(line)) { inTags = true; continue; }
    if (inTags) {
      const mm = line.match(tagRegex);
      if (mm) tags.push(mm[1].trim());
      else if (/^\s*[a-z]/i.test(line)) { inTags = false; }
    }
  }
  meta.tagsArray = tags;
  return { head, body, meta };
}

function buildContent(meta) {
  const title = meta.title || '';
  const description = meta.description || '';
  const github = meta.github || '';
  const website = meta.website || '';
  const tags = meta.tagsArray || [];

  // Derive languages and patterns
  const patterns = tags.filter((t) => KNOWN_PATTERNS.has(t));
  const langs = tags.filter((t) => !KNOWN_PATTERNS.has(t));

  // Guess roles
  const hasAngular = /angular/i.test(tags.join(' '));
  const hasReact = /react|next\.js/i.test(tags.join(' '));
  const hasDotnet = /\.net|c#/i.test(tags.join(' '));
  const hasNode = /node/i.test(tags.join(' '));
  const hasMongo = /mongo/i.test(tags.join(' '));
  const hasSqlServer = /sql\s*server/i.test(tags.join(' '));
  const hasPostgres = /postgres/i.test(tags.join(' '));
  const hasDocker = /docker/i.test(tags.join(' '));
  const hasK8s = /kubernetes/i.test(tags.join(' '));

  const lines = [];
  lines.push('');
  lines.push('## Resumen');
  lines.push(description ? `- ${description}` : `- ${title}`);
  if (github) lines.push(`- Código fuente: ${github}`);
  if (website) lines.push(`- Sitio: ${website}`);

  lines.push('');
  lines.push('## Características');
  lines.push('- Catálogo/gestión de entidades principales del dominio.');
  lines.push('- Autenticación/autorización según el caso.');
  lines.push('- Búsqueda y filtrado eficientes.');
  lines.push('- Buenas prácticas de código y estructura.');

  lines.push('');
  lines.push('## Stack Técnico');
  if (langs.length) lines.push(`- Lenguajes/tecnologías: ${langs.join(', ')}`);
  if (patterns.length) lines.push(`- Patrones/arquitectura: ${patterns.join(', ')}`);
  if (hasDocker || hasK8s) lines.push(`- DevOps: ${[hasDocker?'Docker':null, hasK8s?'Kubernetes':null].filter(Boolean).join(', ')}`);

  lines.push('');
  lines.push('## Implementación');
  if (hasAngular || hasReact) {
    lines.push('### Frontend');
    const fw = hasAngular ? 'Angular' : 'React/Next.js';
    lines.push(`- UI en ${fw} con componentes reutilizables.`);
    lines.push('- Navegación fluida y rendimiento cuidado.');
  }
  if (hasDotnet || hasNode) {
    lines.push('### Backend');
    if (hasDotnet) lines.push('- APIs en .NET (C#), principios SOLID y capas.');
    if (hasNode) lines.push('- APIs en Node.js/Express con controladores y servicios.');
  }
  if (hasMongo || hasSqlServer || hasPostgres) {
    lines.push('### Base de datos');
    const used = [hasMongo?'MongoDB':null, hasSqlServer?'SQL Server':null, hasPostgres?'PostgreSQL':null].filter(Boolean).join(', ');
    lines.push(`- ${used}. Índices y consultas optimizadas según el caso.`);
  }
  lines.push('');
  lines.push('## Cómo funciona');
  lines.push('- Onboarding: registro/inicio de sesión (si aplica).');
  lines.push('- Gestión: creación/edición/listado con validaciones.');
  lines.push('- Integraciones: servicios externos cuando corresponde.');

  lines.push('');
  lines.push('## Retos');
  lines.push('- Escalabilidad y mantenibilidad del código.');
  lines.push('- Seguridad y manejo de datos.');
  lines.push('- Experiencia de usuario consistente.');

  lines.push('');
  lines.push('## Mejoras futuras');
  lines.push('- Métricas/observabilidad y pruebas más profundas.');
  lines.push('- Automatizaciones de despliegue y calidad.');
  lines.push('- Nuevas funcionalidades a partir del feedback.');

  lines.push('');
  return lines.join('\n');
}

function enrichFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const fm = extractFrontmatter(raw);
  const content = buildContent(fm.meta);
  const newText = `---\n${fm.head}\n---\n\n${content}`;
  // Write with BOM to avoid Windows console/VSCode mis-detection
  const withBom = `\uFEFF${newText}`;
  fs.writeFileSync(filePath, withBom, 'utf8');
}

function main() {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'));
  for (const f of files) enrichFile(path.join(dir, f));
  console.log(`Actualizados ${files.length} proyectos con contenido en español.`);
}

main();
