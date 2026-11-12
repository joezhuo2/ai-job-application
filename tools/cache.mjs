import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const DAY = 86400000;
const norm = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const time = (v) => {
  const t = Date.parse(v);
  return Number.isNaN(t) ? null : t;
};

export const keyOf = (p) => [p.company, p.title, p.location].map(norm).join('|');

export const merge = (cache, postings, today, repostDays = 30) => {
  const fresh = [];
  const handled = new Set();
  for (const p of postings) {
    const k = keyOf(p);
    if (handled.has(k)) continue;
    handled.add(k);
    const old = cache[k];
    if (!old) {
      cache[k] = {
        company: p.company,
        title: p.title,
        location: p.location ?? '',
        url: p.url,
        posted: p.posted ?? null,
        firstSeen: today,
        lastSeen: today,
        scored: false,
      };
      fresh.push(p);
      continue;
    }
    old.lastSeen = today;
    const before = time(old.posted);
    const now = time(p.posted);
    const newRound = p.url !== old.url && before !== null && now !== null && now - before > repostDays * DAY;
    if (newRound) {
      const previousPosted = old.posted;
      Object.assign(old, { url: p.url, posted: p.posted, scored: false, previousPosted });
      fresh.push({ ...p, reposted: true, previousPosted });
    } else if (!old.scored) {
      fresh.push(p);
    }
  }
  return fresh;
};

export const mark = (cache, urls) => {
  const wanted = new Set(urls);
  let n = 0;
  for (const entry of Object.values(cache)) {
    if (wanted.has(entry.url) && !entry.scored) {
      entry.scored = true;
      n += 1;
    }
  }
  return n;
};

export const purge = (cache, days, today) => {
  const limit = time(today) - days * DAY;
  let n = 0;
  for (const [k, entry] of Object.entries(cache)) {
    if (time(entry.lastSeen) < limit) {
      delete cache[k];
      n += 1;
    }
  }
  return n;
};

const option = (argv, flag) => {
  const i = argv.indexOf(flag);
  return i === -1 ? undefined : argv.splice(i, 2)[1];
};

const main = (argv) => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const file = option(argv, '--cache') ?? path.join(root, 'me', 'cache.json');
  const repostDays = Number(option(argv, '--repost-days') ?? 30);
  const [command, ...rest] = argv;
  const cache = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
  const today = new Date().toISOString().slice(0, 10);
  const save = () => writeFileSync(file, JSON.stringify(cache, null, 1) + '\n');

  if (command === 'filter') {
    const fresh = merge(cache, JSON.parse(readFileSync(0, 'utf8')), today, repostDays);
    save();
    process.stdout.write(JSON.stringify(fresh, null, 2) + '\n');
  } else if (command === 'mark') {
    const n = mark(cache, rest);
    save();
    console.log(`${n} marked as scored`);
  } else if (command === 'purge') {
    const days = Number(rest[0]);
    if (!Number.isInteger(days) || days < 1) throw new Error('purge needs a whole number of days, 1 or more');
    const n = purge(cache, days, today);
    save();
    console.log(`${n} removed, ${Object.keys(cache).length} kept`);
  } else if (command === 'stats') {
    const all = Object.values(cache);
    console.log(`${all.length} postings cached, ${all.filter((e) => e.scored).length} scored`);
  } else {
    throw new Error('usage: cache.mjs filter | mark <url>... | purge <days> | stats');
  }
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main(process.argv.slice(2));
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
