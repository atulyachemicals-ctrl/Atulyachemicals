import { useState } from 'react';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/atulya_chemicals_re-_jpeg.jpg';

interface HeaderProps {
  onSearchChange: (query: string) => void;
  onMenuToggle: () => void;
  onAuthClick: () => void;
  onCartClick: () => void;
}

export default function Header({ onSearchChange, onMenuToggle, onAuthClick, onCartClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const { isAuthenticated, customer } = useAuth();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearchChange(value);
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
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
