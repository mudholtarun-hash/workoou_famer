import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, Handshake, Tractor, Send, User, MapPin, 
  Phone, Filter, Plus, Sprout, Droplets, Ruler, IndianRupee,
  Search, CheckCircle, Loader2, Bot, ArrowRight, X, HeartHandshake
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- Types ---
interface TradeListing {
  id: string;
  farmer: string;
  crop: string;
  quantity: string;
  type: 'Sell' | 'Exchange';
  exchangeWith?: string; // What they want in return
  price?: string;
  location: string;
  date: string;
}

interface LandListing {
  id: string;
  owner: string;
  acres: number;
  soilType: string;
  waterSource: string;
  pricePerAcre: number;
  location: string;
  suitableFor: string[];
  availableFrom: string;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// --- Mock Data ---
const TRADES: TradeListing[] = [
  { id: 't1', farmer: 'Vikram Singh', crop: 'Basmati Rice (1121)', quantity: '50 Quintals', type: 'Sell', price: '₹4,200/Qtl', location: 'Karnal, Haryana', date: '2 hours ago' },
  { id: 't2', farmer: 'Ram Lal', crop: 'Mustard Seeds', quantity: '10 Quintals', type: 'Exchange', exchangeWith: 'Wheat Seeds for next season', location: 'Bhilwara, Rajasthan', date: '5 hours ago' },
  { id: 't3', farmer: 'Suresh Patil', crop: 'Onions (Red)', quantity: '200 Bags', type: 'Sell', price: '₹1,800/Qtl', location: 'Nashik, Maharashtra', date: '1 day ago' },
];

const LANDS: LandListing[] = [
  { id: 'l1', owner: 'Gurpreet Singh', acres: 12, soilType: 'Alluvial (Loamy)', waterSource: 'Tube Well (24x7)', pricePerAcre: 45000, location: 'Ludhiana, Punjab', suitableFor: ['Wheat', 'Rice', 'Potato'], availableFrom: 'April 2024' },
  { id: 'l2', owner: 'Ramesh Yadav', acres: 4.5, soilType: 'Black Cotton Soil', waterSource: 'Canal Irrigation', pricePerAcre: 28000, location: 'Amravati, Maharashtra', suitableFor: ['Cotton', 'Soybean', 'Pulses'], availableFrom: 'Immediate' },
  { id: 'l3', owner: 'Anil Kumar', acres: 2, soilType: 'Red Soil', waterSource: 'Drip Installed', pricePerAcre: 20000, location: 'Chittoor, Andhra Pradesh', suitableFor: ['Groundnut', 'Tomato'], availableFrom: 'May 2024' },
];

export const MyFriend: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'trade' | 'rent'>('chat');
  
