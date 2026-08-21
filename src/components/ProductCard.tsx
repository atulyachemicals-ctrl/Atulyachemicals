import { useState } from 'react';
import { Package, CheckCircle } from 'lucide-react';
import { Product } from '../types/product';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async () => {
    const variantData = product.variants.find((v) => v.id === selectedVariant);
    if (!variantData) return;

    setIsAdding(true);
    try {
      await addToCart(
        {
          chemicalName: product.title,
          casNumber: product.casNumber || '',
          hsnCode: product.hsnCode || '',
          packaging: variantData.title,
          price: parseFloat(variantData.price.amount),
          weightKg: 1,
        },
        quantity
      );
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200 overflow-hidden flex flex-col h-full">
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {product.title}
            </h3>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">CAS Number:</span> {product.casNumber || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">HSN Code:</span> {product.hsnCode || 'N/A'}
              </p>
            </div>
          </div>
          <Package className="h-8 w-8 text-gray-400 flex-shrink-0" />
        </div>

        <div className="flex-1 flex flex-col justify-end">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PACKAGING
              </label>
              <div className="w-full border border-gray-300 rounded-md max-h-[140px] overflow-y-auto">
                {product.variants.map((variant, index) => (
                  <div
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant.id)}
                    className={`px-4 py-3 cursor-pointer transition-colors ${
                      selectedVariant === variant.id
                        ? 'bg-blue-50 border-l-4 border-l-blue-600'
                        : 'hover:bg-gray-50'
                    } ${index !== 0 ? 'border-t border-gray-200' : ''}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">
                        {variant.title}
                      </span>
                      {isAuthenticated && (
                        <span className="text-sm font-bold text-gray-900">
                          ₹{parseFloat(variant.price.amount).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddToCart}
                disabled={isAdding || !selectedVariant}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors font-medium flex items-center justify-center gap-2"
              >
                {showSuccess ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Added
                  </>
                ) : (
                  <>
                    <Package className="h-5 w-5" />
                    {isAdding ? 'Adding...' : 'Add to Cart'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
