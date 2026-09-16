import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { DropdownOption } from '../types';

interface DropdownProps {
  label: string;
  options: DropdownOption[];
  icon?: React.ElementType;
  value?: string;
  onChange?: (value: string) => void;
}

export const Dropdown: React.FC<DropdownProps> = ({ label, options, icon: Icon, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: DropdownOption) => {
    setSelectedLabel(option.label);
    if (onChange) onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full 
          text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-teal-200 
          transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1
          ${isOpen ? 'ring-2 ring-teal-500 border-teal-500' : ''}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {Icon && <Icon className="w-4 h-4 text-teal-600" />}
        <span>{selectedLabel || label}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <ul
          className="absolute z-50 w-56 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100 origin-top-left"
          role="listbox"
        >
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                onClick={() => handleSelect(option)}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                role="option"
                aria-selected={selectedLabel === option.label}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
