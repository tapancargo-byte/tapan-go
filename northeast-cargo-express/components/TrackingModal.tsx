import React from 'react';
import { TrackingResult } from '../types';
import { X, CheckCircle, Truck, Package, AlertCircle } from 'lucide-react';

interface TrackingModalProps {
  data: TrackingResult | null;
  onClose: () => void;
  isLoading: boolean;
}

const TrackingModal: React.FC<TrackingModalProps> = ({ data, onClose, isLoading }) => {
  if (!data && !isLoading) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Shipment Status</h3>
            {data && <p className="text-sm text-slate-500">AWB: {data.awb}</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 bg-white rounded-full shadow-sm border border-slate-200">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-600 font-medium animate-pulse">Locating your package...</p>
            </div>
          ) : data ? (
            <div className="space-y-8">
              {/* Summary Card */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-blue-100 text-sm">Status</p>
                    <p className="text-2xl font-bold">{data.currentStatus}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100 text-sm">Estimated Delivery</p>
                    <p className="text-xl font-semibold">{data.estimatedDelivery}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                   <span className="flex-1 truncate">{data.origin}</span>
                   <Truck size={16} />
                   <span className="flex-1 truncate text-right">{data.destination}</span>
                </div>
              </div>

              {/* Timeline */}
              <div className="relative pl-4">
                <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-slate-200"></div>
                {data.history.map((event, index) => (
                  <div key={index} className="relative mb-8 last:mb-0 pl-10 group">
                    <div className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 ${index === 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {index === 0 ? <Truck size={18} /> : <CheckCircle size={18} />}
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                       <p className="text-sm text-slate-400 mb-1">{event.timestamp}</p>
                       <h4 className="font-semibold text-slate-800">{event.status}</h4>
                       <p className="text-slate-600 text-sm mt-1">{event.description}</p>
                       <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                         <MapPin size={12} /> {event.location}
                       </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
             <div className="text-center py-12">
               <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
               <p className="text-lg text-slate-800 font-medium">Shipment not found</p>
               <p className="text-slate-500">Please check the AWB number and try again.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper component for map pin
const MapPin = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);

export default TrackingModal;
