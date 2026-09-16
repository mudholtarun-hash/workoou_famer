import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Search, Filter, ShoppingCart, ArrowRight, 
  CheckCircle, Star, Navigation, Store, X, Plus, Minus,
  Truck, CreditCard, ChevronDown, Info, ArrowLeft,
  Minimize2, Maximize2, Layers, FlaskConical, Sprout,
  Compass, Map as MapIcon, ShieldCheck, ChevronUp, AlertCircle
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- Types ---
interface Product {
  id: string;
  name: string;
  brand: string;
  type: 'fertilizer' | 'pesticide';
  composition: string; // NPK or Active Ingredient
  price: number;
  rating: number;
  reviews: number;
  image: string;
  isOrganic: boolean;
  description: string;
  suitableCrops: string[];
}

interface StoreItem {
  id: string;
  name: string;
  distance: number;
  price: number;
  stock: boolean;
  rating: number;
  lat: number;
  lng: number;
  address: string;
}

interface CartItem extends Product {
  quantity: number;
}

// --- Mock Data ---
const FERTILIZERS: Product[] = [
  { id: 'f1', name: 'Urea 46%', brand: 'IFFCO', type: 'fertilizer', composition: 'N: 46%, P: 0%, K: 0%', price: 266, rating: 4.8, reviews: 1250, image: 'https://images.unsplash.com/photo-1622383563227-0440114a8520?auto=format&fit=crop&q=80&w=400', isOrganic: false, description: 'High nitrogen content for vigorous growth.', suitableCrops: ['Wheat', 'Rice', 'Corn'] },
  { id: 'f2', name: 'DAP (Di-Ammonium Phosphate)', brand: 'Coromandel', type: 'fertilizer', composition: 'N: 18%, P: 46%, K: 0%', price: 1350, rating: 4.9, reviews: 890, image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=400', isOrganic: false, description: 'Essential for root development.', suitableCrops: ['Potato', 'Vegetables'] },
  { id: 'f3', name: 'Neem Cake (Organic)', brand: 'KisanChoice', type: 'fertilizer', composition: 'Organic NPK', price: 850, rating: 4.5, reviews: 450, image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&q=80&w=400', isOrganic: true, description: 'Natural pest repellent and fertilizer.', suitableCrops: ['All Crops'] },
  { id: 'f4', name: 'NPK 19:19:19', brand: 'Mahadhan', type: 'fertilizer', composition: 'N: 19%, P: 19%, K: 19%', price: 120, rating: 4.6, reviews: 300, image: 'https://images.unsplash.com/photo-1595855709915-3931e0506eb0?auto=format&fit=crop&q=80&w=400', isOrganic: false, description: 'Balanced nutrition for all stages.', suitableCrops: ['Fruits', 'Flowers'] },
];

const PESTICIDES: Product[] = [
  { id: 'p1', name: 'Roundup (Glyphosate)', brand: 'Monsanto', type: 'pesticide', composition: 'Glyphosate 41% SL', price: 450, rating: 4.2, reviews: 2100, image: 'https://images.unsplash.com/photo-1585314062604-1a357de8b000?auto=format&fit=crop&q=80&w=400', isOrganic: false, description: 'Systemic herbicide for weed control.', suitableCrops: ['Non-Cropped Area'] },
  { id: 'p2', name: 'Neem Oil 10000 PPM', brand: 'AgriCare', type: 'pesticide', composition: 'Azadirachtin', price: 390, rating: 4.7, reviews: 560, image: 'https://images.unsplash.com/photo-1599421490111-ad70be395892?auto=format&fit=crop&q=80&w=400', isOrganic: true, description: 'Organic pest controller.', suitableCrops: ['Vegetables', 'Cotton'] },
  { id: 'p3', name: 'Coragen', brand: 'FMC', type: 'pesticide', composition: 'Chlorantraniliprole 18.5%', price: 1850, rating: 4.9, reviews: 900, image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&q=80&w=400', isOrganic: false, description: 'Long duration control of stem borers.', suitableCrops: ['Rice', 'Sugarcane'] },
];

// Mock Store Generator
const getNearbyStores = (productId: string, userLat: number, userLng: number): StoreItem[] => {
  return [
    { id: 'st1', name: 'Kisan Seva Kendra', distance: 1.2, price: Math.floor(Math.random() * 50) + 200, stock: true, rating: 4.5, lat: userLat + 0.001, lng: userLng + 0.001, address: 'Main Road, Village Raipur' },
    { id: 'st2', name: 'Agri Junction', distance: 3.5, price: Math.floor(Math.random() * 50) + 190, stock: true, rating: 4.2, lat: userLat - 0.002, lng: userLng + 0.002, address: 'Near Bus Stand, City Center' },
    { id: 'st3', name: 'Farmers Coop Society', distance: 5.0, price: Math.floor(Math.random() * 50) + 180, stock: false, rating: 4.8, lat: userLat + 0.003, lng: userLng - 0.001, address: 'Sector 4, Market Yard' },
  ];
};

export const FertilizerView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [category, setCategory] = useState<'fertilizer' | 'pesticide'>('fertilizer');
  const [location, setLocation] = useState<{ lat: number, lng: number, address: string } | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  
  // Cart & Comparison
  const [cart, setCart] = useState<CartItem[]>([]);
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  
  // Modals & Flows
  const [viewStoreModal, setViewStoreModal] = useState<Product | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'idle' | 'address' | 'summary' | 'payment' | 'success'>('idle');
  const [toast, setToast] = useState<string | null>(null);

  // Filters
  const [sortBy, setSortBy] = useState<'rating' | 'price_low' | 'price_high'>('rating');
  const [filterOrganic, setFilterOrganic] = useState(false);

  // -- Location Handler --
  const detectLocation = () => {
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Simulate address fetch
        setTimeout(() => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            address: 'Sector 62, Mohali, Punjab'
          });
          setLocLoading(false);
        }, 1500);
      },
      (err) => {
        alert("Location access denied. Using default location.");
        setLocation({ lat: 30.7333, lng: 76.7794, address: 'Chandigarh (Default)' });
        setLocLoading(false);
      }
    );
  };

  // -- Cart Handlers --
  const addToCart = (product: Product) => {
    setCart(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      return [...prev, { ...product, quantity: 1 }];
    });
    setToast(`${product.name} added to cart ✔`);
    setTimeout(() => setToast(null), 3000);
  };

  // -- Compare Handlers --
  const toggleCompare = (product: Product) => {
    setCompareList(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) return prev.filter(p => p.id !== product.id);
      if (prev.length >= 3) {
        alert("You can compare max 3 products.");
        return prev;
      }
      return [...prev, product];
    });
  };

  // -- Data Processing --
  const products = category === 'fertilizer' ? FERTILIZERS : PESTICIDES;
  const filteredProducts = products
    .filter(p => !filterOrganic || p.isOrganic)
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      return 0;
    });

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = Math.round(cartTotal * 0.05); // 5% GST
  const delivery = 40;

  return (
    <div className="bg-slate-50 min-h-screen pb-20 animate-in fade-in relative">
      
      {/* --- HERO SECTION --- */}
      <div className="bg-gradient-to-r from-green-800 to-teal-900 text-white p-6 sm:p-10 sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
               <button onClick={onBack} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                 <ArrowLeft className="w-5 h-5" />
               </button>
               <div>
                 <h1 className="text-2xl font-bold flex items-center gap-2">
                   <FlaskConical className="w-6 h-6 text-green-300" /> 
                   Agri-Inputs Marketplace
                 </h1>
                 <p className="text-green-100 text-sm">Quality Fertilizers & Pesticides at Best Prices</p>
               </div>
            </div>
            
            {/* Cart Button */}
            <button 
              onClick={() => setCheckoutStep('summary')}
              className="relative p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors group"
            >
               <ShoppingCart className="w-6 h-6 text-white" />
               {cart.length > 0 && (
                 <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                   {cart.length}
                 </span>
               )}
            </button>
          </div>

          {/* Location Bar */}
          <div className="bg-white rounded-xl p-2 flex items-center shadow-xl max-w-2xl mx-auto">
             <div className="pl-3 pr-2">
               <MapPin className={`w-5 h-5 ${location ? 'text-green-600' : 'text-gray-400'}`} />
             </div>
             <input 
               type="text" 
               placeholder="Enter Location / Pincode" 
               value={location?.address || ''}
               readOnly
               className="flex-1 p-2 outline-none text-gray-700 font-medium placeholder:text-gray-400"
             />
             <button 
               onClick={detectLocation}
               disabled={locLoading}
               className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
             >
               {locLoading ? <span className="animate-spin">⌛</span> : <Navigation className="w-4 h-4" />}
               Use GPS
             </button>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Category Tabs */}
        <div className="flex justify-center mb-8">
           <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex">
              <button 
                onClick={() => setCategory('fertilizer')}
                className={`px-8 py-3 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${category === 'fertilizer' ? 'bg-green-100 text-green-800 shadow-inner' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Sprout className="w-4 h-4" /> Fertilizers
              </button>
              <button 
                onClick={() => setCategory('pesticide')}
                className={`px-8 py-3 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${category === 'pesticide' ? 'bg-red-100 text-red-800 shadow-inner' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <ShieldCheck className="w-4 h-4" /> Pesticides
              </button>
           </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
           
           {/* Sidebar Filters */}
           <div className="lg:w-64 flex-shrink-0 space-y-6">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 sticky top-32">
                 <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Filter className="w-4 h-4" /> Filters</h3>
                 
                 <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Sort By</label>
                      <select 
                        value={sortBy} onChange={(e: any) => setSortBy(e.target.value)}
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                      >
                        <option value="rating">Top Rated</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Organic Only</span>
                      <button 
                        onClick={() => setFilterOrganic(!filterOrganic)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${filterOrganic ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                         <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${filterOrganic ? 'translate-x-5' : ''}`}></div>
                      </button>
                    </div>
                 </div>
              </div>
           </div>

           {/* Product Grid */}
           <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                 {filteredProducts.map(product => (
                    <div key={product.id} className="bg-white rounded-2xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all overflow-hidden flex flex-col group relative">
                       {/* Badge */}
                       {product.isOrganic && (
                         <span className="absolute top-3 left-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10">
                           ORGANIC
                         </span>
                       )}

                       {/* Image */}
                       <div className="h-48 p-4 bg-gray-50 flex items-center justify-center relative">
                          <img src={product.image} alt={product.name} className="h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute bottom-3 right-3">
                             <input 
                               type="checkbox" 
                               checked={compareList.some(p => p.id === product.id)}
                               onChange={() => toggleCompare(product)}
                               className="w-5 h-5 accent-green-600 cursor-pointer" 
                             />
                          </div>
                       </div>

                       {/* Content */}
                       <div className="p-4 flex flex-col flex-1">
                          <div className="flex justify-between items-start mb-1">
                             <h3 className="font-bold text-gray-900 leading-tight line-clamp-2">{product.name}</h3>
                             <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-100">
                                <span className="text-xs font-bold text-yellow-700">{product.rating}</span>
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                             </div>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{product.brand} • {product.composition}</p>
                          
                          <div className="mt-auto">
                             <div className="flex items-center gap-2 mb-3">
                                <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
                                <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">In Stock</span>
                             </div>
                             
                             <div className="grid grid-cols-2 gap-2">
                                <button 
                                  onClick={() => setViewStoreModal(product)}
                                  className="py-2 px-3 border border-green-600 text-green-700 rounded-lg text-xs font-bold hover:bg-green-50 flex items-center justify-center gap-1"
                                >
                                  <Store className="w-3.5 h-3.5" /> Buy at Store
                                </button>
                                <button 
                                  onClick={() => addToCart(product)}
                                  className="py-2 px-3 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 flex items-center justify-center gap-1 shadow-md shadow-green-200"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Add to Cart
                                </button>
                             </div>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* --- FLOATING COMPARISON BAR --- */}
      {compareList.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl p-4 z-40 animate-in slide-in-from-bottom-5">
           <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4 overflow-x-auto">
                 {compareList.map(p => (
                   <div key={p.id} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 min-w-max">
                      <img src={p.image} className="w-8 h-8 object-contain mix-blend-multiply" />
                      <div>
                        <p className="text-xs font-bold text-gray-900 line-clamp-1">{p.name}</p>
                        <p className="text-[10px] text-gray-500">₹{p.price}</p>
                      </div>
                      <button onClick={() => toggleCompare(p)} className="text-gray-400 hover:text-red-500 ml-1"><X className="w-3 h-3"/></button>
                   </div>
                 ))}
              </div>
              <div className="flex gap-3 pl-4 border-l border-gray-200 ml-4">
                 <button onClick={() => setCompareList([])} className="text-xs font-bold text-gray-500 hover:text-gray-700">Clear</button>
                 <button 
                   onClick={() => setShowCompareModal(true)}
                   className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-black shadow-lg flex items-center gap-2"
                 >
                   <Layers className="w-4 h-4" /> Compare Now
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* --- COMPARISON MODAL --- */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
           <div className="bg-white w-full max-w-5xl h-[80vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                 <h3 className="font-bold text-lg text-gray-900">Product Comparison</h3>
                 <button onClick={() => setShowCompareModal(false)} className="p-2 hover:bg-gray-200 rounded-full"><X className="w-5 h-5"/></button>
              </div>
              <div className="flex-1 overflow-auto p-6">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr>
                         <th className="p-4 bg-gray-50 border border-gray-200 min-w-[150px]">Feature</th>
                         {compareList.map(p => (
                           <th key={p.id} className="p-4 border border-gray-200 min-w-[200px] bg-white">
                              <div className="flex flex-col items-center text-center">
                                 <img src={p.image} className="h-24 object-contain mb-2 mix-blend-multiply" />
                                 <span className="font-bold text-gray-900 text-sm">{p.name}</span>
                                 <span className="text-xs text-gray-500">{p.brand}</span>
                              </div>
                           </th>
                         ))}
                       </tr>
                    </thead>
                    <tbody className="text-sm">
                       <tr>
                          <td className="p-4 font-bold text-gray-600 border border-gray-200 bg-gray-50">Price</td>
                          {compareList.map(p => (
                            <td key={p.id} className={`p-4 border border-gray-200 font-bold ${p.price === Math.min(...compareList.map(i=>i.price)) ? 'text-green-600 bg-green-50' : 'text-gray-900'}`}>
                              ₹{p.price} {p.price === Math.min(...compareList.map(i=>i.price)) && <span className="text-[10px] bg-green-200 px-1 rounded ml-1">LOWEST</span>}
                            </td>
                          ))}
                       </tr>
                       <tr>
                          <td className="p-4 font-bold text-gray-600 border border-gray-200 bg-gray-50">Rating</td>
                          {compareList.map(p => (
                            <td key={p.id} className="p-4 border border-gray-200">
                              <div className="flex items-center gap-1 justify-center">
                                {p.rating} <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              </div>
                            </td>
                          ))}
                       </tr>
                       <tr>
                          <td className="p-4 font-bold text-gray-600 border border-gray-200 bg-gray-50">Composition</td>
                          {compareList.map(p => (
                            <td key={p.id} className="p-4 border border-gray-200 text-center text-gray-700">{p.composition}</td>
                          ))}
                       </tr>
                       <tr>
                          <td className="p-4 font-bold text-gray-600 border border-gray-200 bg-gray-50">Best Use</td>
                          {compareList.map(p => (
                            <td key={p.id} className="p-4 border border-gray-200 text-center text-gray-700">
                               {p.suitableCrops.join(', ')}
                            </td>
                          ))}
                       </tr>
                       <tr>
                          <td className="p-4 font-bold text-gray-600 border border-gray-200 bg-gray-50">Action</td>
                          {compareList.map(p => (
                            <td key={p.id} className="p-4 border border-gray-200 text-center">
                               <button onClick={() => addToCart(p)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-700">Add to Cart</button>
                            </td>
                          ))}
                       </tr>
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {/* --- STORE LOCATOR MODAL --- */}
      {viewStoreModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
           <div className="bg-white w-full max-w-4xl h-[85vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                 <div>
                    <h3 className="font-bold text-lg text-gray-900">Compare Stores</h3>
                    <p className="text-xs text-gray-500">Finding best deal for <span className="font-semibold text-gray-700">{viewStoreModal.name}</span></p>
                 </div>
                 <button onClick={() => setViewStoreModal(null)} className="p-2 hover:bg-gray-200 rounded-full"><X className="w-5 h-5"/></button>
              </div>
              
              <div className="flex-1 flex flex-col lg:flex-row">
                 {/* Store List */}
                 <div className="lg:w-1/3 border-r border-gray-200 overflow-y-auto p-4 space-y-4">
                    {getNearbyStores(viewStoreModal.id, location?.lat || 0, location?.lng || 0).map(store => (
                       <div key={store.id} className="border border-gray-200 rounded-xl p-4 hover:border-green-300 hover:shadow-md transition-all cursor-pointer group">
                          <div className="flex justify-between items-start mb-2">
                             <h4 className="font-bold text-gray-900">{store.name}</h4>
                             <span className="text-xs font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-100">{store.distance} km</span>
                          </div>
                          <p className="text-xs text-gray-500 mb-3">{store.address}</p>
                          <div className="flex items-center justify-between mt-2">
                             <div>
                                <span className="text-lg font-bold text-gray-900">₹{store.price}</span>
                                {store.price < viewStoreModal.price && <span className="text-[10px] text-green-600 font-bold ml-1">Cheaper</span>}
                             </div>
                             {store.stock ? (
                               <span className="text-xs text-green-600 font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3"/> In Stock</span>
                             ) : (
                               <span className="text-xs text-red-500 font-bold">Out of Stock</span>
                             )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-4">
                             <button className="py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50">Call Store</button>
                             <button className="py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 flex items-center justify-center gap-1">
                               <Navigation className="w-3 h-3" /> Navigate
                             </button>
                          </div>
                       </div>
                    ))}
                 </div>
                 {/* Map Preview (Mocked) */}
                 <div className="flex-1 bg-gray-100 relative">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      frameBorder="0" 
                      src={`https://maps.google.com/maps?q=${location?.lat},${location?.lng}&z=13&output=embed`}
                      className="opacity-80"
                    ></iframe>
                    <div className="absolute bottom-4 left-4 right-4 bg-white p-3 rounded-xl shadow-lg border border-gray-200 text-xs text-gray-600">
                       Using detected location: <strong>{location?.address || "Default"}</strong>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* --- CHECKOUT MODAL --- */}
      {checkoutStep !== 'idle' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
           <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                 <h3 className="font-bold text-gray-900">
                    {checkoutStep === 'summary' && 'Cart Summary'}
                    {checkoutStep === 'address' && 'Delivery Address'}
                    {checkoutStep === 'payment' && 'Payment Method'}
                    {checkoutStep === 'success' && 'Order Confirmed'}
                 </h3>
                 {checkoutStep !== 'success' && (
                   <button onClick={() => setCheckoutStep('idle')} className="p-1 hover:bg-gray-200 rounded-full"><X className="w-5 h-5"/></button>
                 )}
              </div>
              
              <div className="p-6">
                 {/* 1. Summary */}
                 {checkoutStep === 'summary' && (
                   <>
                     {cart.length === 0 ? (
                       <div className="text-center py-8 text-gray-500">Cart is empty.</div>
                     ) : (
                       <div className="space-y-4">
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                             {cart.map((item, i) => (
                               <div key={i} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl">
                                  <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden"><img src={item.image} className="w-full h-full object-cover"/></div>
                                     <div>
                                        <p className="text-sm font-bold text-gray-900">{item.name}</p>
                                        <p className="text-xs text-gray-500">{item.quantity} x ₹{item.price}</p>
                                     </div>
                                  </div>
                                  <span className="font-bold text-gray-900">₹{item.price * item.quantity}</span>
                               </div>
                             ))}
                          </div>
                          <div className="border-t border-gray-100 pt-4 space-y-2">
                             <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>₹{cartTotal}</span></div>
                             <div className="flex justify-between text-sm text-gray-600"><span>Tax (5%)</span><span>₹{tax}</span></div>
                             <div className="flex justify-between text-sm text-gray-600"><span>Delivery</span><span>₹{delivery}</span></div>
                             <div className="flex justify-between text-lg font-bold text-green-700 pt-2"><span>Total</span><span>₹{cartTotal + tax + delivery}</span></div>
                          </div>
                          <button onClick={() => setCheckoutStep('address')} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700">Proceed to Address</button>
                       </div>
                     )}
                   </>
                 )}

                 {/* 2. Address */}
                 {checkoutStep === 'address' && (
                    <div className="space-y-4">
                       <input type="text" placeholder="Full Name" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                       <input type="text" placeholder="Phone Number" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                       <div className="flex gap-2">
                          <input type="text" placeholder="Pincode" className="w-1/3 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                          <input type="text" placeholder="City" className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                       </div>
                       <textarea placeholder="House No, Street, Landmark" className="w-full h-24 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none"></textarea>
                       <button 
                         onClick={() => {
                           if(!location) detectLocation(); // Auto-fill option
                           else { /* Fill logic */ }
                         }} 
                         className="text-xs font-bold text-green-600 flex items-center gap-1 mb-2 hover:underline"
                       >
                         <MapPin className="w-3 h-3" /> Use Current Location
                       </button>
                       <button onClick={() => setCheckoutStep('payment')} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700">Continue to Payment</button>
                    </div>
                 )}

                 {/* 3. Payment */}
                 {checkoutStep === 'payment' && (
                    <div className="space-y-3">
                       <button className="w-full p-4 border border-green-500 bg-green-50 text-green-900 rounded-xl font-bold flex justify-between items-center">
                          <span>UPI / Net Banking</span> <CreditCard className="w-5 h-5"/>
                       </button>
                       <button className="w-full p-4 border border-gray-200 hover:bg-gray-50 rounded-xl font-bold text-gray-700 flex justify-between items-center">
                          <span>Cash on Delivery</span> <Truck className="w-5 h-5"/>
                       </button>
                       <button onClick={() => setCheckoutStep('success')} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 mt-4">Place Order</button>
                    </div>
                 )}

                 {/* 4. Success */}
                 {checkoutStep === 'success' && (
                    <div className="text-center py-8">
                       <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                          <CheckCircle className="w-10 h-10 text-green-600" />
                       </div>
                       <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h3>
                       <p className="text-gray-500 text-sm mb-6">Your inputs will be delivered by {new Date(Date.now() + 86400000 * 2).toLocaleDateString()}.</p>
                       <div className="bg-gray-50 p-4 rounded-xl text-left text-sm text-gray-600 mb-6 border border-gray-100">
                          <p><strong>Order ID:</strong> #ORD-{Math.floor(Math.random() * 100000)}</p>
                          <p><strong>Amount:</strong> ₹{cartTotal + tax + delivery}</p>
                       </div>
                       <button onClick={() => { setCart([]); setCheckoutStep('idle'); }} className="px-8 py-2 bg-gray-900 text-white rounded-lg font-bold">Done</button>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 z-50">
           <CheckCircle className="w-4 h-4 text-green-400" />
           <span className="font-bold text-sm">{toast}</span>
        </div>
      )}
    </div>
  );
};
