#!/usr/bin/env node
// Build _data/nyse_hours.json — the machine-readable NYSE trading calendar served
// at https://opla.cz/data/nyse-hours.json and rendered at https://opla.cz/nyse-hours/
//
// Design rules (see nyse-hours.html "How this is maintained"):
//   * asOf only advances when a scrape actually succeeded. A failed scrape bumps
//     lastCheckedAt and nothing else, so staleness can never be faked away.
//   * The previous file is the fallback. A bad scrape never destroys good data.
//   * _data/nyse_overrides.json is hand-maintained and applied last. This script
//     reads it and never writes it.
//
// Usage: node utils/nyse/build-nyse-hours.mjs [--out FILE] [--offline]
//        --offline  skip the network, just re-stamp lastCheckedAt and re-apply
//                   overrides against the existing file (useful for testing).

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = argValue('--out') ?? resolve(ROOT, '_data/nyse_hours.json');
const OVERRIDES = resolve(ROOT, '_data/nyse_overrides.json');
const OFFLINE = process.argv.includes('--offline');

const CALENDAR_URL = 'https://www.nyse.com/trade/hours-calendars';
const HALTS_URL = 'https://www.nyse.com/api/trade-halts/current/download';
const USER_AGENT =
  'opla.cz-nyse-hours/1.0 (+https://opla.cz/nyse-hours/; weekly-ish calendar cache, not a trading system)';

const DAYS_AHEAD = 150;
const DAYS_BEHIND = 3;
const STALE_AFTER_DAYS = 10;
const MAX_HALT_SYMBOLS = 40;

// Wall-clock session times in America/New_York, transcribed from CALENDAR_URL.
// These are prose on the NYSE page rather than a parseable table, so they live
// here and integrity-check against the page text on every run (see CANARIES).
const VENUES = {
  XNYS: {
    name: 'NYSE (Tape A, the floor)',
    preOpening: '06:30',
    preOpeningIsOrderEntryOnly: true,
    earlyTrading: null,
    core: ['09:30', '16:00'],
    lateTrading: null,
    note: 'No early or late trading session. Orders may be queued from 06:30 but do not execute until the 09:30 Core Open Auction.',
  },
  ARCX: {
    name: 'NYSE Arca Equities',
    preOpening: '02:30',
    earlyTrading: ['04:00', '09:30'],
    core: ['09:30', '16:00'],
    lateTrading: ['16:00', '20:00'],
    note: 'Earliest extended-hours trading in the NYSE group. Most retail brokers do not pass orders this early.',
  },
  XASE: {
    name: 'NYSE American Equities',
    preOpening: '06:30',
    earlyTrading: ['07:00', '09:30'],
    core: ['09:30', '16:00'],
    lateTrading: ['16:00', '20:00'],
  },
  XCIS: {
    name: 'NYSE National',
    preOpening: '06:30',
    earlyTrading: ['07:00', '09:30'],
    core: ['09:30', '16:00'],
    lateTrading: ['16:00', '20:00'],
  },
  NYSETX: {
    name: 'NYSE Texas',
    preOpening: '06:30',
    earlyTrading: ['07:00', '09:30'],
    core: ['09:30', '16:00'],
    lateTrading: ['16:00', '20:00'],
  },
};

// On a 1:00 p.m. early close, late trading ends at 5:00 p.m. ET instead of 8:00 p.m.
const EARLY_CLOSE_CORE_END = '13:00';
const EARLY_CLOSE_LATE_END = '17:00';

// If any of these strings vanish from the NYSE page, the hardcoded session times
// above may be out of date and the run flags it rather than silently serving them.
const CANARIES = [
  '9:30 a.m. to 4:00 p.m. ET',
  '4:00 p.m. to 8:00 p.m. ET',
  '4:00 a.m. to 9:30 a.m. ET',
  '7:00 a.m. to 9:30 a.m. ET',
];

const MONTHS = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
};
const WEEKDAY_RE = '(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)';

