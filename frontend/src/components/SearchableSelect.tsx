import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
  code: string;
  name: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string, name: string) => void;
  placeholder: string;
  label: string;
  error?: string;
  disabled?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.name === value);

  return (
    <div className="space-y-2 relative" ref={containerRef}>


      <label className="text-[11px] font-bold text-gray-400 ml-1 uppercase tracking-wider">
        {label} {error && <span className="text-red-400">*</span>}
      </label>
      
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-lg cursor-pointer flex items-center justify-between transition-all ${
          isOpen ? 'bg-white border-blue-500' : 'border-transparent'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white hover:border-gray-200'}`}
      >
        <span className={`font-bold ${!value ? 'text-gray-400' : 'text-gray-900'}`}>
          {value || placeholder}
        </span>
        <ChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-[100] w-full mt-2 bg-white rounded-lg shadow-2xl border border-gray-100 overflow-hidden"
          >
            <div className="p-3 border-b border-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  autoFocus
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.code}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(option.code, option.name);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <span className={`text-sm font-bold ${value === option.name ? 'text-blue-600' : 'text-gray-700'}`}>
                      {option.name}
                    </span>
                    {value === option.name && <Check size={16} className="text-blue-600" />}
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-gray-400 text-sm font-medium">
                  Không tìm thấy kết quả
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-red-400 text-[10px] font-bold mt-1 ml-1">{error}</p>}
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default SearchableSelect;
