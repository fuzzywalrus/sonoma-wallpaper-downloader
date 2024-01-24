// Apple JSON data
//file:///Library/Application%20Support/com.apple.idleassetsd/Customer/entries.json
let jsonData;

fetch("file:///Library/Application%20Support/com.apple.idleassetsd/Customer/entries.json")
    .then(response => {
        if (!response.ok) {
            throw new Error('Not loading' + response.statusText)
        }
        return response.json();
    })
    .then( data => {
        jsonData = data;
        doallthethings();
    })
    .catch(error => {
        console.error("Problem:" + error);
    })

const sortKeysAlphabetically = (obj, firstKey) => {
    const sortedObj = {};
    if (obj.hasOwnProperty(firstKey)) {
        sortedObj[firstKey] = obj[firstKey];
    }

    Object.keys(obj).sort().forEach(key => {
        if (key !== firstKey) {
            sortedObj[key] = obj[key];
        }
    });

    return sortedObj;
};



const reorderJson = (jsonData) => {
    // Sort and reorganize the 'subcategories' within each 'category'
    jsonData.categories = jsonData.categories.map(category => {
        category.subcategories = category.subcategories.map(subcategory => 
            sortKeysAlphabetically(subcategory, 'localizedDescriptionKey')
        );
        return sortKeysAlphabetically(category, 'localizedDescriptionKey');
    });

    // Sort and reorganize the 'assets'
    jsonData.assets = jsonData.assets.map(asset => 
        sortKeysAlphabetically(asset, 'accessibilityLabel')
    );

    return jsonData;
};

const sortJson = (jsonData) => {
    // Sort the 'subcategories' within each 'category' by 'localizedDescriptionKey'
    jsonData.categories.forEach(category => {
        category.subcategories.sort((a, b) => (a.localizedDescriptionKey || "").localeCompare(b.localizedDescriptionKey || ""));
    });

    // Sort the 'assets' by 'accessibilityLabel'
    jsonData.assets.sort((a, b) => (a.accessibilityLabel || "").localeCompare(b.accessibilityLabel || ""));

    return jsonData;
};





/// Create a linked list

const createLinksList = (jsonData) => {
    const assets = jsonData.assets;
    const linksContainer = document.getElementById('links');

    // Clear existing content
    linksContainer.innerHTML = '';

    assets.forEach(asset => {
        const label = asset.accessibilityLabel || asset.localizedNameKey;
        const url = asset['url-4K-SDR-240FPS'];
        const previewImage = asset.previewImage;

        if (label && url && previewImage) {
            const link = document.createElement('a');
            link.href = url;
            link.download = '';

            const img = document.createElement('img');
            img.src = previewImage;
            img.alt = label; // Alt text for the image


            link.appendChild(img);

            const text = document.createTextNode(label);
            link.appendChild(text);

            const listItem = document.createElement('li');
            listItem.appendChild(link);
            linksContainer.appendChild(listItem);
        }
    });
};



/*
document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function(e) {
            try {
                jsonData = JSON.parse(e.target.result);
                doallthethings(jsonData);
            } catch (error) {
                console.error("Error parsing JSON:", error);
                alert("File is not a valid JSON.");
            }
        };

        reader.readAsText(file);
    }
});
*/


/// runtime

function doallthethings() {
	if (jsonData) {
			// Call the function to sort the JSON data
			const sortedData = sortJson(jsonData);
			const orderedData = reorderJson(sortedData);

			// Output the sorted JSON
			console.log(JSON.stringify(orderedData, null, 4));
			// document.getElementById('json').textContent = JSON.stringify(sortedData, null, 4);

			createLinksList(sortedData);
	} else {
		const linksContainer = document.getElementById('links');
		linksContainer.innerHTML = '<h5>no entries</h5>';
	}

}
doallthethings();
