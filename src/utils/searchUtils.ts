/**
 * Utility functions for advanced chemical catalog search
 */

export interface ChemicalSearchItem {
  'S.NO': string;
  'PRODUCT NAME': string;
  'CAS NO.': string;
  'HSN CODE': string;
  packagingOptions?: Array<{ packing: string; price: string }>;
}

/**
 * Normalizes text for matching by converting to lower-case,
 * replacing dashes, hyphens, slashes, punctuation, and multi-spaces.
 */
export function normalizeSearchText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[\u2013\u2014\u2212\u2010\u2011]/g, '-') // Normalize unicode dashes to standard hyphen
    .replace(/[^a-z0-9%\s]/g, ' ') // Replace non-alphanumeric (except %) with spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Strips all non-alphanumeric characters (including hyphens and spaces)
 * for ultimate strict character matching (e.g. "4tetrabutylcatechol98").
 */
export function stripAllSeparators(text: string): string {
  if (!text) return '';
  return text.toLowerCase().replace(/[^a-z0-9%]/g, '');
}

/**
 * Checks if a chemical item matches the user search query.
 */
export function matchChemical(chem: ChemicalSearchItem, query: string): boolean {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return true;

  const rawQueryLower = trimmedQuery.toLowerCase();
  const normalizedQuery = normalizeSearchText(trimmedQuery);
  const strippedQuery = stripAllSeparators(trimmedQuery);

  const productName = chem['PRODUCT NAME'] || '';
  const casNo = chem['CAS NO.'] || '';
  const hsnCode = chem['HSN CODE'] || '';
  const packingText = (chem.packagingOptions || []).map((p) => p.packing).join(' ');

  // 1. Direct lowercase string substring check
  if (
    productName.toLowerCase().includes(rawQueryLower) ||
    casNo.toLowerCase().includes(rawQueryLower) ||
    hsnCode.toLowerCase().includes(rawQueryLower) ||
    packingText.toLowerCase().includes(rawQueryLower)
  ) {
    return true;
  }

  // 2. Stripped separators check (ignores hyphens, spaces, dashes)
  const strippedName = stripAllSeparators(productName);
  const strippedCas = stripAllSeparators(casNo);
  const strippedHsn = stripAllSeparators(hsnCode);

  if (
    strippedName.includes(strippedQuery) ||
    strippedCas.includes(strippedQuery) ||
    strippedHsn.includes(strippedQuery)
  ) {
    return true;
  }

  // 3. Multi-token check: every word in normalizedQuery must match somewhere in normalized targets
  const queryTokens = normalizedQuery.split(' ').filter(Boolean);
  if (queryTokens.length > 0) {
    const targetNormalized = normalizeSearchText(
      `${productName} ${casNo} ${hsnCode} ${packingText}`
    );
    const targetStripped = stripAllSeparators(`${productName} ${casNo} ${hsnCode} ${packingText}`);

    const allTokensMatch = queryTokens.every((token) => {
      const strippedToken = stripAllSeparators(token);
      return (
        targetNormalized.includes(token) ||
        (strippedToken.length > 0 && targetStripped.includes(strippedToken))
      );
    });

    if (allTokensMatch) {
      return true;
    }
  }

  return false;
}
