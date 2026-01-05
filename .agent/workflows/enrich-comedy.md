---
description: Repeatable workflow for enriching the Comedy Catalogue
---

# Comedy Catalogue Enrichment Workflow

This workflow provides a deterministic, repeatable process for enriching the Comedy Catalogue with new comedians, their metadata, and video works.

## Prerequisites

- YouTube Data API v3 key configured in `youtube-adapter.js`
- Node.js environment with dependencies installed
- Access to Wikipedia for metadata extraction

## Step-by-Step Enrichment Process

### 1. Update Target Comedians List

Edit `research/comedianTargets.md` to add new comedians for enrichment.

```bash
# Open the target list
code research/comedianTargets.md
```

**Format for each comedian:**
```markdown
## **Comedian Name**
- Wikipedia: https://en.wikipedia.org/wiki/Comedian_Name
- Language: English/Hindi/Tamil
- YouTube: @channelhandle
-Notable: Key achievements
```

### 2. Run Discovery (Optional - for new un researched comedians)

Discover comedians from Wikipedia lists:

```bash
node src/mcp-tools/cli.js discover-comedians \
  --source wikipedia \
  --list "List_of_Indian_stand-up_comedians"
```

### 3. Batch Enrichment

Run the batch enrichment script:

```bash
# Dry run to preview changes
node src/mcp-tools/enrich-comedy-catalogue.js --dry-run --limit=5

// turbo
# Enrich first 5 comedians
node src/mcp-tools/enrich-comedy-catalogue.js --limit=5

// turbo
# Enrich all pending comedians
node src/mcp-tools/enrich-comedy-catalogue.js
```

**Enrichment Options:**
- `--limit=N`: Process only N comedians
- `--dry-run`: Preview without saving
- `--force`: Re-enrich existing comedians

**What the enrichment does:**
1. Extracts comedian metadata from Wikipedia (bio, awards, location)
2. Discovers YouTube channel
3. Finds 15-20 videos from personal channel
4. Searches aggregator channels (Comedy Central, Netflix, etc.)
5. Adds comedian entity to catalog
6. Links all discovered videos to comedian

### 4. Validate Enriched Data

Run validation to ensure data quality:

```bash
// turbo
node src/mcp-tools/validate-comedy-data.js
```

**Validation checks:**
- JSON schema compliance
- Required fields present
- No duplicate comedians or videos
- Comedian-video linkages are valid
- Metadata counts match actual data

### 5. Review Enriched Catalogstep

Manually review the updated catalog:

```bash
# View catalog summary
cat src/data/catalogs/comedy-index.json | grep -A 5 "metadata"

# Check entity count
jq '.entities | length' src/data/catalogs/comedy-index.json

# Check video count
jq '.videos | length' src/data/catalogs/comedy-index.json
```

### 6. Test Web Display

Start the development server and verify web display:

```bash
npm run dev
```

Navigate to:
- http://localhost:5173/ - Home page
- http://localhost:5173/#/comedy - Comedy catalogue view
- Check comedian cards display correctly
- Verify video embeds work

### 7. Commit Changes

If everything looks good, commit the enriched catalog:

```bash
git add src/data/catalogs/comedy-index.json
git add src/web/data/catalogs/comedy-index.json
git commit -m "Enrich comedy catalogue: added X comedians, Y videos"
```

---

## Troubleshooting

### Issue: YouTube API Quota Exceeded

**Symptoms:** Error message "quotaExceeded"

**Solution:**
- Wait for quota reset (midnight Pacific Time)
- Reduce `--limit` to enrich fewer comedians per day
- Use manual video entry for critical comedians

### Issue: Wikipedia Extraction Failed

**Symptoms:** "Extraction failed" for specific comedian

**Possible causes:**
- Comedian has no Wikipedia page
- Wikipedia page structure is non-standard
- Network timeout

**Solution:**
- Verify Wikipedia URL is correct
- Add comedian manually to catalog
- Check if comedian page exists in different language

### Issue: No Videos Found

**Symptoms:** "No videos found on YouTube"

**Possible causes:**
- Comedian doesn't have personal channel
- Channel name doesn't match comedian name
- Videos only on aggregator channels

**Solution:**
- Check aggregator channels manually
- Add videos manually via catalog edit
- Update comedian name to match YouTube channel name

### Issue: Duplicate Videos

**Symptoms:** Same video appears multiple times

**Solution:**
- Run validation script to identify duplicates
- Manually remove duplicates from catalog JSON
- Check deduplication logic in enrichment script

---

## Maintenance Schedule

### Weekly
- Enrich 10-15 new comedians
- Validate catalog integrity
- Update research targets list

### Monthly
- Re-enrich top comedians for new videos
- Review and remove dead/invalid video links
- Update aggregator channel list

### Quarterly
- Full catalog validation and cleanup
- Update schema if needed
- Performance review and optimization

---

## Advanced Usage

### Manual Comedian Entry

If automated enrichment fails, manually add comedian:

```javascript
{
    "@type": "Person",
    "entityId": "comedian-UNIQUE-ID",
    "name": "Comedian Name",
    "knowsLanguage": "hi",
    "homeLocation": {
        "@type": "Place",
        "name": "Mumbai, India"
    },
    "sameAs": ["https://wikipedia.org/..."],
    "genre": ["observational", "storytelling"]
}
```

### Custom Video Search

Search specific aggregator for comedian:

```bash
node -e "
import('./src/mcp-tools/youtube-adapter.js').then(yt => {
    yt.searchComedianVideos('Comedian Name', {
        channelId: 'UCxxxxxxxxxxxxxx',
        maxResults: 50
    }).then(console.log);
});
"
```

### Batch Re-enrichment

Re-enrich existing comedians with fresh data:

```bash
node src/mcp-tools/enrich-comedy-catalogue.js --force --limit=5
```

---

## Next Steps

After successful enrichment:

1. [ ] Update `comedyIndex.md` research document
2. [ ] Test web application thoroughly
3. [ ] Update this workflow if any steps changed
4. [ ] Share catalog statistics with team
5. [ ] Plan next batch of comedians to enrich
