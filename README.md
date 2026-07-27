# India Leaders Directory

A directory of Indian political leaders (Prime Minister, Chief Ministers,
Governors, MPs, and MLAs), backed by Supabase, built with Vite + React.

## Setup

```bash
npm install
cp .env.example .env   # fill in your Supabase project URL/keys
npm run dev
```

`.env` needs, at minimum:

- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` - used by the app itself (admin panel, directory pages).
- `SUPABASE_SERVICE_ROLE_KEY` - used only by the server-side import scripts below (never bundled into client JS).

Other checks:

```bash
npm run lint    # tsc --noEmit
npm run build   # production build
```

## MLA import pipeline

Imports every state/UT Legislative Assembly's MLAs into the same `leaders`
table used by the rest of the directory (`category = 'MLA'`). The pipeline
is entirely config-driven - no state's name, PDF path, or output folder is
hardcoded anywhere in the scripts. Adding a new state means adding one line
to `config/states.json`, never adding code.

### 1. Configure states

`config/states.json` lists every state/UT with a Legislative Assembly (28
states + Delhi, Jammu & Kashmir, and Puducherry - the only Union
Territories with one). Each entry is just:

```json
{ "name": "Uttar Pradesh", "code": "up", "pdf": "data/import/up_mla_list.pdf" }
```

`code` is used to derive, by convention:
- the leader-data file: `data/import/<code>_mlas.json`
- the published-image folder: `storage/leaders/<code>/` (served at `/storage/leaders/<code>/...` from `public/`)

To add a new state, append an entry - the pipeline picks it up automatically.

### 2. Get from a source PDF to import-ready JSON

If a state publishes its member list as a PDF, drop it at the path
configured in `config/states.json` (e.g. `data/import/up_mla_list.pdf` -
gitignored, PDFs aren't committed) and run:

```bash
pip install -r scripts/requirements.txt   # PyMuPDF, one-time
python3 scripts/extract_state_mlas.py --state=up
# or, for every state that currently has a PDF in place:
python3 scripts/extract_state_mlas.py --all
```

This runs four stages (each also independently runnable for debugging, all
config-driven the same way):

| Script | What it does |
|---|---|
| `scripts/parse_pdf.py` | Extracts serial/name/party/constituency/district rows from the PDF text. |
| `scripts/extract_images.py` | Extracts embedded photos from the PDF, in page order, to `output/images/<code>/`. |
| `scripts/match_images.py` | Pairs each image to the leader it appeared next to (positional heuristic - depends on both scripts walking the PDF the same way). |
| `scripts/rename_images.py` | Renames each matched image to `<slug>.png` and rewrites `image` to the final `/storage/leaders/<code>/<slug>.png` path. |

`extract_state_mlas.py` then writes `data/import/<code>_mlas.json` and
publishes the renamed images to `public/storage/leaders/<code>/` - both
ready to commit.

A state with no PDF supplied yet is skipped with a message, not treated as
an error, so `--all` is always safe to re-run as more states' source data
arrives.

If a state doesn't publish a PDF, produce `data/import/<code>_mlas.json`
by hand (or another script) in the same shape - the importer below doesn't
care how the file was produced.

### 3. Import into Supabase

```bash
npm run import:mlas                              # every configured state that has a data file
npm run import:mlas -- --state=up                 # a single state
npm run import:mlas -- --state=up --dry-run        # preview without touching the database
npm run import:mlas -- --state=up --download-images
```

(npm needs the `--` separator to forward flags to the script - `npm run
import:mlas --state=up` *without* it is silently swallowed by npm itself.)

For every MLA, the importer generates: `slug`, `state`, `constituency`
(constituency + district), `party`, `designation`/`category` = `MLA`,
`status` = `Published`, `featured` = `false`, plus `gender`/`bio`/`image`/
`cover_image`/social links whenever the source data provides them.

**Idempotent, nationwide:** re-running an import never creates a
duplicate. A leader's slug is looked up in the database before writing; if
it belongs to the *same* person (matched on state + constituency) the
existing row is updated, otherwise a new one is inserted. This also
resolves name collisions *across* states correctly - two different
people named "Anil Kumar" in two different states get distinct slugs
(the second falls back to `anil-kumar-<constituency>`) instead of one
overwriting the other.

**Images:** each leader's `image` path is verified against `public/`
before being written - a missing file is reported and the field is left
blank rather than failing the import. With `--download-images`, a missing
image is looked up through a fallback chain (see below) and, if found,
downloaded into `public/storage/leaders/<code>/` and pointed at from there.
Unsplash (or any other stock-photo service) is never used as a fallback.

The legacy `npm run import:leaders` (no state, reads `data-store.json`'s
`directoryLeaders`) still works exactly as before - the MLA pipeline is an
addition to the same script, not a replacement.

### Official image fallback chain

Configured in `scripts/lib/imageProviders.ts`, tried in order per leader:

1. **Official Legislative Assembly website**
2. **State Government website**
3. **Wikipedia Commons**

Every state Assembly (and most state government portals) publishes its
member directory on its own site with its own layout and no public lookup
API, so (1) and (2) are implemented as defensive stubs that return no
candidate rather than guess a URL - the same pattern already used
elsewhere in this codebase for institutions with no public per-person API.
They're the extension point for a real per-site scraper once one is
written and verified against the live site. (3) is a real, working
implementation against Wikipedia Commons' public search API. It hasn't
been exercised against live Wikipedia in this environment (outbound
network here is restricted to an allowlist that doesn't include
commons.wikimedia.org) - verify it against the real API before relying on
it in production.

### Logging and reports

Every run appends to `logs/import.log` (gitignored) and prints a summary:

```
=== Import Report ===
States/files processed: 1 (Uttar Pradesh (up))
Processed: 398
Inserted: 398
Updated: 0
Skipped: 0
Failed: 0
Images missing (skipped): 398
Images downloaded: 0
=====================
```

`Failed` counts records that hit a database error; a single bad record is
logged and skipped rather than aborting the rest of the batch.

### Known data-quality caveat

Some state PDFs run a member's surname onto the same line as their party
name (a PDF text-extraction artifact), e.g. `party: "Choudhary\nBhartiya
Janata Party"` for someone actually named "Mukesh Choudhary". The pipeline
normalizes whitespace but doesn't guess at re-splitting name/party text,
to avoid silently corrupting data - review a new state's output before
publishing if this shows up.
