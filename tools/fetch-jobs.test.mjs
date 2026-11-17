import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeGreenhouse,
  normalizeLever,
  normalizeAshby,
  normalizeSmartRecruiters,
  normalizeWorkable,
  normalizeWorkday,
  normalizeRecruitee,
  normalizeBambooHr,
  normalizeOracle,
  normalizeEightfold,
  normalizeIcims,
  normalizeJobBank,
  normalizeGithubList,
  parseOracle,
  parseEightfold,
  parseIcims,
  parseGithubList,
  parseWorkday,
  paged,
  filterJobs,
} from './fetch-jobs.mjs';

test('smartrecruiters', () => {
  const out = normalizeSmartRecruiters('Acme', {
    content: [
      { id: '744', name: 'Software Intern', releasedDate: '2026-03-04T05:06:07.000Z', location: { city: 'Toronto', region: 'ON', country: 'ca', fullLocation: 'Toronto, ON, Canada' } },
      { id: '745', name: 'Bare', location: { city: 'Paris', country: 'fr' } },
    ],
  });
  assert.deepEqual(out[0], { source: 'smartrecruiters', company: 'Acme', title: 'Software Intern', location: 'Toronto, ON, Canada', url: 'https://jobs.smartrecruiters.com/Acme/744', posted: '2026-03-04T05:06:07.000Z' });
  assert.equal(out[1].location, 'Paris, fr');
  assert.equal(out[1].posted, null);
});

test('workable', () => {
  const out = normalizeWorkable('acme', {
    jobs: [{ title: 'ML Intern', url: 'https://apply.workable.com/j/AB12', city: 'Paris', state: '', country: 'France', published_on: '2026-05-29' }],
  });
  assert.deepEqual(out, [
    { source: 'workable', company: 'acme', title: 'ML Intern', location: 'Paris, France', url: 'https://apply.workable.com/j/AB12', posted: '2026-05-29T00:00:00.000Z' },
  ]);
});

test('workday', () => {
  const site = parseWorkday('https://acme.wd5.myworkdayjobs.com/en-US/AcmeCareers?q=intern');
  assert.deepEqual(site, { company: 'acme', base: 'https://acme.wd5.myworkdayjobs.com/AcmeCareers', api: 'https://acme.wd5.myworkdayjobs.com/wday/cxs/acme/AcmeCareers/jobs' });
  assert.throws(() => parseWorkday('https://example.com/AcmeCareers'));
  assert.throws(() => parseWorkday('https://acme.wd5.myworkdayjobs.com/'));
  const out = normalizeWorkday(site, {
    jobPostings: [
      { title: 'A', externalPath: '/job/Toronto/A_R1', locationsText: 'Toronto', postedOn: 'Posted Today' },
      { title: 'B', externalPath: '/job/X/B_R2', locationsText: '3 Locations', postedOn: 'Posted Yesterday' },
      { title: 'C', externalPath: '/job/X/C_R3', locationsText: 'Remote', postedOn: 'Posted 5 Days Ago' },
      { title: 'D', externalPath: '/job/X/D_R4', locationsText: 'Remote', postedOn: 'Posted 30+ Days Ago' },
    ],
  }, new Date('2026-11-14T10:00:00Z'));
  assert.deepEqual(out[0], { source: 'workday', company: 'acme', title: 'A', location: 'Toronto', url: 'https://acme.wd5.myworkdayjobs.com/AcmeCareers/job/Toronto/A_R1', posted: '2026-11-14T00:00:00.000Z' });
  assert.equal(out[1].location, '');
  assert.equal(out[1].posted, '2026-11-13T00:00:00.000Z');
  assert.equal(out[2].posted, '2026-11-09T00:00:00.000Z');
  assert.equal(out[3].posted, null);
});

test('paged', async () => {
  const calls = [];
  const out = await paged('x', 2, async (offset) => {
    calls.push(offset);
    return { total: offset === 0 ? 5 : 0, items: [1, 2, 3, 4, 5].slice(offset, offset + 2) };
  });
  assert.deepEqual(out, [1, 2, 3, 4, 5]);
  assert.deepEqual(calls, [0, 2, 4]);
  assert.deepEqual(await paged('x', 2, async () => ({ total: 0, items: [] })), []);
});

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

test('recruitee and bamboohr', () => {
  assert.deepEqual(normalizeRecruitee('bunq', { offers: [{ title: 'Dev', location: 'London, UK', careers_url: 'https://c/o/dev', published_at: '2026-11-16 14:19:38 UTC' }] }), [
    { source: 'recruitee', company: 'bunq', title: 'Dev', location: 'London, UK', url: 'https://c/o/dev', posted: '2026-11-16T14:19:38.000Z' },
  ]);
  const out = normalizeBambooHr('acme', { result: [{ id: '7', jobOpeningName: 'QA', location: { city: 'Ottawa', state: 'ON' } }, { id: '8', jobOpeningName: 'Ops', location: {}, isRemote: true }] });
  assert.deepEqual(out[0], { source: 'bamboohr', company: 'acme', title: 'QA', location: 'Ottawa, ON', url: 'https://acme.bamboohr.com/careers/7', posted: null });
  assert.equal(out[1].location, 'Remote');
});

