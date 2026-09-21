import { Package, FileText, Info, ShieldCheck } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onNavigate: (page: string) => void;
}

export default function MobileMenu({ isOpen, onNavigate }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 top-16 z-40 bg-white border-t border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ul className="space-y-3">
          <li>
            <button
              onClick={() => {
                onNavigate('pdf-list');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full text-left px-4 py-3.5 bg-blue-50/80 hover:bg-blue-100 text-blue-900 rounded-xl transition-colors font-bold flex items-center justify-between border border-blue-200 shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>Product List (4 PDF Catalogs)</span>
              </div>
              <span className="text-xs bg-blue-600 text-white px-2.5 py-0.5 rounded-full font-semibold">
                PDFs Only
              </span>
            </button>
          </li>

          <li>
            <button
              onClick={() => {
                onNavigate('products');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium flex items-center gap-3"
            >
              <Package className="h-5 w-5 text-gray-500" />
              <span>Interactive Chemical Catalog</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => onNavigate('terms')}
              className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium flex items-center gap-3"
            >
              <ShieldCheck className="h-5 w-5 text-gray-500" />
              <span>Terms and Conditions</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => onNavigate('about')}
              className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium flex items-center gap-3"
            >
              <Info className="h-5 w-5 text-gray-500" />
              <span>About Us</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
