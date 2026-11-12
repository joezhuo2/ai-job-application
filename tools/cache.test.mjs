import { test } from 'node:test';
import assert from 'node:assert/strict';
import { keyOf, merge, mark, purge } from './cache.mjs';

const job = (over = {}) => ({
  company: 'Acme',
  title: 'Software Engineer Intern',
  location: 'Toronto, ON',
  url: 'https://a.example/1',
  posted: '2026-09-01T00:00:00.000Z',
  ...over,
});

test('keyOf ignores case and punctuation', () => {
  assert.equal(keyOf(job()), keyOf(job({ company: 'ACME', title: 'Software Engineer, Intern', location: 'Toronto ON' })));
});

test('a new posting is returned once and stays unscored until marked', () => {
  const cache = {};
  assert.equal(merge(cache, [job(), job({ url: 'https://b.example/dup' })], '2026-11-01').length, 1);
  assert.equal(merge(cache, [job()], '2026-11-02').length, 1);
  assert.equal(mark(cache, ['https://a.example/1']), 1);
  assert.equal(merge(cache, [job()], '2026-11-03').length, 0);
});

test('the same job under another URL is a duplicate inside the repost window', () => {
  const cache = {};
  merge(cache, [job()], '2026-11-01');
  mark(cache, ['https://a.example/1']);
  assert.equal(merge(cache, [job({ url: 'https://b.example/9', posted: '2026-09-10T00:00:00.000Z' })], '2026-11-02').length, 0);
  assert.equal(merge(cache, [job({ url: 'https://b.example/9', posted: null })], '2026-11-02').length, 0);
});

test('a later posting under a new URL is a new round', () => {
  const cache = {};
  merge(cache, [job()], '2026-11-01');
  mark(cache, ['https://a.example/1']);
  const fresh = merge(cache, [job({ url: 'https://a.example/2', posted: '2027-01-15T00:00:00.000Z' })], '2027-01-16');
  assert.equal(fresh.length, 1);
  assert.equal(fresh[0].reposted, true);
  assert.equal(fresh[0].previousPosted, '2026-09-01T00:00:00.000Z');
});

test('an edited posting at the same URL is not a new round', () => {
  const cache = {};
  merge(cache, [job()], '2026-11-01');
  mark(cache, ['https://a.example/1']);
  assert.equal(merge(cache, [job({ posted: '2027-01-15T00:00:00.000Z' })], '2027-01-16').length, 0);
});

test('purge removes only postings not seen within the limit', () => {
  const cache = {};
  merge(cache, [job()], '2026-08-01');
  merge(cache, [job({ title: 'Other Intern', url: 'https://a.example/3' })], '2026-11-01');
  assert.equal(purge(cache, 30, '2026-11-12'), 1);
  assert.deepEqual(Object.values(cache).map((e) => e.title), ['Other Intern']);
});
