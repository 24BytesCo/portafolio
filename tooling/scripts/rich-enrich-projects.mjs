#!/usr/bin/env node
// Generate per‑project Spanish descriptions by inspecting each GitHub repo

import fs from 'node:fs';
import path from 'node:path';

const GH_TOKEN = process.env.GITHUB_TOKEN;
const headers = {
  'Accept': 'application/vnd.github+json',
};
if (GH_TOKEN) headers['Authorization'] = `Bearer ${GH_TOKEN}`;

const root = process.cwd();
const dir = path.join(root, 'apps/web/content/projects');

function readText(p){ return fs.readFileSync(p, 'utf8'); }

function parseFrontmatter(txt){
  const m = txt.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if(!m) return {meta:{}, body: txt, raw: txt};
  const head = m[1];
  const body = m[2] ?? '';
  const meta = {};
  for(const line of head.split(/\r?\n/)){
    const kv = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if(kv){ meta[kv[1]] = kv[2].replace(/^['"]|['"]$/g,''); }
  }
  return {meta, body, head};
}

async function j(url){
  const res = await fetch(url, {headers});
  if(!res.ok) throw new Error(`${res.status} ${res.statusText} ${url}`);
  return res.json();
}

function guess(ownerRepo){
  const [owner, repo] = ownerRepo.split('/');
  return {owner, repo};
}

function yes(rx, text){ return rx.test(text); }

function bulletList(arr){ return arr.map((s)=>`- ${s}`).join('\n'); }

function uniq(arr){ return [...new Set(arr.filter(Boolean))]; }

function md(head, sections){
  const parts = ['---', head, '---', ''];
  for(const [title, lines] of sections){
    if(!lines || !lines.length) continue;
    parts.push(`## ${title}`);
    parts.push(bulletList(lines));
    parts.push('');
  }
  return parts.join('\n');
}

async function enrichOne(file){
  const txt = readText(file);
  const {meta, head} = parseFrontmatter(txt);
  if(!meta.github) return; // skip
  const {owner, repo} = guess(meta.github.replace('https://github.com/',''));

  // fetch repo metadata
  let repoJson, langs = {}, topics = [], tree = { tree: [] }, readmeText = '';
  try { repoJson = await j(`https://api.github.com/repos/${owner}/${repo}`); } catch {}
  try { langs = await j(`https://api.github.com/repos/${owner}/${repo}/languages`);} catch {}
  try { const t = await j(`https://api.github.com/repos/${owner}/${repo}/topics`); topics = t.names||[]; } catch {}
  try { const r = await j(`https://api.github.com/repos/${owner}/${repo}/readme`); readmeText = Buffer.from(r.content||'', 'base64').toString('utf8'); } catch {}
  try {
    const branch = (repoJson && repoJson.default_branch) || 'main';
    tree = await j(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`);
  } catch {}

  const allPaths = (tree.tree||[]).map(x=>x.path.toLowerCase());
  const deps = (readmeText + ' ' + allPaths.join(' ')).toLowerCase();

  // signals
  const isDotnet = yes(/\.csproj|program\.cs|aspnet|entity framework|ef core/, deps);
  const isAngular = yes(/angular\.json|@angular\//, deps);
  const isReact = yes(/react|next\.config|next\./, deps);
  const isNode = yes(/package\.json|express|nestjs/, deps);
  const hasMongo = yes(/mongoose|mongodb/, deps);
  const hasSqlServer = yes(/sqlserver|sql server|mssql|entityframework/, deps);
  const hasPostgres = yes(/postgres|npgsql|pg\b/, deps);
  const hasRabbit = yes(/rabbitmq|masstransit/, deps);
  const hasKafka = yes(/kafka/, deps);
  const hasDocker = yes(/dockerfile|docker-compose|containers?/, deps);
  const hasK8s = yes(/k8s|kubernetes|deployment\.ya?ml/, deps);
  const usesClean = yes(/clean\s+architecture|arquitectura\s+limpia/, readmeText.toLowerCase());
  const usesDDD = yes(/\bddd\b|domain[- ]driven|orientada\s+al\s+dominio/, readmeText.toLowerCase());
  const usesEDA = yes(/event[- ]driven|arquitectura\s+orientada\s+a\s+eventos/, readmeText.toLowerCase());
  const usesCQRS = yes(/\bcqrs\b/, readmeText.toLowerCase());
  const hasCI = yes(/github actions|azure devops|ci\/cd|workflow/, deps);

  const languages = Object.keys(langs);
  const patterns = uniq([
    usesClean && 'Clean Architecture',
    usesDDD && 'DDD',
    usesEDA && 'Arquitectura Orientada a Eventos',
    usesCQRS && 'CQRS',
    hasRabbit && 'RabbitMQ',
    hasKafka && 'Kafka',
    hasDocker && 'Docker',
    hasK8s && 'Kubernetes',
    hasCI && 'CI/CD',
  ]);

  // Sections content
  const resumen = uniq([
    meta.description || `Proyecto ${meta.title}`,
    meta.github && `Código fuente: ${meta.github}`,
    meta.website && `Sitio: ${meta.website}`,
  ]);

  const caracts = [
    'Módulos y endpoints bien definidos.',
    hasRabbit && 'Comunicación asíncrona con RabbitMQ.',
    hasKafka && 'Procesamiento de eventos con Kafka.',
    (hasMongo||hasSqlServer||hasPostgres) && 'Persistencia y consultas optimizadas.',
    hasCI && 'Automatización: pipelines de CI/CD.',
  ].filter(Boolean);

  const stack = [
    languages.length && `Lenguajes/tecnologías: ${languages.join(', ')}`,
    (isDotnet||isNode||isAngular||isReact) && `Frameworks: ${uniq([
      isDotnet && '.NET', isNode && 'Node.js', isAngular && 'Angular', isReact && 'React/Next.js'
    ]).join(', ')}`,
    patterns.length && `Arquitectura/DevOps: ${patterns.join(', ')}`,
    (hasMongo||hasSqlServer||hasPostgres) && `Base de datos: ${uniq([
      hasMongo&&'MongoDB', hasSqlServer&&'SQL Server', hasPostgres&&'PostgreSQL'
    ]).join(', ')}`,
  ].filter(Boolean);

  const impl = [];
  if (isAngular || isReact) {
    impl.push('Frontend');
    impl.push(`- UI con ${isAngular ? 'Angular' : 'React/Next.js'} y componentes reutilizables.`);
    impl.push('- Navegación y estados predecibles.');
  }
  if (isDotnet || isNode) {
    impl.push('Backend');
    if (isDotnet) impl.push('- APIs REST en .NET (C#), principios SOLID, capas y configuraciones limpias.');
    if (isNode) impl.push('- Servicios en Node.js/Express con controladores y servicios modulares.');
    if (usesCQRS) impl.push('- Separación de lecturas y escrituras (CQRS).');
    if (usesEDA) impl.push('- Publicación/suscripción de eventos de dominio.');
  }
  if (hasMongo || hasSqlServer || hasPostgres) {
    impl.push('Base de datos');
    impl.push(`- ${uniq([hasMongo&&'MongoDB', hasSqlServer&&'SQL Server', hasPostgres&&'PostgreSQL']).join(', ')} con índices y consultas optimizadas.`);
  }
  if (hasDocker || hasK8s) {
    impl.push('Despliegue');
    impl.push(`- Contenerización con ${hasDocker?'Docker':''}${hasDocker&&hasK8s?', ':''}${hasK8s?'orquestación con Kubernetes':''}.`);
  }

  // Convert impl flat list into sections (### headings)
  const implLines = [];
  let current = null;
  for (const line of impl){
    if (/^(Frontend|Backend|Base de datos|Despliegue)$/.test(line)) {
      current = line; implLines.push(`### ${line}`); continue;
    }
    implLines.push(line);
  }

  const sections = [
    ['Resumen', resumen],
    ['Características', caracts],
    ['Stack Técnico', stack],
    ['Implementación', implLines],
    ['Cómo funciona', [
      'Onboarding (si aplica) y flujos principales.',
      'CRUD/operaciones del dominio con validaciones.',
      (hasRabbit||hasKafka) && 'Procesamiento de eventos y mensajería.',
    ].filter(Boolean)],
    ['Retos', [
      'Mantenibilidad y escalabilidad del código.',
      'Seguridad, datos y rendimiento.',
    ]],
    ['Mejoras futuras', [
      'Pruebas más profundas y observabilidad.',
      'Automatización de despliegues y calidad.',
    ]],
  ];

  const newDoc = md(head, sections);
  fs.writeFileSync(file, `\uFEFF${newDoc}`, 'utf8');
}

async function main(){
  const files = fs.readdirSync(dir).filter(f=>f.endsWith('.mdx'));
  for(const f of files){
    try { await enrichOne(path.join(dir, f)); }
    catch(e){ console.error('skip', f, e.message); }
  }
  console.log('Proyectos enriquecidos con contenido específico por repo.');
}

main();

