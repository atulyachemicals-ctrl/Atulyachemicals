import { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import {
  getActiveGoogleSheetUrl,
  setActiveGoogleSheetUrl,
  resetGoogleSheetUrl,
  DEFAULT_GOOGLE_SHEET_URL,
  fetchGoogleSheetData,
  normalizeGoogleSheetUrl,
} from '../services/googleSheets';

interface GoogleSheetConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function GoogleSheetConfigModal({
  isOpen,
  onClose,
  onSaved,
}: GoogleSheetConfigModalProps) {
  const [urlInput, setUrlInput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    count?: number;
    message?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUrlInput(getActiveGoogleSheetUrl());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const normalized = normalizeGoogleSheetUrl(urlInput);
      const rows = await fetchGoogleSheetData(normalized);
      if (rows && rows.length > 0) {
        setTestResult({
          success: true,
          count: rows.length,
          message: `Successfully connected! Found ${rows.length} product entries.`,
        });
      } else {
        setTestResult({
          success: false,
          message: 'Connected, but the sheet appears to be empty or missing headers.',
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to connect to Google Sheet URL.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    setActiveGoogleSheetUrl(urlInput);
    onSaved();
    onClose();
  };

  const handleReset = () => {
    resetGoogleSheetUrl();
    setUrlInput(DEFAULT_GOOGLE_SHEET_URL);
    setTestResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl relative border border-gray-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-100 text-green-700 rounded-lg">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Google Sheet Dynamic Data Link</h2>
            <p className="text-sm text-gray-500">
              Connect your live Google Sheet CSV to automatically update site products
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Google Sheet Published CSV URL / Spreadsheet Link
            </label>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setTestResult(null);
              }}
              placeholder="https://docs.google.com/spreadsheets/d/e/.../pub?output=csv"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTestConnection}
              disabled={isTesting || !urlInput.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isTesting ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
              Test Connection
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 text-sm font-medium rounded-lg transition-colors"
              title="Reset to default published sheet link"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Default
            </button>
          </div>

          {testResult && (
            <div
              className={`p-4 rounded-lg flex items-start gap-3 border text-sm ${
                testResult.success
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">
                  {testResult.success ? 'Connection Successful!' : 'Connection Error'}
                </p>
                <p className="mt-0.5">{testResult.message}</p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-900 space-y-2">
            <p className="font-semibold text-sm flex items-center gap-1.5 text-blue-950">
              <ExternalLink className="h-4 w-4" /> How to publish a Google Sheet:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-blue-800">
              <li>Open your Google Sheet containing chemical products.</li>
              <li>
                Click <strong>File &gt; Share &gt; Publish to web</strong>.
              </li>
              <li>
                Choose your sheet tab and set format to <strong>Comma-separated values (.csv)</strong>.
              </li>
              <li>
                Click <strong>Publish</strong>, copy the generated link, and paste it above!
              </li>
            </ol>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
          >
            Save &amp; Sync Now
          </button>
        </div>
      </div>
    </div>
  );
}
