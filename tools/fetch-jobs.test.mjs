import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeGreenhouse, normalizeLever, normalizeAshby, filterJobs } from './fetch-jobs.mjs';

test('greenhouse', () => {
  const out = normalizeGreenhouse('acme', {
    jobs: [{ id: 1, title: 'SWE Intern', absolute_url: 'https://g/1', location: { name: 'NYC' }, updated_at: '2026-01-02T03:04:05Z' }],
  });
  assert.deepEqual(out, [
    { source: 'greenhouse', company: 'acme', title: 'SWE Intern', location: 'NYC', url: 'https://g/1', posted: '2026-01-02T03:04:05.000Z' },
  ]);
});

test('lever', () => {
  const out = normalizeLever('acme', [
    { id: 'a', text: 'Co-op', hostedUrl: 'https://l/a', categories: { location: 'Remote' }, createdAt: 1767323045000 },
    { id: 'b', text: 'Bare', hostedUrl: 'https://l/b' },
  ]);
  assert.equal(out[0].source, 'lever');
  assert.equal(out[0].location, 'Remote');
  assert.equal(out[0].posted, new Date(1767323045000).toISOString());
  assert.equal(out[1].location, '');
  assert.equal(out[1].posted, null);
});

test('ashby', () => {
  const out = normalizeAshby('acme', {
    jobs: [{ id: 'x', title: 'Student Engineer', location: 'London', jobUrl: 'https://a/x', publishedAt: '2026-02-03' }],
  });
  assert.deepEqual(out, [
    { source: 'ashby', company: 'acme', title: 'Student Engineer', location: 'London', url: 'https://a/x', posted: '2026-02-03T00:00:00.000Z' },
  ]);
});

test('filterJobs', () => {
  const jobs = [
    { title: 'SWE Intern', location: 'New York' },
    { title: 'Co-op Engineer', location: '' },
    { title: 'Staff Engineer', location: 'New York' },
    { title: 'Coop Student', location: 'Berlin' },
  ];
  assert.equal(filterJobs(jobs).length, 4);
  assert.deepEqual(filterJobs(jobs, { title: 'intern|co-?op' }).map((j) => j.title), ['SWE Intern', 'Co-op Engineer', 'Coop Student']);
  assert.deepEqual(filterJobs(jobs, { location: 'new york' }).map((j) => j.title), ['SWE Intern', 'Co-op Engineer', 'Staff Engineer']);
  assert.deepEqual(filterJobs(jobs, { title: 'co-?op', location: 'berlin' }).map((j) => j.title), ['Co-op Engineer', 'Coop Student']);
});
