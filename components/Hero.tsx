import React from 'react';
import { CloudRain, TrendingUp, Leaf, MessageSquareText, Play, ArrowRight, ChevronDown } from 'lucide-react';
import { FeatureItem } from '../types';

const features: FeatureItem[] = [
  {
    id: 'weather',
    title: 'Weather Updates',
    icon: CloudRain,
    colorClass: 'bg-green-100 border-green-200',
    iconColorClass: 'text-green-600'
  },
  {
    id: 'market',
    title: 'Market Prices',
    icon: TrendingUp,
    colorClass: 'bg-gradient-to-br from-green-50 to-teal-50 border-teal-200',
    iconColorClass: 'text-teal-600'
  },
  {
    id: 'crop',
    title: 'Crop Guidance',
    icon: Leaf,
    colorClass: 'bg-emerald-100 border-emerald-200',
    iconColorClass: 'text-emerald-600'
  },
  {
    id: 'ai',
    title: 'AI Assistant',
    icon: MessageSquareText,
    colorClass: 'bg-teal-100 border-teal-200',
    iconColorClass: 'text-teal-700'
  }
];

interface HeroProps {
  onStartExploring: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartExploring }) => {
  return (
    <section className="relative w-full min-h-[calc(100vh-80px)] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-white px-4 py-12 sm:px-6 lg:px-8">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-green-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-100 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-8 shadow-sm hover:bg-teal-100 transition-colors cursor-default">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
          New: AI-Powered Crop Diagnosis
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          <span className="block text-teal-600 drop-shadow-sm">Smart Agriculture</span>
          <span className="block text-charcoal-900 mt-1 md:mt-2">for Modern Farmers</span>
        </h1>

        {/* Subheading */}
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 mb-12 leading-relaxed">
          Access real-time <span className="text-teal-700 font-medium">weather updates</span>, track 
          <span className="text-green-700 font-medium"> market prices</span>, get expert 
          <span className="text-emerald-700 font-medium"> crop recommendations</span>, and chat with our 
          <span className="text-teal-700 font-medium"> AI assistant</span> to optimize your yield.
        </p>

        {/* Feature Icons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-14 w-full max-w-3xl mx-auto">
          {features.map((feature) => (
            <div 
              key={feature.id} 
              className="flex flex-col items-center gap-3 group cursor-pointer"
            >
              <div className={`
                relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-full 
                ${feature.colorClass} border shadow-sm group-hover:shadow-md group-hover:-translate-y-1 
                transition-all duration-300
              `}>
                <feature.icon className={`w-8 h-8 sm:w-9 sm:h-9 ${feature.iconColorClass} transition-transform duration-300 group-hover:scale-110`} strokeWidth={1.5} />
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-teal-700 transition-colors">
                {feature.title}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-16">
          <button 
            onClick={onStartExploring}
            className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white transition-all duration-200 bg-gradient-to-r from-teal-500 to-green-500 rounded-full hover:from-teal-600 hover:to-green-600 shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            <span>Start Exploring</span>
            <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
          
          <button className="group inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-gray-700 transition-all duration-200 bg-white border-2 border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200">
            <Play className="w-5 h-5 mr-2 text-teal-600 fill-teal-50" />
            <span>Watch Demo</span>
          </button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce-slow text-gray-400">
          <span className="text-[10px] uppercase tracking-widest font-medium opacity-60">Scroll Down</span>
          <ChevronDown className="w-5 h-5" />
        </div>
      </div>
    </section>
  );
};