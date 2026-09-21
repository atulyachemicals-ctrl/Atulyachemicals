import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Package,
  Loader2,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { parseWeightFromPackaging } from '../utils/weightParser';
import { fetchGoogleSheetData } from '../services/googleSheets';
import GoogleSheetConfigModal from './GoogleSheetConfigModal';
import { matchChemical } from '../utils/searchUtils';

interface PackagingOption {
  packing: string;
  price: string;
}

export interface Chemical {
  'S.NO': string;
  'PRODUCT NAME': string;
  'CAS NO.': string;
  'HSN CODE': string;
  packagingOptions: PackagingOption[];
}

interface ChemicalCatalogProps {
  searchQuery: string;
  onClearSearch?: () => void;
}

const ITEMS_PER_PAGE = 24;
const CACHE_KEY = 'atulya_chemicals_data';
const LAST_SYNC_KEY = 'atulya_chemicals_last_sync';

export default function ChemicalCatalog({ searchQuery, onClearSearch }: ChemicalCatalogProps) {
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [preSearchPage, setPreSearchPage] = useState<number>(1);
  const [prevSearchQuery, setPrevSearchQuery] = useState<string>('');
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

  // Handle Search & Page Restoration
  useEffect(() => {
    const trimmedQuery = searchQuery.trim();
    const prevTrimmed = prevSearchQuery.trim();

    if (!prevTrimmed && trimmedQuery) {
      // Initiating search: record current page
      setPreSearchPage(currentPage);
      setCurrentPage(1);
    } else if (prevTrimmed && !trimmedQuery) {
      // Clearing search: restore pre-search page
      setCurrentPage(preSearchPage);
    }
    setPrevSearchQuery(searchQuery);
  }, [searchQuery]);

  // Advanced search matching across complete catalog
  const filteredChemicals = useMemo(() => {
    if (!searchQuery.trim()) return chemicals;
    return chemicals.filter((chem) => matchChemical(chem, searchQuery));
  }, [chemicals, searchQuery]);

  const totalPages = Math.ceil(filteredChemicals.length / ITEMS_PER_PAGE) || 1;

  const paginatedChemicals = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredChemicals.slice(startIndex, endIndex);
  }, [filteredChemicals, currentPage]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReturnToPreSearchPage = () => {
    if (onClearSearch) {
      onClearSearch();
    }
    setCurrentPage(preSearchPage);
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
      {/* Active Search Banner with Return Action */}
      {searchQuery.trim() && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-lg">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-blue-900">
                Search Results for: <span className="underline decoration-blue-400">"{searchQuery}"</span>
              </p>
              <p className="text-xs text-blue-700">
                Found {filteredChemicals.length} matching products in catalog
              </p>
            </div>
          </div>

          <button
            onClick={handleReturnToPreSearchPage}
            className="flex items-center gap-2 bg-white hover:bg-blue-100 text-blue-800 font-semibold px-4 py-2 rounded-lg border border-blue-300 text-xs sm:text-sm transition-colors shadow-2xs"
          >
            <ArrowLeft className="h-4 w-4" />
            Clear Search &amp; Return to Page {preSearchPage}
          </button>
        </div>
      )}

      {/* Catalog Header Info with Top Pagination Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
        <p className="text-xs sm:text-sm text-gray-600 font-medium">
          Showing Page <span className="font-bold text-gray-900">{currentPage}</span> of{' '}
          <span className="font-bold text-gray-900">{totalPages}</span> ({filteredChemicals.length} total products)
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors text-sm font-semibold text-gray-700 shadow-2xs"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous Page
          </button>

          <span className="text-xs sm:text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors text-sm font-semibold text-gray-700 shadow-2xs"
          >
            Next Page
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {filteredChemicals.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-2xs">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-700 text-lg font-bold">No chemicals found matching "{searchQuery}".</p>
          <p className="text-gray-500 text-sm mt-1 mb-4">
            Try searching by chemical name, CAS Number, HSN Code, or partial keywords.
          </p>
          <button
            onClick={handleReturnToPreSearchPage}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Full Product List (Page {preSearchPage})
          </button>
        </div>
      ) : (
        <>
          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedChemicals.map((chemical, index) => (
              <div
                key={`${chemical['S.NO']}-${index}`}
                className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between relative"
              >
                <div className="p-6">
                  <div className="mb-3">
                    {/* FULL PRODUCT NAME VISIBILITY (No line clamp, fully readable) */}
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug whitespace-normal break-words">
                      {chemical['PRODUCT NAME']}
                    </h3>
                  </div>

                  <div className="space-y-2 bg-gray-50/80 rounded-lg p-3 border border-gray-200/80 mb-4">
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

                  {chemical.packagingOptions.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Available Packaging &amp; Rates
                      </p>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                        {chemical.packagingOptions.map((option, optionIndex) => {
                          const optionKey = `${chemical['S.NO']}-${index}`;
                          const isOptionSelected = selectedPackaging[optionKey] === optionIndex;

                          return (
                            <div
                              key={optionIndex}
                              onClick={() =>
                                setSelectedPackaging((prev) => ({
                                  ...prev,
                                  [optionKey]: optionIndex,
                                }))
                              }
                              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                isOptionSelected
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
                      const optionKey = `${chemical['S.NO']}-${index}`;
                      const selectedIndex = selectedPackaging[optionKey] ?? 0;
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

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8 border-t border-gray-200">
            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              Showing Page <span className="font-bold text-gray-900">{currentPage}</span> of{' '}
              <span className="font-bold text-gray-900">{totalPages}</span> ({filteredChemicals.length} total products)
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors text-sm font-semibold text-gray-700 shadow-2xs"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous Page
              </button>

              <span className="text-xs sm:text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors text-sm font-semibold text-gray-700 shadow-2xs"
              >
                Next Page
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
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
