#!/usr/bin/env node
// Lista proyectos (GitHub Projects v2) y, opcionalmente, exporta items a JSON/CSV.
// Uso:
//   node tooling/scripts/list-github-projects.mjs list --user <login> [--token <gh_pat>] [--limit 20] [--json]
//   node tooling/scripts/list-github-projects.mjs list --org  <login> [--token <gh_pat>] [--limit 20] [--json]
//   node tooling/scripts/list-github-projects.mjs items --user <login> --project <number> [--limit 100] [--json|--csv]

const args = process.argv.slice(2);
function getArg(name, fallback = undefined) {
  const i = args.indexOf(`--${name}`);
  if (i !== -1 && args[i + 1] && !args[i + 1].startsWith('--')) return args[i + 1];
  return fallback;
}
const hasFlag = (name) => args.includes(`--${name}`);

const mode = args[0] || 'list';
const user = getArg('user', process.env.GITHUB_USERNAME);
const org = getArg('org', process.env.GITHUB_ORG);
const login = org || user;
const ownerType = org ? 'org' : 'user';
const token = getArg('token', process.env.GITHUB_TOKEN);
const limit = Number(getArg('limit', '20'));
const projNumber = Number(getArg('project', args[1] || '0'));
const outJson = hasFlag('json');
const outCsv = hasFlag('csv');

if (!login) {
  console.error('Falta --user <login> o --org <login>');
  process.exit(1);
}

