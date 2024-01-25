# The Sonoma Video Wallpaper Downloader

![Sonoma Video Wallpaper Downloader](http://blog.greggant.com/images/posts/2024-01-24-sonoma-downloader-v1.png)

I took inspiration from https://github.com/mikeswanson/WallGet, which is a Wallpaper downloader for macOS Sonoma that uses a Python script to trigger downloading all of the macOS Sonoma video wallpapers.

However, I wanted to do something a bit different and allow users to download the individual wallpapers and save them wherever they would like. Downloads may take several minutes, depending on your internet connection.

## Usage

![Sonoma Video Wallpaper Downloader Cannot Be Verified](http://blog.greggant.com/images/posts/2024-01-24-cannot-be-verified.png)

This is currently an unsigned application. You will receive an unidentified developer message. To bypass this error, right-click ( control-click or two-finger click on a trackpad) and select open.

![Sonoma Video Wallpaper Downloader right](http://blog.greggant.com/images/posts/2024-01-24-right-click.png)

Users on non-14.0+ will bounce to all the wallpapers released as of macOS 14.1.1 (23B81).

Click the image or title to trigger a download.


## Downloading the App

Go to the [Releases](https://github.com/fuzzywalrus/sonoma-wallpaper-downloader/releases) and download either the ZIP or DMG file. It's a universal binary, so it'll work on both Apple Silicon and Intel Macs. 

## So what is this app doing exactly....

macOS 14 Sonoma shipped with video wallpapers and screensavers akin to the Apple TV. These are video files hosted by Apple and referenced in `Library/Application Support/com.apple.idleassetsd/Customer` in several files. This application reads the appropriate files and then generates a list of the available video files to the host operating system and creates a pictorial list so users can download them.

In theory, if Apple updates the OS to include new video wallpapers, this application should be able to automatically include them as long as the operating system has been updated.

The initial build took roughly 4+ hours, as I'd never built an electron application. For simplicity, this was built using vanilla JavaScript rather than a full-blown framework like React.


### Future release plans

I'm not sure of the copyright implications of including the URLs to the files, but I will likely make a fallback for non-sonoma users that provides the necessary data to the Sonoma14.1.1 (23B81) release as a fallback. The current design _should_ continue to work moving forward as Apple adds new videos as it reads the current OS's list provided Apple does not radically change the way Wallpapers work. Provided it doesn't require a lot of effort, I'd like to also provide a download completion status.

This application's intent is a simple point-and-click interface for downloading the videos. There are no plans to extend beyond this functionality. 

Since this is an Electron app, I apologize about the 190 MB+ size. 
