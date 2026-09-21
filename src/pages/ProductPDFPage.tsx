import ProductDocuments from '../components/ProductDocuments';
import { ArrowLeft } from 'lucide-react';

interface ProductPDFPageProps {
  onBackToCatalog?: () => void;
}

export default function ProductPDFPage({ onBackToCatalog }: ProductPDFPageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product List PDF Catalogs</h1>
          <p className="text-gray-600">Download or view official Atulya Chemicals product catalog documents (2025-2026)</p>
        </div>

        {onBackToCatalog && (
          <button
            onClick={onBackToCatalog}
            className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-800 font-semibold px-4 py-2 rounded-lg border border-gray-300 text-sm transition-colors shadow-2xs"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Interactive Catalog
          </button>
        )}
      </div>

      {/* ONLY the 4 PDF Documents */}
      <ProductDocuments />
    </div>
  );
}
