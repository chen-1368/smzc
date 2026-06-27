# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Crawl and analyze **造梦无双** (ZaoMeng WuShuang) game configuration files from its Cocos2d-js H5 online client. The game's Web entry serves JS-based config files from a CDN (`https://client-zmxyol.3304399.net/client/`) — each file exports a 2D array (header row + data rows) representing a game configuration table.

## Architecture

- **`01-crawl-method.md`** — Documentation of the crawling methodology.
- **`.firecrawl/`** — Firecrawl tool configuration for crawling/scraping.
- **`godWar-configs/`** — Downloaded game config files (JS format), one per game system. See `settings.js` for the full list of ~200 config files.

### Config File Format

Every config JS file follows this pattern:

```js
var tmp = [["header1","header2",...], [row1], [row2], ...];
(window.__IS_SERVER__ ? module.exports=tmp : (window.configData ||= {}, window.configData.<name>=tmp));
```

- First element is the header row (field names)
- Subsequent elements are data rows
- File is both Node.js (exports) and browser (window.configData) compatible

### Crawling Method Summary

1. GET `index.html` → extract `main.<hash>.js` and `src/settings.<hash>.js` URLs
2. GET `settings.<hash>.js` → parse `window._CCSettings.jsList` for full config file list
3. Download each config file individually by its full path (directory listing is blocked — 403)
4. Save to local directories organized by system

## Commands

No build system, test framework, or linter is configured. This is a data collection project.

- **Crawl a config file**: Use Firecrawl (`/firecrawl`) or direct HTTP GET to download individual config files from the CDN
- **Explore downloaded data**: Read any `.js` file in `godWar-configs/` to inspect game configuration tables
- **Add new config download**: Create a new subdirectory and follow the pattern in `01-crawl-method.md`

## Key Files

| File | Purpose |
|------|---------|
| `01-crawl-method.md` | Crawling methodology and pipeline documentation |
| `.firecrawl/settings.js` | Full jsList of all ~200 downloadable config files |
| `godWar-configs/` | Downloaded godWar (battle system) configuration data |

## Workflow Notes

- The CDN returns 403 on directory listing — always resolve exact file paths from `settings.js` before downloading
- Each config file's hash suffix (e.g., `.6acdd.js`) changes between game versions — re-fetch `settings.js` to get current hashes
- Config data is plain JS arrays, not JSON — can be `require()`'d in Node.js or loaded via `<script>` in a browser
