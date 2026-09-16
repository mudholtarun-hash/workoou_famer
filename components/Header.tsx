import React from 'react';
import { Wheat, Globe, MapPin } from 'lucide-react';
import { Dropdown } from './Dropdown';

const states = [
  { label: 'Punjab', value: 'PB' },
  { label: 'Haryana', value: 'HR' },
  { label: 'Uttar Pradesh', value: 'UP' },
  { label: 'Madhya Pradesh', value: 'MP' },
  { label: 'Maharashtra', value: 'MH' },
];

const districts = [
  { label: 'Amritsar', value: 'ASR' },
  { label: 'Ludhiana', value: 'LDH' },
  { label: 'Patiala', value: 'PTA' },
  { label: 'Jalandhar', value: 'JAL' },
  { label: 'Bathinda', value: 'BTI' },
];

const languages = [
  { label: 'English', value: 'en' },
  { label: 'Hindi', value: 'hi' },
  { label: 'Punjabi', value: 'pa' },
  { label: 'Marathi', value: 'mr' },
];

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Group */}
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-tr from-teal-500 to-green-500 rounded-full shadow-md group-hover:shadow-lg transition-shadow duration-300">
              <Wheat className="w-6 h-6 text-white" />
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-full transition-opacity duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold leading-none tracking-tight">
                <span className="text-teal-700">Kisan</span>
                <span className="text-gray-800 ml-1">Portal</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-green-600 font-semibold mt-0.5">Agriculture Hub</span>
            </div>
          </div>

          {/* Desktop Navigation / Dropdowns */}
          <div className="hidden md:flex items-center gap-4">
            <Dropdown label="Select State" options={states} icon={MapPin} />
            <Dropdown label="Select District" options={districts} />
            <div className="h-6 w-px bg-gray-200 mx-1"></div>
            <Dropdown label="English" options={languages} icon={Globe} />
          </div>

          {/* Mobile Menu Button (Placeholder for now) */}
          <div className="md:hidden">
            <button className="p-2 text-gray-600 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500">
              <span className="sr-only">Open menu</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
