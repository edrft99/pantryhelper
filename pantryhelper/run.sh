#!/usr/bin/env bash
set -e

echo "Starting PantryHelper..."

# Read Home Assistant options
CONFIG_PATH="/data/options.json"

if [ -f "$CONFIG_PATH" ]; then
    echo "Reading configuration from $CONFIG_PATH"
    
    # Extract configuration values
    export OPENAI_API_KEY=$(jq --raw-output '.openai_api_key // empty' $CONFIG_PATH)
    export MEALIE_URL=$(jq --raw-output '.mealie_url // empty' $CONFIG_PATH)
    export MEALIE_API_TOKEN=$(jq --raw-output '.mealie_api_token // empty' $CONFIG_PATH)
    
    # Validate required configuration
    if [ -z "$OPENAI_API_KEY" ]; then
        echo "ERROR: OpenAI API key is required!"
        echo "Please configure 'openai_api_key' in the addon configuration."
        exit 1
    fi
    
    echo "Configuration loaded successfully"
    
    # Log optional service status
    if [ -n "$MEALIE_URL" ]; then
        echo "Mealie integration enabled: $MEALIE_URL"
    else
        echo "Mealie integration disabled (optional)"
    fi
else
    echo "WARNING: Configuration file not found at $CONFIG_PATH"
    echo "Running with environment variables (development mode)"
fi

# Set production environment
export NODE_ENV=production
export PORT=3001

echo "Starting Node.js server..."
cd /app
exec node server/index.js
