// Description: This function takes a JSON object and reorders the keys within the object. It sorts the 'subcategories' within each 'category' and the 'assets' based on the 'newLabel' key. It also moves the 'localizedDescriptionKey' to the top of each 'subcategory' and 'category'.

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