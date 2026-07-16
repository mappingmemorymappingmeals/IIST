# 🚀 GitHub Pages Hosting Guide
## Mapping Memory, Mapping Meals — Step-by-Step Deployment

Follow these steps exactly. Total time: ~10 minutes. Cost: FREE forever.

---

## WHAT'S IN THIS PACKAGE

| File | Purpose |
|---|---|
| `index.html` | The complete website (MUST be named exactly `index.html`) |
| `README.md` | Repository front page — shows project info on GitHub |
| `LICENSE` | CC BY 4.0 + Data Shield notice |
| `robots.txt` | Blocks AI training crawlers (Indigenous data sovereignty) |
| `.nojekyll` | Tells GitHub to serve files directly (faster, more reliable) |
| `404.html` | Friendly "page not found" page that redirects home |
| `HOSTING_GUIDE.md` | This guide (you can delete it after deployment) |

---

## STEP 1 — Open Your Repository

Go to: **https://github.com/mappingmemorymappingmeals/mappingmemoryproject**

(Log in with the mappingmemorymappingmeals account first.)

---

## STEP 2 — Upload All Files

1. Click the **"Add file"** button (top right of the file list)
2. Choose **"Upload files"**
3. Drag and drop ALL files from this package:
   - `index.html`
   - `README.md`
   - `LICENSE`
   - `robots.txt`
   - `.nojekyll`
   - `404.html`
4. In the commit message box, type: `Deploy project website v3`
5. Click **"Commit changes"**

⚠️ **IMPORTANT:** The main file MUST be named `index.html` — GitHub Pages
looks for this exact name to serve as your homepage. Do not rename it.

⚠️ **Note on `.nojekyll`:** This file starts with a dot and may appear
invisible in your file explorer. If drag-and-drop misses it, you can
create it directly on GitHub: Add file → Create new file → type
`.nojekyll` as the name → leave contents empty → Commit.

---

## STEP 3 — Turn On GitHub Pages

1. In your repository, click **"Settings"** (the gear tab)
2. In the left sidebar, click **"Pages"**
3. Under **"Build and deployment"**:
   - Source: **Deploy from a branch**
   - Branch: **main** — Folder: **/ (root)**
4. Click **"Save"**

---

## STEP 4 — Wait & Visit Your Live Site

GitHub takes 1–3 minutes to build. Then your site will be LIVE at:

### 🌐 https://mappingmemorymappingmeals.github.io/mappingmemoryproject/

Refresh the Settings → Pages screen — when ready, a green banner
appears with a "Visit site" button.

---

## STEP 5 — Verify Everything Works

Open the live URL and check:
- [ ] Homepage loads with the hero animation
- [ ] Navigation between all pages works
- [ ] Team photos display
- [ ] "Open Map in New Tab" opens the archive map
- [ ] "Open Full Bibliography" opens the Google Doc
- [ ] All Google Forms open (Review, Blog, Edit Data, Feedback, Contact, Mailing List)
- [ ] Social media icons link correctly
- [ ] Dark/Light theme toggle works
- [ ] FAQ accordion opens and closes
- [ ] 154 recipe videos page loads with search

---

## UPDATING THE WEBSITE LATER

Whenever you need changes:
1. Get the updated `index.html` file
2. Go to the repo → click on `index.html` → click the pencil (edit) icon
   OR use "Add file → Upload files" to replace it
3. Commit changes
4. The live site updates automatically in 1–2 minutes

---

## OPTIONAL EXTRAS (Later, If You Want)

**Custom domain** (e.g. mappingmemory.in):
Settings → Pages → Custom domain → enter your domain → follow DNS
instructions. Domains cost ~₹800–1200/year from registrars like
GoDaddy or Namecheap.

**Share with IIST:** Add Prof. Gigy J. Alex as a repository collaborator:
Settings → Collaborators → Add people — this fulfils the Endings Project
distributed-custody recommendation.

**Internet Archive backup:** Once live, submit your URL at
https://web.archive.org/save — this creates a permanent snapshot for
long-term preservation.

---

## TROUBLESHOOTING

| Problem | Fix |
|---|---|
| 404 error on the live URL | Wait 3 more minutes; confirm file is named exactly `index.html` (lowercase) |
| Old version still showing | Hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac) |
| Pages option missing in Settings | Make sure the repository is **Public** (Settings → General → Danger Zone → Change visibility) |
| Photos not loading | They are embedded inside index.html — re-upload the complete file |
| Site not updating after edit | Check the Actions tab for the build status; wait for the green tick |

---

*Questions? mappingmemory.contact@gmail.com*
