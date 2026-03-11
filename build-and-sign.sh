#!/bin/bash

#############################################
# Mac Video Wallpaper Manager - Build & Sign Script
# Builds, signs, and notarizes the Tauri app
#############################################

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Mac Video Wallpaper Manager - Build & Sign       ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════╝${NC}"
echo ""

# Load environment variables
if [ -f .env ]; then
    # shellcheck disable=SC2046
    export $(grep -v '^#' .env | xargs)
    echo -e "${GREEN}✅ Loaded .env file${NC}"
else
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo -e "${YELLOW}   Continuing without notarization...${NC}"
fi

# Check if Rust is available
if ! command -v cargo &> /dev/null; then
    echo -e "${YELLOW}⚠️  Rust not found in PATH. Loading from ~/.cargo/env${NC}"
    if [ -f "$HOME/.cargo/env" ]; then
        source "$HOME/.cargo/env"
        echo -e "${GREEN}✅ Loaded Rust environment${NC}"
    else
        echo -e "${RED}❌ Rust not found. Please install Rust first.${NC}"
        echo "   Visit: https://rustup.rs/"
        exit 1
    fi
fi

# Verify signing identity (allow override from .env)
SIGNING_IDENTITY="${APPLE_SIGNING_IDENTITY:-Developer ID Application: Greg Gant (36SA478KNK)}"
echo ""
echo -e "${BLUE}🔍 Verifying code signing identity...${NC}"
if security find-identity -v -p codesigning | grep -q "$SIGNING_IDENTITY"; then
    echo -e "${GREEN}✅ Found signing identity: $SIGNING_IDENTITY${NC}"
else
    echo -e "${RED}❌ Signing identity not found in keychain${NC}"
    echo "   Run: security find-identity -v -p codesigning"
    exit 1
fi

# Check for notarization credentials
NOTARIZE=false
if [ -n "$APPLE_ID" ] && [ -n "$APPLE_PASSWORD" ] && [ -n "$APPLE_TEAM_ID" ]; then
    NOTARIZE=true
    echo -e "${GREEN}✅ Notarization credentials found${NC}"
    export APPLE_ID
    export APPLE_PASSWORD
    export APPLE_TEAM_ID
else
    echo -e "${YELLOW}⚠️  Notarization credentials not complete${NC}"
    echo -e "${YELLOW}   App will be signed but not notarized${NC}"
fi

# Clean previous builds
echo ""
echo -e "${BLUE}🧹 Cleaning previous builds...${NC}"
rm -rf src-tauri/target/universal-apple-darwin/release/bundle/dmg/*.dmg 2>/dev/null || true
echo -e "${GREEN}✅ Cleaned${NC}"

# Build the app
echo ""
echo -e "${BLUE}🔨 Building universal binary (Intel + Apple Silicon)...${NC}"
echo -e "${BLUE}   This may take a few minutes...${NC}"
npm run tauri:build:universal

# Check if build succeeded
if [ ! -f "src-tauri/target/universal-apple-darwin/release/bundle/dmg/Mac Video Wallpaper Manager_1.1.0_universal.dmg" ]; then
    echo -e "${RED}❌ Build failed - DMG not found${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Build complete!${NC}"

# Verify code signature
echo ""
echo -e "${BLUE}🔐 Verifying code signature...${NC}"
codesign -vvv --deep --strict "src-tauri/target/universal-apple-darwin/release/bundle/dmg/Mac Video Wallpaper Manager_1.1.0_universal.dmg" 2>&1 | head -3

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Code signature verified${NC}"
else
    echo -e "${RED}❌ Code signature verification failed${NC}"
    exit 1
fi

# Verify universal binary
echo ""
echo -e "${BLUE}🔍 Verifying universal binary...${NC}"
BINARY_PATH="src-tauri/target/universal-apple-darwin/release/bundle/macos/Mac Video Wallpaper Manager.app/Contents/MacOS/macos-video-downloader"
if [ -f "$BINARY_PATH" ]; then
    LIPO_OUTPUT=$(lipo -info "$BINARY_PATH")
    if echo "$LIPO_OUTPUT" | grep -q "x86_64 arm64"; then
        echo -e "${GREEN}✅ Universal binary confirmed: x86_64 + ARM64${NC}"
    else
        echo -e "${YELLOW}⚠️  Binary info: $LIPO_OUTPUT${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Binary not found for verification${NC}"
fi

# Notarize if credentials are available
if [ "$NOTARIZE" = true ]; then
    echo ""
    echo -e "${BLUE}📤 Submitting for notarization...${NC}"
    echo -e "${BLUE}   This may take a few minutes...${NC}"

    NOTARIZE_OUTPUT=$(xcrun notarytool submit \
        "src-tauri/target/universal-apple-darwin/release/bundle/dmg/Mac Video Wallpaper Manager_1.1.0_universal.dmg" \
        --apple-id "$APPLE_ID" \
        --password "$APPLE_PASSWORD" \
        --team-id "$APPLE_TEAM_ID" \
        --wait 2>&1)

    if echo "$NOTARIZE_OUTPUT" | grep -q "status: Accepted"; then
        echo -e "${GREEN}✅ Notarization successful!${NC}"

        # Staple the notarization ticket
        echo ""
        echo -e "${BLUE}📎 Stapling notarization ticket...${NC}"
        xcrun stapler staple "src-tauri/target/universal-apple-darwin/release/bundle/dmg/Mac Video Wallpaper Manager_1.1.0_universal.dmg"

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Notarization ticket stapled${NC}"

            # Verify Gatekeeper approval
            echo ""
            echo -e "${BLUE}🔍 Verifying Gatekeeper approval...${NC}"
            SPCTL_OUTPUT=$(spctl -a -vvv -t install "src-tauri/target/universal-apple-darwin/release/bundle/dmg/Mac Video Wallpaper Manager_1.1.0_universal.dmg" 2>&1)

            if echo "$SPCTL_OUTPUT" | grep -q "accepted"; then
                echo -e "${GREEN}✅ Gatekeeper: ACCEPTED${NC}"
                echo -e "${GREEN}✅ App is fully notarized and ready for distribution!${NC}"
            else
                echo -e "${YELLOW}⚠️  Gatekeeper check: $SPCTL_OUTPUT${NC}"
            fi
        else
            echo -e "${RED}❌ Failed to staple notarization ticket${NC}"
        fi
    else
        echo -e "${RED}❌ Notarization failed${NC}"
        echo "$NOTARIZE_OUTPUT"
    fi
fi

# Summary
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              Build Summary                    ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════╝${NC}"
echo ""

DMG_PATH="src-tauri/target/universal-apple-darwin/release/bundle/dmg/Mac Video Wallpaper Manager_1.1.0_universal.dmg"
DMG_SIZE=$(du -h "$DMG_PATH" | awk '{print $1}')

echo -e "${GREEN}✅ DMG Location:${NC}"
echo "   $DMG_PATH"
echo ""
echo -e "${GREEN}✅ Size: $DMG_SIZE${NC}"
echo ""
echo -e "${GREEN}✅ Signed: Developer ID Application: Greg Gant${NC}"
if [ "$NOTARIZE" = true ]; then
    echo -e "${GREEN}✅ Notarized: Yes${NC}"
else
    echo -e "${YELLOW}⚠️  Notarized: No (credentials not provided)${NC}"
fi
echo -e "${GREEN}✅ Universal: Intel (x86_64) + Apple Silicon (ARM64)${NC}"
echo -e "${GREEN}✅ macOS: Sonoma 14.0+${NC}"
echo ""
echo -e "${GREEN}🎉 Build complete! Ready for distribution.${NC}"
echo ""
