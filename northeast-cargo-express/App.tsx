import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import FeaturesBar from './components/FeaturesBar';
import QuoteModal from './components/QuoteModal';

const App: React.FC = () => {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Header onOpenQuote={() => setIsQuoteModalOpen(true)} />
      <Hero onOpenQuote={() => setIsQuoteModalOpen(true)} />
      <FeaturesBar />
      
      {/* Additional content section to make the page feel complete */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why choose Northeast Cargo?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">We specialize in connecting the Seven Sisters with the rest of India. Our dedicated fleet and specialized handling ensure your goods arrive safely and on time.</p>
        </div>
      </div>

      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} Northeast Cargo Express. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

      <QuoteModal 
        isOpen={isQuoteModalOpen} 
        onClose={() => setIsQuoteModalOpen(false)} 
      />
    </div>
  );
};

export default App;
