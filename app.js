// Apple JSON data
//file:///Library/Application%20Support/com.apple.idleassetsd/Customer/entries.json
let jsonData, references;

const fs = require('fs').promises; // Use the promise-based version of fs
const plist = require('plist');
const bplistParser = require('bplist-parser');
const { ipcRenderer } = require('electron');


document.addEventListener('DOMContentLoaded', () => {
    //console.log("sending test!")
    //ipcRenderer.send('test');
});


ipcRenderer.on('update_available', () => {
    alert('A new update is available. Downloading now...');
   
});

ipcRenderer.on('update_downloaded', () => {
    let userResponse = confirm('A new update has been downloaded. Would you like to restart the app to install the update now?');
    console.log("userResponse:", userResponse)
    if (userResponse) {
        console.log("fire restart_app");
        ipcRenderer.send('restart_app');
    }
});

//custom
const sortJson =  require('./js/sortJson')
const reorderJson = require('./js/reorderJson')
const createLinksList = require('./js/createLinksList');
const downloadProgress = require('./js/downloadProgress');

downloadProgress();



const localizedStrings = '/Library/Application Support/com.apple.idleassetsd/Customer/TVIdleScreenStrings.bundle/en.lproj/Localizable.nocache.strings';
const entriesJson = 'file:///Library/Application%20Support/com.apple.idleassetsd/Customer/entries.json'

// Fallbacks
const fallbackLocalizedString = 'https://assets.codepen.io/168181/Localizable.nocache.strings';
const fallbackEntriesJson = 'https://assets.codepen.io/168181/entries.json'; 

async function readAndProcessData() {
    let parsedData;

    // Check to see if the localizedStrings is on the local machine, if not use the  fallbackLocalizedString
    try {
        // Try reading the plist file from the local file system
        const data = await fs.readFile(localizedStrings);
        parsedData = bplistParser.parseBuffer(data);
    } catch (localError) {
        console.log('Local file read failed: ', localError.message);
        console.log('Trying fallback URL for plist...');

        try {
            // Fallback: Fetch from URL
            const response = await fetch(fallbackLocalizedString);
            if (!response.ok) {
                throw new Error('Fallback URL failed: ' + response.statusText);
            }
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer); // Convert array buffer to buffer. This is some chatGPT magic.
            parsedData = bplistParser.parseBuffer(buffer);
        } catch (fallbackError) {
            console.error("Problem with fallback for plist:", fallbackError);
            return;
        }
    }

    // Check to see if the entriesJson is on the local machine, if not use the fallbackEntriesJson

    try {
    
        references = parsedData[0];
        //console.log(references);

        // Fetch JSON data
        let response;
        try {
            // Try fetching the primary URL
            response = await fetch(entriesJson);
        } catch (error) {
            console.log('Primary URL failed: ', error.message);
            console.log('Trying fallback URL...');
            response = await fetch(fallbackEntriesJson); // Attempt to use the fallback URL
        }

        if (!response.ok) {
            throw new Error('Both primary and fallback URLs failed: ' + response.statusText);
        }

        // Check if the response is actually JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error('Fetched content is not valid JSON');
        }
        jsonData = await response.json();

        // Process data
        const sortedData = sortJson(jsonData, references);
        const orderedData = reorderJson(sortedData, references);
        createLinksList(orderedData, references);
    } catch (error) {
        console.error("Problem:", error);
    }
}

readAndProcessData();

/// runtime

function doallthethings() {
	if (jsonData) {
			// Call the function to sort the JSON data
			const sortedData = sortJson(jsonData, references);
			const orderedData = reorderJson(sortedData, references);

			createLinksList(orderedData, references);
	} else {
		const linksContainer = document.getElementById('links');
		linksContainer.innerHTML = '<h5>no entries</h5>';
	}

}
doallthethings();



