import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, Upload, Loader2, ScanLine, AlertCircle, Phone, 
  MapPin, ShoppingCart, Stethoscope, Store, Search, CheckCircle, 
  CreditCard, X, Truck, Navigation, Star, Filter, 
  Leaf, Sprout, FlaskConical, AlertTriangle, ClipboardCheck, ShieldCheck,
  Image as ImageIcon, RefreshCw, GraduationCap, Bell, PackagePlus, ArrowLeft, DollarSign
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

// -- Types --
interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  category: 'Seeds' | 'Saplings' | 'Fertilizer' | 'Pesticide' | 'Organic';
  image: string;
  rating: number;
  reviews: number;
  deliveryDate: string;
  isPrime: boolean;
  bestSeller?: boolean;
  inStock: boolean;
}

interface SellerProduct {
  id: string;
  name: string;
  category: string;
  price: string;
  quantity: string;
  description: string;
  sellerName: string;
  contact: string;
  image: string | null;
}

interface Expert {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  address: string;
  distance: string;
  isOpen: boolean;
  experience?: string;
  consultationFee?: number;
}

interface CartItem extends Product {
  quantity: number;
}

// -- Mock Data --
const MARKETPLACE_DATA: Product[] = [
  // SEEDS
  { id: 's1', name: 'Desi Wheat Seeds (Kalyan Sona)', price: 40, originalPrice: 60, category: 'Seeds', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400', rating: 4.5, reviews: 120, deliveryDate: '2 Days', isPrime: true, inStock: true },
  { id: 's2', name: 'Basmati Rice Seeds (Pusa 1121)', price: 120, originalPrice: 150, category: 'Seeds', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400', rating: 4.8, reviews: 450, deliveryDate: 'Tomorrow', isPrime: true, inStock: true, bestSeller: true },
  { id: 's3', name: 'Hybrid Tomato Seeds (High Yield)', price: 350, originalPrice: 500, category: 'Seeds', image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&q=80&w=400', rating: 4.6, reviews: 89, deliveryDate: 'Tomorrow', isPrime: true, inStock: true },
  { id: 's4', name: 'Mustard Seeds (Black Bold)', price: 80, originalPrice: 100, category: 'Seeds', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400', rating: 4.3, reviews: 67, deliveryDate: '3 Days', isPrime: false, inStock: true },
  
  // SAPLINGS
  { id: 'p1', name: 'Alphonso Mango Sapling (Grafted)', price: 250, originalPrice: 350, category: 'Saplings', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=400', rating: 4.8, reviews: 600, deliveryDate: '2 Days', isPrime: true, inStock: true, bestSeller: true },
  { id: 'p2', name: 'Guava Plant (Allahabad Safeda)', price: 150, originalPrice: 200, category: 'Saplings', image: 'https://images.unsplash.com/photo-1536882240095-0379873feb4e?auto=format&fit=crop&q=80&w=400', rating: 4.6, reviews: 300, deliveryDate: 'Tomorrow', isPrime: true, inStock: true },
  { id: 'p3', name: 'Lemon (Nimbu) Plant - Kagzi', price: 120, originalPrice: 180, category: 'Saplings', image: 'https://images.unsplash.com/photo-1595855709915-3931e0506eb0?auto=format&fit=crop&q=80&w=400', rating: 4.5, reviews: 250, deliveryDate: 'Tomorrow', isPrime: true, inStock: true },
  
  // FERTILIZERS
  { id: 'f1', name: 'Neem Cake Organic Fertilizer (5kg)', price: 300, originalPrice: 400, category: 'Fertilizer', image: 'https://images.unsplash.com/photo-1622383563227-0440114a8520?auto=format&fit=crop&q=80&w=400', rating: 4.7, reviews: 150, deliveryDate: 'Tomorrow', isPrime: true, inStock: true },
  { id: 'f2', name: 'NPK 19:19:19 Water Soluble (1kg)', price: 180, originalPrice: 250, category: 'Fertilizer', image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=400', rating: 4.9, reviews: 500, deliveryDate: 'Tomorrow', isPrime: true, inStock: true, bestSeller: true },
];

interface PlantMedicalViewProps {
  defaultTab?: 'diagnosis' | 'expert' | 'shop' | 'map';
  defaultCategory?: string;
  onBack?: () => void;
}

export const PlantMedicalView: React.FC<PlantMedicalViewProps> = ({ 
  defaultTab = 'diagnosis', 
  defaultCategory = 'All',
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'expert' | 'shop' | 'map' | 'sell'>(defaultTab);
  
  // -- Global/Location State --
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');
  const [showLocationModal, setShowLocationModal] = useState(false);

  // -- Diagnosis State --
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // -- Shop State --
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'address' | 'summary' | 'payment' | 'success' | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory);

  // -- Seller State --
  const [sellFormData, setSellFormData] = useState<SellerProduct>({
    id: '', name: '', category: 'Seeds', price: '', quantity: '', description: '', sellerName: '', contact: '', image: null
  });

  // -- Expert & Map State --
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loadingExperts, setLoadingExperts] = useState(false);
  const [bookingExpert, setBookingExpert] = useState<Expert | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);
  const [mapSummary, setMapSummary] = useState<string>('');
  const [loadingMap, setLoadingMap] = useState(false);

  // Init: Check location if starting in Shop mode
  useEffect(() => {
    if (activeTab === 'shop' && !userAddress) {
      setShowLocationModal(true);
    }
  }, [activeTab]);

  const handleLocationSubmit = (address: string) => {
    setUserAddress(address);
    setShowLocationModal(false);
    // Simulate getting lat/lng
    navigator.geolocation.getCurrentPosition((pos) => {
       setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    }, () => {
       setUserLocation({ lat: 28.6139, lng: 77.2090 }); 
    });
  };

  // -- Diagnosis Logic --
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setDiagnosisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    setDiagnosisResult(null);
    setImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Unable to access camera.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        setImage(canvasRef.current.toDataURL('image/jpeg'));
        stopCamera();
      }
    }
  };

  const analyzePlant = async () => {
    if (!image) return;
    setAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = image.split(',')[1];
      const prompt = `
        You are an expert Agricultural Scientist. Identify plant disease/pest from photo.
        Output purely JSON:
        { 
          "disease_name": "Name", 
          "what_is_it": "Simple explanation", 
          "steps_to_cure": ["Step 1", "Step 2"], 
          "medicines": ["Medicine A", "Medicine B"] 
        }
      `;
      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ inlineData: { mimeType: 'image/jpeg', data: base64Data } }, { text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });
      setDiagnosisResult(JSON.parse(result.text));
    } catch (error) {
      setDiagnosisResult({
        disease_name: "Yellow Rust",
        what_is_it: "Fungal disease causing yellow powder on leaves.",
        steps_to_cure: ["Spray fungicide immediately.", "Avoid over-watering.", "Isolate infected plants."],
        medicines: ["Propiconazole", "Tebuconazole"]
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // -- Shop Logic --
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      return [...prev, { ...product, quantity: 1 }];
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const filteredProducts = MARKETPLACE_DATA.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // -- Expert Logic (Doctors for Plants) --
  const fetchExperts = async () => {
    setLoadingExperts(true);
    if (!navigator.geolocation) {
      setLoadingExperts(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const result = await ai.models.generateContent({
           model: 'gemini-3-flash-preview',
           contents: `Find 6 top agricultural experts, KVK scientists, or plant clinics near current location. Return a JSON object with "experts" array.`,
           config: {
             tools: [{ googleMaps: {} }],
             toolConfig: { retrievalConfig: { latLng: { latitude, longitude } } },
             responseMimeType: "application/json",
             responseSchema: {
               type: Type.OBJECT,
               properties: {
                 experts: {
                   type: Type.ARRAY,
                   items: {
                     type: Type.OBJECT,
                     properties: {
                       id: { type: Type.STRING },
                       name: { type: Type.STRING },
                       specialty: { type: Type.STRING },
                       rating: { type: Type.NUMBER },
                       reviews: { type: Type.NUMBER },
                       address: { type: Type.STRING },
                       isOpen: { type: Type.BOOLEAN },
                       distance: { type: Type.STRING },
                       experience: { type: Type.STRING },
                       consultationFee: { type: Type.NUMBER },
                     }
                   }
                 }
               }
             }
           }
        });
        const data = JSON.parse(result.text);
        setExperts(data.experts || []);
      } catch (e) {
        console.error("Expert Fetch Error", e);
      } finally {
        setLoadingExperts(false);
      }
    });
  };

  useEffect(() => {
    if (activeTab === 'expert' && experts.length === 0) fetchExperts();
  }, [activeTab]);

  // -- Seller Logic --
  const handleSellerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSellFormData({ ...sellFormData, image: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const submitProduct = () => {
    alert("Product Listed Successfully!");
    setSellFormData({ id: '', name: '', category: 'Seeds', price: '', quantity: '', description: '', sellerName: '', contact: '', image: null });
    setActiveTab('shop');
  };

  // -- Map Logic --
  const fetchNearbyStores = async () => {
    setLoadingMap(true);
    setNearbyPlaces([]);
    if (!navigator.geolocation) {
      setLoadingMap(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      setUserLocation({ lat: latitude, lng: longitude });
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const result = await ai.models.generateContent({
           model: 'gemini-2.5-flash',
           contents: `Find 5 nearest Seeds, Saplings, and Fertilizer stores.`,
           config: {
             tools: [{ googleMaps: {} }],
             toolConfig: { retrievalConfig: { latLng: { latitude, longitude } } }
           }
        });
        setMapSummary(result.text || '');
        const chunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        setNearbyPlaces(chunks);
      } catch (e) {
        console.error("Map Error", e);
      } finally {
        setLoadingMap(false);
      }
    });
  };
  
  useEffect(() => {
    if (activeTab === 'map') fetchNearbyStores();
  }, [activeTab]);


  return (
    <div className="space-y-6 pb-12 animate-in fade-in relative">
      
      {/* 0. Location Modal (Force Entry) */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
           <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-300">
              <div className="text-center mb-6">
                 <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                   <MapPin className="w-8 h-8 text-green-600" />
                 </div>
                 <h3 className="text-2xl font-bold text-gray-900">Where are you located?</h3>
                 <p className="text-gray-500 mt-2">To show nearby seeds, saplings, and stores, we need your location.</p>
              </div>
              <div className="space-y-4">
                 <input 
                   type="text" 
                   placeholder="Enter Pincode or City Name" 
                   className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-green-500 outline-none"
                   onKeyDown={(e) => { if (e.key === 'Enter') handleLocationSubmit(e.currentTarget.value) }}
                 />
                 <button 
                   onClick={() => handleLocationSubmit("Current Location")}
                   className="w-full py-3.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
                 >
                   Find Stores Near Me
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* 1. Header Tabs */}
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-xl border border-gray-100 shadow-sm sticky top-0 z-40">
        {onBack && (
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg border border-transparent hover:border-gray-200">
             <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}
        <button onClick={() => setActiveTab('diagnosis')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'diagnosis' ? 'bg-green-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>
          <ScanLine className="w-4 h-4" /> AI Checkup
        </button>
        <button onClick={() => setActiveTab('shop')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'shop' ? 'bg-green-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>
          <Store className="w-4 h-4" /> Shop
        </button>
        <button onClick={() => setActiveTab('expert')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'expert' ? 'bg-green-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>
          <GraduationCap className="w-4 h-4" /> Experts
        </button>
        <button onClick={() => setActiveTab('map')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'map' ? 'bg-green-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>
          <MapPin className="w-4 h-4" /> Map
        </button>
        <button onClick={() => setActiveTab('sell')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'sell' ? 'bg-purple-600 text-white shadow-md' : 'text-purple-600 bg-purple-50 hover:bg-purple-100'}`}>
          <DollarSign className="w-4 h-4" /> Sell Produce
        </button>
      </div>

      {/* 2. TAB CONTENT */}

      {/* --- AI CHECKUP (DIAGNOSIS) --- */}
      {activeTab === 'diagnosis' && (
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Crop Disease Doctor</h2>
            <p className="text-gray-500 text-sm mt-1">Scan leaves or stems to identify diseases and get solutions.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
             <div className="space-y-6">
                {!image && !isCameraOpen && (
                   <div className="grid grid-cols-2 gap-4">
                      <button onClick={startCamera} className="flex flex-col items-center justify-center gap-3 p-8 bg-green-50 border-2 border-green-100 rounded-3xl hover:bg-green-100 transition-all shadow-sm">
                         <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md"><Camera className="w-8 h-8 text-green-600" /></div>
                         <span className="font-bold text-green-800">Take Photo</span>
                      </button>
                      <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center gap-3 p-8 bg-white border-2 border-gray-100 rounded-3xl hover:bg-gray-50 transition-all shadow-sm">
                         <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center shadow-md"><ImageIcon className="w-8 h-8 text-gray-500" /></div>
                         <span className="font-bold text-gray-700">Gallery</span>
                      </button>
                   </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                {isCameraOpen && (
                  <div className="relative rounded-3xl overflow-hidden bg-black shadow-lg">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-96 object-cover" />
                    <button onClick={capturePhoto} className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-gray-300"></button>
                  </div>
                )}
                {image && (
                  <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                     <div className="relative rounded-2xl overflow-hidden aspect-[4/3] mb-4 bg-gray-100">
                        <img src={image} alt="Preview" className="w-full h-full object-contain" />
                        <button onClick={() => { setImage(null); setDiagnosisResult(null); }} className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-black/80">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                     </div>
                     {!diagnosisResult && (
                       <button onClick={analyzePlant} disabled={analyzing} className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold flex justify-center items-center gap-2 shadow-lg hover:bg-green-700">
                         {analyzing ? <Loader2 className="animate-spin" /> : <ScanLine />}
                         {analyzing ? 'Analyzing Crop...' : 'Identify Disease'}
                       </button>
                     )}
                  </div>
                )}
             </div>
             
             {/* Report Result */}
             <div>
                {diagnosisResult ? (
                   <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4">
                      <div className="bg-red-50 p-6 border-b border-red-100">
                         <div className="flex items-start gap-3">
                            <AlertTriangle className="w-8 h-8 text-red-500 mt-1 flex-shrink-0" />
                            <div>
                               <span className="text-xs font-bold text-red-800 uppercase tracking-wider">Diagnosis Result</span>
                               <h2 className="text-3xl font-bold text-gray-900 mt-1">{diagnosisResult.disease_name}</h2>
                            </div>
                         </div>
                      </div>
                      <div className="p-6 space-y-6">
                         <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2 mb-2"><Search className="w-4 h-4"/> What is it?</h3>
                            <p className="bg-gray-50 p-4 rounded-2xl border border-gray-100 font-medium text-gray-800">{diagnosisResult.what_is_it}</p>
                         </div>
                         <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2 mb-3"><ClipboardCheck className="w-4 h-4"/> Steps to Cure</h3>
                            <ul className="space-y-3">
                               {diagnosisResult.steps_to_cure.map((step: string, i: number) => (
                                 <li key={i} className="flex items-start gap-3 bg-green-50 p-3 rounded-xl border border-green-100">
                                    <div className="w-6 h-6 bg-green-200 text-green-800 rounded-full flex items-center justify-center font-bold text-xs mt-0.5">{i+1}</div>
                                    <span className="text-gray-800">{step}</span>
                                 </li>
                               ))}
                            </ul>
                         </div>
                         <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2 mb-3"><ShoppingCart className="w-4 h-4"/> Recommended Medicines</h3>
                            <div className="grid grid-cols-1 gap-2">
                               {diagnosisResult.medicines.map((med: string, i: number) => (
                                 <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:bg-green-50 hover:border-green-200 transition-colors">
                                    <span className="font-bold text-gray-900">{med}</span>
                                    <button onClick={() => setActiveTab('shop')} className="text-xs font-bold bg-gray-900 text-white px-3 py-1.5 rounded-lg">Buy Now</button>
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>
                ) : (
                   <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-gray-100 text-gray-400">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4"><CheckCircle className="w-8 h-8 text-gray-200" /></div>
                      <p>Scan a plant to see the report.</p>
                   </div>
                )}
             </div>
          </div>
        </div>
      )}

      {/* --- SHOP (MARKETPLACE) --- */}
      {activeTab === 'shop' && (
        <div className="animate-in fade-in slide-in-from-bottom-2">
           {/* Top Search & Cart */}
           <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 sticky top-16 z-20">
              <div className="flex-1 relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                 <input 
                   type="text" 
                   placeholder="Search seeds, saplings, fertilizers..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm"
                 />
              </div>
              <button onClick={() => setCheckoutStep('cart')} className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200">
                 <ShoppingCart className="w-5 h-5" />
                 <span className="font-bold text-sm">Cart</span>
                 {cart.length > 0 && <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{cart.reduce((a,b)=>a+b.quantity,0)}</span>}
              </button>
           </div>

           <div className="flex flex-col lg:flex-row gap-6">
              {/* Sidebar */}
              <div className="hidden lg:block w-64 flex-shrink-0 space-y-6">
                 <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 sticky top-32">
                   <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Filter className="w-4 h-4" /> Categories</h3>
                   <div className="space-y-2">
                      {defaultCategory === 'All' ? ['All', 'Seeds', 'Saplings', 'Fertilizer'].map(cat => (
                        <label key={cat} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                          <input type="radio" name="cat" checked={selectedCategory === cat} onChange={() => setSelectedCategory(cat)} className="w-4 h-4 text-green-600 accent-green-600"/>
                          <span className={`text-sm ${selectedCategory === cat ? 'font-bold text-green-700' : 'text-gray-600'}`}>{cat}</span>
                        </label>
                      )) : (
                        <span className="text-sm font-bold text-green-700 p-2 block">{defaultCategory}</span>
                      )}
                   </div>
                 </div>
              </div>
              
              {/* Product Grid */}
              <div className="flex-1">
                 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredProducts.map(product => (
                       <div key={product.id} className="bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden group h-full">
                          <div className="relative h-48 p-4 bg-white flex items-center justify-center border-b border-gray-50">
                             {product.bestSeller && <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-sm shadow-sm z-10">#1 Best Seller</span>}
                             <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
                          </div>
                          <div className="p-4 flex flex-col flex-1">
                             <h3 className="font-medium text-gray-900 text-base leading-snug line-clamp-2 hover:text-green-700 cursor-pointer mb-1">{product.name}</h3>
                             <div className="flex items-center gap-1 mb-2">
                                <div className="flex text-yellow-400">
                                   {[1,2,3,4].map(i => <Star key={i} className="w-3.5 h-3.5 fill-current"/>)}
                                   <Star className={`w-3.5 h-3.5 ${product.rating >= 4.5 ? 'fill-current' : 'text-gray-300'}`}/>
                                </div>
                                <span className="text-xs text-blue-600">({product.reviews})</span>
                             </div>
                             <div className="mb-2">
                                <div className="flex items-baseline gap-2">
                                   <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
                                   <span className="text-xs text-gray-500 line-through">M.R.P.: ₹{product.originalPrice}</span>
                                   <span className="text-xs font-bold text-red-700">({Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off)</span>
                                </div>
                             </div>
                             <div className="mb-4 space-y-1">
                                <p className="text-xs text-gray-700">Get it by <span className="font-bold">{product.deliveryDate}</span></p>
                                <p className="text-xs text-gray-500">FREE Delivery by Kisan Portal</p>
                             </div>
                             <button onClick={() => addToCart(product)} className="mt-auto w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium py-2 rounded-full text-sm shadow-sm hover:shadow transition-colors">
                               Add to Cart
                             </button>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* --- EXPERTS TAB (DOCTORS) --- */}
      {activeTab === 'expert' && (
        <div className="animate-in fade-in slide-in-from-bottom-2">
           <div className="flex justify-between items-center mb-6">
             <div>
               <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                 Agricultural Experts & KVK Scientists
                 {loadingExperts && <Loader2 className="w-4 h-4 animate-spin text-green-600" />}
               </h2>
               <p className="text-sm text-gray-500">Find trusted experts near you for crop consultation.</p>
             </div>
             <button onClick={fetchExperts} className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors">Refresh List</button>
           </div>
           
           {experts.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {experts.map(doc => (
                  <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group">
                     <div className="p-6 border-b border-gray-50 flex items-start justify-between">
                        <div className="flex gap-4">
                           <div className="w-16 h-16 bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl flex items-center justify-center text-2xl font-bold text-green-700 border border-green-100 shadow-inner">{doc.name.charAt(0)}</div>
                           <div>
                              <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{doc.name}</h3>
                              <p className="text-sm text-gray-500 mb-1">{doc.specialty}</p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${doc.isOpen ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{doc.isOpen ? 'Available' : 'Closed'}</span>
                           </div>
                        </div>
                     </div>
                     <div className="p-6 space-y-3 flex-1">
                        <div className="flex items-start gap-3">
                           <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                           <div>
                             <p className="text-sm text-gray-600 line-clamp-2">{doc.address}</p>
                             <span className="text-xs font-semibold text-green-600 mt-1 block">{doc.distance} away</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <CreditCard className="w-4 h-4 text-gray-400 flex-shrink-0" />
                           <p className="text-sm text-gray-600">Fee: <span className="font-bold text-gray-800">₹{doc.consultationFee}</span></p>
                        </div>
                     </div>
                     <div className="p-4 bg-gray-50 grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-100 text-sm"><Phone className="w-4 h-4" /> Call</button>
                        <button onClick={() => setBookingExpert(doc)} className="flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-sm text-sm">Book Slot</button>
                     </div>
                  </div>
                ))}
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                {loadingExperts ? <Loader2 className="w-8 h-8 animate-spin text-green-500 mb-2" /> : <GraduationCap className="w-12 h-12 text-gray-300 mb-2" />}
                <p className="text-gray-500">{loadingExperts ? 'Finding experts...' : 'Click refresh to find experts.'}</p>
             </div>
           )}

           {/* Booking Modal */}
           {bookingExpert && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-gray-900">Book Consultation</h3>
                      <button onClick={() => setBookingExpert(null)} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5 text-gray-500" /></button>
                   </div>
                   <form onSubmit={(e) => { e.preventDefault(); alert("Booking Confirmed!"); setBookingExpert(null); }} className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Select Date</label>
                        <input type="date" required className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500" />
                      </div>
                      <div>
                         <label className="text-xs font-bold text-gray-500 uppercase">Crop Problem</label>
                         <input type="text" placeholder="e.g. Yellowing leaves" required className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500" />
                      </div>
                      <button type="submit" className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg mt-2">Confirm Booking</button>
                   </form>
                </div>
             </div>
           )}
        </div>
      )}

      {/* --- MAP TAB --- */}
      {activeTab === 'map' && (
         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 min-h-[500px]">
           <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-900">Nearby Seed & Sapling Stores</h2>
                  {loadingMap && <Loader2 className="w-5 h-5 animate-spin text-green-600" />}
               </div>
               <div className="text-sm bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">
                  Location: <span className="font-bold text-gray-800">{userAddress || "Detecting..."}</span>
               </div>
           </div>
           
           {userLocation && (
              <div className="w-full h-96 bg-gray-100 rounded-xl overflow-hidden mb-6 border border-gray-200 relative shadow-inner">
                <iframe
                  title="Google Maps"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://maps.google.com/maps?q=seeds+saplings+nursery&sll=${userLocation.lat},${userLocation.lng}&output=embed`}
                  allowFullScreen
                ></iframe>
              </div>
           )}

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearbyPlaces.map((place, i) => (
                <div key={i} className="flex flex-col p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors bg-white shadow-sm">
                   <h3 className="font-bold text-gray-900 line-clamp-1">{place.maps?.title || place.web?.title || "Local Agri Store"}</h3>
                   <p className="text-xs text-gray-500 mb-3 line-clamp-2">{place.web?.snippet || "Visit for high quality seeds and plants."}</p>
                   <div className="mt-auto flex gap-2">
                     <a href={place.maps?.uri || place.web?.uri} target="_blank" className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-green-100">
                       <Navigation className="w-3 h-3" /> Drive
                     </a>
                     <button className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-gray-800">
                       Order Here
                     </button>
                   </div>
                </div>
              ))}
           </div>
         </div>
      )}

      {/* --- SELL YOUR PRODUCTS TAB --- */}
      {activeTab === 'sell' && (
         <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
            <div className="bg-purple-50 p-6 border-b border-purple-100">
               <h2 className="text-2xl font-bold text-purple-900 flex items-center gap-2">
                 <DollarSign className="w-6 h-6" /> Sell Your Products
               </h2>
               <p className="text-purple-700 text-sm mt-1">List your Seeds or Saplings on Kisan Portal marketplace.</p>
            </div>
            
            <div className="p-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="col-span-full md:col-span-1">
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Product Image</label>
                     <div 
                       onClick={() => document.getElementById('sell-img')?.click()}
                       className="border-2 border-dashed border-gray-300 rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-purple-300 transition-all"
                     >
                        {sellFormData.image ? (
                           <img src={sellFormData.image} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                           <>
                             <Upload className="w-8 h-8 text-gray-400 mb-2" />
                             <span className="text-sm text-gray-500 font-medium">Click to upload photo</span>
                           </>
                        )}
                        <input id="sell-img" type="file" className="hidden" accept="image/*" onChange={handleSellerImageUpload} />
                     </div>
                  </div>

                  <div className="col-span-full md:col-span-1 space-y-4">
                     <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Name</label>
                       <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm" placeholder="e.g. Organic Tomato Seeds" 
                         value={sellFormData.name} onChange={e => setSellFormData({...sellFormData, name: e.target.value})}
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                       <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                         value={sellFormData.category} onChange={e => setSellFormData({...sellFormData, category: e.target.value})}
                       >
                         <option>Seeds</option>
                         <option>Saplings</option>
                       </select>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price (₹)</label>
                          <input type="number" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm" placeholder="200"
                            value={sellFormData.price} onChange={e => setSellFormData({...sellFormData, price: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Qty Available</label>
                          <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm" placeholder="e.g. 10 kg"
                            value={sellFormData.quantity} onChange={e => setSellFormData({...sellFormData, quantity: e.target.value})}
                          />
                        </div>
                     </div>
                  </div>
                  
                  <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Your Name</label>
                       <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm" 
                         value={sellFormData.sellerName} onChange={e => setSellFormData({...sellFormData, sellerName: e.target.value})}
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contact Number</label>
                       <input type="tel" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm" 
                         value={sellFormData.contact} onChange={e => setSellFormData({...sellFormData, contact: e.target.value})}
                       />
                     </div>
                     <div className="col-span-full">
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                       <textarea className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm h-24" placeholder="Describe quality, origin, etc."
                         value={sellFormData.description} onChange={e => setSellFormData({...sellFormData, description: e.target.value})}
                       ></textarea>
                     </div>
                  </div>
               </div>
               
               <button 
                 onClick={submitProduct}
                 className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 flex items-center justify-center gap-2"
               >
                 <PackagePlus className="w-5 h-5" /> List Product Now
               </button>
            </div>
         </div>
      )}

      {/* -- CHECKOUT MODAL FLOW -- */}
      {checkoutStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-900">
                  {checkoutStep === 'cart' && 'Your Cart'}
                  {checkoutStep === 'address' && 'Delivery Address'}
                  {checkoutStep === 'summary' && 'Order Summary'}
                  {checkoutStep === 'payment' && 'Payment Method'}
                  {checkoutStep === 'success' && 'Order Confirmed'}
                </h3>
                {checkoutStep !== 'success' && <button onClick={() => setCheckoutStep(null)}><X className="w-5 h-5 text-gray-500" /></button>}
             </div>

             <div className="p-6">
                {checkoutStep === 'cart' && (
                  <div className="space-y-4">
                     {cart.length === 0 ? <p className="text-center py-8">Cart is empty.</p> : (
                       <ul className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">{cart.map((item, idx) => (
                         <li key={idx} className="flex justify-between items-center text-sm font-medium">
                           <span>{item.name} (x{item.quantity})</span><span>₹{item.price * item.quantity}</span>
                         </li>
                       ))}</ul>
                     )}
                     {cart.length > 0 && (
                       <div className="pt-4 border-t border-gray-100">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-bold text-gray-500">Total</span>
                            <span className="text-xl font-bold text-green-700">₹{cartTotal}</span>
                          </div>
                          <button onClick={() => setCheckoutStep('address')} className="w-full py-3 bg-yellow-400 text-gray-900 rounded-xl font-bold">Proceed to Buy</button>
                       </div>
                     )}
                  </div>
                )}
                {checkoutStep === 'address' && (
                   <div className="space-y-4">
                     <textarea value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Enter Full Address..." className="w-full h-32 p-3 bg-gray-50 border rounded-xl outline-none"></textarea>
                     <button onClick={() => setCheckoutStep('summary')} className="w-full py-3 bg-yellow-400 text-gray-900 rounded-xl font-bold">Continue</button>
                   </div>
                )}
                {checkoutStep === 'summary' && (
                   <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-xl text-sm space-y-2">
                        <p><strong>Items:</strong> {cart.length}</p>
                        <p><strong>Address:</strong> {deliveryAddress}</p>
                        <p className="text-lg font-bold text-green-700">Total: ₹{cartTotal}</p>
                      </div>
                      <button onClick={() => setCheckoutStep('payment')} className="w-full py-3 bg-yellow-400 text-gray-900 rounded-xl font-bold">Continue to Payment</button>
                   </div>
                )}
                {checkoutStep === 'payment' && (
                   <div className="space-y-3">
                      <button onClick={() => setPaymentMode('cod')} className={`w-full p-4 border rounded-xl text-left font-bold ${paymentMode==='cod'?'border-green-500 bg-green-50':''}`}>Cash on Delivery</button>
                      <button onClick={() => setPaymentMode('upi')} className={`w-full p-4 border rounded-xl text-left font-bold ${paymentMode==='upi'?'border-green-500 bg-green-50':''}`}>UPI / Online</button>
                      <button onClick={() => setCheckoutStep('success')} disabled={!paymentMode} className="w-full py-3 bg-green-600 text-white rounded-xl font-bold mt-4 disabled:opacity-50">Place Order</button>
                   </div>
                )}
                {checkoutStep === 'success' && (
                  <div className="text-center py-6">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4 animate-bounce" />
                    <h3 className="text-xl font-bold">Order Placed!</h3>
                    <button onClick={() => { setCart([]); setCheckoutStep(null); }} className="mt-6 px-6 py-2 bg-gray-100 rounded-lg font-bold">Close</button>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 z-50">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-sm font-bold">Added to Cart</span>
        </div>
      )}

    </div>
  );
};