import type { AppleEntriesData } from '../types';

const sortKeysAlphabetically = <T extends Record<string, unknown>>(
  obj: T,
  firstKey: string
): T => {
  const result: Record<string, unknown> = {};
  if (Object.prototype.hasOwnProperty.call(obj, firstKey)) {
    result[firstKey] = obj[firstKey];
  }
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      if (key !== firstKey) result[key] = obj[key];
    });
  return result as T;
};

export const reorderJson = (jsonData: AppleEntriesData): AppleEntriesData => {
  const result: AppleEntriesData = JSON.parse(JSON.stringify(jsonData));

  result.categories = result.categories?.map((category) => {
    const sorted = { ...category };
    sorted.subcategories = sorted.subcategories?.map((sub) =>
      sortKeysAlphabetically(sub, 'localizedDescriptionKey')
    );
    return sortKeysAlphabetically(sorted, 'localizedDescriptionKey');
  });

  result.assets = result.assets.map((asset) =>
    sortKeysAlphabetically(asset, 'newLabel')
  );

  return result;
};
