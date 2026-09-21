import React, { useState } from 'react';
import { X, Search, Truck, CheckCircle2, Clock, MapPin, PackageCheck, AlertCircle } from 'lucide-react';
import { trackShipment, TrackingDetails } from '../services/shiprocket';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export default function OrderTrackingModal({ isOpen, onClose, initialQuery = '' }: OrderTrackingModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<TrackingDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) {
      setError('Please enter an AWB Code or Order ID');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await trackShipment(query);
      if (data) {
        setTrackingData(data);
      } else {
        setError('No tracking record found for this AWB/Order ID.');
        setTrackingData(null);
      }
    } catch (err) {
      setError('Unable to fetch tracking status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { key: 'ORDER_PLACED', label: 'Manifested' },
    { key: 'PICKED_UP', label: 'Picked Up' },
    { key: 'IN_TRANSIT', label: 'In Transit' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' },
  ];

  const currentStepIndex = trackingData
    ? steps.findIndex((s) => s.key === trackingData.currentStatus)
    : -1;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Truck className="h-6 w-6 text-blue-300" />
              <div>
                <h3 className="font-bold text-lg">Track Standard Courier</h3>
                <p className="text-xs text-blue-200">Powered by Shiprocket Courier Network</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <form onSubmit={handleTrack} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter AWB Code or Order ID (e.g. AWB123456)"
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
              >
                {loading ? <Clock className="h-4 w-4 animate-spin" /> : 'Track'}
              </button>
            </form>

            {error && (
              <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {!trackingData && !loading && (
              <div className="text-center py-10 space-y-2">
                <PackageCheck className="h-12 w-12 text-gray-300 mx-auto" />
                <p className="text-sm font-medium text-gray-600">Enter your Shipment AWB Number</p>
                <p className="text-xs text-gray-400">Track real-time courier updates, dispatch location, and estimated delivery.</p>
              </div>
            )}

            {trackingData && (
              <div className="space-y-6">
                {/* Status Summary Card */}
                <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 flex justify-between items-center text-xs">
                  <div>
                    <p className="text-gray-500">AWB Code: <span className="font-mono font-bold text-gray-900">{trackingData.awbCode}</span></p>
                    <p className="text-gray-500 mt-0.5">Courier: <span className="font-bold text-blue-900">{trackingData.courierName}</span></p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-blue-600 text-white font-semibold text-[11px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {trackingData.status}
                    </span>
                  </div>
                </div>

                {/* Tracking Progress Timeline */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Shipment Progress</p>
                  <div className="flex items-center justify-between relative pt-2">
                    {/* Progress Bar Line */}
                    <div className="absolute top-5 left-4 right-4 h-1 bg-gray-200 -z-10">
                      <div
                        className="h-full bg-blue-600 transition-all duration-500"
                        style={{
                          width: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 100)}%`,
                        }}
                      />
                    </div>

                    {steps.map((step, idx) => {
                      const isDone = idx <= currentStepIndex;
                      const isCurrent = idx === currentStepIndex;

                      return (
                        <div key={step.key} className="flex flex-col items-center text-center max-w-[65px]">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              isDone
                                ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                                : 'bg-white border-2 border-gray-300 text-gray-400'
                            }`}
                          >
                            {isDone ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                          </div>
                          <span
                            className={`text-[10px] mt-1.5 leading-tight font-medium ${
                              isCurrent
                                ? 'text-blue-700 font-bold'
                                : isDone
                                ? 'text-gray-900'
                                : 'text-gray-400'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Activity Feed */}
                <div className="space-y-3 pt-2">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Activity History</p>
                  <div className="space-y-3 pl-2 border-l-2 border-gray-200">
                    {trackingData.activities.map((act, index) => (
                      <div key={index} className="relative pl-4 text-xs space-y-0.5">
                        <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-100" />
                        <div className="flex justify-between items-start">
                          <p className="font-semibold text-gray-900">{act.activity}</p>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{act.date}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-gray-500">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span>{act.location}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
