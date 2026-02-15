# PantryHelper - Home Assistant Addon

![PantryHelper Logo](icon.png)

AI-powered pantry management and recipe suggestions for Home Assistant.

## About

PantryHelper helps you manage your kitchen inventory and discover recipes based on what you have. Simply photograph your pantry or fridge, and the addon will:

- 🔍 **Identify ingredients** using OpenAI Vision (GPT-4o)
- 📝 **Track your pantry** with a built-in inventory system
- 👨‍🍳 **Suggest recipes** from TheMealDB and AI-generated options
- ⭐ **Save favorites** for future cooking
- 🔄 **Sync with Mealie** (optional) for recipe management

## Features

- **Photo-based ingredient detection** - Use your phone camera to scan pantry items
- **Smart recipe matching** - Find recipes that use 50%+ of your ingredients
- **Hybrid recipe sources** - Real recipes from TheMealDB + AI-generated suggestions
- **Pantry inventory** - Full CRUD management with quantities and categories
- **Favorites system** - Save and manage your favorite recipes
- **Mealie integration** - Optional sync with self-hosted Mealie server
- **Mobile-friendly UI** - Responsive design with React and Tailwind CSS

## Requirements

- **OpenAI API Key** (Required) - For ingredient detection and AI recipes
  - Get yours at: https://platform.openai.com/api-keys
  - Uses GPT-4o model (vision + text)
  - Cost: ~$0.01-0.05 per image scan
  
- **Mealie Server** (Optional) - For advanced recipe management
  - Self-hosted recipe manager: https://mealie.io
  - Can be another Home Assistant addon

## Installation

1. **Add this repository to Home Assistant:**
   - Go to **Settings** → **Add-ons** → **Add-on Store**
   - Click the ⋮ menu (top right) → **Repositories**
   - Add: `https://github.com/edrft99/pantryhelper`

2. **Install PantryHelper:**
   - Refresh the Add-on Store
   - Find "PantryHelper" in the list
   - Click **Install**

3. **Configure the addon:**
   - Go to the **Configuration** tab
   - Enter your **OpenAI API Key** (required)
   - Optionally enter Mealie URL and token
   - Click **Save**

4. **Start the addon:**
   - Go to the **Info** tab
   - Click **Start**
   - Enable **Start on boot** (recommended)
   - Click **Show in sidebar** for quick access

## Configuration

### Required Settings

- **openai_api_key**: Your OpenAI API key
  - Format: `sk-...`
  - Required for all functionality

### Optional Settings

- **mealie_url**: URL of your Mealie instance
  - Example: `http://homeassistant.local:9000`
  - Leave empty to disable Mealie integration
  
- **mealie_api_token**: Mealie API authentication token
  - Get from Mealie: Settings → API Tokens
  - Required only if using Mealie integration

## Usage

1. **Access PantryHelper** via the sidebar icon or Ingress panel
2. **Take a photo** of your pantry, fridge, or ingredient labels
3. **Review detected ingredients** and edit if needed
4. **Add to pantry** to build your inventory
5. **Get recipes** based on your available ingredients
6. **Save favorites** for recipes you want to try
7. **Export to Mealie** (optional) for meal planning

## Support

- **Issues**: https://github.com/edrft99/pantryhelper/issues
- **Documentation**: See DOCS.md for detailed guides

## License

MIT License - See repository for details
