import React from 'react';
import { Plane, Clock, ShieldCheck, MapPin, Truck } from 'lucide-react';

const FeaturesBar: React.FC = () => {
  return (
    <div className="bg-blue-50 border-t border-blue-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between items-center gap-6 text-center sm:text-left">
          
          <div className="flex items-center gap-3 mx-auto sm:mx-0">
            <div className="p-2 bg-blue-100 rounded-full text-blue-600">
              <Plane size={20} />
            </div>
            <span className="text-slate-700 font-medium text-sm sm:text-base">Air & Road Shipments</span>
          </div>

          <div className="hidden sm:block w-px h-8 bg-blue-200"></div>

          <div className="flex items-center gap-3 mx-auto sm:mx-0">
            <div className="p-2 bg-green-100 rounded-full text-green-600">
              <Clock size={20} />
            </div>
            <span className="text-slate-700 font-medium text-sm sm:text-base">98%+ On-Time</span>
          </div>

          <div className="hidden md:block w-px h-8 bg-blue-200"></div>

          <div className="flex items-center gap-3 mx-auto sm:mx-0">
            <div className="p-2 bg-purple-100 rounded-full text-purple-600">
              <ShieldCheck size={20} />
            </div>
            <span className="text-slate-700 font-medium text-sm sm:text-base">15 Years Experience</span>
          </div>

          <div className="hidden lg:block w-px h-8 bg-blue-200"></div>

          <div className="flex items-center gap-3 mx-auto sm:mx-0">
            <div className="p-2 bg-orange-100 rounded-full text-orange-600">
              <MapPin size={20} />
            </div>
            <span className="text-slate-700 font-medium text-sm sm:text-base">Real-Time Tracking</span>
          </div>

          <div className="hidden lg:block w-px h-8 bg-blue-200"></div>

          <div className="flex items-center gap-3 mx-auto sm:mx-0">
            <div className="p-2 bg-teal-100 rounded-full text-teal-600">
              <Truck size={20} />
            </div>
            <span className="text-slate-700 font-medium text-sm sm:text-base">Door-to-Door Delivery</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FeaturesBar;
