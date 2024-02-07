// Description: This function takes a JSON object and sorts the 'subcategories' within each 'category' by 'localizedDescriptionKey'. It also sorts the 'assets' by 'newLabel' and adds the 'newLabel' key to each asset. The 'newLabel' is obtained from the 'references' object using the 'localizedNameKey' of each asset.

const sortJson = (jsonData, references) => {
    jsonData.assets.forEach(asset => {  // Corrected this line
        const key = asset.localizedNameKey;
        const labelFromReferences = references[key];  // Assuming 'references' is accessible here
    
        // Add the new key/value pair to the asset
        asset.newLabel = labelFromReferences;
    });
    // Sort the 'subcategories' within each 'category' by 'localizedDescriptionKey'
    jsonData.categories.forEach(category => {
        category.subcategories.sort((a, b) => (a.localizedDescriptionKey || "").localeCompare(b.localizedDescriptionKey || ""));
    });

    // Sort the 'assets' by 'accessibilityLabel'
    jsonData.assets.sort((a, b) => (a.newLabel || "").localeCompare(b.newLabel || ""));

    return jsonData;
};


module.exports = sortJson;