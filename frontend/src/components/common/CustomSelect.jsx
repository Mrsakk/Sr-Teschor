import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomSelect({ value, onChange, options, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        className="w-full flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-800 bg-transparent cursor-pointer mt-0.5 select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate pr-2">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-3 w-48 sm:w-56 max-h-60 overflow-y-auto bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div
            className={`px-4 py-2.5 text-xs cursor-pointer flex items-center justify-between hover:bg-orange-50 transition-colors ${
              value === '' ? 'text-orange-600 font-bold bg-orange-50/50' : 'text-slate-700 font-medium'
            }`}
            onClick={() => { onChange(''); setIsOpen(false); }}
          >
            <span>{placeholder}</span>
            {value === '' && <Check className="w-4 h-4 text-orange-500" />}
          </div>
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`px-4 py-2.5 text-xs cursor-pointer flex items-center justify-between hover:bg-orange-50 transition-colors ${
                value === opt.value ? 'text-orange-600 font-bold bg-orange-50/50' : 'text-slate-700 font-medium'
              }`}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
            >
              <span>{opt.label}</span>
              {value === opt.value && <Check className="w-4 h-4 text-orange-500" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
