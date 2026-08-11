---
layout: post
title: A static site can serve agents too. I built one that answers "is the NYSE open?"
author: Ondrej Platek
tags: LLM, agents, Claude Code, MCP, static site, Jekyll, GitHub Actions, timezones, NYSE, vibe coding
---


I asked what I thought was a silly question: **can a static site be useful to an LLM agent?** Not "can an agent read my blog post", but can it answer a live-ish factual question that an agent would otherwise get wrong.

The test question I picked: **is the New York Stock Exchange open right now?**

The result is live: **[opla.cz/nyse-hours](/nyse-hours/)** for humans, and [`/data/nyse-hours.json`](https://opla.cz/data/nyse-hours.json) for agents. Built with Claude Code in one session, and it refreshes itself every morning without me.

## Why that question is annoyingly hard

It looks like a one-liner — 9:30 to 4, right? — and then it isn't:

- **Holidays.** Ten a year, and they move. Good Friday is not a federal holiday but the exchange closes anyway. In 2028 New Year's Day falls on a Saturday and there is simply *no* New Year's holiday.
- **Early closes.** The day after Thanksgiving and a few others close at 1 p.m. These live in *footnotes* on the NYSE page, not in the table.
- **Daylight saving.** New York and Prague do not switch on the same date, so for two weeks a year every "London/Prague is 6 hours ahead" rule of thumb quietly breaks.
- **"NYSE" is not one thing.** This one I did not know before this project. The floor — Tape A, the exchange people picture — has **no pre-market and no after-hours session at all**. It queues orders from 6:30 and trades 9:30 to 4. Extended-hours trading in NYSE-listed stocks happens on *NYSE Arca* (4:00 a.m.!) and on American/National/Texas (7:00). Flatten all that into "pre-market is 4:00–9:30" and you have written something false.
- **Unscheduled closures.** Days of mourning, hurricanes, technical outages. No calendar has these in advance.

An LLM asked this from memory will answer confidently and be wrong about the corner cases — which are exactly the cases where someone bothers to ask.

## First finding: you cannot host MCP on GitHub Pages

My first instinct was an MCP server. That is the obvious 2026 answer for "give agents a tool".

It does not work here, and the reason is short: MCP's Streamable HTTP transport requires the client to **POST** JSON-RPC to your endpoint. GitHub Pages serves `GET` and `HEAD` and answers everything else with **405**. There is no clever workaround — you need a runtime.

Your real options:

1. **A JSON file plus `llms.txt`.** Zero infrastructure, works today with every agent that has a fetch tool.
2. **A stdio MCP server on npm** that fetches that JSON. The "server" runs on the *client* via `npx`. Your site stays static and you still get a genuine MCP tool.
3. **A remote MCP endpoint** on a Cloudflare Worker or similar. A runtime, just a small one.

I built option 1, because 2 and 3 both need it anyway. It boils down to **one correct, machine-readable file.** Everything else is plumbing on top.

## What it actually does

A Node script (no dependencies) scrapes the published NYSE calendar and the trade-halt feed, and writes one JSON file. GitHub Actions runs it **daily at 07:10 UTC** — that is 03:10 in New York, after any evening announcement and about an hour before Arca's pre-market opens, so the answer is fresh before anyone starts trading. It commits only when something changed.

Sessions come out as absolute instants, with the offset *and* a UTC mirror:

```json
{
  "date": "2026-11-27",
  "type": "early_close",
  "reason": "Day after Thanksgiving",
  "sessions": {
    "core": {
      "start":    "2026-11-27T09:30:00-05:00",
      "end":      "2026-11-27T13:00:00-05:00",
      "startUtc": "2026-11-27T14:30:00Z",
      "endUtc":   "2026-11-27T18:00:00Z"
    }
  }
}
```

Never wall-clock strings. If you hand a model `"09:30"` and a timezone name you have asked it to do DST arithmetic, and it will get it wrong twice a year. Give it an instant and there is nothing left to compute.

```bash
curl -s https://opla.cz/data/nyse-hours.json | jq '{asOf, stale, summary}'
```

There is also a plain-English `summary` near the top of the file, so an agent that truncates the response still gets the answer.

## The part I actually care about: not lying when it breaks

Cached data has one nasty failure mode. The scraper breaks, nobody notices, and the site keeps cheerfully serving last year's holidays as though they were checked this morning. **A wrong answer delivered confidently is worse than no answer.**

So the data carries two different timestamps, and the distinction is the whole design:

- `asOf` — when a scrape last **succeeded**.
- `lastCheckedAt` — when the job last **ran**.

A broken scraper widens the gap between them. It cannot pretend to be fresh by running and doing nothing. On top of that: a failed fetch or an implausible parse keeps the previous good file instead of overwriting it; the page recomputes its own age **in your browser**, so a page served from a stale build admits it rather than quoting itself as current; and past ten days CI fails loudly and the JSON flips `stale: true`, with `llms.txt` telling agents to say the data is unverified instead of quoting times as fact.

For the closures nobody can scrape in advance — days of mourning, weather — there is a hand-edited `_data/nyse_overrides.json`. CI reads it and never writes it, so one commit fixes the site and the robot cannot undo it.

And everything user-facing says the same thing in plain words: **this is a published schedule, not live exchange status, and not for trading decisions.** It cannot see an intraday halt. If money depends on the answer, go to the source.

## Working with Claude Code on this

The part worth writing down, since the whole thing was built in one session.

**It checked before it built.** Instead of assuming the NYSE page was scrapable, it curled the candidate URLs first, found `/markets/hours-calendars` 302s to `/trade/hours-calendars`, and turned up an undocumented trade-halt CSV endpoint. Cheap, and it changed the design.

**It caught the domain bug I would have shipped.** The floor-versus-Arca distinction above came out of reading the actual page, not from my prompt. I asked for "pre-market and post-market hours" and would have happily shipped a single wrong range.

**It debugged its own output.** Two failures in the loop, both found by running the thing rather than by reading it: the early-close parser split sentences on periods, so `1:00 p.m.` looked like the end of a sentence and every footnote date vanished. And the validator was correctly strict for scraped days but wrongly rejected my *hand-written* overrides — a 12:00 weather close is legitimate, and the check had to learn the difference.

**The test I did not expect.** The live status card is browser JavaScript, which normally means clicking around to check it. Instead it ran that script in Node against a stubbed DOM and a frozen clock, across eight scenarios — pre-market, core, after-hours, weekend, Labor Day, the Friday before a long weekend. All eight printed and checked in seconds. That is a testing trick I am stealing for other things.

**Where I still had to be the human.** Deciding that honest staleness mattered more than always having an answer. Knowing that flipping `site.url` to HTTPS would rewrite my Atom entry IDs and re-notify every feed reader — so we left it alone and hardcoded the https links instead. The taste calls stayed mine; the grind did not.

One correction I had to make in my very first message, for the record: I typed "New York **State** Exchange". There is no such thing. It is the Stock Exchange. Even the person asking the question gets it wrong.

## Should you do this?

**If you have a static site and a fact you know well that agents get wrong — publish it as JSON, point `llms.txt` at it, and let CI keep it honest. You do not need MCP, a server, or a framework. You need one file that is correct, one job that refreshes it, and the discipline to make it admit when it is stale.**


**[See it live → opla.cz/nyse-hours](/nyse-hours/)**
