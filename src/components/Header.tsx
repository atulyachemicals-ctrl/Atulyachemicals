import { useState } from 'react';
import { Search, ShoppingCart, User, Menu, X, Truck } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/atulya_chemicals_re-_jpeg.jpg';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onMenuToggle: () => void;
  onAuthClick: () => void;
  onCartClick: () => void;
  onTrackOrderClick?: () => void;
}

export default function Header({
  searchQuery,
  onSearchChange,
  onMenuToggle,
  onAuthClick,
  onCartClick,
  onTrackOrderClick,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const { isAuthenticated, customer } = useAuth();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  const handleClearSearch = () => {
    onSearchChange('');
  };

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
    onMenuToggle();
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={handleMenuClick}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>

            <div className="flex items-center">
              <img
                src={logo}
                alt="Atulya Chemicals"
                className="h-12 w-auto object-contain"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 flex-1 max-w-2xl mx-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Product Name, CAS Number, or HSN Code..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                  title="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onTrackOrderClick && (
              <button
                onClick={onTrackOrderClick}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                title="Track Shiprocket Courier"
              >
                <Truck className="h-4 w-4 text-blue-600" />
                <span>Track Order</span>
              </button>
            )}

            <button
              onClick={onCartClick}
              className="relative p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-6 w-6 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={onAuthClick}
              className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <User className="h-5 w-5 text-gray-700" />
              <span className="text-sm font-medium text-gray-700">
                {isAuthenticated ? customer?.fullName?.split(' ')[0] || 'Account' : 'Sign In'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

