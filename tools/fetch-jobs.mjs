import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const iso = (v) => {
  if (v == null || v === '') return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

export const normalizeGreenhouse = (company, data) =>
  (data.jobs ?? []).map((j) => ({
    source: 'greenhouse',
    company,
    title: j.title ?? '',
    location: j.location?.name ?? '',
    url: j.absolute_url ?? '',
    posted: iso(j.updated_at),
  }));

export const normalizeLever = (company, data) =>
  (Array.isArray(data) ? data : []).map((j) => ({
    source: 'lever',
    company,
    title: j.text ?? '',
    location: j.categories?.location ?? '',
    url: j.hostedUrl ?? '',
    posted: iso(j.createdAt),
  }));

export const normalizeAshby = (company, data) =>
  (data.jobs ?? []).map((j) => ({
    source: 'ashby',
    company,
    title: j.title ?? '',
    location: j.location ?? '',
    url: j.jobUrl ?? '',
    posted: iso(j.publishedAt),
  }));

export const filterJobs = (jobs, { title, location } = {}) => {
  const t = title ? new RegExp(title, 'i') : null;
  const l = location ? new RegExp(location, 'i') : null;
  return jobs.filter(
    (j) => (!t || t.test(j.title)) && (!l || !j.location || l.test(j.location)),
  );
};

const providers = {
  greenhouse: [(n) => `https://boards-api.greenhouse.io/v1/boards/${n}/jobs`, normalizeGreenhouse],
  lever: [(n) => `https://api.lever.co/v0/postings/${n}?mode=json`, normalizeLever],
  ashby: [(n) => `https://api.ashbyhq.com/posting-api/job-board/${n}`, normalizeAshby],
};

const fetchOne = async (source, name) => {
  const [url, normalize] = providers[source];
  try {
    const res = await fetch(url(encodeURIComponent(name)), { signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return normalize(name, await res.json());
  } catch (err) {
    console.error(`${source}/${name}: ${err.message}`);
    return [];
  }
};

const arg = (argv, flag) => {
  const i = argv.indexOf(flag);
  return i === -1 ? undefined : argv[i + 1];
};

export const main = async (argv) => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const file = arg(argv, '--companies') ?? path.join(root, 'me', 'companies.json');
  const config = JSON.parse(await readFile(file, 'utf8'));
  const tasks = Object.keys(providers).flatMap((s) => (config[s] ?? []).map((n) => fetchOne(s, n)));
  const jobs = (await Promise.all(tasks)).flat();
  const out = filterJobs(jobs, { title: arg(argv, '--title'), location: arg(argv, '--location') });
  process.stdout.write(JSON.stringify(out, null, 2) + '\n');
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
