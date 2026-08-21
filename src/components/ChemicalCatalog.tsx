import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Package,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { parseWeightFromPackaging } from '../utils/weightParser';
import { fetchGoogleSheetData } from '../services/googleSheets';
import GoogleSheetConfigModal from './GoogleSheetConfigModal';

interface PackagingOption {
  packing: string;
  price: string;
}

interface Chemical {
  'S.NO': string;
  'PRODUCT NAME': string;
  'CAS NO.': string;
  'HSN CODE': string;
  packagingOptions: PackagingOption[];
}

interface ChemicalCatalogProps {
  searchQuery: string;
}

const ITEMS_PER_PAGE = 24;
const CACHE_KEY = 'atulya_chemicals_data';
const LAST_SYNC_KEY = 'atulya_chemicals_last_sync';

export default function ChemicalCatalog({ searchQuery }: ChemicalCatalogProps) {
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPackaging, setSelectedPackaging] = useState<Record<string, number>>({});
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const { addToCart } = useCart();

  const normalizeChemicalData = (rawData: any[]): Chemical[] => {
    const groupedData = new Map<string, Chemical>();

    rawData.forEach((item: any) => {
      const chemicalName = (
        item['Chemical Name'] ||
        item['PRODUCT NAME'] ||
        item['Product Name'] ||
        item['Title'] ||
        ''
      ).trim();

      const casNumber = (
        item['CAS number'] ||
        item['CAS NO.'] ||
        item['CAS Number'] ||
        item['cas_number'] ||
        ''
      ).trim();

      const hsnCode = (
        item['HSN code'] ||
        item['HSN CODE'] ||
        item['HSN Code'] ||
        item['hsn_code'] ||
        ''
      ).trim();

      const packing = (
        item['Packing'] ||
        item['PACKING'] ||
        item['Option1 Value'] ||
        ''
      ).trim();

      const price = (
        item['Rate'] ||
        item['PRICE'] ||
        item['Price'] ||
        item['Variant Price'] ||
        ''
      ).trim();

      if (!chemicalName) return;

      const key = chemicalName;

      if (!groupedData.has(key)) {
        groupedData.set(key, {
          'S.NO': String(groupedData.size + 1),
          'PRODUCT NAME': key,
          'CAS NO.': casNumber,
          'HSN CODE': hsnCode,
          packagingOptions: [],
        });
      }

      const chemical = groupedData.get(key)!;

      if (casNumber && !chemical['CAS NO.']) {
        chemical['CAS NO.'] = casNumber;
      }
      if (hsnCode && !chemical['HSN CODE']) {
        chemical['HSN CODE'] = hsnCode;
      }

      if (packing && price) {
        chemical.packagingOptions.push({
          packing: packing,
          price: price,
        });
      }
    });

    return Array.from(groupedData.values());
  };

  const fetchChemicals = useCallback(async (isManualSync = false) => {
    try {
      // Stale-While-Revalidate: load cache first if available
      const cachedData = localStorage.getItem(CACHE_KEY);

      if (cachedData && !isManualSync) {
        try {
          const parsed = JSON.parse(cachedData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setChemicals(parsed);
            setIsLoading(false);
          }
        } catch (e) {
          console.warn('Failed to parse cache:', e);
        }
      }

      // Fetch live data directly from Google Sheets
      const rawData = await fetchGoogleSheetData();
      const normalizedData = normalizeChemicalData(rawData);

      const now = Date.now();
      localStorage.setItem(CACHE_KEY, JSON.stringify(normalizedData));
      localStorage.setItem(LAST_SYNC_KEY, now.toString());

      setChemicals(normalizedData);
      setError(null);
    } catch (err) {
      console.error('Failed to sync Google Sheet:', err);
      if (!localStorage.getItem(CACHE_KEY)) {
        setError(err instanceof Error ? err.message : 'Failed to fetch chemical catalog');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChemicals();
  }, [fetchChemicals]);

  const filteredChemicals = useMemo(() => {
    if (!searchQuery.trim()) return chemicals;

    const query = searchQuery.toLowerCase();
    return chemicals.filter(
      (chem) =>
        chem['PRODUCT NAME']?.toLowerCase().includes(query) ||
        chem['CAS NO.']?.toLowerCase().includes(query) ||
        chem['HSN CODE']?.toLowerCase().includes(query)
    );
  }, [chemicals, searchQuery]);

  const totalPages = Math.ceil(filteredChemicals.length / ITEMS_PER_PAGE);

  const paginatedChemicals = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredChemicals.slice(startIndex, endIndex);
  }, [filteredChemicals, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = async (chemical: Chemical, packagingOption: PackagingOption) => {
    try {
      const weightKg = parseWeightFromPackaging(packagingOption.packing);
      await addToCart(
        {
          chemicalName: chemical['PRODUCT NAME'],
          casNumber: chemical['CAS NO.'],
          hsnCode: chemical['HSN CODE'],
          packaging: packagingOption.packing,
          price: parseFloat(packagingOption.price),
          weightKg,
        },
        1
      );
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  if (isLoading && chemicals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600 text-lg font-medium">Fetching live data from Google Sheet...</p>
        <p className="text-gray-400 text-sm mt-1">Directly syncing products &amp; rates</p>
      </div>
    );
  }

  if (error && chemicals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center shadow-sm">
          <h3 className="text-red-800 font-bold text-lg mb-2">Error Loading Data</h3>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => fetchChemicals(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Check Sheet Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">


      {filteredChemicals.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-semibold">No chemicals found matching "{searchQuery}".</p>
          <p className="text-gray-400 text-sm mt-1">Try searching by CAS Number or HSN Code.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredChemicals.length)} of{' '}
              <span className="font-bold text-gray-900">{filteredChemicals.length}</span> chemicals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedChemicals.map((chemical, index) => (
              <div
                key={`${chemical['S.NO']}-${index}`}
                className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col justify-between"
              >
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 min-h-[3.5rem] leading-snug">
                      {chemical['PRODUCT NAME']}
                    </h3>

                    <div className="space-y-2 bg-gray-50/80 rounded-lg p-3 border border-gray-200/80">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          CAS Number:
                        </span>
                        <span className="text-sm font-mono text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          {chemical['CAS NO.'] || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-gray-200/60 pt-2">
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          HSN Code:
                        </span>
                        <span className="text-sm font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          {chemical['HSN CODE'] || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {chemical.packagingOptions.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Available Packaging &amp; Rates
                      </p>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                        {chemical.packagingOptions.map((option, optionIndex) => {
                          const chemicalKey = `${chemical['S.NO']}-${index}`;
                          const isSelected = selectedPackaging[chemicalKey] === optionIndex;

                          return (
                            <div
                              key={optionIndex}
                              onClick={() =>
                                setSelectedPackaging((prev) => ({
                                  ...prev,
                                  [chemicalKey]: optionIndex,
                                }))
                              }
                              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-blue-600 bg-blue-50/80 shadow-xs'
                                  : 'border-gray-200 hover:border-gray-300 bg-white'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-800">
                                  {option.packing}
                                </span>
                                {option.price && (
                                  <span className="text-base font-bold text-gray-900">
                                    ₹{parseFloat(option.price).toLocaleString('en-IN', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={() => {
                      const chemicalKey = `${chemical['S.NO']}-${index}`;
                      const selectedIndex = selectedPackaging[chemicalKey] ?? 0;
                      const selectedOption = chemical.packagingOptions[selectedIndex];
                      if (selectedOption) {
                        handleAddToCart(chemical, selectedOption);
                      }
                    }}
                    disabled={chemical.packagingOptions.length === 0}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Package className="h-4 w-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 py-8">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium text-gray-700"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-semibold text-sm">
                  Page {currentPage} of {totalPages}
                </span>
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium text-gray-700"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Google Sheet Link Settings Modal */}
      <GoogleSheetConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSaved={() => fetchChemicals(true)}
      />
    </div>
  );
}