const warnings = [];
function warn(msg) {
  warnings.push(msg);
  console.log(`::warning title=nyse-hours::${msg}`);
}
function argValue(flag) {
  const i = process.argv.indexOf(flag);
  return i === -1 ? undefined : process.argv[i + 1];
}

// ---------------------------------------------------------------- time helpers

// Offset of America/New_York for a given calendar date, probed at 17:00 UTC.
// US DST switches at 02:00 local on a Sunday, so a midday probe is always on the
// correct side of the transition for any date, and no trading session we emit
// straddles 02:00 local anyway.
function etOffset(isoDate) {
  const probe = new Date(`${isoDate}T17:00:00Z`);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    timeZoneName: 'longOffset',
  }).format(probe);
  const m = parts.match(/GMT([+-]\d{2}:\d{2})/);
  if (!m) throw new Error(`cannot resolve America/New_York offset for ${isoDate}`);
  return m[1];
}

function instant(isoDate, hhmm, offset) {
  return `${isoDate}T${hhmm}:00${offset}`;
}

function span(isoDate, [from, to], offset) {
  const start = instant(isoDate, from, offset);
  const end = instant(isoDate, to, offset);
  return {
    start,
    end,
    startUtc: new Date(start).toISOString().replace('.000', ''),
    endUtc: new Date(end).toISOString().replace('.000', ''),
  };
}

function addDays(isoDate, n) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function weekdayName(isoDate) {
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long' })
    .format(new Date(`${isoDate}T00:00:00Z`));
}

function isWeekend(isoDate) {
  const day = new Date(`${isoDate}T00:00:00Z`).getUTCDay();
  return day === 0 || day === 6;
}

function todayInNewYork() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

// ---------------------------------------------------------------------- network

