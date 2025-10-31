# macOS Video Downloader

A React + Tarui application for downloading macOS video wallpapers (Sonoma and above).
cl
## Features

- Browse and preview available macOS video wallpapers
- Download wallpapers with progress tracking
- Automatic updates via Tauri's auto-updater
- Works on macOS systems (Sonoma and above)


![I made a video too](https://github.com/fuzzywalrus/sonoma-wallpaper-downloader/assets/2363648/71fcb78d-e6c7-47e0-9c59-defc427fc787)

[Watch the YouTube video](https://www.youtube.com/watch?v=D6yynEDJ5gI)


I took inspiration from https://github.com/mikeswanson/WallGet, which is a Wallpaper downloader for macOS Sonoma that uses a Python script to trigger downloading all of the macOS video wallpapers.

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

It has now been ported to Tauri + React to reduce the application size from 190MB+ to about 13MB.


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

If you're a developer, you may want to poke around yourself in `Library/Application Support/com.apple.idleassetsd/`. 

# Developers

This very simplistic Tauri app builds a universal binary for ARM64/x86 Macs. 

## Setup 

### Requirements 

- Node.js
- OptionaL: Xcode developer tools installed on your Mac if you'd like to notarize the application.


1. Clone the repository:
   ```
   git clone https://github.com/yourusername/macos-sonoma-video-downloader.git
   cd macos-sonoma-video-downloader
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
 npm run tauri:dev 
## Dev

 ` npm run tauri:dev ` will trigger the development environment.


## Publishing Updates

1. Update the version in `package.json`

2. Build and publish:
   ```
   npm run release
   ```

 ## Technologies Used

- React - Frontend UI framework
- Tauri - Desktop application framework
- bplist-parser - For parsing Apple Property List files
- tauri-plugin-update - For managing application updates


## Building

You'll need to create a .env file or disable signing. 

If you have a valid Apple Developer account, you should be able to create an Apple App password in the Apple Accounts Portal, and in the Apple Developer Portal an App ID. The env file should look the following for building with notarization. 

See the example .env.example file for reference.



The packaged application will be available in the `dist` directory.

## Misc Notes

## Acknowledgements

- Apple for the original wallpapers
- Tauri team for the desktop application framework
- Mike Swanson for the original WallGet project
