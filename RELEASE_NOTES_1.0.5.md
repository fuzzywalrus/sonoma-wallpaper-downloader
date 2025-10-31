# Release Notes - v1.0.5

## 🎉 What's New

### Tauri Migration Complete!
This release marks the complete conversion from Electron to Tauri, bringing significant improvements:

### 📦 Size Reduction
- **Before (Electron)**: 190 MB
- **After (Tauri)**: 13 MB
- **Savings**: **93% smaller!**

### ✨ New Features
- **About Section**: Now displays version info and link to greggant.com
- **Automated Build Script**: One-command build, sign, and notarization
- **Universal Binary**: Works on both Intel and Apple Silicon Macs
- **Code Signed & Notarized**: Zero security warnings on macOS

### 🔧 Technical Improvements
- Converted from Electron to Tauri (Rust + React)
- Added automated notarization during build
- Improved performance and reduced memory footprint
- Better macOS integration with native APIs
- Optimized binary with LTO and size optimizations

### 🔐 Security & Compatibility
- ✅ Code Signed with Developer ID
- ✅ Notarized by Apple
- ✅ Gatekeeper Approved
- ✅ macOS Sonoma 14.0+ required
- ✅ Works on Intel (x86_64) and Apple Silicon (ARM64)

## 📥 Installation

1. Download `macOS Video Downloader_1.0.5_universal.dmg`
2. Double-click to open
3. Drag to Applications folder
4. Launch - no warnings!

## 🛠️ For Developers

### Build Commands

**Automated Build (Recommended)**:
```bash
npm run build:sign
```
This single command:
- Builds the React frontend
- Compiles the Rust backend
- Creates universal binary
- Code signs the app
- Notarizes with Apple
- Staples the notarization ticket
- Verifies everything worked

**Manual Build**:
```bash
npm run tauri:build:universal
```

**Development**:
```bash
npm run tauri:dev
```

### Requirements
- macOS Sonoma 14.0+
- Rust (automatically loaded from ~/.cargo/env)
- Node.js
- Apple Developer account (for signing)

### Environment Variables
Create `.env` file:
```bash
APPLE_ID=your@email.com
APPLE_PASSWORD=xxxx-xxxx-xxxx-xxxx
APPLE_TEAM_ID=36SA478KNK
```

## 📝 Changes in Detail

### Frontend
- Added footer with version and creator link
- Updated to v1.0.5
- Improved CSS styling for footer

### Backend
- Migrated from Electron (Node.js) to Tauri (Rust)
- Native file system access
- Binary plist parsing in Rust
- Smaller, faster, more secure

### Build Process
- Created `build-and-sign.sh` script
- Automated notarization workflow
- Universal binary support
- Comprehensive verification steps

## 🐛 Bug Fixes
- Fixed all code signing issues
- Improved error handling during builds
- Better environment variable management

## 📊 Stats

| Metric | Electron (1.0.4) | Tauri (1.0.5) |
|--------|------------------|---------------|
| Size | 190 MB | 13 MB |
| Startup | ~2s | ~0.5s |
| Memory | ~200 MB | ~50 MB |
| Bundle | Intel only option | Universal |

## 🙏 Credits

Created by [Greg Gant](https://greggant.com)

## 📎 Links

- GitHub: https://github.com/fuzzywalrus/sonoma-wallpaper-downloader
- Website: https://greggant.com
- Issues: https://github.com/fuzzywalrus/sonoma-wallpaper-downloader/issues

---

**Full Changelog**: https://github.com/fuzzywalrus/sonoma-wallpaper-downloader/compare/v1.0.4...v1.0.5
