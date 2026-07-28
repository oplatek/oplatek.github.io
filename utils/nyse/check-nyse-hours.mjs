#!/usr/bin/env node
// Invariant checks on _data/nyse_hours.json. Run in CI right after the build so a
// plausible-looking scrape that is actually wrong fails the job instead of being
// published. Exit 0 = safe to commit.

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const FILE = process.argv[2] ?? resolve(ROOT, '_data/nyse_hours.json');
const data = JSON.parse(readFileSync(FILE, 'utf8'));

const failures = [];
const checks = [];
function check(name, fn) {
  try {
    const detail = fn();
    checks.push(`  ok   ${name}${detail ? ` (${detail})` : ''}`);
  } catch (err) {
    failures.push(`${name}: ${err.message}`);
    checks.push(`  FAIL ${name}: ${err.message}`);
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const isWeekendDate = (d) => [0, 6].includes(new Date(`${d}T00:00:00Z`).getUTCDay());

check('required top-level fields', () => {
  for (const k of ['asOf', 'lastCheckedAt', 'stale', 'days', 'holidays', 'earlyCloses', 'venues', 'summary', 'disclaimer', 'consolidatedSessions']) {
    assert(data[k] !== undefined, `missing ${k}`);
  }
});

check('asOf is a sane timestamp', () => {
  assert(typeof data.asOf === 'string' && !Number.isNaN(Date.parse(data.asOf)), `unparseable asOf: ${data.asOf}`);
  assert(Date.parse(data.asOf) <= Date.now() + 60_000, 'asOf is in the future');
  return data.asOf;
});

check('not stale', () => {
  assert(data.stale === false, `stale=true, ageDays=${data.ageDays}`);
  return `ageDays=${data.ageDays}`;
});

check('disclaimer still says this is not live status', () => {
  assert(/not live/i.test(data.disclaimer), 'disclaimer no longer warns that this is not live status');
});

check('day window is contiguous and sorted', () => {
  assert(data.days.length > 30, `only ${data.days.length} days`);
  for (let i = 1; i < data.days.length; i++) {
    const prev = new Date(`${data.days[i - 1].date}T00:00:00Z`);
    prev.setUTCDate(prev.getUTCDate() + 1);
    assert(prev.toISOString().slice(0, 10) === data.days[i].date,
      `gap between ${data.days[i - 1].date} and ${data.days[i].date}`);
  }
  return `${data.days.length} days, ${data.window.from} → ${data.window.to}`;
});

check('today is inside the window', () => {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
  assert(data.days.some((d) => d.date === today), `${today} not present`);
  assert(data.today === today, `data.today=${data.today} but New York date is ${today}`);
  return today;
});

check('weekends and holidays are closed, trading days are open', () => {
  for (const d of data.days) {
    if (isWeekendDate(d.date)) {
      assert(d.type === 'weekend', `${d.date} is a weekend but typed ${d.type}`);
      assert(d.open === false && d.sessions === null, `${d.date} is a weekend but has sessions`);
    }
    if (d.type === 'holiday' || d.type === 'unscheduled_closure') {
      assert(d.open === false && d.sessions === null, `${d.date} is ${d.type} but marked open`);
    }
    if (d.type === 'regular' || d.type === 'early_close') {
      assert(d.open === true && d.sessions, `${d.date} is ${d.type} but has no sessions`);
    }
  }
});

check('session instants are ordered and UTC mirrors match', () => {
  for (const d of data.days) {
    if (!d.sessions) continue;
    const { preMarket, core, afterHours } = d.sessions;
    for (const [label, s] of Object.entries({ preMarket, core, afterHours })) {
      assert(Date.parse(s.start) < Date.parse(s.end), `${d.date} ${label}: start >= end`);
      assert(Date.parse(s.start) === Date.parse(s.startUtc), `${d.date} ${label}: startUtc disagrees with start`);
      assert(Date.parse(s.end) === Date.parse(s.endUtc), `${d.date} ${label}: endUtc disagrees with end`);
      assert(s.startUtc.endsWith('Z') && s.endUtc.endsWith('Z'), `${d.date} ${label}: UTC fields are not Z-suffixed`);
    }
    assert(Date.parse(preMarket.end) === Date.parse(core.start), `${d.date}: pre-market does not meet core open`);
    assert(Date.parse(core.end) === Date.parse(afterHours.start), `${d.date}: core close does not meet after-hours`);
  }
});

check('New York wall-clock times are the expected ones', () => {
  const et = (iso) => new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date(iso));
  let regular = 0;
  let early = 0;
  let overridden = 0;
  for (const d of data.days) {
    if (!d.sessions) continue;
    // Hand-authored overrides describe irregular days on purpose — a weather close
    // at 12:00 or a delayed open at 10:15 is the whole point of the file.
    if (d.override) { overridden++; continue; }
    assert(et(d.sessions.preMarket.start) === '04:00', `${d.date}: pre-market opens at ${et(d.sessions.preMarket.start)} ET, expected 04:00`);
    assert(et(d.sessions.core.start) === '09:30', `${d.date}: core opens at ${et(d.sessions.core.start)} ET, expected 09:30`);
    if (d.type === 'regular') {
      assert(et(d.sessions.core.end) === '16:00', `${d.date}: core closes at ${et(d.sessions.core.end)} ET, expected 16:00`);
      assert(et(d.sessions.afterHours.end) === '20:00', `${d.date}: after-hours ends at ${et(d.sessions.afterHours.end)} ET, expected 20:00`);
      regular++;
    } else if (d.type === 'early_close') {
      assert(et(d.sessions.core.end) === '13:00', `${d.date}: early close at ${et(d.sessions.core.end)} ET, expected 13:00`);
      assert(et(d.sessions.afterHours.end) === '17:00', `${d.date}: early-close after-hours ends at ${et(d.sessions.afterHours.end)} ET, expected 17:00`);
      early++;
    }
  }
  return `${regular} regular, ${early} early-close days${overridden ? `, ${overridden} overridden (exempt)` : ''}`;
});

check('DST offsets are US Eastern', () => {
  const offsets = new Set(data.days.map((d) => d.utcOffset));
  for (const o of offsets) assert(['-04:00', '-05:00'].includes(o), `unexpected offset ${o}`);
  return [...offsets].join(', ');
});

check('holiday calendar is plausible', () => {
  assert(data.holidays.length >= 18, `only ${data.holidays.length} holidays`);
  const seen = new Set();
  for (const h of data.holidays) {
    assert(/^\d{4}-\d{2}-\d{2}$/.test(h.date), `bad holiday date ${h.date}`);
    assert(h.name && h.name.length > 2, `holiday ${h.date} has no name`);
    // NYSE never observes a holiday on a Saturday or Sunday; it shifts or skips it.
    assert(!isWeekendDate(h.date), `${h.date} (${h.name}) falls on a weekend — parser probably misread a column`);
    assert(!seen.has(h.date), `duplicate holiday date ${h.date}`);
    seen.add(h.date);
  }
  // Every year covered should have 8-10 closures (2028 loses New Year's Day to a Saturday).
  const byYear = {};
  for (const h of data.holidays) byYear[h.date.slice(0, 4)] = (byYear[h.date.slice(0, 4)] ?? 0) + 1;
  for (const [year, n] of Object.entries(byYear)) {
    assert(n >= 8 && n <= 10, `${year} has ${n} holidays, expected 8-10`);
  }
  return Object.entries(byYear).map(([y, n]) => `${y}:${n}`).join(' ');
});

check('early closes are trading days, not holidays', () => {
  assert(data.earlyCloses.length >= 3, `only ${data.earlyCloses.length} early closes`);
  const holidays = new Set(data.holidays.map((h) => h.date));
  for (const e of data.earlyCloses) {
    assert(!isWeekendDate(e.date), `early close ${e.date} falls on a weekend`);
    assert(!holidays.has(e.date), `${e.date} is listed as both a holiday and an early close`);
    assert(e.core && e.afterHours, `early close ${e.date} has no session detail`);
  }
  return data.earlyCloses.map((e) => e.date).join(' ');
});

check('venue session times are present', () => {
  assert(Object.keys(data.venues).length >= 4, 'expected at least 4 NYSE venues');
  assert(data.venues.XNYS.earlyTrading === null && data.venues.XNYS.lateTrading === null,
    'the NYSE floor should have no early/late trading session');
  assert(data.venues.ARCX.earlyTrading[0] === '04:00', 'Arca early trading should start at 04:00');
});

check('liveWindow agrees with days', () => {
  assert(data.liveWindow.length > 20, `liveWindow has only ${data.liveWindow.length} entries`);
  assert(data.liveWindow[0].date === data.today, `liveWindow starts at ${data.liveWindow[0].date}, expected today (${data.today})`);
  for (const lw of data.liveWindow) {
    const day = data.days.find((d) => d.date === lw.date);
    assert(day, `liveWindow has ${lw.date} which is not in days`);
    assert(day.open === lw.open && day.type === lw.type, `liveWindow/${lw.date} disagrees with days`);
    if (lw.open) {
      assert(lw.coreStart === day.sessions.core.start && lw.coreEnd === day.sessions.core.end,
        `liveWindow/${lw.date} core instants disagree with days`);
      assert(Date.parse(lw.coreStartUtc) === Date.parse(lw.coreStart), `liveWindow/${lw.date} coreStartUtc mismatch`);
    }
  }
  return `${data.liveWindow.length} entries`;
});

check('sources are recorded', () => {
  assert(Array.isArray(data.sources) && data.sources.length >= 1, 'no sources recorded');
  for (const s of data.sources) assert(s.url && s.name, 'source missing url or name');
  const failed = data.sources.filter((s) => !s.ok).map((s) => s.name);
  // A failed source is a warning, not a failure: the build falls back to stored
  // data and `stale` is the gate that eventually breaks the job.
  return failed.length ? `${data.sources.length} sources, degraded: ${failed.join(', ')}` : `${data.sources.length} sources ok`;
});

console.log(`checking ${FILE}`);
console.log(checks.join('\n'));

if (failures.length) {
  for (const f of failures) console.error(`::error title=nyse-hours-check::${f}`);
  console.error(`\n${failures.length} check(s) failed`);
  process.exit(1);
}
console.log(`\nall ${checks.length} checks passed`);
