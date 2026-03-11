import type { AppleEntriesData } from '../types';

export const sortJson = (
  jsonData: AppleEntriesData,
  references: Record<string, string>
): AppleEntriesData => {
  const result: AppleEntriesData = JSON.parse(JSON.stringify(jsonData));

  result.assets.forEach((asset) => {
    asset.newLabel = references?.[asset.localizedNameKey ?? ''] ?? null;
  });

  result.categories?.forEach((category) => {
    category.subcategories?.sort((a, b) =>
      (a.localizedDescriptionKey ?? '').localeCompare(b.localizedDescriptionKey ?? '')
    );
  });

  result.assets.sort((a, b) =>
    (a.newLabel ?? a.accessibilityLabel ?? '').localeCompare(
      b.newLabel ?? b.accessibilityLabel ?? ''
    )
  );

  return result;
};
