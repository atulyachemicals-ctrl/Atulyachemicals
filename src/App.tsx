import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Header from './components/Header';
import MobileMenu from './components/MobileMenu';
import AuthModal from './components/AuthModal';
import CartDrawer from './components/CartDrawer';
import OrderTrackingModal from './components/OrderTrackingModal';
import ProductListingPage from './pages/ProductListingPage';
import ProductPDFPage from './pages/ProductPDFPage';
import TermsPage from './pages/TermsPage';
import AboutPage from './pages/AboutPage';

function App() {
  const [currentPage, setCurrentPage] = useState<'products' | 'pdf-list' | 'terms' | 'about'>('products');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as 'products' | 'pdf-list' | 'terms' | 'about');
    setIsMenuOpen(false);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (currentPage !== 'products') {
      setCurrentPage('products');
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-gray-50">
          <Header
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onMenuToggle={handleMenuToggle}
            onAuthClick={() => setIsAuthModalOpen(true)}
            onCartClick={() => setIsCartDrawerOpen(true)}
            onTrackOrderClick={() => setIsTrackingModalOpen(true)}
          />

          <MobileMenu isOpen={isMenuOpen} onNavigate={handleNavigate} />

          <main className="min-h-[calc(100vh-4rem)]">
            {currentPage === 'products' && (
              <ProductListingPage
                searchQuery={searchQuery}
                onClearSearch={handleClearSearch}
              />
            )}
            {currentPage === 'pdf-list' && (
              <ProductPDFPage onBackToCatalog={() => setCurrentPage('products')} />
            )}
            {currentPage === 'terms' && <TermsPage />}
            {currentPage === 'about' && <AboutPage />}
          </main>

          <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

          <CartDrawer
            isOpen={isCartDrawerOpen}
            onClose={() => setIsCartDrawerOpen(false)}
            onOpenAuth={() => {
              setIsCartDrawerOpen(false);
              setIsAuthModalOpen(true);
            }}
          />

          <OrderTrackingModal
            isOpen={isTrackingModalOpen}
            onClose={() => setIsTrackingModalOpen(false)}
          />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

