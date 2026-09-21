/**
 * CSV Exporter utility for downloading chemical catalog data
 */

export interface ExportableChemical {
  'S.NO': string;
  'PRODUCT NAME': string;
  'CAS NO.': string;
  'HSN CODE': string;
  packagingOptions?: Array<{ packing: string; price: string }>;
}

/**
 * Escapes CSV cell values to prevent breaking structure.
 */
function escapeCSVValue(value: string | number): string {
  const str = String(value ?? '').trim();
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates and initiates browser download of a CSV file containing chemical catalog data.
 */
export function exportChemicalsToCSV(chemicals: ExportableChemical[], filename: string = 'Atulya_Chemicals_Catalog.csv'): void {
  if (!chemicals || chemicals.length === 0) {
    alert('No products selected for export.');
    return;
  }

  const headers = ['S.No', 'Product Name', 'CAS Number', 'HSN Code', 'Packaging Options', 'Prices (INR)'];
  const rows: string[][] = [headers];

  chemicals.forEach((chem, idx) => {
    const packagingStr = chem.packagingOptions && chem.packagingOptions.length > 0
      ? chem.packagingOptions.map((p) => p.packing).join(' | ')
      : 'N/A';

    const pricesStr = chem.packagingOptions && chem.packagingOptions.length > 0
      ? chem.packagingOptions.map((p) => (p.price ? `₹${p.price}` : 'N/A')).join(' | ')
      : 'N/A';

    rows.push([
      escapeCSVValue(chem['S.NO'] || idx + 1),
      escapeCSVValue(chem['PRODUCT NAME']),
      escapeCSVValue(chem['CAS NO.'] || 'N/A'),
      escapeCSVValue(chem['HSN CODE'] || 'N/A'),
      escapeCSVValue(packagingStr),
      escapeCSVValue(pricesStr),
    ]);
  });

  const csvContent = rows.map((row) => row.join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
