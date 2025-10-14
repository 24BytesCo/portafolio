#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { prefer: 'hyphen', mode: 'move', dry: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--prefer=')) opts.prefer = a.split('=')[1];
    else if (a.startsWith('--mode=')) opts.mode = a.split('=')[1];
    else if (a === '--dry-run' || a === '--dry') opts.dry = true;
  }
  if (!['hyphen','underscore'].includes(opts.prefer)) opts.prefer = 'hyphen';
  if (!['move','copy'].includes(opts.mode)) opts.mode = 'move';
  return opts;
}

function slugNormalize(name, prefer = 'hyphen') {
  const delim = prefer === 'underscore' ? '_' : '-';
  // remove diacritics
  let s = name.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  // unify separators
  s = s.replace(/[_\s-]+/g, delim);
  // remove non alnum + delim
  s = s.replace(new RegExp(`[^a-zA-Z0-9${delim}]`, 'g'), delim);
  // collapse repeats
  s = s.replace(new RegExp(`${delim}{2,}`, 'g'), delim);
  s = s.toLowerCase().replace(new RegExp(`^${delim}|${delim}$`, 'g'), '');
  return s;
}

function ensureCover(dir, dry) {
  const exts = ['.jpg','.jpeg','.png','.webp'];
  const coverExists = exts.some(ext => fs.existsSync(path.join(dir, `cover${ext}`)));
  if (coverExists) return { created: false };
  const files = fs.readdirSync(dir).filter(f => exts.includes(path.extname(f).toLowerCase()));
  if (files.length === 0) return { created: false };
  const src = path.join(dir, files[0]);
  const dst = path.join(dir, `cover${path.extname(files[0]).toLowerCase()}`);
  if (dry) return { created: true, from: files[0] };
  if (!fs.existsSync(dst)) fs.copyFileSync(src, dst);
  return { created: true, from: files[0] };
}

function main() {
  const opts = parseArgs();
  const root = path.resolve(process.cwd(), 'apps/web/public/images/projects');
  if (!fs.existsSync(root)) {
    console.error('Projects images directory not found:', root);
    process.exit(1);
  }
  const entries = fs.readdirSync(root, { withFileTypes: true }).filter(e => e.isDirectory());
  const report = [];
  for (const ent of entries) {
    const curName = ent.name;
    const target = slugNormalize(curName, opts.prefer);
    const curPath = path.join(root, curName);
    const targetPath = path.join(root, target);
    let action = 'skip';
    let moved = false;
    if (curName !== target) {
      if (fs.existsSync(targetPath)) {
        // merge files if target exists
        const files = fs.readdirSync(curPath);
        for (const f of files) {
          const src = path.join(curPath, f);
          const dst = path.join(targetPath, f);
          if (fs.existsSync(dst)) continue;
          if (!opts.dry) fs.copyFileSync(src, dst);
        }
        if (!opts.dry && opts.mode === 'move') fs.rmSync(curPath, { recursive: true, force: true });
        action = 'merge';
      } else {
        if (!opts.dry) {
          if (opts.mode === 'move') fs.renameSync(curPath, targetPath);
          else {
            fs.mkdirSync(targetPath, { recursive: true });
            const files = fs.readdirSync(curPath);
            for (const f of files) fs.copyFileSync(path.join(curPath, f), path.join(targetPath, f));
          }
        }
        action = opts.mode;
        moved = true;
      }
    }
    const finalDir = moved || action === 'merge' ? targetPath : curPath;
    const cover = ensureCover(finalDir, opts.dry);
    report.push({ from: curName, to: target, action, cover });
  }
  console.table(report.map(r => ({ from: r.from, to: r.to, action: r.action, cover: r.cover.created ? `added(${r.cover.from||''})` : 'ok' })));
}

main();