async function fetchText(url, label) {
  const res = await fetch(url, {
    headers: { 'user-agent': USER_AGENT, accept: '*/*' },
    signal: AbortSignal.timeout(30_000),
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`${label}: HTTP ${res.status}`);
  const body = await res.text();
  if (body.length < 500) throw new Error(`${label}: suspiciously short body (${body.length} bytes)`);
  return body;
}

// -------------------------------------------------------------------- scraping

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<\/(tr|p|div|li|h[1-6])>/gi, '\n')
    .replace(/<\/t[dh]>/gi, ' | ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;|&#8217;|&rsquo;/g, '’')
    .replace(/&#8212;|&mdash;/g, '—')
    .replace(/[ \t]+/g, ' ');
}

// The holiday table is one row per holiday, one column per year:
//   Holiday | 2026 | 2027 | 2028
//   New Year's Day | Thursday, January 1 | Friday, January 1 | -*
function parseHolidays(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const headerIdx = lines.findIndex((l) => /^Holiday(\s*\|\s*\d{4}){2,}/.test(l));
  if (headerIdx === -1) throw new Error('holiday table header row not found');

  const years = lines[headerIdx]
    .split('|').map((c) => c.trim()).slice(1)
    .filter((c) => /^\d{4}$/.test(c)).map(Number);
  if (!years.length) throw new Error('no year columns in holiday table header');

  const holidays = [];
  for (const line of lines.slice(headerIdx + 1, headerIdx + 20)) {
    const cells = line.split('|').map((c) => c.trim());
    if (cells.length < 2) continue;
    const name = cells[0].replace(/\*+$/, '').trim();
    if (!name || /^\d{4}$/.test(name)) continue;
    let matchedAny = false;
    years.forEach((year, i) => {
      const cell = cells[i + 1];
      if (!cell) return;
      const m = cell.match(new RegExp(`${WEEKDAY_RE},\\s+([A-Z][a-z]+)\\s+(\\d{1,2})`));
      if (!m) return; // "—*" means the holiday is not observed that year
      const month = MONTHS[m[1]];
      if (!month) return;
      matchedAny = true;
      holidays.push({
        date: `${year}-${String(month).padStart(2, '0')}-${String(Number(m[2])).padStart(2, '0')}`,
        name,
        observed: /observed/i.test(cell),
      });
    });
    if (!matchedAny && holidays.length) break; // fell off the end of the table
  }

  holidays.sort((a, b) => a.date.localeCompare(b.date));
  return { holidays, years };
}

// Early closes live in the table footnotes:
//   "Each market will close early at 1:00 p.m. ... on Friday, November 27, 2026,
//    Friday, November 26, 2027, and Friday, November 24, 2028 (the day after
//    Thanksgiving)."
function parseEarlyCloses(text) {
  const out = new Map();
  const dateRe = new RegExp(`${WEEKDAY_RE},\\s+([A-Z][a-z]+)\\s+(\\d{1,2}),\\s+(\\d{4})`, 'g');
  // Each footnote runs from "close early at 1:00 p.m." to "All times are Eastern
  // Time." Sentence-splitting on periods is not an option here: "1:00 p.m." and
  // "Jr." both look like sentence ends.
  const windows = [];
  for (const m of text.matchAll(/close early at 1:00 ?p\.?m\.?/gi)) {
    const rest = text.slice(m.index, m.index + 800);
    const stop = rest.search(/All times are Eastern Time\./i);
    windows.push(stop === -1 ? rest : rest.slice(0, stop));
  }
  for (const footnote of windows) {
    const reason = /day after Thanksgiving/i.test(footnote)
      ? 'Day after Thanksgiving'
      : /July/i.test(footnote) ? 'Day before Independence Day'
      : /December 2[34]/i.test(footnote) ? 'Christmas Eve' : 'Early close';
    for (const m of footnote.matchAll(dateRe)) {
      const month = MONTHS[m[1]];
      if (!month) continue;
      const date = `${m[3]}-${String(month).padStart(2, '0')}-${String(Number(m[2])).padStart(2, '0')}`;
      if (!out.has(date)) out.set(date, { date, reason });
    }
  }
  return [...out.values()].sort((a, b) => a.date.localeCompare(b.date));
}

// RFC4180-ish: quoted fields, doubled quotes. The NYSE feed embeds commas in
// security names, so splitting on commas mangles every row after the name.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

function parseHalts(csv) {
  const rows = parseCsv(csv);
  const header = rows.shift()?.map((h) => h.trim().toLowerCase()) ?? [];
  const col = (n) => header.indexOf(n);
  const idx = {
    date: col('halt date'), time: col('halt time'), symbol: col('symbol'),
    name: col('name'), exchange: col('exchange'), reason: col('reason'),
    resumeDate: col('resume date'),
  };
  if (idx.symbol === -1 || idx.reason === -1) throw new Error('unexpected trade-halt CSV header');

  const halts = rows.map((r) => ({
    date: (r[idx.date] ?? '').trim(),
    time: (r[idx.time] ?? '').trim(),
    symbol: (r[idx.symbol] ?? '').trim(),
    name: (r[idx.name] ?? '').replace(/^"+|"+$/g, '').trim(),
    exchange: (r[idx.exchange] ?? '').trim(),
    reason: (r[idx.reason] ?? '').trim(),
    resumed: Boolean((r[idx.resumeDate] ?? '').trim()),
  })).filter((h) => h.symbol);

  const open = halts.filter((h) => !h.resumed);
  const marketWide = open.filter((h) => /market[- ]?wide|circuit breaker|MWCB|\bM[123]\b/i.test(h.reason));
  const byExchange = {};
  for (const h of open) byExchange[h.exchange || 'unknown'] = (byExchange[h.exchange || 'unknown'] ?? 0) + 1;

  return {
    source: HALTS_URL,
    scope: 'Single-security trading halts across US exchanges, as published by NYSE. A symbol halt does not close the exchange.',
    openHaltCount: open.length,
    byExchange,
    marketWideHalt: marketWide.length > 0,
    marketWideHalts: marketWide,
    symbols: open.slice(0, MAX_HALT_SYMBOLS),
    truncated: open.length > MAX_HALT_SYMBOLS,
  };
}

// -------------------------------------------------------------------- assembly

function loadJson(path, fallback) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return fallback;
  }
}

