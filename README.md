# opla.cz
See http://opla.cz or http://oplatek.github.io/

## Tools
 - https://github.com/jekyll/jekyll
 - https://github.com/poole/poole.git
 - I just followed the [simple guide](http://joshualande.com/jekyll-github-pages-poole/)

## NYSE trading hours dataset

The site publishes a small machine-readable dataset so that agents (and people in the wrong timezone) can answer
"is the NYSE open?" without guessing.

| What | Where |
| --- | --- |
| Human page, with a live status card | [/nyse-hours/](https://opla.cz/nyse-hours/) — `nyse-hours.html` |
| JSON endpoint | [/data/nyse-hours.json](https://opla.cz/data/nyse-hours.json) — `data/nyse-hours.json` (Liquid passthrough) |
| Generated data (source of truth) | `_data/nyse_hours.json` — **do not hand-edit** |
| Manual overrides | `_data/nyse_overrides.json` — hand-edited, never written by CI |
| Generator | `utils/nyse/build-nyse-hours.mjs` |
| Invariant checks | `utils/nyse/check-nyse-hours.mjs` |
| Daily refresh | `.github/workflows/nyse-hours.yml`, 07:10 UTC |
| Agent discovery | `llms.txt` |

Local run (Node 18+, no dependencies):

```bash
node utils/nyse/build-nyse-hours.mjs      # scrape nyse.com and regenerate
node utils/nyse/check-nyse-hours.mjs      # 15 invariant checks, exit 1 on failure
node utils/nyse/build-nyse-hours.mjs --offline   # re-apply overrides without the network
```

Two rules keep the data honest:

- `asOf` advances **only** when a scrape succeeds; `lastCheckedAt` records every run. A failing scraper therefore shows
  up as growing staleness instead of silently serving old times as current. Past `staleAfterDays` (10) the workflow
  fails and both the page and the JSON say so.
- Unscheduled closures (days of mourning, weather, outages) are not in the published NYSE calendar. Add them to
  `_data/nyse_overrides.json` by hand — see the `_readme` and `_examples` keys in that file — then run the workflow
  manually. CI reads that file and never overwrites it.

It caches a published schedule. It is not live exchange status and must not be used for trading decisions.

## Bugs
Please report bugs via [Github issue tracker](https://github.com/oplatek/oplatek.github.io/issues/new).

If you do not have a Github account or want to give me more detailed feedback, drop me an email.
You can find information how to contact me on http://opla.cz
