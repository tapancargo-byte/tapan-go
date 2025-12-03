import React, { useState } from 'react';
import { trackShipment } from '../services/geminiService';
import { TrackingResult } from '../types';
import TrackingModal from './TrackingModal';
import { Search } from 'lucide-react';

interface HeroProps {
  onOpenQuote: () => void;
}

const Hero: React.FC<HeroProps> = ({ onOpenQuote }) => {
  const [awb, setAwb] = useState('');
  const [trackingData, setTrackingData] = useState<TrackingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!awb.trim()) return;

    setShowModal(true);
    setIsLoading(true);
    setTrackingData(null); // Clear previous

    try {
      const data = await trackShipment(awb);
      setTrackingData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-slate-50 to-blue-50 pt-16 pb-24 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-white skew-x-[-20deg] translate-x-1/3 opacity-50 z-0"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left space-y-8">
            <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 leading-[1.15] tracking-tight">
              15 Years Connecting <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-500">
                Northeast & Delhi
              </span> <br className="hidden lg:block" />
              With Speed and Trust
            </h1>
            
            <p className="text-lg text-slate-600 font-medium">
              Door-to-door pickup • Real-time tracking • 24/7 support
            </p>

            {/* Tracking Widget */}
            <div className="max-w-xl mx-auto lg:mx-0 bg-white p-2 rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                 <input 
                  type="text" 
                  value={awb}
                  onChange={(e) => setAwb(e.target.value)}
                  placeholder="AWB / reference number (e.g. 123-4567890)" 
                  className="w-full h-14 pl-5 pr-4 rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                 />
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                   <Search size={20} />
                 </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleTrack}
                  className="flex-1 sm:flex-none h-14 px-8 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg"
                >
                  Track
                </button>
                <button 
                  onClick={onOpenQuote}
                  className="flex-1 sm:flex-none h-14 px-6 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl transition-all border border-blue-200"
                >
                  Get a Quote
                </button>
              </div>
            </div>

            <p className="text-sm text-slate-400">
              Try tracking dummy ID: <span className="font-mono bg-slate-100 px-1 py-0.5 rounded cursor-pointer hover:text-blue-600" onClick={() => setAwb('NEC-882190-DEL')}>NEC-882190-DEL</span>
            </p>
          </div>

          {/* Right Image */}
          <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
             <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/20 border-4 border-white transform hover:scale-[1.01] transition-transform duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                  alt="Logistics Warehouse" 
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent"></div>
             </div>
             
             {/* Floating Badge */}
             <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-blue-50 hidden sm:flex items-center gap-4 animate-bounce-slow">
                <div className="bg-green-100 p-3 rounded-full text-green-600">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Success Rate</p>
                  <p className="text-xl font-bold text-slate-800">99.8%</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      <TrackingModal 
        data={trackingData}
        isLoading={isLoading}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default Hero;
