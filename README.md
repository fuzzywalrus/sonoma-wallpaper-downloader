
![I made a video too](https://github.com/fuzzywalrus/sonoma-wallpaper-downloader/assets/2363648/71fcb78d-e6c7-47e0-9c59-defc427fc787)

[Watch the YouTube video](https://www.youtube.com/watch?v=D6yynEDJ5gI)


I took inspiration from https://github.com/mikeswanson/WallGet, which is a Wallpaper downloader for macOS Sonoma that uses a Python script to trigger downloading all of the macOS Sonoma video wallpapers.

<img width="1520" alt="Screenshot 2024-01-26 at 12 32 18 AM" src="https://github.com/fuzzywalrus/sonoma-wallpaper-downloader/assets/2363648/e0749462-b6e2-45b2-9897-cf977ffe4fc6">


However, I wanted to do something a bit different and allow users to download the individual wallpapers and save them wherever they would like. Downloads may take several minutes, depending on your internet connection. Currently, there are about 130+ videos, totaling 65 GBs of videos. Apple has introduced more videos over time on the Apple TV and will likely add more for macOS as well in future OS releases. With any luck the format will stay the same under macOS and this app will work in future version of macOS.

## Usage

The app is now signed code and features auto-updates! Download from releases and double click to run!

## Pre macOS 14 notes

Users on non-14.0+ will bounce to all the wallpapers released as of macOS 14.1.1 (23B81). It's important to note that the videos are 4k 240 FPS in HEVC. Older OSes may not support the video format. Older computesr may not be able to playback the video files.

Click the image or title to trigger a download.


## Downloading the App

Go to the [Releases](https://github.com/fuzzywalrus/sonoma-wallpaper-downloader/releases) and download either the ZIP or DMG file. It's a universal binary, so it'll work on both Apple Silicon and Intel Macs. 

## So what is this app doing exactly....?


macOS 14 Sonoma shipped with video wallpapers and screensavers akin to the Apple TV. These are video files hosted by Apple and referenced in `Library/Application Support/com.apple.idleassetsd/Customer` in several files. This application reads the appropriate files and then generates a list of the available video files to the host operating system and creates a pictorial list so users can download them.

Realistically this could be a webpage with hardcoded URLs but I wanted it to work regardless of what Apple changes. In theory, if Apple updates the OS to include new video wallpapers or makes the URLs on a per-request or per-CPU ID basis, this application should be able to automatically include them as long as the operating system has been updated.

The initial build took roughly 4+ hours, as I'd never built an electron application. For simplicity, this was built using vanilla JavaScript rather than a full-blown framework like React. Ironically, getting notarization working took many many more hours thanks to the pain of Apple's developer portal and my own ignorance around auto-updates requiring signed code.


### Future release plans

#### Current To-do:

- Custom icon
- Sorting options
- Change the update available interaction

The current design _should_ continue to work moving forward as Apple adds new videos as it reads the current OS's list provided Apple does not radically change the way Wallpapers work. Provided it doesn't require a lot of effort, I'd like to also provide a download completion status and perhaps move this to Next.js or React.

This application's intent is a simple point-and-click interface for downloading the videos. There are no plans to extend beyond this functionality. 

#### Possible features

I may pull the lists from Aerial as I noticed that they have yanked screen savers from Apple TV, as this would give users resolution options or use it to reverse engineer the URLs. (Needs further investigation).

https://github.com/JohnCoates/Aerial/blob/master/Resources/Community/en.json

https://github.com/JohnCoates/Aerial/blob/master/Aerial/Source/Models/ManifestLoader.swift

https://github.com/JohnCoates/Aerial/blob/master/Aerial/Source/Models/Sources/SourceInfo.swift

I also may move this to React and try caching the images.

Since this is an Electron app, I apologize about the 190 MB+ size. 


# Troubleshooting / FAQ


### Problem: I can't open the video:

The application at this time doesn't display the download state, you may have to wait a bit. Also, if you are running an older macOS, it may not support HEVC 4k 240 FPS video

### Can you add different resolution support or different formats?

No. These are the only URLs Apple provides to the videos. If you'd like to change the frames-per-second or resolution, Quicktime can export to different resolutions and you can control the slow motion effect within it. Alternately, Handbrake may work at converting the videos. However, this may come using Aerial as a reference point.

I will not be making conversions of the videos as they're copyright of Apple.  

### What is the copyright of the video files?

I do not know off the top of my head. This application works by reading the existing system pref files on Sonoma, particularly, only two files to generate the list of videos and thumbnails. I am not hosting or distributing anything. This is simply a different front-end for what Apple already provides.

These files were produced by Apple or licensed by Apple. I'd _highly_ recommend not using the videos for anything commercial, only personal projects or for your own personal enjoyment. 


### Can you add more videos or let me add my own videos to my system preferences? 

No. There are applications that do offer alternatives to Apple's screen savers and wallpapers. I've investigated letting users customize videos and in my very quick surface test, it doesn't appear that it is editable without going into the SQLlite database. A portion the DB is encrypted. 

If you're a developer, you may want to poke around yourself in `Library/Application Support/com.apple.idleassetsd/`. I am not a macOS developer by trade, hence why this is written in the bloatware known as Electron.

# Developers

This very simplistic electron app builds a universal binary for ARM64/x86 Macs. The `main.js` is used for the Electron layer and app.js is used for inside the app. Main.js. There isn't much use of IPC communication in this app beyond the auto-updating.

## Setup 

### Requirements 

- Node.js
- OptionaL: Xcode developer tools installed on your Mac if you'd like to notarize the application.


Run `npm install` to install the dependencies from the root directory of this program. 
## Dev

 `npm run dev` will trigger the development. Changes to `main.js` requires restarting the run dev.  If you'd like to use the inspect element within the environment, you'll need to unccomment or add `mainWindow.webContents.openDevTools()` in the main.js.

## Building

You'll need to create a .env file or disable signing. 

If you have a valid Apple Developer account, you should be able to create an Apple App password in the Apple Accounts Portal, and in the Apple Developer Portal an App ID. The env file should look the following for building with notarization. 

Place the .env file in the root of the project with the following information (replace the values with your own information).

```
DEBUG=electron-notarize*
APPLEID=your@email.com
APPLEIDPASS=your-apple-pass  
```

I followed this blog post for app signing; by followed, I mean I copied, besides updating the to the correct repos and using a .ENV rather than keychains. 
 
https://www.funtoimagine.com/blog/electron-mac-sign-and-notarize/


`npm run build`

To disable notarization/signing, in the package JSON remove or comment out the following:

```
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "entitlements": "build/entitlements.mac.plist",
      "entitlementsInherit": "build/entitlements.mac.plist",
...
     "afterSign": "scripts/notarize.js",

```

This probably doesn't need to be stated but.... DO NOT SHARE YOUR .ENV FILE ON YOUR OWN REPOSITORY. 

## Misc Notes

Updates land in:

`~/Library/Caches/sonoma-wallpapers-updater/`

The update log is in:

`~/Library/Logs/sonoma-wallpapers/main.log`

Updates require signed code and the latest release yaml file to be part of the release to function properly.

