# PantryHelper Documentation

Complete guide for installing, configuring, and using PantryHelper on Home Assistant.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Usage Guide](#usage-guide)
- [Mealie Integration](#mealie-integration)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

---

## Installation

### Prerequisites

- Home Assistant OS, Supervised, or Container installation
- OpenAI API key (required)
- Internet connection for API access

### Step-by-Step Installation

1. **Add the Repository**
   ```
   Settings → Add-ons → Add-on Store → ⋮ (menu) → Repositories
   Add: https://github.com/edrft99/pantryhelper
   ```

2. **Install the Addon**
   - Refresh the store page
   - Find "PantryHelper"
   - Click **Install** (may take a few minutes)

3. **Configure**
   - Go to Configuration tab
   - Enter your OpenAI API key
   - Save configuration

4. **Start**
   - Go to Info tab
   - Click **Start**
   - Wait for "Started" status (30-60 seconds first time)
   - Enable "Start on boot" for automatic startup

5. **Access**
   - Click **Open Web UI** or
   - Use the sidebar icon (if "Show in sidebar" is enabled)

---

## Configuration

### OpenAI API Key (Required)

**What is it?**
The OpenAI API key allows PantryHelper to use GPT-4o for:
- Identifying ingredients from photos
- Generating recipe suggestions when real recipes are scarce

**How to get one:**
1. Visit https://platform.openai.com/api-keys
2. Sign up or log in
3. Create a new API key
4. Copy the key (starts with `sk-...`)
5. Paste into addon configuration

**Cost considerations:**
- Image scans: ~$0.01-0.05 per photo
- Recipe generation: ~$0.02-0.10 per request
- Suggested budget: $5-10/month for typical household use
- You can set usage limits in your OpenAI account

### Mealie Integration (Optional)

**What is Mealie?**
Mealie is a self-hosted recipe manager with meal planning, shopping lists, and more.

**Why integrate?**
- Automatic pantry sync: Items added to PantryHelper appear in Mealie's foods database
- Manual recipe export: Send your favorite recipes to Mealie
- Unified recipe management across multiple sources

**Setup:**

1. **Install Mealie** (if not already installed)
   - Available as a Home Assistant addon
   - Or use standalone Docker installation

2. **Get API Token**
   - Open Mealie
   - Go to Settings → API Tokens
   - Create new token
   - Copy the token value

3. **Configure PantryHelper**
   ```
   mealie_url: http://homeassistant.local:9000
   mealie_api_token: <your-token-here>
   ```

4. **Test Connection**
   - Start PantryHelper
   - Check logs for "Mealie integration enabled"
   - Add an item to pantry, verify it appears in Mealie foods

**Note:** If Mealie is unreachable, PantryHelper continues to work locally without sync.

---

## Usage Guide

### 1. Scanning Ingredients

**From Homepage:**
1. Click "Take Photo" to use camera OR
2. Click "Upload from Gallery" to select existing photos
3. You can select multiple photos at once
4. Review the thumbnail grid
5. Click "Scan Photos" to detect ingredients

**Tips for best results:**
- Good lighting helps accuracy
- One category per photo (e.g., all spices, all produce)
- Clear labels visible
- Avoid extreme angles

### 2. Managing Pantry

**Add Items:**
- After scanning, review detected ingredients
- Edit names, quantities, or categories
- Click "Add All to Pantry"
- Or manually add from Pantry page

**Edit Items:**
- Go to Pantry page
- Click quantity/unit to edit inline
- Changes save automatically
- Syncs to Mealie if configured

**Delete Items:**
- Click trash icon on individual items
- Or use "Clear All" to empty entire pantry

**Search:**
- Use search bar to filter items
- Searches by name and category

### 3. Finding Recipes

**Get Suggestions:**
1. Make sure you have items in your pantry
2. Go to Recipes page
3. Click "Get Recipe Suggestions"
4. Wait for results (5-15 seconds)

**How it works:**
- Queries TheMealDB for real recipes
- Filters to recipes using 50%+ of your ingredients
- Supplements with AI-generated recipes if needed
- Shows match percentage for real recipes

**Recipe Sources:**
- 🔵 **TheMealDB**: Free, real, community recipes
- 🟣 **AI Generated**: Custom recipes from OpenAI

### 4. Saving Favorites

**Save a Recipe:**
- Click the heart icon on any recipe card
- Recipe is saved to Favorites page
- Persist across addon restarts

**Export to Mealie:**
- Click "Add to Mealie" button (if configured)
- Recipe is sent to your Mealie instance
- Can now use Mealie's meal planning features

**Remove from Favorites:**
- Click the filled heart icon to unfavorite
- Or delete from Favorites page

---

## Mealie Integration

### What Gets Synced?

**Automatic (Pantry → Mealie Foods):**
- Add item: Creates food in Mealie
- Update quantity: Updates food in Mealie
- Delete item: Removes food from Mealie
- Uses name-based matching

**Manual (Recipe Export):**
- Click "Add to Mealie" on any recipe
- Sends recipe with ingredients, instructions, metadata
- Appears in Mealie's recipe database

### Sync Behavior

- **Non-blocking**: If Mealie is down, pantry operations continue locally
- **Name-based**: Matches foods by name (case-insensitive)
- **Overwrite**: Updating pantry item overwrites Mealie food
- **No import**: PantryHelper doesn't import from Mealie (one-way sync)

### Troubleshooting Mealie

**"Mealie integration disabled"**
- Check mealie_url and mealie_api_token are set
- Restart addon after configuration changes

**"Mealie connection failed"**
- Verify Mealie is running
- Check URL is correct (include http://)
- Test with: `curl http://your-mealie-url/api/docs`
- Check API token is valid in Mealie settings

**Items not syncing**
- Check PantryHelper logs for errors
- Verify network connectivity between addons
- Try manually re-adding an item

---

## Troubleshooting

### Addon Won't Start

**Check logs:**
```
Settings → Add-ons → PantryHelper → Log tab
```

**Common issues:**
- Missing OpenAI API key: Configure in Configuration tab
- Invalid API key: Verify key starts with `sk-` and is active
- Port conflict: Rarely an issue with ingress, check if port 3001 is used

### Image Scan Fails

**"Failed to detect ingredients"**
- Check OpenAI API key is valid
- Verify internet connection
- Try a clearer photo with better lighting
- Check OpenAI account has credits

**"Image too large"**
- Photos are auto-compressed to 1.5MB
- If still failing, reduce resolution before upload

### Recipes Not Loading

**"No recipes found"**
- Ensure you have items in pantry
- TheMealDB may have limited matches for your ingredients
- AI recipes should still generate if OpenAI key is valid

**"Failed to generate recipes"**
- Check OpenAI API key and credits
- Check internet connection
- Try again with fewer ingredients

### Favorites Not Saving

**Database persistence:**
- Favorites stored in `/data/pantryhelper.db`
- Included in Home Assistant snapshots
- If losing data on restart, check addon logs for DB errors

### UI Not Loading

**Blank page or 404 errors:**
- Hard refresh browser: Ctrl+Shift+R or Cmd+Shift+R
- Clear browser cache
- Check addon is running (Info tab shows "Started")
- Try incognito/private window

**Ingress not working:**
- Access via external port: `http://homeassistant.local:3001`
- Check Home Assistant reverse proxy settings
- Restart addon

---

## FAQ

### General

**Q: How much does it cost to run?**
A: Only OpenAI API costs apply (~$5-10/month for typical use). TheMealDB is free.

**Q: Can I use it offline?**
A: No, requires internet for OpenAI and TheMealDB APIs.

**Q: Does it work on mobile?**
A: Yes! Mobile-responsive design, works in HA Companion app browser.

**Q: Can multiple users access it?**
A: Yes, but single shared pantry per HA instance. HA Ingress provides authentication.

### Technical

**Q: What architectures are supported?**
A: aarch64 (HA Green, Pi 4/5) and amd64 (x86 PCs, VMs)

**Q: Where is data stored?**
A: SQLite database at `/data/pantryhelper.db`, included in HA snapshots

**Q: Can I backup my data?**
A: Yes, use Home Assistant's snapshot/backup feature

**Q: How do I upgrade the addon?**
A: Add-on Store → PantryHelper → Check for updates → Update

### Privacy & Security

**Q: What data is sent to OpenAI?**
A: Only the photos you scan and your pantry ingredient list for recipe generation.

**Q: Is my data private?**
A: Photos are processed in-memory, not stored. Database is local. OpenAI API follows their privacy policy.

**Q: Can I self-host the AI models?**
A: Not currently. Future versions may support local vision models.

### Features

**Q: Can I manually add ingredients without photos?**
A: Yes, go to Pantry page → Add Item manually

**Q: Does it track expiration dates?**
A: Not yet - planned for future version

**Q: Can I import recipes from other sources?**
A: Not directly. You can favorite generated recipes or use Mealie integration.

**Q: Will it integrate with HA cameras?**
A: Planned for future - currently uses web camera/file upload

---

## Advanced

### Port Mapping (Alternative Access)

If ingress isn't working, you can access via direct port:

```yaml
# config.json (manual edit)
"ports": {
  "3001/tcp": 3001
}
```

Then access at: `http://homeassistant.local:3001`

### Environment Variables (Development)

For local development outside HA:

```bash
OPENAI_API_KEY=sk-...
MEALIE_URL=http://localhost:9000
MEALIE_API_TOKEN=token
NODE_ENV=development
PORT=3001
```

### Database Query

To inspect database directly:

```bash
# In HA terminal addon or SSH
sqlite3 /data/pantryhelper.db "SELECT * FROM pantry_items;"
```

---

## Support & Contributing

- **Bug Reports**: https://github.com/edrft99/pantryhelper/issues
- **Feature Requests**: GitHub issues with `enhancement` label
- **Source Code**: https://github.com/edrft99/pantryhelper

---

## Changelog

### v1.0.0 - Initial Release
- AI-powered ingredient detection
- Pantry inventory management
- Hybrid recipe suggestions (TheMealDB + AI)
- Favorites system
- Mealie integration
- Home Assistant addon with Ingress support
