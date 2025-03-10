/**
 * Sort object keys alphabetically, prioritizing a specific first key
 * @param {Object} obj - Object to sort
 * @param {string} firstKey - Key to prioritize as first
 * @returns {Object} - New object with sorted keys
 */
const sortKeysAlphabetically = (obj, firstKey) => {
  const sortedObj = {};
  
  // Place the specified key first if it exists
  if (obj && obj.hasOwnProperty(firstKey)) {
    sortedObj[firstKey] = obj[firstKey];
  }

  // Sort remaining keys alphabetically
  if (obj) {
    Object.keys(obj)
      .sort()
      .forEach(key => {
        if (key !== firstKey) {
          sortedObj[key] = obj[key];
        }
      });
  }

  return sortedObj;
};

/**
 * Reorder JSON by sorting keys in a specific order
 * @param {Object} jsonData - Original JSON data
 * @returns {Object} - Reordered JSON data
 */
export const reorderJson = (jsonData) => {
  // Create a deep copy to avoid mutating the original
  const result = JSON.parse(JSON.stringify(jsonData));

  // Sort and reorganize the 'subcategories' within each 'category'
  if (result.categories) {
    result.categories = result.categories.map(category => {
      if (category.subcategories) {
        category.subcategories = category.subcategories.map(subcategory => 
          sortKeysAlphabetically(subcategory, 'localizedDescriptionKey')
        );
      }
      return sortKeysAlphabetically(category, 'localizedDescriptionKey');
    });
  }

  // Sort and reorganize the 'assets'
  if (result.assets) {
    result.assets = result.assets.map(asset => 
      sortKeysAlphabetically(asset, 'newLabel')
    );
  }

  return result;
};