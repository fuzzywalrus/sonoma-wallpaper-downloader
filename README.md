# The Sonoma Video Wallpaper Downloader

![Sonoma Video Wallpaper Downloader](http://blog.greggant.com/images/posts/2024-01-24-sonoma-downloader-v1.png)

I took inspiration from https://github.com/mikeswanson/WallGet, which is a Wallpaper downloader for macOS Sonoma that uses a Python script to trigger downloading all of the macOS Sonoma video wallpapers.

However, I wanted to do something a bit different and allow users to download the individual wallpapers and save them wherever they would like. Downloads may take several minutes, depending on your internet connection. Currently, there are about 130+ videos, totaling 65 GBs of videos. Apple has introduced more videos over time on the Apple TV and will likely add more for macOS as well in future OS releases. With any luck the format will stay the same under macOS and this app will work in future version of macOS.

## Usage

![Sonoma Video Wallpaper Downloader Cannot Be Verified](http://blog.greggant.com/images/posts/2024-01-24-cannot-be-verified.png)

This is currently an unsigned application. You will receive an unidentified developer message. To bypass this error, right-click ( control-click or two-finger click on a trackpad) and select open.

![Sonoma Video Wallpaper Downloader right](http://blog.greggant.com/images/posts/2024-01-24-right-click.png)


## Pre macOS 14 notes

Users on non-14.0+ will bounce to all the wallpapers released as of macOS 14.1.1 (23B81). It's important to note that the videos are 4k 240 FPS in HEVC. Older OSes may not support the video format. Older computesr may not be able to playback the video files.

Click the image or title to trigger a download.


## Downloading the App

Go to the [Releases](https://github.com/fuzzywalrus/sonoma-wallpaper-downloader/releases) and download either the ZIP or DMG file. It's a universal binary, so it'll work on both Apple Silicon and Intel Macs. 

## So what is this app doing exactly....?

macOS 14 Sonoma shipped with video wallpapers and screensavers akin to the Apple TV. These are video files hosted by Apple and referenced in `Library/Application Support/com.apple.idleassetsd/Customer` in several files. This application reads the appropriate files and then generates a list of the available video files to the host operating system and creates a pictorial list so users can download them.

In theory, if Apple updates the OS to include new video wallpapers, this application should be able to automatically include them as long as the operating system has been updated.

The initial build took roughly 4+ hours, as I'd never built an electron application. For simplicity, this was built using vanilla JavaScript rather than a full-blown framework like React.


### Future release plans

he current design _should_ continue to work moving forward as Apple adds new videos as it reads the current OS's list provided Apple does not radically change the way Wallpapers work. Provided it doesn't require a lot of effort, I'd like to also provide a download completion status and perhaps move this to Next.js or React.

This application's intent is a simple point-and-click interface for downloading the videos. There are no plans to extend beyond this functionality. 

Since this is an Electron app, I apologize about the 190 MB+ size. 


# Troubleshooting / FAQ


### Problem: I can't open the app!

Currently this app is unsigned code and macOS does not like that. Right click and select open, then open again. 

### Problem: I can't open the video:

The application at this time doesn't display the download state, you may have to wait a bit. Also, if you are running an older macOS, it may not support HEVC 4k 240 FPS video

### Can you add different resolution support or different formats?

No. These are the only URLs Apple provides to the videos. If you'd like to change the frames-per-second or resolution, Quicktime can export to different resolutions and you can control the slow motion effect within it. Alternately, Handbrake may work at converting the videos.

I will not be making conversions of the videos as they're copyright of Apple. 

### What is the copyright of these files?

I do not know off the top of my head. This application works by reading the existing system pref files on Sonoma, particularly, only two files to generate the list of videos and thumbnails. I am not hosting or distributing anything. This is simply a different front-end for what Apple already provides.

These files were produced by Apple or licensed by Apple. I'd _highly_ recommend not using the videos for anything commercial, only personal projects or for your own personal enjoyment. 

### Can you add more videos or let me add my own videos to my system preferences? 

No. There are applications that do offer alternatives to Apple's screen savers and wallpapers. I've investigated letting users customize videos and in my very quick surface test, it doesn't appear that it is editable without going into the SQLlite database. A portion the DB is encrypted. 

If you're a developer, you may want to poke around yourself in `Library/Application Support/com.apple.idleassetsd/`. I am not a macOS developer by trade, hence why this is written in the bloatware known as Electron.



