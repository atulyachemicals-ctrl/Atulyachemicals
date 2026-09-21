import { X, Trash2, Plus, Minus, Truck, Package as PackageIcon, LogIn, CheckCircle2, AlertCircle, MapPin, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { checkPincodeServiceability, CourierOption, ServiceabilityResponse } from '../services/shiprocket';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth?: () => void;
}

export default function CartDrawer({ isOpen, onClose, onOpenAuth }: CartDrawerProps) {
  const { cartItems, removeItem, updateQuantity, totalAmount, totalWeight } = useCart();
  const { isAuthenticated, customer } = useAuth();
  const [selectedShipping, setSelectedShipping] = useState<'courier' | 'transport'>('courier');

  // Shiprocket Courier State
  const [pincode, setPincode] = useState('');
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [pincodeResult, setPincodeResult] = useState<ServiceabilityResponse | null>(null);
  const [selectedCourier, setSelectedCourier] = useState<CourierOption | null>(null);

  useEffect(() => {
    if (totalWeight >= 20) {
      setSelectedShipping('transport');
    }
  }, [totalWeight]);

  // Extract pincode from customer address if available
  useEffect(() => {
    if (customer?.shippingAddress) {
      const match = customer.shippingAddress.match(/\b\d{6}\b/);
      if (match && match[0]) {
        setPincode(match[0]);
        handleCheckPincode(match[0]);
      }
    }
  }, [customer]);

  const handleCheckPincode = async (targetPincode?: string) => {
    const code = targetPincode || pincode;
    if (!code || code.trim().length !== 6) return;

    setIsCheckingPincode(true);
    try {
      const res = await checkPincodeServiceability(code, totalWeight);
      setPincodeResult(res);
      if (res.isServiceable && res.recommendedCourier) {
        setSelectedCourier(res.recommendedCourier);
      } else {
        setSelectedCourier(null);
      }
    } catch (err) {
      console.error('Failed to check courier pincode serviceability:', err);
    } finally {
      setIsCheckingPincode(false);
    }
  };

  if (!isOpen) return null;

  const showCourierOption = totalWeight < 20;
  const transportCharge = totalWeight >= 100 ? 500 : totalWeight >= 20 ? 350 : 0;
  const courierCharge = selectedShipping === 'courier' && selectedCourier ? selectedCourier.rate : 0;
  const shippingCharge = selectedShipping === 'transport' ? transportCharge : courierCharge;
  const finalTotal = totalAmount + shippingCharge;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      if (onOpenAuth) {
        onOpenAuth();
      }
      return;
    }

    const companyInfo = customer?.companyName ? ` (${customer.companyName})` : '';
    const shipAddr = customer?.shippingAddress ? `\nShipping to: ${customer.shippingAddress}` : '';
    const courierDetails = selectedShipping === 'courier' && selectedCourier
      ? `\nCourier: ${selectedCourier.name} (Freight: ₹${selectedCourier.rate}, EST: ${selectedCourier.etd})`
      : `\nTransport Method: Packing and Forwarding (Freight: ₹${transportCharge})`;

    alert(`Thank you for your order request, ${customer?.fullName}${companyInfo}!${shipAddr}${courierDetails}\n\nOur representative will contact you shortly to confirm dispatch.`);
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

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
            {/* Customer Delivery & Address Details */}
            {isAuthenticated && customer && (
              <div className="bg-white border border-gray-200 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex justify-between items-center font-bold text-gray-900 border-b border-gray-100 pb-1.5">
                  <span>Order Details</span>
                  <span className="text-blue-600">{customer.companyName || customer.fullName}</span>
                </div>
                <div className="text-gray-600 space-y-1">
                  <p><span className="font-semibold text-gray-700">Shipping:</span> {customer.shippingAddress || 'Not set'}</p>
                  <p><span className="font-semibold text-gray-700">Billing:</span> {customer.billingAddress || 'Same as shipping'}</p>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs">
              <p className="font-bold text-blue-900 mb-0.5">
                Total Weight: {totalWeight.toFixed(2)} kg
              </p>
              <p className="text-blue-700">
                {totalWeight < 20
                  ? 'Standard Courier and Transport delivery available'
                  : totalWeight >= 100
                  ? 'Heavy Transport delivery (≥ 100 kg)'
                  : 'Transport delivery required (≥ 20 kg)'}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Shipping Method:</p>

              {showCourierOption && (
                <div className={`border rounded-xl transition-all overflow-hidden ${
                  selectedShipping === 'courier' ? 'border-blue-600 bg-blue-50/40 shadow-xs' : 'border-gray-200 bg-white'
                }`}>
                  <label className="flex items-center gap-3 p-3 cursor-pointer">
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
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-gray-900 text-xs">Standard Courier (Shiprocket)</p>
                        {selectedCourier && selectedShipping === 'courier' && (
                          <span className="font-bold text-xs text-blue-700">₹{selectedCourier.rate}</span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500">Fast doorstep courier for parcels under 20 kg</p>
                    </div>
                  </label>

                  {/* Shiprocket Pincode & Rates Panel */}
                  {selectedShipping === 'courier' && (
                    <div className="px-3 pb-3 pt-1 border-t border-blue-100/80 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="relative flex-1">
                          <MapPin className="h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                          <input
                            type="text"
                            maxLength={6}
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                            placeholder="Enter 6-digit Pincode"
                            className="w-full pl-8 pr-2 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-blue-500 outline-hidden"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCheckPincode()}
                          disabled={isCheckingPincode || pincode.length !== 6}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50 transition-colors flex items-center gap-1"
                        >
                          {isCheckingPincode ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Check'}
                        </button>
                      </div>

                      {pincodeResult && (
                        <div className="space-y-1.5 text-xs">
                          {pincodeResult.isServiceable ? (
                            <div className="space-y-1.5">
                              <p className="text-[11px] font-semibold text-green-700 flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                                <span>Courier Available for {pincodeResult.deliveryPincode}</span>
                              </p>
                              <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                                {pincodeResult.couriers.map((c) => (
                                  <div
                                    key={c.id}
                                    onClick={() => setSelectedCourier(c)}
                                    className={`p-2 rounded-lg border cursor-pointer text-[11px] flex justify-between items-center transition-all ${
                                      selectedCourier?.id === c.id
                                        ? 'border-blue-600 bg-white ring-1 ring-blue-500 shadow-xs'
                                        : 'border-gray-200 bg-white/80 hover:bg-white'
                                    }`}
                                  >
                                    <div>
                                      <p className="font-bold text-gray-900">{c.name}</p>
                                      <p className="text-[10px] text-gray-500">Est. Delivery: {c.etd}</p>
                                    </div>
                                    <span className="font-bold text-blue-700 text-xs">₹{c.rate}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-[11px] text-red-600 flex items-center gap-1 bg-red-50 p-2 rounded-lg border border-red-200">
                              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                              <span>{pincodeResult.message || 'Pincode not serviceable by standard courier.'}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
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
                  <p className="font-semibold text-gray-900 text-xs">Packing and forwarding upto transport</p>
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
              {selectedShipping === 'courier' && selectedCourier && (
                <div className="flex justify-between text-blue-700 font-medium">
                  <span>Courier Freight ({selectedCourier.name}):</span>
                  <span>₹{selectedCourier.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              {selectedShipping === 'transport' && shippingCharge > 0 && (
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