function buildDays({ today, holidayByDate, earlyCloseByDate, overrideByDate }) {
  const days = [];
  for (let i = -DAYS_BEHIND; i <= DAYS_AHEAD; i++) {
    const date = addDays(today, i);
    const offset = etOffset(date);
    const holiday = holidayByDate.get(date);
    const early = earlyCloseByDate.get(date);
    const override = overrideByDate.get(date);

    let type;
    let reason = null;
    let coreEnd = VENUES.XNYS.core[1];
    let coreStart = VENUES.XNYS.core[0];

    if (holiday) {
      type = 'holiday';
      reason = holiday.name + (holiday.observed ? ' (observed)' : '');
    } else if (isWeekend(date)) {
      type = 'weekend';
    } else if (early) {
      type = 'early_close';
      reason = early.reason;
      coreEnd = EARLY_CLOSE_CORE_END;
    } else {
      type = 'regular';
    }

    if (override) {
      if (override.type === 'closed') {
        type = 'unscheduled_closure';
        reason = override.reason ?? 'Unscheduled closure';
      } else if (override.type === 'early_close') {
        type = 'early_close';
        reason = override.reason ?? 'Early close';
        coreEnd = override.coreClose ?? EARLY_CLOSE_CORE_END;
      } else if (override.type === 'delayed_open') {
        reason = override.reason ?? 'Delayed open';
        coreStart = override.coreOpen ?? coreStart;
      } else if (override.type === 'note') {
        reason = [reason, override.reason].filter(Boolean).join(' — ');
      }
    }

    const closed = type === 'holiday' || type === 'weekend' || type === 'unscheduled_closure';
    const day = {
      date,
      weekday: weekdayName(date),
      type,
      open: !closed,
      reason,
      utcOffset: offset,
    };

    if (!closed) {
      const lateEnd = type === 'early_close' ? EARLY_CLOSE_LATE_END : VENUES.ARCX.lateTrading[1];
      day.sessions = {
        preMarket: span(date, [VENUES.ARCX.earlyTrading[0], coreStart], offset),
        core: span(date, [coreStart, coreEnd], offset),
        afterHours: span(date, [coreEnd, lateEnd], offset),
      };
    } else {
      day.sessions = null;
    }

    if (override) {
      day.override = { source: override.source ?? null, appliedFrom: '_data/nyse_overrides.json' };
    }
    days.push(day);
  }
  return days;
}

// ------------------------------------------------------------------------ main

const previous = loadJson(OUT, null);
const overridesFile = loadJson(OVERRIDES, { entries: [] });
const overrideEntries = (overridesFile.entries ?? []).filter((e) => e && e.date);

const today = todayInNewYork();
const nowIso = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

const sources = [];
let holidays = previous?.holidays ?? [];
let earlyCloses = previous?.earlyCloses ?? [];
let calendarOk = false;

if (!OFFLINE) {
  try {
    const html = await fetchText(CALENDAR_URL, 'hours-calendars');
    const text = htmlToText(html);
    const parsed = parseHolidays(text);
    const parsedEarly = parseEarlyCloses(text);

    // Sanity gates: a parse that produces implausible output is a failed parse.
    if (parsed.holidays.length < 18) {
      throw new Error(`only ${parsed.holidays.length} holidays parsed, expected 18+ across ${parsed.years.length} years`);
    }
    if (!parsed.years.includes(new Date(`${today}T12:00:00Z`).getUTCFullYear())) {
      throw new Error(`holiday table does not cover the current year (${parsed.years.join(', ')})`);
    }
    if (!parsedEarly.length) throw new Error('no early-close dates parsed from footnotes');

    const missingCanaries = CANARIES.filter((c) => !text.includes(c));
    if (missingCanaries.length) {
      warn(`session times on ${CALENDAR_URL} may have changed — missing expected text: ${missingCanaries.join(' / ')}. Verify VENUES in utils/nyse/build-nyse-hours.mjs.`);
    }

    holidays = parsed.holidays;
    earlyCloses = parsedEarly;
    calendarOk = true;
    sources.push({ name: 'NYSE holidays & trading hours', url: CALENDAR_URL, fetchedAt: nowIso, ok: true, holidaysParsed: holidays.length, earlyClosesParsed: earlyCloses.length });
  } catch (err) {
    warn(`holiday calendar scrape failed (${err.message}); keeping previously stored calendar`);
    sources.push({ name: 'NYSE holidays & trading hours', url: CALENDAR_URL, fetchedAt: nowIso, ok: false, error: String(err.message) });
  }
} else {
  sources.push({ name: 'NYSE holidays & trading hours', url: CALENDAR_URL, fetchedAt: previous?.asOf ?? null, ok: false, error: 'offline mode: not fetched' });
}

