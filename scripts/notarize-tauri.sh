#!/bin/bash

# Tauri Notarization Script
# This script notarizes and staples the Tauri-built DMG

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 Tauri App Notarization Script${NC}"
echo ""

# Load environment variables
if [ -f .env ]; then
    # shellcheck disable=SC2046
    export $(grep -v '^#' .env | xargs)
    echo -e "${GREEN}✅ Loaded .env file${NC}"
else
    echo -e "${RED}❌ .env file not found. Please create it with your Apple credentials.${NC}"
    echo "See .env.example for the template"
    exit 1
fi

# Check required variables (use the same names as .env and build-and-sign.sh)
if [ -z "$APPLE_ID" ] || [ -z "$APPLE_PASSWORD" ] || [ -z "$APPLE_TEAM_ID" ]; then
    echo -e "${RED}❌ Missing required environment variables${NC}"
    echo "Required: APPLE_ID, APPLE_PASSWORD, APPLE_TEAM_ID"
    exit 1
fi

# Find the DMG file (current version)
DMG_PATH="src-tauri/target/universal-apple-darwin/release/bundle/dmg/Mac Video Wallpaper Manager_1.1.0_universal.dmg"

if [ ! -f "$DMG_PATH" ]; then
    echo -e "${RED}❌ DMG not found at: $DMG_PATH${NC}"
    echo "Please build the app first: npm run tauri:build:universal"
    exit 1
fi

echo -e "${BLUE}📦 Found DMG: $DMG_PATH${NC}"
echo ""

# Submit for notarization
echo -e "${BLUE}📤 Submitting for notarization...${NC}"
xcrun notarytool submit "$DMG_PATH" \
    --apple-id "$APPLE_ID" \
    --password "$APPLE_PASSWORD" \
    --team-id "$APPLE_TEAM_ID" \
    --wait

# Check if notarization was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Notarization successful!${NC}"
    echo ""

    # Staple the notarization ticket
    echo -e "${BLUE}📎 Stapling notarization ticket...${NC}"
    xcrun stapler staple "$DMG_PATH"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Notarization ticket stapled!${NC}"
        echo ""
        echo -e "${GREEN}🎉 Your app is now notarized and ready for distribution!${NC}"
        echo ""
        echo "DMG location: $DMG_PATH"
    else
        echo -e "${RED}❌ Failed to staple notarization ticket${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Notarization failed${NC}"
    echo "Check the errors above for details"
    exit 1
fi

# Verify notarization
echo ""
echo -e "${BLUE}🔍 Verifying notarization...${NC}"
spctl -a -vvv -t install "$DMG_PATH"

echo ""
echo -e "${GREEN}✅ All done!${NC}"
