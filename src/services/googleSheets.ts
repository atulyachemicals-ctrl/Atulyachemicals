export const DEFAULT_GOOGLE_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ2Bom5w89dkG9s400wHK6szRXpqbXW5_GMhG-4xN9o5mpmXxc9kwIMySOprhqZrk3GGnjP-ypuyt0q/pub?output=csv';

const STORAGE_KEY = 'atulya_custom_google_sheet_url';

/**
 * Gets the configured Google Sheet URL (from LocalStorage, Env, or Default)
 */
export function getActiveGoogleSheetUrl(): string {
  const customUrl = localStorage.getItem(STORAGE_KEY);
  if (customUrl && customUrl.trim().length > 0) {
    return customUrl.trim();
  }
  if (import.meta.env.VITE_GOOGLE_SHEET_URL) {
    return import.meta.env.VITE_GOOGLE_SHEET_URL;
  }
  return DEFAULT_GOOGLE_SHEET_URL;
}

/**
 * Saves a custom Google Sheet URL to LocalStorage
 */
export function setActiveGoogleSheetUrl(url: string): void {
  const normalized = normalizeGoogleSheetUrl(url);
  localStorage.setItem(STORAGE_KEY, normalized);
}

/**
 * Resets the Google Sheet URL back to default
 */
export function resetGoogleSheetUrl(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Converts various Google Sheet formats (edit URLs, spreadsheet IDs) into a published CSV export URL
 */
export function normalizeGoogleSheetUrl(inputUrl: string): string {
  let url = inputUrl.trim();
  if (!url) return DEFAULT_GOOGLE_SHEET_URL;

  // If already a published CSV output URL or SheetDB / API URL
  if (url.includes('output=csv') || url.includes('/gviz/tq?tqx=out:csv') || url.includes('sheetdb.io')) {
    return url;
  }

  // Handle spreadsheet ID pattern: https://docs.google.com/spreadsheets/d/<ID>/edit
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    const spreadsheetId = match[1];
    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;
  }

  return url;
}

/**
 * Lightweight RFC-4180 compliant CSV parser
 */
export function parseCSV(csvText: string): Record<string, string>[] {
  const lines: string[][] = [];
  let currentLine: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentLine.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentLine.push(currentField.trim());
      if (currentLine.some((field) => field.length > 0)) {
        lines.push(currentLine);
      }
      currentLine = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField || currentLine.length > 0) {
    currentLine.push(currentField.trim());
    lines.push(currentLine);
  }

  if (lines.length === 0) return [];

  const headers = lines[0].map((h) => h.trim().replace(/^"|"$/g, ''));
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i];
    if (values.length === 0 || (values.length === 1 && values[0] === '')) continue;

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ? values[index].replace(/^"|"$/g, '').trim() : '';
    });
    rows.push(row);
  }

  return rows;
}

/**
 * Fetches raw data from Google Sheet CSV or fallback endpoints
 */
export async function fetchGoogleSheetData(sheetUrl?: string): Promise<Record<string, string>[]> {
  const targetUrl = normalizeGoogleSheetUrl(sheetUrl || getActiveGoogleSheetUrl());

  // Add cache-busting timestamp parameter so Google Sheets returns latest live data
  const separator = targetUrl.includes('?') ? '&' : '?';
  const fetchUrl = `${targetUrl}${separator}_t=${Date.now()}`;

  const response = await fetch(fetchUrl, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to fetch Google Sheet data (Status: ${response.status})`);
  }

  const contentType = response.headers.get('content-type') || '';

  // Handle JSON endpoints (e.g. SheetDB / OpenSheet) vs CSV
  if (contentType.includes('application/json')) {
    const json = await response.json();
    return Array.isArray(json) ? json : [];
  }

  const csvText = await response.text();
  return parseCSV(csvText);
}
