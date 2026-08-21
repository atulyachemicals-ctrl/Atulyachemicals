import ChemicalCatalog from '../components/ChemicalCatalog';

interface ProductListingPageProps {
  searchQuery: string;
}

export default function ProductListingPage({ searchQuery }: ProductListingPageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Chemical Catalog</h1>
        <p className="text-gray-600">Browse our extensive collection of chemical products</p>
      </div>

      <ChemicalCatalog searchQuery={searchQuery} />
    </div>
  );
}
