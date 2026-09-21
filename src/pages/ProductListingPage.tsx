import ChemicalCatalog from '../components/ChemicalCatalog';

interface ProductListingPageProps {
  searchQuery: string;
  onClearSearch?: () => void;
}

export default function ProductListingPage({ searchQuery, onClearSearch }: ProductListingPageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Chemical Catalog</h1>
        <p className="text-gray-600">Browse our extensive collection of chemical products</p>
      </div>

      {/* Interactive Chemical Catalog */}
      <ChemicalCatalog searchQuery={searchQuery} onClearSearch={onClearSearch} />
    </div>
  );
}