let halts = previous?.halts ?? null;
if (!OFFLINE) {
  try {
    halts = { ...parseHalts(await fetchText(HALTS_URL, 'trade-halts')), fetchedAt: nowIso };
    sources.push({ name: 'NYSE current trade halts', url: HALTS_URL, fetchedAt: nowIso, ok: true });
    if (halts.marketWideHalt) {
      warn(`market-wide circuit breaker present in trade-halt feed — check whether an override is needed in _data/nyse_overrides.json`);
    }
  } catch (err) {
    warn(`trade-halt scrape failed (${err.message}); keeping previous halt snapshot`);
    sources.push({ name: 'NYSE current trade halts', url: HALTS_URL, fetchedAt: nowIso, ok: false, error: String(err.message) });
    if (halts) halts.stale = true;
  }
}

if (!holidays.length) {
  console.error('::error title=nyse-hours::no holiday data available (scrape failed and no previous data to fall back on)');
  process.exit(1);
}

const days = buildDays({
  today,
  holidayByDate: new Map(holidays.map((h) => [h.date, h])),
  earlyCloseByDate: new Map(earlyCloses.map((e) => [e.date, e])),
  overrideByDate: new Map(overrideEntries.map((e) => [e.date, e])),
});

// asOf advances only on a successful calendar scrape. Everything downstream
// derives staleness from it, so a broken scraper degrades visibly.
const asOf = calendarOk ? nowIso : (previous?.asOf ?? null);
const ageDays = asOf ? (Date.now() - Date.parse(asOf)) / 86_400_000 : Infinity;
const stale = ageDays > STALE_AFTER_DAYS;

// Early closes reach years past the rolling `days` window, so spell out their
// session instants here too — they are the dates people get wrong.
const earlyClosesDetailed = earlyCloses.map((e) => {
  const offset = etOffset(e.date);
  return {
    ...e,
    utcOffset: offset,
    core: span(e.date, [VENUES.XNYS.core[0], EARLY_CLOSE_CORE_END], offset),
    afterHours: span(e.date, [EARLY_CLOSE_CORE_END, EARLY_CLOSE_LATE_END], offset),
  };
});

const todayDay = days.find((d) => d.date === today);
const summary = todayDay
  ? [
      `NYSE core trading runs 09:30–16:00 America/New_York, Monday to Friday, except on the listed holidays.`,
      `Pre-market is 04:00–09:30 (NYSE Arca; 07:00 on American/National/Texas) and after-hours is 16:00–20:00.`,
      `${today} (${todayDay.weekday}) is a ${todayDay.type.replace(/_/g, ' ')} day${todayDay.reason ? ` — ${todayDay.reason}` : ''}:`,
      todayDay.open
        ? `core session ${todayDay.sessions.core.start} (${todayDay.sessions.core.startUtc}) to ${todayDay.sessions.core.end} (${todayDay.sessions.core.endUtc}).`
        : `the exchange is closed all day.`,
      `This is the published schedule as of ${asOf}, not live exchange status.`,
    ].join(' ')
  : null;