const API = 'https://api.github.com/graphql';
async function gql(query, variables = {}) {
  const res = await fetch(API, {
    method: 'POST',
    headers: {
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) {
    console.error(JSON.stringify(json.errors || { status: res.status }, null, 2));
    throw new Error('GitHub GraphQL error');
  }
  return json.data;
}

async function listProjects(ownerType, login, first = 20) {
  const queryUser = `
    query($login:String!, $first:Int!) {
      user(login:$login) {
        projectsV2(first:$first, orderBy:{field:UPDATED_AT, direction:DESC}) {
          nodes { id number title url closed updatedAt }
        }
      }
    }
  `;
  const queryOrg = `
    query($login:String!, $first:Int!) {
      organization(login:$login) {
        projectsV2(first:$first, orderBy:{field:UPDATED_AT, direction:DESC}) {
          nodes { id number title url closed updatedAt }
        }
      }
    }
  `;
  const data = await gql(ownerType === 'org' ? queryOrg : queryUser, { login, first });
  const root = ownerType === 'org' ? data.organization : data.user;
  return root?.projectsV2?.nodes || [];
}

function normalizeFieldValue(node) {
  const type = node.__typename;
  const fname = node.field?.name || '';
  if (type === 'ProjectV2ItemFieldTextValue') return { [fname]: node.text };
  if (type === 'ProjectV2ItemFieldNumberValue') return { [fname]: node.number };
  if (type === 'ProjectV2ItemFieldDateValue') return { [fname]: node.date };
  if (type === 'ProjectV2ItemFieldSingleSelectValue') return { [fname]: node.option?.name ?? null };
  if (type === 'ProjectV2ItemFieldIterationValue') return { [fname]: node.title ?? null };
  return { [fname || type]: null };
}

async function listItems(ownerType, login, number, first = 50) {
  const queryUser = `
    query($login:String!, $number:Int!, $first:Int!) {
      user(login:$login) {
        projectV2(number:$number) {
          id number title url
          fields(first:50) { nodes { __typename id name dataType } }
          items(first:$first) { nodes { id content { __typename ... on Issue { title url state } ... on PullRequest { title url state } ... on DraftIssue { title } } fieldValues(first:20) { nodes { __typename ... on ProjectV2ItemFieldTextValue { text field { ... on ProjectV2FieldCommon { name } } } ... on ProjectV2ItemFieldNumberValue { number field { ... on ProjectV2FieldCommon { name } } } ... on ProjectV2ItemFieldDateValue { date field { ... on ProjectV2FieldCommon { name } } } ... on ProjectV2ItemFieldSingleSelectValue { option { id name } field { ... on ProjectV2FieldCommon { name } } } ... on ProjectV2ItemFieldIterationValue { title field { ... on ProjectV2FieldCommon { name } } } } } }
        }
      }
    }
  `;
  const queryOrg = `
    query($login:String!, $number:Int!, $first:Int!) {
      organization(login:$login) {
        projectV2(number:$number) {
          id number title url
          fields(first:50) { nodes { __typename id name dataType } }
          items(first:$first) { nodes { id content { __typename ... on Issue { title url state } ... on PullRequest { title url state } ... on DraftIssue { title } } fieldValues(first:20) { nodes { __typename ... on ProjectV2ItemFieldTextValue { text field { ... on ProjectV2FieldCommon { name } } } ... on ProjectV2ItemFieldNumberValue { number field { ... on ProjectV2FieldCommon { name } } } ... on ProjectV2ItemFieldDateValue { date field { ... on ProjectV2FieldCommon { name } } } ... on ProjectV2ItemFieldSingleSelectValue { option { id name } field { ... on ProjectV2FieldCommon { name } } } ... on ProjectV2ItemFieldIterationValue { title field { ... on ProjectV2FieldCommon { name } } } } } }
        }
      }
    }
  `;
  const data = await gql(ownerType === 'org' ? queryOrg : queryUser, { login, number, first });
  const p = (ownerType === 'org' ? data.organization : data.user)?.projectV2;
  if (!p) return { project: null, items: [] };
  const items = (p.items?.nodes || []).map((n) => {
    const c = n.content || {};
    const title = c.title || '(Sin título)';
    const url = c.url || null;
    const state = c.state || null;
    const fields = Object.assign({}, ...(n.fieldValues?.nodes || []).map(normalizeFieldValue));
    return { id: n.id, title, url, state, fields };
  });
  return { project: { id: p.id, number: p.number, title: p.title, url: p.url }, items };
}

function toCsv(rows) {
  if (!rows.length) return '';
  // Construir columnas a partir de todos los campos
  const fieldNames = new Set(['title', 'url', 'state']);
  for (const r of rows) for (const k of Object.keys(r.fields || {})) fieldNames.add(k);
  const headers = Array.from(fieldNames);
  const esc = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const lines = [headers.join(',')];
  for (const r of rows) {
    const line = headers
      .map((h) => (h in r ? r[h] : r.fields?.[h] ?? ''))
      .map(esc)
      .join(',');
    lines.push(line);
  }
  return lines.join('\n');
}

async function main() {
  if (mode === 'list') {
    const projects = await listProjects(ownerType, login, limit);
    if (outJson) console.log(JSON.stringify(projects, null, 2));
    else projects.forEach((p) => console.log(`- #${p.number} ${p.title}\n  ${p.url}\n  updated: ${p.updatedAt}\n`));
    return;
  }
  if (mode === 'items') {
    if (!projNumber) {
      console.error('Uso: items --user <login>|--org <login> --project <number> [--limit 100] [--json|--csv]');
      process.exit(1);
    }
    const { project, items } = await listItems(ownerType, login, projNumber, limit);
    if (!project) {
      console.error('Proyecto no encontrado');
      process.exit(1);
    }
    if (outCsv) {
      const flat = items.map((i) => ({ title: i.title, url: i.url, state: i.state, fields: i.fields }));
      console.log(toCsv(flat));
      return;
    }
    if (outJson) console.log(JSON.stringify({ project, items }, null, 2));
    else {
      console.log(`#${project.number} ${project.title} — ${project.url}`);
      for (const it of items) {
        console.log(`- ${it.title}${it.url ? `\n  ${it.url}` : ''}${it.state ? `\n  state: ${it.state}` : ''}`);
        const entries = Object.entries(it.fields || {});
        if (entries.length) console.log('  fields:');
        for (const [k, v] of entries) console.log(`    - ${k}: ${v}`);
      }
    }
    return;
  }
  console.error('Modos válidos: list | items');
  process.exit(1);
}

main().catch((e) => {
  console.error(e?.message || e);
  process.exit(1);
});

