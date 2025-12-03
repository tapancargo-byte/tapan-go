import React from 'react';
import { Package, Menu, X } from 'lucide-react';

interface HeaderProps {
  onOpenQuote: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenQuote }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => window.location.reload()}>
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3 text-white">
              <Package size={24} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-slate-800 leading-tight">Northeast</span>
              <span className="text-sm font-medium text-slate-500 tracking-wide uppercase">Cargo Express</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Services</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Tracking</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">About</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Contact</a>
            <button 
              onClick={onOpenQuote}
              className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5"
            >
              Book Shipment
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-blue-600 p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 shadow-lg absolute w-full left-0 top-20">
          <div className="flex flex-col space-y-4">
            <a href="#" className="text-gray-700 font-medium py-2 border-b border-gray-50">Services</a>
            <a href="#" className="text-gray-700 font-medium py-2 border-b border-gray-50">Tracking</a>
            <a href="#" className="text-gray-700 font-medium py-2 border-b border-gray-50">About</a>
            <a href="#" className="text-gray-700 font-medium py-2 border-b border-gray-50">Contact</a>
            <button 
              onClick={() => {
                setIsMenuOpen(false);
                onOpenQuote();
              }}
              className="bg-blue-700 text-white w-full py-3 rounded-lg font-semibold"
            >
              Book Shipment
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
