export function parseWeightFromPackaging(packaging: string): number {
  if (!packaging) return 0;

  const packagingUpper = packaging.toUpperCase().trim();

  const kgMatch = packagingUpper.match(/(\d+(?:\.\d+)?)\s*KG/);
  if (kgMatch) {
    return parseFloat(kgMatch[1]);
  }

  const gmMatch = packagingUpper.match(/(\d+(?:\.\d+)?)\s*(?:GM|G)/);
  if (gmMatch) {
    return parseFloat(gmMatch[1]) / 1000;
  }

  const lMatch = packagingUpper.match(/(\d+(?:\.\d+)?)\s*(?:LTR|L|LITRE|LITER)/);
  if (lMatch) {
    return parseFloat(lMatch[1]);
  }

  const mlMatch = packagingUpper.match(/(\d+(?:\.\d+)?)\s*(?:ML)/);
  if (mlMatch) {
    return parseFloat(mlMatch[1]) / 1000;
  }

  return 0;
}