  // -- Chat State --
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: '1', text: 'Namaste! I am your Kisan Sahayak. I can help you find traders, rent land, or answer crop questions.', sender: 'bot', timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // -- Trade/Rent State --
  const [showPostModal, setShowPostModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  // -- Chat Logic --
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), text: input, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are a friendly Indian agricultural assistant named "My Friend". 
        Context: The user is asking about farming, trading crops, or renting land.
        User said: "${userMsg.text}".
        Reply concisely and helpfully in English. If they ask about trading or land, guide them to the respective tabs in this app.`
      });
      
      const botMsg: ChatMessage = { id: (Date.now()+1).toString(), text: result.text, sender: 'bot', timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now().toString(), text: "Sorry, connection error. Please try again.", sender: 'bot', timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in">
      <div className="flex justify-center mb-6">
        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 inline-flex gap-1">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'chat' ? 'bg-teal-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <MessageCircle className="w-4 h-4" /> Ask Sahayak
          </button>
          <button 
            onClick={() => setActiveTab('trade')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'trade' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Handshake className="w-4 h-4" /> Harvest Exchange
          </button>
          <button 
            onClick={() => setActiveTab('rent')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'rent' ? 'bg-green-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Tractor className="w-4 h-4" /> Land Rental
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'chat' && (
          <div className="h-full flex flex-col max-w-3xl mx-auto bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-4 flex items-center gap-3 text-white">
               <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                 <Bot className="w-6 h-6 text-white" />
               </div>
               <div>
                 <h3 className="font-bold">Kisan Sahayak AI</h3>
                 <p className="text-xs text-teal-100">Always here to help you</p>
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
               {messages.map(msg => (
                 <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-teal-600 text-white rounded-tr-none' : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'}`}>
                       {msg.text}
                    </div>
                 </div>
               ))}
               {isTyping && (
                 <div className="flex justify-start"><div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm"><Loader2 className="w-5 h-5 text-teal-500 animate-spin" /></div></div>
               )}
               <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
               <input 
                 value={input} onChange={e => setInput(e.target.value)}
                 placeholder="Ask about weather, crops, or farming tips..."
                 className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
               />
               <button type="submit" className="p-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"><Send className="w-5 h-5" /></button>
            </form>
          </div>
        )}

        {activeTab === 'trade' && (
          <div className="h-full overflow-y-auto pb-20 custom-scrollbar max-w-5xl mx-auto px-4">
             <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Community Harvest Exchange</h2>
                  <p className="text-gray-500 text-sm">Trade products directly with other farmers or mutual traders.</p>
                </div>
                <button onClick={() => setShowPostModal(true)} className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-200 flex items-center gap-2">
                  <Plus className="w-5 h-5" /> Post Your Harvest
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {TRADES.map(trade => (
                  <div key={trade.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg transition-all group">
                     <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-lg">
                             {trade.farmer.charAt(0)}
                           </div>
                           <div>
                             <h4 className="font-bold text-gray-900 leading-tight">{trade.farmer}</h4>
                             <span className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3"/> {trade.location}</span>
                           </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded border ${trade.type === 'Sell' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                          {trade.type === 'Sell' ? 'FOR SALE' : 'EXCHANGE'}
                        </span>
                     </div>
                     
                     <div className="space-y-3 mb-6">
                        <div className="bg-gray-50 p-3 rounded-xl">
                           <p className="text-xs text-gray-500 uppercase font-bold">Available Crop</p>
                           <p className="text-lg font-bold text-gray-800">{trade.crop}</p>
                           <p className="text-sm text-gray-600">Quantity: <span className="font-semibold">{trade.quantity}</span></p>
                        </div>
                        {trade.type === 'Sell' ? (
                          <div className="flex items-center gap-2 text-green-700 font-bold bg-green-50 p-2 rounded-lg">
                             <IndianRupee className="w-4 h-4" /> {trade.price}
                          </div>
                        ) : (
                          <div className="flex items-start gap-2 text-blue-700 font-medium bg-blue-50 p-2 rounded-lg text-sm">
                             <HeartHandshake className="w-4 h-4 mt-0.5" /> Wants: {trade.exchangeWith}
                          </div>
                        )}
                     </div>

                     <button className="w-full py-3 border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-900 hover:text-white transition-colors flex items-center justify-center gap-2">
                       <Phone className="w-4 h-4" /> Contact Farmer
                     </button>
                     <p className="text-center text-[10px] text-gray-400 mt-3">Posted {trade.date}</p>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'rent' && (
          <div className="h-full overflow-y-auto pb-20 custom-scrollbar max-w-5xl mx-auto px-4">
             <div className="bg-green-50 rounded-2xl p-6 mb-8 border border-green-100 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                   <h2 className="text-xl font-bold text-green-900 mb-2">Find Suitable Land for Cultivation</h2>
                   <p className="text-green-700 text-sm max-w-lg">
                     Looking to expand? Rent fields with specific soil types (Black, Red, Loamy) perfect for your crop choice.
                   </p>
                </div>
                <button className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 whitespace-nowrap">
                  List Your Land
                </button>
             </div>

             <div className="space-y-4">
                {LANDS.map(land => (
                  <div key={land.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-green-300 hover:shadow-md transition-all flex flex-col md:flex-row gap-6">
                     <div className="flex-shrink-0">
                        <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center">
                           <Tractor className="w-10 h-10 text-gray-400" />
                        </div>
                     </div>
                     <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                           <h3 className="text-lg font-bold text-gray-900">{land.acres} Acres Field in {land.location}</h3>
                           <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">Available {land.availableFrom}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                           <div>
                              <p className="text-xs text-gray-500">Soil Type</p>
                              <p className="font-semibold text-gray-800">{land.soilType}</p>
                           </div>
                           <div>
                              <p className="text-xs text-gray-500">Water</p>
                              <p className="font-semibold text-gray-800">{land.waterSource}</p>
                           </div>
                           <div>
                              <p className="text-xs text-gray-500">Owner</p>
                              <p className="font-semibold text-gray-800">{land.owner}</p>
                           </div>
                           <div>
                              <p className="text-xs text-gray-500">Rent (Est.)</p>
                              <p className="font-bold text-green-600">₹{land.pricePerAcre.toLocaleString()}<span className="text-xs text-gray-400 font-normal">/acre/yr</span></p>
                           </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           <span className="text-xs font-bold text-gray-500 py-1">Best For:</span>
                           {land.suitableFor.map(crop => (
                             <span key={crop} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">{crop}</span>
                           ))}
                        </div>
                     </div>
                     <div className="flex flex-col justify-center gap-2 min-w-[140px]">
                        <button className="bg-green-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-green-700">Contact Owner</button>
                        <button className="border border-gray-200 text-gray-600 py-2 rounded-lg font-bold text-sm hover:bg-gray-50">View Details</button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>

      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-md rounded-2xl p-6 animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-xl">Post Your Harvest</h3>
                 <button onClick={() => setShowPostModal(false)}><X className="w-5 h-5 text-gray-500"/></button>
              </div>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowPostModal(false); alert("Listing Posted!"); }}>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Crop</label>
                    <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" placeholder="e.g. Wheat" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantity</label>
                       <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" placeholder="e.g. 50 Quintals" />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expected Price</label>
                       <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" placeholder="e.g. ₹2,200/Qtl" />
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location</label>
                    <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" placeholder="e.g. Nashik, Maharashtra" />
                 </div>
                 <button type="submit" className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md transition-colors">
                    Submit Listing
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
