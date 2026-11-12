import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { install } from './install.mjs';

test('install copies the project, creates me/ once and never overwrites it', () => {
  const target = mkdtempSync(path.join(tmpdir(), 'aja-'));
  try {
    assert.equal(install(target).createdProfile, true);
    for (const f of ['.claude/commands/apply.md', 'tools/fetch-jobs.mjs', 'tools/cache.mjs', '.claude/commands/scoring.md', 'CLAUDE.md', 'me/preferences.md', 'me/cover-letter.tex', '.claude/commands/cover-letter.md', 'me.example/resume.tex']) {
      assert.ok(existsSync(path.join(target, f)), f);
    }
    assert.match(readFileSync(path.join(target, '.gitignore'), 'utf8'), /^\/me\/$/m);

    const mine = path.join(target, 'me', 'profile.md');
    writeFileSync(mine, 'my data');
    assert.equal(install(target).createdProfile, false);
    assert.equal(readFileSync(mine, 'utf8'), 'my data');
  } finally {
    rmSync(target, { recursive: true, force: true });
  }
});
