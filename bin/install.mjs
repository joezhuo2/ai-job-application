#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const source = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const shipped = ['.claude/commands', 'tools/fetch-jobs.mjs', 'tools/cache.mjs', 'me.example', 'CLAUDE.md', 'README.md'];

export const install = (target) => {
  mkdirSync(target, { recursive: true });
  for (const item of shipped) {
    cpSync(path.join(source, item), path.join(target, item), { recursive: true });
  }
  writeFileSync(path.join(target, '.gitignore'), '/me/\n/tools/tectonic/\n');
  const me = path.join(target, 'me');
  const createdProfile = !existsSync(me);
  if (createdProfile) cpSync(path.join(target, 'me.example'), me, { recursive: true });
  return { target, createdProfile };
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const target = path.resolve(process.argv[2] ?? 'ai-job-application');
  if (target === source) {
    console.error('Choose a folder other than the package itself.');
    process.exit(1);
  }
  const { createdProfile } = install(target);
  console.log(`Installed in ${target}`);
  console.log(createdProfile ? 'Created a blank profile in me/.' : 'Kept your existing me/ folder.');
  console.log('Next: open that folder in Claude Code and run /sync-profile.');
}