const output = {
  $comment: 'Generated by utils/nyse/build-nyse-hours.mjs. Do not edit by hand — edit _data/nyse_overrides.json instead.',
  disclaimer:
    'Scheduled hours only, NOT live exchange status. Derived from the published NYSE holiday calendar, refreshed daily. It will not reflect an intraday halt, a technical outage, or a closure announced since asOf. Do not use for trading decisions.',
  exchange: {
    name: 'New York Stock Exchange',
    operator: 'NYSE Group / Intercontinental Exchange',
    mic: 'XNYS',
    timezone: 'America/New_York',
    country: 'US',
  },
  summary,
  asOf,
  lastCheckedAt: nowIso,
  staleAfterDays: STALE_AFTER_DAYS,
  stale,
  ageDays: Number.isFinite(ageDays) ? Math.round(ageDays * 100) / 100 : null,
  warnings,
  sources,
  today,
  window: { from: days[0].date, to: days[days.length - 1].date },
  // What "is NYSE open" usually means: the widest extended-hours window across
  // NYSE-group equity venues. Per-venue truth is in `venues`.
  consolidatedSessions: {
    timezone: 'America/New_York',
    preMarket: '04:00-09:30',
    core: '09:30-16:00',
    afterHours: '16:00-20:00',
    earlyCloseCore: '09:30-13:00',
    earlyCloseAfterHours: '13:00-17:00',
    caveats: [
      'The NYSE floor itself (Tape A, MIC XNYS) has no pre-market or after-hours session — only the 09:30-16:00 core session, with order entry queued from 06:30.',
      'The 04:00 pre-market start is NYSE Arca. NYSE American, National and Texas start early trading at 07:00.',
      'Most retail brokers accept extended-hours orders over a narrower window (often 07:00-09:30 and 16:00-20:00) and liquidity is thin.',
    ],
  },
  venues: VENUES,
  days,
  // Compact projection inlined into /nyse-hours/ so the "right now" card needs no
  // extra request. Four instants fully describe a trading day: pre-market open,
  // core open, core close, after-hours close.
  liveWindow: days.slice(DAYS_BEHIND).slice(0, 45).map((d) => ({
    date: d.date,
    type: d.type,
    open: d.open,
    reason: d.reason,
    pre: d.sessions?.preMarket.start ?? null,
    coreStart: d.sessions?.core.start ?? null,
    coreEnd: d.sessions?.core.end ?? null,
    postEnd: d.sessions?.afterHours.end ?? null,
    coreStartUtc: d.sessions?.core.startUtc ?? null,
    coreEndUtc: d.sessions?.core.endUtc ?? null,
  })),
  holidays,
  earlyCloses: earlyClosesDetailed,
  overridesApplied: overrideEntries.filter((e) => days.some((d) => d.date === e.date)),
  halts,
  meta: {
    generator: 'utils/nyse/build-nyse-hours.mjs',
    humanPage: 'https://opla.cz/nyse-hours/',
    jsonEndpoint: 'https://opla.cz/data/nyse-hours.json',
    repository: 'https://github.com/oplatek/oplatek.github.io',
    license: 'CC0-1.0 for this compilation; underlying facts are published by NYSE.',
  },
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, `${JSON.stringify(output, null, 2)}\n`);

const todayEntry = days.find((d) => d.date === today);
console.log(`wrote ${OUT}`);
console.log(`  asOf=${asOf} stale=${stale} holidays=${holidays.length} earlyCloses=${earlyCloses.length}`);
console.log(`  today ${today} (${todayEntry?.weekday}): ${todayEntry?.type}${todayEntry?.reason ? ` — ${todayEntry.reason}` : ''}`);
console.log(`  halts: ${halts ? `${halts.openHaltCount} open, marketWide=${halts.marketWideHalt}` : 'none'}`);

if (stale) {
  console.error(`::error title=nyse-hours::calendar data is ${output.ageDays} days old (> ${STALE_AFTER_DAYS}); the NYSE scrape has been failing. Fix the parser or update _data/nyse_hours.json by hand.`);
  process.exit(1);
}
