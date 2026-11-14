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

export const normalizeSmartRecruiters = (company, data) =>
  (data.content ?? []).map((j) => ({
    source: 'smartrecruiters',
    company,
    title: j.name ?? '',
    location: j.location?.fullLocation ?? [j.location?.city, j.location?.region, j.location?.country].filter(Boolean).join(', '),
    url: `https://jobs.smartrecruiters.com/${encodeURIComponent(company)}/${j.id}`,
    posted: iso(j.releasedDate),
  }));

export const normalizeWorkable = (company, data) =>
  (data.jobs ?? []).map((j) => ({
    source: 'workable',
    company,
    title: j.title ?? '',
    location: [j.city, j.state, j.country].filter(Boolean).join(', '),
    url: j.url ?? '',
    posted: iso(j.published_on ?? j.created_at),
  }));

export const parseWorkday = (entry) => {
  const u = new URL(entry);
  if (!u.hostname.endsWith('.myworkdayjobs.com')) throw new Error('not a myworkdayjobs.com careers URL');
  const tenant = u.hostname.split('.')[0];
  const site = u.pathname.split('/').filter((p) => p && !/^[a-z]{2}-[A-Z]{2}$/.test(p))[0];
  if (!site) throw new Error('careers URL has no site name');
  return { company: tenant, base: `${u.origin}/${site}`, api: `${u.origin}/wday/cxs/${tenant}/${site}/jobs` };
};

const workdayPosted = (text, now) => {
  const m = /Posted (Today|Yesterday|(\d+) Days? Ago)/i.exec(text ?? '');
  if (!m) return null;
  const days = m[2] ? Number(m[2]) : /today/i.test(m[1]) ? 0 : 1;
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - days)).toISOString();
};

export const normalizeWorkday = ({ company, base }, data, now = new Date()) =>
  (data.jobPostings ?? []).map((j) => ({
    source: 'workday',
    company,
    title: j.title ?? '',
    location: /^\d+ Locations$/.test(j.locationsText ?? '') ? '' : (j.locationsText ?? ''),
    url: j.externalPath ? base + j.externalPath : '',
    posted: workdayPosted(j.postedOn, now),
  }));

export const filterJobs =(jobs, { title, location } = {}) => {
  const t = title ? new RegExp(title, 'i') : null;
  const l = location ? new RegExp(location, 'i') : null;
  return jobs.filter(
    (j) => (!t || t.test(j.title)) && (!l || !j.location || l.test(j.location)),
  );
};

const getJson = async (url, body) => {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(30000),
    ...(body && { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

// shortcut: stops at MAX_POSTINGS per company and says so on stderr, raise it if a company you want is cut off
const MAX_POSTINGS = 3000;

export const paged = async (label, size, page) => {
  const all = [];
  let total;
  do {
    const p = await page(all.length);
    total ??= p.total ?? 0;
    all.push(...p.items);
    if (p.items.length < size) return all;
  } while (all.length < total && all.length < MAX_POSTINGS);
  if (all.length < total) console.error(`${label}: stopped at ${all.length} of ${total} postings`);
  return all;
};

const simple = (url, normalize) => async (name) => normalize(name, await getJson(url(encodeURIComponent(name))));

const providers = {
  greenhouse: simple((n) => `https://boards-api.greenhouse.io/v1/boards/${n}/jobs`, normalizeGreenhouse),
  lever: simple((n) => `https://api.lever.co/v0/postings/${n}?mode=json`, normalizeLever),
  ashby: simple((n) => `https://api.ashbyhq.com/posting-api/job-board/${n}`, normalizeAshby),
  workable: simple((n) => `https://apply.workable.com/api/v1/widget/accounts/${n}`, normalizeWorkable),
  smartrecruiters: (name) =>
    paged(`smartrecruiters/${name}`, 100, async (offset) => {
      const data = await getJson(`https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(name)}/postings?limit=100&offset=${offset}`);
      return { total: data.totalFound, items: normalizeSmartRecruiters(name, data) };
    }),
  workday: async (entry) => {
    const site = parseWorkday(entry);
    return paged(`workday/${site.company}`, 20, async (offset) => {
      const data = await getJson(site.api, { limit: 20, offset, searchText: '', appliedFacets: {} });
      return { total: data.total, items: normalizeWorkday(site, data) };
    });
  },
};

const fetchOne = async (source, name) => {
  try {
    return await providers[source](name);
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
