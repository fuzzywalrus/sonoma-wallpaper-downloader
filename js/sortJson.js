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