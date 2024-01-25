// Apple JSON data
//file:///Library/Application%20Support/com.apple.idleassetsd/Customer/entries.json
let jsonData, references;

const fs = require('fs').promises; // Use the promise-based version of fs
const plist = require('plist');
const bplistParser = require('bplist-parser');

//custom
const sortJson =  require('./js/sortJson')
const reorderJson = require('./js/reorderJson')
const createLinksList = require('./js/createLinksList');

// Path to your file
// File path
const localizedStrings = '/Library/Application Support/com.apple.idleassetsd/Customer/TVIdleScreenStrings.bundle/en.lproj/Localizable.nocache.strings';
const entriesJson = 'file:///Library/Application%20Support/com.apple.idleassetsd/Customer/entries.json'

async function readAndProcessData() {
    try {
        // Read and parse plist file
        const data = await fs.readFile(localizedStrings);
        const parsedData = bplistParser.parseBuffer(data);
        references = parsedData[0];
        console.log(references);

        // Fetch JSON data
        const response = await fetch(entriesJson);
        if (!response.ok) {
            throw new Error('Not loading' + response.statusText);
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

			// Output the sorted JSON
			// console.log(JSON.stringify(orderedData, null, 4));
			// document.getElementById('json').textContent = JSON.stringify(sortedData, null, 4);

			createLinksList(orderedData, references);
	} else {
		const linksContainer = document.getElementById('links');
		linksContainer.innerHTML = '<h5>no entries</h5>';
	}

}
doallthethings();





