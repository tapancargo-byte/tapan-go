import React, { useState } from 'react';
import { QuoteResult, QuoteRequest } from '../types';
import { generateQuote } from '../services/geminiService';
import { X, Calculator, IndianRupee } from 'lucide-react';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuoteModal: React.FC<QuoteModalProps> = ({ isOpen, onClose }) => {
  const [request, setRequest] = useState<QuoteRequest>({
    origin: '',
    destination: '',
    weight: '',
    type: 'Standard'
  });
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await generateQuote(request);
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="bg-white/20 p-2 rounded-lg">
                <Calculator size={24} />
             </div>
             <h3 className="text-xl font-bold">Get a Quote</h3>
          </div>
          <button onClick={onClose} className="text-blue-100 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Origin City</label>
                  <input
                    required
                    type="text"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="e.g. Guwahati"
                    value={request.origin}
                    onChange={(e) => setRequest({...request, origin: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Destination City</label>
                  <input
                    required
                    type="text"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="e.g. New Delhi"
                    value={request.destination}
                    onChange={(e) => setRequest({...request, destination: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label>
                <input
                  required
                  type="number"
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g. 50"
                  value={request.weight}
                  onChange={(e) => setRequest({...request, weight: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Service Type</label>
                <select 
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                  value={request.type}
                  onChange={(e) => setRequest({...request, type: e.target.value})}
                >
                  <option value="Standard">Standard Road (Cost Effective)</option>
                  <option value="Express">Express Air (Fastest)</option>
                  <option value="Fragile">Fragile Handling</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {isLoading ? 'Calculating...' : 'Calculate Price'}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6 animate-fadeIn">
              <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                <p className="text-green-600 font-medium mb-1">Estimated Cost</p>
                <div className="flex items-center justify-center text-4xl font-bold text-slate-800">
                  <IndianRupee size={32} strokeWidth={2.5} />
                  {result.price}
                </div>
                <p className="text-slate-500 text-sm mt-2">{result.serviceType}</p>
              </div>

              <div className="space-y-3 text-left">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                   <span className="text-slate-500">Estimated Time</span>
                   <span className="font-semibold text-slate-800">{result.estimatedTime}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                   <span className="text-slate-500">Route</span>
                   <span className="font-semibold text-slate-800">{request.origin} → {request.destination}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600">
                  {result.details}
                </div>
              </div>

              <button 
                onClick={() => setResult(null)}
                className="text-blue-600 font-medium hover:text-blue-800"
              >
                Calculate another quote
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuoteModal;
