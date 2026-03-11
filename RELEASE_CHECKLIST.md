# Release Checklist v1.1.0

## ✅ Pre-Release (Completed)

- [x] Updated version to 1.1.0 in all files
  - [x] package.json
  - [x] src-tauri/tauri.conf.json
  - [x] src-tauri/Cargo.toml

- [x] Added footer with greggant.com link

- [x] Created migration notice for Electron users

- [x] Created automated build script (build-and-sign.sh)

- [x] Built and tested both versions:
  - [x] Tauri version (13 MB, signed & notarized)
  - [x] Electron version (192 MB, with migration notice)

## 📦 Release Files

### Tauri Version (Recommended)
```
File: Mac Video Wallpaper Manager_1.1.0_universal.dmg
Location: src-tauri/target/universal-apple-darwin/release/bundle/dmg/
Size: ~13 MB
Status: ✅ Signed ✅ Notarized ✅ Stapled
Architectures: Intel (x86_64) + Apple Silicon (ARM64)
```

### Electron Version (Final - with migration notice)
```
File: Mac Video Wallpaper Manager-1.1.0-universal.dmg
Location: dist/
Size: ~192 MB
Status: ✅ Signed ⚠️ Not notarized (optional)
Architectures: Universal
Purpose: Auto-update from v1.0.4, shows migration banner
```

## 🚀 Release Steps

### 1. Create GitHub Release

1. Go to: https://github.com/fuzzywalrus/sonoma-wallpaper-downloader/releases/new

2. **Tag**: `v1.1.0`

3. **Title**: `v1.1.0 - Tauri Migration Release`

4. **Description**:
```markdown
# Mac Video Wallpaper Manager v1.1.0

## 🎉 Major Update: Migrated to Tauri!

This release marks a complete rewrite using modern Tauri framework.

### 🌟 What's New

- **93% Smaller**: 13 MB instead of 190 MB!
- **Faster Performance**: Instant startup, lower memory usage
- **Better Security**: Built with Rust for enhanced security
- **Universal Binary**: Works on Intel and Apple Silicon Macs
- **Footer**: Now shows version and link to greggant.com

### 📥 Downloads

**🔹 New Users - Download This:**
- **Mac Video Wallpaper Manager_1.1.0_universal.dmg** (Tauri - Recommended)
  - 13 MB, fully signed & notarized
  - Works on macOS Sonoma 14.0+
  - Intel (x86_64) + Apple Silicon (ARM64)

**🔹 Existing Users (v1.0.4):**
Your app will auto-update to the Electron version below, which will show you how to upgrade to Tauri.

- **Mac Video Wallpaper Manager-1.1.0-universal.dmg** (Electron - Final Version)
  - 192 MB, shows migration notice
  - Auto-updateable from v1.0.4
  - Directs you to download Tauri version

### ⚠️ Important for Existing Users

If you're currently using v1.0.4:
1. Your app will auto-update to this Electron version
2. You'll see a purple banner with upgrade information
3. Click "Download New Version" to get the new Tauri version
4. This is a ONE-TIME manual upgrade
5. Future updates will work automatically again!

### 🔄 What Changed

**Frontend**: Same React interface you know and love
**Backend**: Migrated from Electron (Node.js) to Tauri (Rust)
**Size**: Reduced from 190 MB to 13 MB
**Performance**: Significantly faster and more efficient

### 📊 Comparison

| Feature | Electron (Old) | Tauri (New) |
|---------|---------------|-------------|
| Size | 190 MB | 13 MB |
| Startup | ~2s | ~0.5s |
| Memory | ~200 MB | ~50 MB |
| Security | Good | Excellent |

### 🛠️ For Developers

See [MIGRATION_GUIDE.md](https://github.com/fuzzywalrus/sonoma-wallpaper-downloader/blob/main/MIGRATION_GUIDE.md) for details on the migration strategy.

**Build commands:**
```bash
# Tauri (recommended)
npm run build:sign

# Electron (deprecated)
npm run electron:build
```

### 📝 Full Changelog

See [RELEASE_NOTES_1.1.0.md](https://github.com/fuzzywalrus/sonoma-wallpaper-downloader/blob/main/RELEASE_NOTES_1.1.0.md)

---

**Created by** [Greg Gant](https://greggant.com)
```

5. **Upload Files**:
   - ✅ `Mac Video Wallpaper Manager_1.1.0_universal.dmg` (Tauri - from src-tauri/target/)
   - ✅ `Mac Video Wallpaper Manager-1.1.0-universal.dmg` (Electron - from dist/)
   - ✅ `latest-mac.yml` (if exists in dist/ - for Electron auto-update)

6. **Check "Set as the latest release"**

7. **Publish Release**

### 2. Update README.md

Update the README to reflect Tauri migration:

```markdown
## Download

Download the latest version from [GitHub Releases](https://github.com/fuzzywalrus/sonoma-wallpaper-downloader/releases/latest)

**Recommended**: Download `Mac Video Wallpaper Manager_1.1.0_universal.dmg` (Tauri version)

## Features

- 🎯 13 MB lightweight application (93% smaller than before!)
- 🚀 Built with Tauri for maximum performance
- ✨ Universal binary - works on Intel and Apple Silicon Macs
- ... (rest of features)
```

### 3. Post-Release

- [ ] Test download links work
- [ ] Verify Tauri DMG has no warnings on fresh Mac
- [ ] Test that Electron users see migration banner
- [ ] Monitor download statistics
- [ ] Respond to any issues

### 4. Future Releases (v1.0.6+)

- Only build Tauri versions
- Use `latest.json` for Tauri auto-updates
- Remove Electron support

## 📊 Download Statistics to Monitor

Track which version users are downloading:
- If Tauri downloads > 90%, can deprecate Electron
- Check GitHub Insights → Traffic → Popular content

## 🐛 Known Issues

- ⚠️ Electron version shows DMG name as "(Download me)" - harmless, just cosmetic
- ⚠️ One-time manual upgrade required for existing users

## ✅ Testing Checklist

- [x] Tauri version launches without warnings
- [x] Electron version shows migration banner
- [x] Migration banner "Download" button works
- [x] Both versions can download wallpapers
- [x] Footer shows correct version and link
- [x] Code signing verified
- [x] Notarization verified (Tauri)
- [x] Gatekeeper approves (Tauri)

## 📞 Support

If users have issues:
1. Direct them to the Tauri version (recommended)
2. Ensure they're on macOS Sonoma 14.0+
3. Check GitHub issues for similar problems
4. Create new issue if needed

---

**Ready to release!** 🚀
