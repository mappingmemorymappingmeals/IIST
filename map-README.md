# Deep Map v2

The interactive archive map of *Mapping Memory, Mapping Meals*, running inside the project website.
It needs no server: GitHub Pages serves these files as they are.

- Full screen: `https://mappingmemorymappingmeals.github.io/IIST/map.html`
- Embedded on the Archive page: `map.html?embed=1`
- Link to one entry: `map.html#entry=T-001` · one place: `map.html#place=26.4914,89.5270` · the index: `map.html#index`

## Files (all at the top level of the repository)

| File | What it holds |
|---|---|
| `map.html` | The map page |
| `map-app.js` | Map, panels, search, filters, tours, snapshot, guestbook, music |
| `map-narrate.js` | Builds Talking Tour scripts, snapshots and the five questions from archive fields |
| `map-i18n.js` | Interface labels in English, Bengali and Hindi |
| `map-icons.js`, `map-app.css` | Icons and styles |
| `map-archive.json` | The 100 entries, 17 thematic trails and the 14-layer guide |
| `map-guestbook.json` | The two Google links that switch on the shared Guestbook |
| `map-*.geojson` | West Bengal outline, districts, district label points, India states, spotlight mask |
| `map-audio-*.mp3` | The ten tribal and folk music tracks |
| `map-maplibre-gl.js`, `map-maplibre-gl.css` | MapLibre GL JS 5.24.0 (BSD-3-Clause, see `map-maplibre-LICENSE.txt`) |
| `map-prep_data.py` | Rebuilds `map-archive.json` from the original `entries.json` export |

## Updating the archive

Edit `map-archive.json` directly (each entry keeps the original field names), or regenerate it:

```
python3 map-prep_data.py path/to/entries.json map-archive.json
```

Entries without `lat`/`lng` stay in the archive index and search, and open their district on the map.

## Guestbook

GitHub Pages cannot store anything, so the shared Guestbook uses a Google Form (to receive reflections) and its response Sheet (to show them). Until `map-guestbook.json` holds both links, the Guestbook still works but keeps each visitor's reflections on their own device and says so.

One-time setup, about ten minutes:

1. In Google Forms, create a form called "Deep Map Guestbook" with five **Short answer / Paragraph** questions, titled exactly: `Name`, `Community`, `District`, `Food`, `Memory` (Memory as a Paragraph). Make none of them required in the form; the map checks the fields itself. In Settings, turn off "Collect email addresses" and "Limit to 1 response" so no sign-in is needed.
2. Click the three-dot menu → **Get pre-filled link**. Type these answers, in capitals: `NAME`, `COMMUNITY`, `DISTRICT`, `FOOD`, `MEMORY`. Click **Get link** → **Copy link**. Paste it into `formUrl`.
3. In the form's **Responses** tab, click **Link to Sheets** → create a new spreadsheet.
4. In that spreadsheet, click **Share** → General access: **Anyone with the link** → **Viewer**. Copy the sheet's address from the browser and paste it into `sheetUrl`.
5. Upload the updated `map-guestbook.json`. New reflections now appear for everyone within about a minute.

Moderation: add a column called `Hidden` to the response sheet and type `yes` in it to hide a reflection, or delete the row. To approve reflections before they appear, set `"requireApproval": true` and add a column called `Approved`; only rows with `yes` there are shown.

Privacy: the form collects only what the visitor types (name or pen name, optional community, district, linked food, and the memory). No email or account is needed.

## Notes

- Basemaps: CARTO (dark and Voyager), Esri World Imagery; terrain: AWS Terrain Tiles. All load from their public tile servers.
- Bengali and Hindi: interface labels are built in; the research text is translated by Google Translate, using the same `googtrans` cookie as the main website.
- Add `?debug` to the URL to log map loading errors in the browser console.
- Typography: Times New Roman throughout, with 14pt as the smallest size (`1rem = 14pt` in `map-app.css`).
