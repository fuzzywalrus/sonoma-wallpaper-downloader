# The Sonoma Video Wallpaper Downloader

![Sonoma Video Wallpaper Downloader](http://blog.greggant.com/images/posts/2024-01-24-sonoma-downloader-v1.png)

I took inspiration from https://github.com/mikeswanson/WallGet, which is a Wallpaper downloader for macOS Sonoma that uses a Python script to trigger downloading all of the macOS Sonoma video wallpapers.

However, I wanted to do something a bit different and allow users to download the individual wallpapers and save them wherever they would like.  Downloads make take a several minutes depending on your internet connection.

## Usage

This is currently an unsigned application. You will receive an unidentified developer message. To bypass this error, right click ( control-click or two finger click on a track pad) and select open.

The app requires Sonoma to read system files to extrapolate the current available backgrounds to download. This may result in a short delay as the images are loaded. 

Click the iamge or title to trigger a download.

# Important: This app requires Sonoma or later to function properly!

This application is dependent on reading the system preference files to grab a current list of the available video wallpapers.

## Downloading the App

Go to the [Releases](https://github.com/fuzzywalrus/sonoma-wallpaper-downloader/releases) and download either the ZIP or DMG file. It's a universal binary, so it'll work on both Apple Silicon and Intel Macs. 


### Future release plans

I'm not sure of the copyright implications of including the URLs to the files but I will likely make a fallback for non-sonoma users that provides the necessary data to the Sonoma14.1.1 (23B81) release as a fallback. The current design _should_ continue to work moving forward as Apple adds new videos as it'll read the current OS's list, provided Apple does not radically change the way Wallpapers work.  Provided it doesn't require a lot of effort, I'd like to also provide a download completion status.

This application's intent is a simple point-and-click interface for downloading the videos. There are no plans to extend beyond this functionality. 

Since this is an Electron app, I apologize about the 190 MB+ size. 
