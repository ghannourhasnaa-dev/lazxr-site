#!/usr/bin/env node
const { watch } = require('chokidar');
const { execSync } = require('child_process');
const path = require('path');

const DIR = path.resolve(__dirname);
const BRANCH = 'develop';
const DEBOUNCE = 3000;
const IGNORE = ['**/node_modules/**','**/.git/**','**/*.log','**/.env'];

let timer = null;
let pushing = false;
let pending = new Set();

const log = {
  ok:   m => console.log(`\x1b[32m[lazxr]\x1b[0m ✓ ${m}`),
  info: m => console.log(`\x1b[36m[lazxr]\x1b[0m ${m}`),
  warn: m => console.log(`\x1b[33m[lazxr]\x1b[0m ⚠ ${m}`),
  err:  m => console.log(`\x1b[31m[lazxr]\x1b[0m ✗ ${m}`),
  dim:  m => console.log(`\x1b[90m         ${m}\x1b[0m`)
};

function git(cmd) {
  return execSync(`git ${cmd}`, { cwd: DIR, encoding: 'utf8', stdio: ['pipe','pipe','pipe'] }).trim();
}

function gitSafe(cmd) {
  try { return { ok: true, out: git(cmd) }; }
  catch (e) { return { ok: false, out: e.stderr?.trim() || e.message }; }
}

function preflight() {
  if (!gitSafe('rev-parse --is-inside-work-tree').ok) {
    log.err('Not a git repo'); process.exit(1);
  }
  const br = git('branch --show-current');
  if (br !== BRANCH) {
    const sw = gitSafe(`checkout ${BRANCH}`);
    if (!sw.ok) { log.err(`Cannot switch to ${BRANCH}`); process.exit(1); }
    log.ok(`Switched to ${BRANCH}`);
  } else {
    log.ok(`Branch: ${BRANCH}`);
  }
  const rm = gitSafe('remote get-url origin');
  if (!rm.ok) { log.err('No remote origin'); process.exit(1); }
  log.ok(`Remote: ${rm.out}`);
  const pull = gitSafe(`pull --rebase origin ${BRANCH}`);
  if (pull.ok) log.ok('Synced with remote');
  else log.warn('Pull skipped');
}

function commitAndPush() {
  if (pushing) { log.warn('Push in progress'); return; }
  pushing = true;
  pending.clear();
  try {
    const br = git('branch --show-current');
    if (br !== BRANCH) { log.err(`BLOCKED: on "${br}"`); return; }
    const status = git('status --porcelain');
    if (!status) { log.dim('No changes'); return; }
    git('add -A');
    const diff = gitSafe('diff --cached --stat');
    if (!diff.ok || !diff.out) { log.dim('Nothing staged'); return; }
    const lines = status.split('\n').filter(Boolean);
    const names = lines.map(l => l.slice(3).trim());
    let msg;
    if (names.length === 1 && names[0] === 'index.html') msg = 'update: site changes';
    else if (names.some(n => n.endsWith('.glb'))) msg = 'asset: update 3D models';
    else if (names.some(n => n.endsWith('.css'))) msg = 'style: update styles';
    else msg = `update: ${lines.length} file(s) changed`;
    git(`commit -m "${msg}"`);
    log.ok(`Commit: ${msg}`);
    log.info('Pushing to origin/develop...');
    const push = gitSafe(`push origin ${BRANCH}`);
    if (push.ok) log.ok('Pushed → develop--lazxr.netlify.app');
    else { log.err(`Push failed: ${push.out}`); log.dim('Retry: git push origin develop'); }
  } catch (e) {
    log.err(e.message);
    gitSafe('reset HEAD');
  } finally {
    pushing = false;
  }
}

function onChange(p) {
  const rel = path.relative(DIR, p);
  if (rel.startsWith('.git')) return;
  pending.add(rel);
  log.dim(`changed: ${rel}`);
  if (timer) clearTimeout(timer);
  timer = setTimeout(commitAndPush, DEBOUNCE);
}

function main() {
  console.log('\n\x1b[33m  LAZXR Auto-Git v2.1 — develop only\x1b[0m\n');
  preflight();
  watch(DIR, {
    ignored: IGNORE, persistent: true, ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 }
  })
  .on('add', onChange).on('change', onChange).on('unlink', onChange)
  .on('ready', () => { log.ok('Watching...'); log.dim('Ctrl+C to stop\n'); });
  process.on('SIGINT', () => { log.info('Stopped.'); process.exit(0); });
}

main();
