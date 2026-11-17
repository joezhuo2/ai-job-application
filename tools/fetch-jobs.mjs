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

export const normalizeRecruitee = (company, data) =>
  (data.offers ?? []).map((j) => ({
    source: 'recruitee',
    company,
    title: j.title ?? '',
    location: j.location ?? [j.city, j.country].filter(Boolean).join(', '),
    url: j.careers_url ?? '',
    posted: iso(j.published_at?.replace(' UTC', 'Z').replace(' ', 'T')),
  }));

export const normalizeBambooHr = (company, data) =>
  (data.result ?? []).map((j) => ({
    source: 'bamboohr',
    company,
    title: j.jobOpeningName ?? '',
    location: [j.location?.city, j.location?.state].filter(Boolean).join(', ') || (j.isRemote ? 'Remote' : ''),
    url: `https://${company}.bamboohr.com/careers/${j.id}`,
    posted: null,
  }));

export const parseOracle = (entry) => {
  const u = new URL(entry);
  const site = /\/sites\/([^/?#]+)/.exec(u.pathname)?.[1];
  if (!u.hostname.endsWith('.oraclecloud.com') || !site) throw new Error('not an Oracle careers URL (https://<host>.oraclecloud.com/hcmUI/CandidateExperience/en/sites/<site>)');
  return { company: u.hostname.split('.')[0], origin: u.origin, site };
};

export const normalizeOracle = ({ company, origin, site }, data) =>
  (data.items?.[0]?.requisitionList ?? []).map((j) => ({
    source: 'oracle',
    company,
    title: j.Title ?? '',
    location: j.PrimaryLocation ?? '',
    url: `${origin}/hcmUI/CandidateExperience/en/sites/${site}/job/${j.Id}`,
    posted: iso(j.PostedDate),
  }));

export const parseEightfold = (entry) => {
  const u = new URL(entry);
  const domain = u.searchParams.get('domain');
  if (!domain) throw new Error('careers URL needs ?domain=<company domain>');
  return { company: domain.split('.')[0], origin: u.origin, domain };
};

export const normalizeEightfold = ({ company, origin }, data) =>
  (data.positions ?? []).map((j) => ({
    source: 'eightfold',
    company,
    title: j.name ?? '',
    location: j.location ?? (j.locations ?? []).join('; '),
    url: j.canonicalPositionUrl ?? `${origin}/careers/job/${j.id}`,
    posted: j.t_create ? new Date(j.t_create * 1000).toISOString() : null,
  }));

export const parseIcims = (entry) => {
  const u = new URL(/^https?:/.test(entry) ? entry : `https://${entry}`);
  if (!u.hostname.endsWith('.icims.com')) throw new Error('not an icims.com careers host (careers-<company>.icims.com)');
  return { company: u.hostname.split('.')[0].replace(/^careers-/, ''), origin: u.origin };
};

const decode = (t) =>
  t.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/\s+/g, ' ').trim();

export const normalizeIcims = ({ company }, html) =>
  html
    .split('iCIMS_JobCardItem')
    .slice(1)
    .map((card) => {
      const url = /href="([^"]*\/jobs\/\d+\/[^"]*)"/.exec(card)?.[1] ?? '';
      const d = /title="(\d+)\/(\d+)\/(\d+)/.exec(card);
      return {
        source: 'icims',
        company,
        title: decode(/<h3[^>]*>([\s\S]*?)<\/h3>/.exec(card)?.[1] ?? ''),
        location: decode(/Location<\/span>\s*<span[^>]*>([\s\S]*?)<\/span>/.exec(card)?.[1] ?? ''),
        url: url.replace(/\?in_iframe=1$/, ''),
        posted: d ? iso(`${d[3]}-${d[1].padStart(2, '0')}-${d[2].padStart(2, '0')}`) : null,
      };
    })
    .filter((j) => j.url);

export const normalizeJobBank = (atom) =>
  atom
    .split('<entry>')
    .slice(1)
    .map((e) => {
      const field = (name) => decode(new RegExp(`<strong>${name}:</strong>([^<]*)`).exec(e)?.[1] ?? '');
      return {
        source: 'jobbank',
        company: field('Employer'),
        title: decode(/<title[^>]*>([\s\S]*?)<\/title>/.exec(e)?.[1] ?? ''),
        location: field('Location'),
        url: /<link[^>]*href="([^"]*)"/.exec(e)?.[1] ?? '',
        posted: iso(/<updated>([^<]*)</.exec(e)?.[1]),
      };
    });

