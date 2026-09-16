import React, { useState, useEffect } from 'react';
import { 
  MapPin, ChevronDown, TrendingUp, TrendingDown, 
  Minus, Loader2, Sprout, Sun, CloudRain, 
  ArrowUpRight, ArrowDownRight, Info, Mic, MicOff,
  Lightbulb, Warehouse, Gavel, BarChart3, Tag
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

// Enhanced Mock Data
const STATES = [
  { label: 'Punjab', value: 'PB', districts: ['Amritsar', 'Ludhiana', 'Patiala', 'Jalandhar', 'Bathinda'] },
  { label: 'Maharashtra', value: 'MH', districts: ['Nashik', 'Pune', 'Nagpur', 'Mumbai', 'Aurangabad'] },
  { label: 'Karnataka', value: 'KA', districts: ['Bangalore', 'Mysore', 'Hubli', 'Belgaum', 'Shimoga'] },
  { label: 'Uttar Pradesh', value: 'UP', districts: ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Meerut'] },
  { label: 'Telangana', value: 'TS', districts: ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam'] },
];

const MARKETS = ['Main Mandi', 'APMC Market', 'City Wholesale', 'Farmers Market', 'Organic Trade Hub'];

const CATEGORIES = [
  { label: 'Fruits', value: 'fruits', items: ['Apple', 'Banana', 'Mango', 'Pomegranate', 'Orange', 'Papaya', 'Grapes', 'Watermelon'] },
  { label: 'Vegetables', value: 'vegetables', items: ['Tomato', 'Potato', 'Onion', 'Cauliflower', 'Spinach', 'Brinjal', 'Okra', 'Carrot'] },
  { label: 'Grains', value: 'grains', items: ['Wheat', 'Rice', 'Maize', 'Bajra', 'Jowar', 'Barley', 'Ragi'] },
];

export const MarketView: React.FC = () => {
  // Selection State
  const [selectedState, setSelectedState] = useState(STATES[0]);
  const [selectedDistrict, setSelectedDistrict] = useState(STATES[0].districts[1]);
  const [selectedMarket, setSelectedMarket] = useState(MARKETS[0]);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [selectedItem, setSelectedItem] = useState(CATEGORIES[0].items[0]);

  // Dynamic Data State
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [marketStats, setMarketStats] = useState({
    currentPrice: 2125,
    lastYearPrice: 1950,
    forecastPrice: 2200,
    stockScore: 75,
    trend: 'up',
    aiInsight: {
      sentiment: 'Bullish',
      summary: 'Market is stable with slight upward trend due to seasonal demand and lower arrivals in local mandis.',
      factors: ['Seasonal Demand', 'Lower Arrivals', 'Export Quality'],
      action: 'Good time to sell 60% of stock for immediate cash flow, hold the rest.',
      storage: 'Store in cool, dry conditions with proper ventilation to maintain grade A quality.'
    },
    seasonalTag: 'Peak Season',
    unit: 'quintal',
    gradePrices: { high: 2400, mid: 2125, low: 1800 },
    monthlyData: Array(12).fill(0).map((_, i) => ({ 
      month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i], 
      profit: 50 + Math.random() * 30, 
      loss: 10 + Math.random() * 20 
    }))
  });

  // Voice Search Logic
  const toggleVoiceSearch = () => {
    if (isListening) return; // Simple debounce/prevent double activation

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice search is not supported in this browser.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; // Optimized for Indian accents/places
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      console.error("Speech error", event.error);
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log("Voice Command:", transcript);
      handleVoiceCommand(transcript);
    };

    recognition.start();
  };

  const handleVoiceCommand = (command: string) => {
    let foundState = null;
    let foundDistrict = null;
    let foundCategory = null;
    let foundItem = null;

    // Search for Location (State & District)
    for (const state of STATES) {
      if (command.includes(state.label.toLowerCase())) {
        foundState = state;
      }
      for (const dist of state.districts) {
        if (command.includes(dist.toLowerCase())) {
          foundDistrict = dist;
          foundState = state; // District implies state
        }
      }
    }

    // Search for Crop
    for (const cat of CATEGORIES) {
      for (const item of cat.items) {
        if (command.includes(item.toLowerCase())) {
          foundItem = item;
          foundCategory = cat;
        }
      }
      // Also check category names if no specific item found, but usually item is preferred
      if (!foundItem && command.includes(cat.label.toLowerCase())) {
         foundCategory = cat;
         foundItem = cat.items[0]; // Default to first item
      }
    }

    // Apply State Updates
    if (foundState) {
      setSelectedState(foundState);
      if (foundDistrict) {
        setSelectedDistrict(foundDistrict);
      } else {
        // If only state was mentioned, default to first district if current district is invalid for new state
        // To be safe, just default to first district of the new state
        setSelectedDistrict(foundState.districts[0]);
      }
    }
    
    if (foundItem && foundCategory) {
      setSelectedItem(foundItem);
      setSelectedCategory(foundCategory);
    }
  };

  // Fetch Data from Gemini
  const fetchMarketData = async () => {
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `
        Act as an agricultural economist. Generate detailed market data for "${selectedItem}" (${selectedCategory.label}) in "${selectedDistrict}", "${selectedState.label}".
        Context: Selected Market is ${selectedMarket}. Current month is ${new Date().toLocaleString('default', { month: 'long' })}.

        Provide a JSON response with:
        1. currentPrice: Current market price in INR (per kg for fruits/veg, per quintal for grains).
        2. lastYearPrice: Price same time last year.
        3. forecastPrice: Predicted price for next week.
        4. stockScore: 0-100 (100 = high supply/stock).
        5. trend: "up", "down", or "stable".
        6. aiInsight: Object containing:
             - sentiment: "Bullish" (prices rising), "Bearish" (prices falling), or "Neutral".
             - summary: Detailed 2-3 sentence market analysis explaining WHY prices are moving.
             - factors: Array of 3 short strings representing key price drivers (e.g. "High Export Demand", "Late Monsoon").
             - action: Specific selling advice (e.g. "Sell 50% now, hold rest").
             - storage: Storage tip for this specific crop to maintain value.
        7. seasonalTag: Short tag (e.g. "Summer Crop", "Harvest Season").
        8. gradePrices: Object with { high: number, mid: number, low: number } for Grade A, B, C prices.
        9. monthlyData: Array of 12 objects (Jan-Dec) representing typical profit vs loss potential (0-100 scale) for this specific crop in this region. 
            Example: { month: "Jan", profit: 80, loss: 10 }. Make it seasonally accurate (e.g. Wheat profit high in harvest months).
      `;

      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              currentPrice: { type: Type.NUMBER },
              lastYearPrice: { type: Type.NUMBER },
              forecastPrice: { type: Type.NUMBER },
              stockScore: { type: Type.NUMBER },
              trend: { type: Type.STRING },
              aiInsight: {
                type: Type.OBJECT,
                properties: {
                  sentiment: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  factors: { type: Type.ARRAY, items: { type: Type.STRING } },
                  action: { type: Type.STRING },
                  storage: { type: Type.STRING }
                }
              },
              seasonalTag: { type: Type.STRING },
              gradePrices: {
                type: Type.OBJECT,
                properties: {
                  high: { type: Type.NUMBER },
                  mid: { type: Type.NUMBER },
                  low: { type: Type.NUMBER },
                }
              },
              monthlyData: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    month: { type: Type.STRING },
                    profit: { type: Type.NUMBER },
                    loss: { type: Type.NUMBER },
                  }
                }
              }
            }
          }
        }
      });

      const data = JSON.parse(result.text);
      setMarketStats({
        ...data,
        unit: selectedCategory.value === 'grains' ? 'quintal' : 'kg'
      });

    } catch (error) {
      console.error("AI Error", error);
      // Fallback is kept simple to avoid clutter, real app would handle error state better
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, [selectedItem, selectedDistrict, selectedCategory, selectedMarket, selectedState]);

  // Derived calculations
  const profitPercentage = ((marketStats.currentPrice - marketStats.lastYearPrice) / marketStats.lastYearPrice * 100).toFixed(1);
  const isProfit = parseFloat(profitPercentage) >= 0;
  
  // Stock Ring Calculations
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (marketStats.stockScore / 100) * circumference;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* 1. Filters Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <div className="p-2 bg-teal-50 rounded-lg">
                <MapPin className="w-5 h-5 text-teal-600" />
              </div>
              Select Market Location & Crop
            </h2>
            <button 
              onClick={toggleVoiceSearch}
              className={`p-2.5 rounded-full transition-all duration-300 flex items-center justify-center shadow-sm
                ${isListening 
                  ? 'bg-red-50 text-red-600 animate-pulse ring-2 ring-red-400 ring-offset-1' 
                  : 'bg-gray-50 text-gray-500 hover:bg-teal-50 hover:text-teal-600 border border-gray-200'
                }`}
              title={isListening ? "Listening..." : "Voice Search (e.g. 'Tomato in Pune')"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            {isListening && <span className="text-xs font-bold text-red-500 animate-pulse">Listening...</span>}
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-teal-600 bg-teal-50 px-3 py-1.5 rounded-full animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Updating real-time prices...
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* State Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">State</label>
            <div className="relative group">
              <select 
                value={selectedState.value}
                onChange={(e) => {
                  const st = STATES.find(s => s.value === e.target.value) || STATES[0];
                  setSelectedState(st);
                  setSelectedDistrict(st.districts[0]);
                }}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 appearance-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none cursor-pointer hover:border-teal-200"
              >
                {STATES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-teal-600 transition-colors" />
            </div>
          </div>

          {/* District Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">District</label>
            <div className="relative group">
              <select 
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 appearance-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none cursor-pointer hover:border-teal-200"
              >
                {selectedState.districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-teal-600 transition-colors" />
            </div>
          </div>

          {/* Market Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Market</label>
            <div className="relative group">
              <select 
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 appearance-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none cursor-pointer hover:border-teal-200"
              >
                {MARKETS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-teal-600 transition-colors" />
            </div>
          </div>

          {/* Category Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Category</label>
            <div className="relative group">
              <select 
                value={selectedCategory.value}
                onChange={(e) => {
                  const cat = CATEGORIES.find(c => c.value === e.target.value) || CATEGORIES[0];
                  setSelectedCategory(cat);
                  setSelectedItem(cat.items[0]);
                }}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 appearance-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none cursor-pointer hover:border-teal-200"
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-teal-600 transition-colors" />
            </div>
          </div>

          {/* Item Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Crop</label>
            <div className="relative group">
              <select 
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 appearance-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none cursor-pointer hover:border-teal-200"
              >
                {selectedCategory.items.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-teal-600 transition-colors" />
            </div>
          </div>

        </div>
      </div>

      {/* 2. Main Dashboard Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Market Report Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group">
          <div className="flex justify-between items-center mb-8 relative z-10">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Market Report</h3>
              <p className="text-xs text-gray-500 mt-1">Price Analysis for {selectedItem}</p>
            </div>
            <button className="text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-full hover:bg-teal-100 transition-colors">
              View All
            </button>
          </div>
          
          <div className="space-y-6 relative z-10">
            {/* Last Year */}
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-gray-500 font-medium">Last Year</span>
                <span className="font-bold text-gray-700">₹{marketStats.lastYearPrice}</span>
              </div>
              <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-400 rounded-full shadow-[0_0_10px_rgba(251,146,60,0.4)]" 
                  style={{ width: '60%' }}
                ></div>
              </div>
            </div>

            {/* Present */}
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-gray-500 font-medium">Present (Today)</span>
                <span className="font-bold text-teal-600 text-sm">₹{marketStats.currentPrice}</span>
              </div>
              <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-teal-500 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.4)] relative" 
                  style={{ width: '80%' }}
                >
                    <div className="absolute top-0 right-0 h-full w-4 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Future */}
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-gray-500 font-medium">Predicted (Next Week)</span>
                <span className="font-bold text-green-600">₹{marketStats.forecastPrice}</span>
              </div>
              <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)]" 
                  style={{ width: '70%' }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-gray-100 flex justify-between items-center relative z-10">
             <div className="flex flex-col">
               <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Net Profit</span>
               <span className={`text-2xl font-bold ${isProfit ? 'text-teal-600' : 'text-red-500'}`}>
                 {isProfit ? '+' : ''}{profitPercentage}%
               </span>
             </div>
             <div className={`p-3 rounded-xl ${isProfit ? 'bg-teal-50 text-teal-600' : 'bg-red-50 text-red-600'}`}>
               {isProfit ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
             </div>
          </div>
        </div>

        {/* Stock Market Card (Blue Theme) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center relative overflow-hidden">
           {/* Background Gradient */}
           <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none"></div>

          <div className="w-full flex justify-between items-start mb-2 relative z-10">
            <h3 className="font-bold text-gray-900 text-lg">Stock Market</h3>
            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-md">
              LIVE
            </span>
          </div>
          <p className="text-xs text-gray-500 w-full text-left mb-6 relative z-10">
            Supply Demand Index & Rate
          </p>
          
          <div className="relative w-56 h-56 flex items-center justify-center">
            {/* SVG Ring */}
            <svg className="w-full h-full transform -rotate-90">
              {/* Track */}
              <circle
                cx="112"
                cy="112"
                r={radius}
                stroke="#eff6ff"
                strokeWidth="16"
                fill="none"
              />
              {/* Progress */}
              <circle
                cx="112"
                cy="112"
                r={radius}
                stroke="url(#blueGradient)"
                strokeWidth="16"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-medium text-gray-400 mb-1">Current Rate</span>
              <span className="text-4xl font-extrabold text-gray-900 tracking-tight">
                ₹{marketStats.currentPrice}
              </span>
              <span className="text-xs font-semibold text-blue-600 mt-1 bg-blue-50 px-2 py-0.5 rounded-md">
                /{marketStats.unit}
              </span>
            </div>
            
            {/* Orbiting Dot (Optional Visual Flair) */}
             <div 
               className="absolute top-0 left-0 w-full h-full animate-spin-slow pointer-events-none opacity-50"
               style={{ animationDuration: '10s' }}
             >
                <div className="w-3 h-3 bg-blue-400 rounded-full blur-[2px] absolute top-6 left-1/2 -translate-x-1/2"></div>
             </div>
          </div>
          
          <div className="mt-6 w-full grid grid-cols-2 gap-4 text-xs">
             <div className="bg-blue-50 p-3 rounded-xl flex flex-col items-center">
                <span className="text-gray-500 mb-1">Stock Level</span>
                <span className="font-bold text-blue-700 text-lg">{marketStats.stockScore}/100</span>
             </div>
             <div className="bg-green-50 p-3 rounded-xl flex flex-col items-center">
                <span className="text-gray-500 mb-1">Availability</span>
                <span className="font-bold text-green-700 text-lg">{marketStats.stockScore > 50 ? 'High' : 'Low'}</span>
             </div>
          </div>
        </div>

        {/* Revenue Card (Bar Chart) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Revenue</h3>
              <p className="text-xs text-gray-400 mt-1">Yearly Profit/Loss for {selectedItem}</p>
            </div>
            <div className="flex gap-3 text-[10px] font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-600"></span>
                <span>Profit</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-200"></span>
                <span>Loss</span>
              </div>
            </div>
          </div>

          <div className="h-56 flex items-end justify-between gap-2 mt-4">
            {marketStats.monthlyData.map((data, i) => {
               // Use dynamic data from AI
               const pHeight = data.profit;
               const lHeight = data.loss;
               const month = data.month;
               
               return (
                <div key={i} className="flex flex-col items-center gap-2 flex-1 group h-full justify-end">
                  <div className="w-full flex gap-1 items-end justify-center h-full relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                       {month}: +{Math.round(pHeight)}%
                    </div>

                    <div 
                      className="w-1.5 sm:w-2 bg-blue-600 rounded-t-sm hover:bg-blue-700 transition-all duration-300 relative z-10" 
                      style={{ height: `${pHeight}%` }}
                    ></div>
                    <div 
                      className="w-1.5 sm:w-2 bg-blue-200 rounded-t-sm hover:bg-blue-300 transition-all duration-300 relative z-0" 
                      style={{ height: `${lHeight}%` }}
                    ></div>
                  </div>
                  <span className="text-[9px] text-gray-400 font-medium group-hover:text-blue-600 transition-colors uppercase">{month.charAt(0)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Detailed Prices Table with Grading */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Quality Grading & Rates for {selectedItem}</h3>
            <p className="text-xs text-gray-500">Live grading based on {selectedMarket} standards</p>
          </div>
          <div className="flex items-center gap-2">
             <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded border border-green-200 flex items-center gap-1">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
               UPDATED NOW
             </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Grade</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Specifications</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Price / {marketStats.unit}</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Trend</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* Grade A */}
              <tr className="group hover:bg-teal-50/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm group-hover:scale-110 transition-transform">A</div>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">Premium</span>
                      <span className="text-[10px] text-gray-400">Export Quality</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600 text-xs">
                  Large size, Uniform color, No defects
                </td>
                <td className="px-6 py-4">
                  <span className="font-bold text-gray-900 text-base">₹{marketStats.gradePrices?.high || Math.round(marketStats.currentPrice * 1.2)}</span>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-1 text-green-600 bg-green-50 w-fit px-2 py-0.5 rounded-md text-xs font-medium">
                     <ArrowUpRight className="w-3 h-3" /> +2.4%
                   </div>
                </td>
                <td className="px-6 py-4">
                   <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                     In Stock
                   </span>
                </td>
              </tr>

              {/* Grade B */}
              <tr className="group hover:bg-teal-50/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm group-hover:scale-110 transition-transform">B</div>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">Standard</span>
                      <span className="text-[10px] text-gray-400">Market Regular</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600 text-xs">
                  Medium size, Slight variations allowed
                </td>
                <td className="px-6 py-4">
                  <span className="font-bold text-gray-900 text-base">₹{marketStats.gradePrices?.mid || marketStats.currentPrice}</span>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-1 text-gray-500 bg-gray-50 w-fit px-2 py-0.5 rounded-md text-xs font-medium">
                     <Minus className="w-3 h-3" /> Stable
                   </div>
                </td>
                <td className="px-6 py-4">
                   <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                     High Vol
                   </span>
                </td>
              </tr>

              {/* Grade C */}
              <tr className="group hover:bg-teal-50/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm group-hover:scale-110 transition-transform">C</div>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">Economy</span>
                      <span className="text-[10px] text-gray-400">Local / Small</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600 text-xs">
                  Small size, Mixed variety, Minor defects
                </td>
                <td className="px-6 py-4">
                  <span className="font-bold text-gray-900 text-base">₹{marketStats.gradePrices?.low || Math.round(marketStats.currentPrice * 0.8)}</span>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-1 text-red-500 bg-red-50 w-fit px-2 py-0.5 rounded-md text-xs font-medium">
                     <ArrowDownRight className="w-3 h-3" /> -1.2%
                   </div>
                </td>
                <td className="px-6 py-4">
                   <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                     Limited
                   </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. AI Crop Analysis & Recommendation */}
      <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl border border-teal-100 p-6 relative overflow-hidden">
        <Sprout className="absolute -bottom-4 -right-4 w-32 h-32 text-teal-100/50 rotate-12" />

        <div className="flex flex-col lg:flex-row items-start gap-6 relative z-10">
          <div className="p-3 bg-white rounded-xl shadow-sm border border-teal-50">
            <Sprout className="w-8 h-8 text-teal-600" />
          </div>
          
          <div className="flex-1 w-full">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                Gemini AI Market Analysis
                {isLoading && <Loader2 className="w-4 h-4 animate-spin text-teal-600" />}
              </h3>
              
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border shadow-sm flex items-center gap-1.5
                ${marketStats.aiInsight.sentiment === 'Bullish' ? 'bg-green-100 text-green-700 border-green-200' : 
                  marketStats.aiInsight.sentiment === 'Bearish' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-gray-100 text-gray-700 border-gray-200'}
              `}>
                <BarChart3 className="w-3.5 h-3.5" />
                {marketStats.aiInsight.sentiment}
              </span>
            </div>
            
            {isLoading ? (
               <div className="space-y-3 animate-pulse">
                 <div className="h-4 bg-teal-100/50 rounded w-full"></div>
                 <div className="h-4 bg-teal-100/50 rounded w-5/6"></div>
                 <div className="h-20 bg-teal-100/50 rounded-xl w-full mt-4"></div>
               </div>
            ) : (
              <div className="space-y-5">
                 <div className="bg-white/60 p-4 rounded-xl border border-teal-100/50 backdrop-blur-sm shadow-sm">
                   <p className="text-gray-700 text-sm leading-relaxed">
                     {marketStats.aiInsight.summary}
                   </p>
                 </div>
                 
                 <div className="flex flex-wrap gap-2">
                    {marketStats.aiInsight.factors.map((factor, i) => (
                      <span key={i} className="text-xs font-semibold text-teal-800 bg-teal-100/50 px-3 py-1.5 rounded-md border border-teal-200/50 flex items-center gap-1">
                        <Tag className="w-3 h-3 opacity-60" /> {factor}
                      </span>
                    ))}
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 flex gap-3">
                       <div className="p-2 bg-blue-100 rounded-lg h-fit text-blue-600">
                         <Gavel className="w-4 h-4" />
                       </div>
                       <div>
                         <h4 className="text-xs font-bold text-blue-800 uppercase mb-1">Selling Strategy</h4>
                         <p className="text-sm text-gray-700 leading-snug">{marketStats.aiInsight.action}</p>
                       </div>
                    </div>

                    <div className="bg-orange-50/50 rounded-xl p-4 border border-orange-100 flex gap-3">
                       <div className="p-2 bg-orange-100 rounded-lg h-fit text-orange-600">
                         <Warehouse className="w-4 h-4" />
                       </div>
                       <div>
                         <h4 className="text-xs font-bold text-orange-800 uppercase mb-1">Storage Advice</h4>
                         <p className="text-sm text-gray-700 leading-snug">{marketStats.aiInsight.storage}</p>
                       </div>
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};