test('oracle', () => {
  const site = parseOracle('https://eeho.fa.us2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1?lang=en');
  assert.deepEqual(site, { company: 'eeho', origin: 'https://eeho.fa.us2.oraclecloud.com', site: 'CX_1' });
  assert.throws(() => parseOracle('https://example.com/hcmUI/CandidateExperience/en/sites/CX_1'));
  assert.throws(() => parseOracle('https://eeho.fa.us2.oraclecloud.com/'));
  assert.deepEqual(normalizeOracle(site, { items: [{ requisitionList: [{ Id: '9', Title: 'Intern', PrimaryLocation: 'Austin', PostedDate: '2026-11-16' }] }] }), [
    { source: 'oracle', company: 'eeho', title: 'Intern', location: 'Austin', url: 'https://eeho.fa.us2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1/job/9', posted: '2026-11-16T00:00:00.000Z' },
  ]);
});

test('eightfold', () => {
  const site = parseEightfold('https://careers.qualcomm.com/?domain=qualcomm.com');
  assert.deepEqual(site, { company: 'qualcomm', origin: 'https://careers.qualcomm.com', domain: 'qualcomm.com' });
  assert.throws(() => parseEightfold('https://careers.qualcomm.com/'));
  const out = normalizeEightfold(site, { positions: [{ id: 5, name: 'Intern', location: 'San Diego', t_create: 1767323045, canonicalPositionUrl: 'https://careers.qualcomm.com/careers/job/5' }] });
  assert.deepEqual(out, [{ source: 'eightfold', company: 'qualcomm', title: 'Intern', location: 'San Diego', url: 'https://careers.qualcomm.com/careers/job/5', posted: '2026-01-02T03:04:05.000Z' }]);
});

test('icims', () => {
  assert.deepEqual(parseIcims('careers-kinaxis.icims.com'), { company: 'kinaxis', origin: 'https://careers-kinaxis.icims.com' });
  assert.throws(() => parseIcims('example.com'));
  const html = `<ul><li class="iCIMS_JobCardItem"><span class="sr-only field-label">Location</span>
<span >
CA-ON-Ottawa</span><a href="https://careers-kinaxis.icims.com/jobs/1/dev-%26-ops/job?in_iframe=1"><h3 >
Dev &amp; Ops</h3></a><span title="11/16/2026 7:53 AM">1 day ago</span></li></ul>`;
  assert.deepEqual(normalizeIcims({ company: 'kinaxis' }, html), [
    { source: 'icims', company: 'kinaxis', title: 'Dev & Ops', location: 'CA-ON-Ottawa', url: 'https://careers-kinaxis.icims.com/jobs/1/dev-%26-ops/job', posted: '2026-11-16T00:00:00.000Z' },
  ]);
  assert.deepEqual(normalizeIcims({ company: 'k' }, '<html></html>'), []);
});

test('jobbank', () => {
  const atom = `<feed><entry><title type="html"><![CDATA[software intern]]></title><link rel="alternate" href="https://www.jobbank.gc.ca/jobsearch/jobposting/1"/><updated>2026-11-16T21:00:00Z</updated><summary type="html"><![CDATA[<strong>Location:</strong> Toronto (ON)  <br /><strong>Employer:</strong> Acme &amp; Co<br />]]></summary></entry></feed>`;
  assert.deepEqual(normalizeJobBank(atom), [
    { source: 'jobbank', company: 'Acme & Co', title: 'software intern', location: 'Toronto (ON)', url: 'https://www.jobbank.gc.ca/jobsearch/jobposting/1', posted: '2026-11-16T21:00:00.000Z' },
  ]);
  assert.deepEqual(normalizeJobBank('<feed></feed>'), []);
});

test('github list', () => {
  assert.equal(parseGithubList('SimplifyJobs/Summer2027-Internships'), 'https://raw.githubusercontent.com/SimplifyJobs/Summer2027-Internships/dev/.github/scripts/listings.json');
  assert.equal(parseGithubList('a/b@main'), 'https://raw.githubusercontent.com/a/b/main/.github/scripts/listings.json');
  assert.throws(() => parseGithubList('not a repo'));
  const out = normalizeGithubList([
    { active: true, company_name: 'Acme', title: 'Intern', locations: ['A', 'B'], url: 'https://x/1', date_posted: 1767323045 },
    { active: false, company_name: 'Old', title: 'Gone', url: 'https://x/2' },
    { active: true, is_visible: false, company_name: 'Hidden', title: 'H', url: 'https://x/3' },
  ]);
  assert.deepEqual(out, [{ source: 'github', company: 'Acme', title: 'Intern', location: 'A; B', url: 'https://x/1', posted: '2026-01-02T03:04:05.000Z' }]);
});
