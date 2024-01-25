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



const reorderJson = (jsonData, references) => {

    // Sort and reorganize the 'subcategories' within each 'category'
    jsonData.categories = jsonData.categories.map(category => {
        category.subcategories = category.subcategories.map(subcategory => 
            sortKeysAlphabetically(subcategory, 'localizedDescriptionKey')
        );
        return sortKeysAlphabetically(category, 'localizedDescriptionKey');
    });

    // Sort and reorganize the 'assets'
    jsonData.assets = jsonData.assets.map(asset => 
        sortKeysAlphabetically(asset, 'newLabel')
    );

    return jsonData;
};

module.exports = reorderJson;