interface MobileMenuProps {
  isOpen: boolean;
  onNavigate: (page: string) => void;
}

export default function MobileMenu({ isOpen, onNavigate }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 top-16 z-40 bg-white border-t border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => onNavigate('products')}
              className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md transition-colors font-medium"
            >
              Product List
            </button>
          </li>
          <li>
            <button
              onClick={() => onNavigate('terms')}
              className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md transition-colors font-medium"
            >
              Terms and Conditions
            </button>
          </li>
          <li>
            <button
              onClick={() => onNavigate('about')}
              className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md transition-colors font-medium"
            >
              About Us
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
