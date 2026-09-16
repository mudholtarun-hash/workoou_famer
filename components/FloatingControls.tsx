import React from 'react';
import { MessageCircle, Mic } from 'lucide-react';

interface FloatingControlsProps {
  onOpenChat?: () => void;
}

export const FloatingControls: React.FC<FloatingControlsProps> = ({ onOpenChat }) => {
  return (
    <>
      {/* Mic Overlay - Bottom Left */}
      <div className="fixed bottom-6 left-6 z-40 animate-fade-in-up">
        <button 
          className="group flex items-center justify-center w-12 h-12 bg-white/90 backdrop-blur border border-gray-200 rounded-full shadow-lg hover:shadow-xl hover:bg-teal-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          aria-label="Activate voice commands"
        >
           <div className="absolute inset-0 bg-teal-500 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300 animate-pulse"></div>
          <Mic className="w-5 h-5 text-gray-600 group-hover:text-teal-600 transition-colors" />
        </button>
      </div>

      {/* Chat Button - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-40 animate-bounce-subtle">
        <button 
          onClick={onOpenChat}
          className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-r from-teal-600 to-green-600 rounded-full shadow-lg shadow-teal-900/20 hover:shadow-xl hover:shadow-teal-900/30 hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-teal-200"
          aria-label="Open AI Assistant Chat"
        >
          <MessageCircle className="w-7 h-7 text-white fill-current" />
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
          </span>
        </button>
      </div>
    </>
  );
};