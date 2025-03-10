/**
 * Sorts JSON data based on localized references
 * @param {Object} jsonData - Original JSON data
 * @param {Object} references - Localized string references
 * @returns {Object} - Sorted JSON data
 */
export const sortJson = (jsonData, references) => {
  // Create a deep copy to avoid mutating the original
  const result = JSON.parse(JSON.stringify(jsonData));
  
  // Add new labels from references to each asset
  result.assets.forEach(asset => {
    const key = asset.localizedNameKey;
    asset.newLabel = references ? references[key] : null;
  });
  
  // Sort the 'subcategories' within each 'category' by 'localizedDescriptionKey'
  if (result.categories) {
    result.categories.forEach(category => {
      if (category.subcategories) {
        category.subcategories.sort((a, b) => 
          (a.localizedDescriptionKey || "").localeCompare(b.localizedDescriptionKey || "")
        );
      }
    });
  }

  // Sort the 'assets' by 'newLabel' (or fallback to accessibilityLabel)
  if (result.assets) {
    result.assets.sort((a, b) => 
      (a.newLabel || a.accessibilityLabel || "").localeCompare(b.newLabel || b.accessibilityLabel || "")
    );
  }

  return result;
};