export const parseGithubList = (entry) => {
  const m = /^([\w.-]+\/[\w.-]+)(?:@([\w./-]+))?$/.exec(entry);
  if (!m) throw new Error('expected owner/repo or owner/repo@branch');
  return `https://raw.githubusercontent.com/${m[1]}/${m[2] ?? 'dev'}/.github/scripts/listings.json`;
};

export const normalizeGithubList = (data) =>
  (Array.isArray(data) ? data : [])
    .filter((j) => j.active && j.is_visible !== false)
    .map((j) => ({
      source: 'github',
      company: j.company_name ?? '',
      title: j.title ?? '',
      location: (j.locations ?? []).join('; '),
      url: j.url ?? '',
      posted: j.date_posted ? new Date(j.date_posted * 1000).toISOString() : null,
    }));

export const filterJobs = (jobs, { title, location } = {}) => {
  const t = title ? new RegExp(title, 'i') : null;
  const l = location ? new RegExp(location, 'i') : null;
  return jobs.filter(
    (j) => (!t || t.test(j.title)) && (!l || !j.location || l.test(j.location)),
  );
};

const get = async (url, body, accept = 'application/json') => {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(30000),
    headers: { 'user-agent': 'Mozilla/5.0', accept },
    ...(body && { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
};

const getJson = async (url, body) => (await get(url, body)).json();
const getText = async (url) => (await get(url, undefined, '*/*')).text();

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
  recruitee: async (name) => normalizeRecruitee(name, await getJson(`https://${encodeURIComponent(name)}.recruitee.com/api/offers/`)),
  bamboohr: async (name) => normalizeBambooHr(name, await getJson(`https://${encodeURIComponent(name)}.bamboohr.com/careers/list`)),
  oracle: async (entry) => {
    const site = parseOracle(entry);
    const jobs = [];
    let total = Infinity;
    for (let offset = 0; offset < Math.min(total, MAX_POSTINGS); offset += 25) {
      const data = await getJson(`${site.origin}/hcmRestApi/resources/latest/recruitingCEJobRequisitions?onlyData=true&expand=requisitionList.secondaryLocations&finder=findReqs;siteNumber=${site.site},limit=25,offset=${offset}`);
      total = data.items?.[0]?.TotalJobsCount ?? 0;
      jobs.push(...normalizeOracle(site, data));
    }
    return jobs;
  },
  eightfold: async (entry) => {
    const site = parseEightfold(entry);
    return paged(`eightfold/${site.company}`, 10, async (offset) => {
      const data = await getJson(`${site.origin}/api/apply/v2/jobs?domain=${encodeURIComponent(site.domain)}&start=${offset}&num=10`);
      return { total: data.count, items: normalizeEightfold(site, data) };
    });
  },
  icims: async (entry) => {
    const site = parseIcims(entry);
    const jobs = [];
    for (let page = 0; jobs.length < MAX_POSTINGS; page++) {
      const items = normalizeIcims(site, await getText(`${site.origin}/jobs/search?ss=1&in_iframe=1&pr=${page}`));
      if (!items.length) break;
      jobs.push(...items);
    }
    return jobs;
  },
  jobbank: async (entry) => {
    const [search, location] = entry.split('|').map((p) => p.trim());
    const q = new URLSearchParams({ searchstring: search, ...(location && { locationstring: location }) });
    return normalizeJobBank(await getText(`https://www.jobbank.gc.ca/jobsearch/feed/jobSearchRSSfeed?${q}`));
  },
  github: async (entry) => normalizeGithubList(await getJson(parseGithubList(entry))),
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
