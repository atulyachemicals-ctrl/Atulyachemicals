import { X, Trash2, Plus, Minus, Truck, Package as PackageIcon, LogIn } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth?: () => void;
}

export default function CartDrawer({ isOpen, onClose, onOpenAuth }: CartDrawerProps) {
  const { cartItems, removeItem, updateQuantity, totalAmount, totalWeight } = useCart();
  const { isAuthenticated } = useAuth();
  const [selectedShipping, setSelectedShipping] = useState<'courier' | 'transport'>('courier');

  useEffect(() => {
    if (totalWeight >= 20) {
      setSelectedShipping('transport');
    }
  }, [totalWeight]);

  if (!isOpen) return null;

  const showCourierOption = totalWeight < 20;
  const transportCharge = totalWeight >= 100 ? 500 : totalWeight >= 20 ? 350 : 0;
  const shippingCharge = selectedShipping === 'transport' ? transportCharge : 0;
  const finalTotal = totalAmount + shippingCharge;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      if (onOpenAuth) {
        onOpenAuth();
      }
      return;
    }
    alert('Thank you for your order request! Our representative will contact you shortly.');
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900">Shopping Cart</h2>
            <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
              {cartItems.reduce((acc, i) => acc + i.quantity, 0)} items
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-700" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <PackageIcon className="h-16 w-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Your cart is empty</p>
              <p className="text-xs text-gray-400 mt-1">Browse chemicals and add packaging sizes to cart</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 shadow-xs">
                  <div className="flex gap-3 mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-sm">{item.chemicalName}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        CAS: <span className="font-mono">{item.casNumber || 'N/A'}</span> | HSN: <span className="font-mono">{item.hsnCode || 'N/A'}</span>
                      </p>
                      <div className="inline-block mt-1 bg-white border border-gray-200 px-2 py-0.5 rounded text-xs font-semibold text-gray-700">
                        {item.packaging}
                      </div>
                      {item.price > 0 && (
                        <p className="text-sm text-gray-900 mt-1.5 font-bold">
                          ₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })} each
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors self-start"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-200/60">
                    <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 py-1 hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5 text-gray-600" />
                      </button>
                      <span className="text-xs font-bold text-gray-900 min-w-[1.8rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2.5 py-1 hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5 text-gray-600" />
                      </button>
                    </div>

                    <span className="text-sm font-bold text-gray-900">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 p-6 space-y-4 bg-gray-50/50">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs">
              <p className="font-bold text-blue-900 mb-0.5">
                Total Weight: {totalWeight.toFixed(2)} kg
              </p>
              <p className="text-blue-700">
                {totalWeight < 20
                  ? 'Standard Courier and Bulk Transport available'
                  : totalWeight >= 100
                  ? 'Heavy Transport delivery (≥ 100 kg)'
                  : 'Transport delivery required (≥ 20 kg)'}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Shipping Method:</p>

              {showCourierOption && (
                <label
                  className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                    selectedShipping === 'courier' ? 'border-blue-600 bg-blue-50/60 shadow-xs' : 'border-gray-200 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="shipping"
                    value="courier"
                    checked={selectedShipping === 'courier'}
                    onChange={(e) => setSelectedShipping(e.target.value as 'courier' | 'transport')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <PackageIcon className="h-4 w-4 text-gray-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-xs">Standard Courier</p>
                    <p className="text-xs text-gray-500">Fast delivery for light packages</p>
                  </div>
                </label>
              )}

              <label
                className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                  selectedShipping === 'transport' || !showCourierOption ? 'border-blue-600 bg-blue-50/60 shadow-xs' : 'border-gray-200 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="shipping"
                  value="transport"
                  checked={selectedShipping === 'transport' || !showCourierOption}
                  onChange={(e) => setSelectedShipping(e.target.value as 'courier' | 'transport')}
                  disabled={!showCourierOption}
                  className="w-4 h-4 text-blue-600"
                />
                <Truck className="h-4 w-4 text-gray-600" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-xs">Bulk Chemical Transport</p>
                  <p className="text-xs text-gray-500">
                    {totalWeight >= 20 ? `₹${transportCharge} flat transport charge` : 'Calculated at dispatch'}
                  </p>
                </div>
              </label>
            </div>

            <div className="border-t border-gray-200 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal:</span>
                <span>₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              {shippingCharge > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Transport Freight:</span>
                  <span>₹{shippingCharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Estimated Total:</span>
                <span className="text-blue-600">₹{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 text-sm"
            >
              {isAuthenticated ? (
                'Proceed to Checkout'
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign In / Create Account to Checkout
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
