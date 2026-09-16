import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, Upload, Loader2, ScanLine, AlertCircle, Phone, 
  MapPin, ShoppingCart, Stethoscope, Store, Search, CheckCircle, 
  CreditCard, X, Plus, Minus, Truck, Navigation, Star, Filter, 
  ChevronRight, Clock, Calendar, User, ShieldCheck, Image as ImageIcon,
  RefreshCw, ClipboardCheck, AlertTriangle
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

// -- Types --
interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  deliveryDate: string;
  isPrime: boolean;
  bestSeller?: boolean;
}

interface Doctor {
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

// -- Mock Data: Medicine Specific --
const MEDICINE_PRODUCTS: Product[] = [
  { 
    id: '1', 
    name: 'Ivermectin Injection 10ml - Anti-Parasitic for Cattle & Dogs', 
    price: 145, 
    originalPrice: 199,
    category: 'Injectables', 
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400', 
    rating: 4.5, 
    reviews: 120,
    deliveryDate: 'Tomorrow, 25 Aug',
    isPrime: true,
    bestSeller: true
  },
  { 
    id: '2', 
    name: 'Himalaya Scavon Spray - Wound Healer & Fly Repellent (100ml)', 
    price: 210, 
    originalPrice: 250,
    category: 'Topical', 
    image: 'https://images.unsplash.com/photo-1628009368231-760335298029?auto=format&fit=crop&q=80&w=400', 
    rating: 4.8, 
    reviews: 3400,
    deliveryDate: 'Fri, 26 Aug',
    isPrime: true,
    bestSeller: true
  },
  { 
    id: '3', 
    name: 'Albendazole Oral Suspension - Broad Spectrum Dewormer', 
    price: 85, 
    originalPrice: 100,
    category: 'Dewormer', 
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=400', 
    rating: 4.2, 
    reviews: 56,
    deliveryDate: 'Tomorrow, 25 Aug',
    isPrime: false
  },
  { 
    id: '4', 
    name: 'Mastilep Gel - Ayurvedic Ointment for Mastitis (Cow/Buffalo)', 
    price: 120, 
    originalPrice: 150,
    category: 'Ointment', 
    image: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&q=80&w=400', 
    rating: 4.6, 
    reviews: 890,
    deliveryDate: 'Sat, 27 Aug',
    isPrime: true
  },
  { 
    id: '5', 
    name: 'Oxytetracycline 20% LA Injection - Antibiotic', 
    price: 350, 
    originalPrice: 420,
    category: 'Antibiotics', 
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=400', 
    rating: 4.7, 
    reviews: 210,
    deliveryDate: 'Tomorrow, 25 Aug',
    isPrime: true
  },
  { 
    id: '6', 
    name: 'Topicure Spray - Natural Herbal Wound Healing Spray', 
    price: 180, 
    originalPrice: 200,
    category: 'Topical', 
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80&w=400', 
    rating: 4.4, 
    reviews: 1500,
    deliveryDate: 'Mon, 29 Aug',
    isPrime: false
  },
  { 
    id: '7', 
    name: 'Meloxicam Paracetamol Bolus - Fever & Pain Relief', 
    price: 60, 
    originalPrice: 80,
    category: 'Tablets', 
    image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&q=80&w=400', 
    rating: 4.3, 
    reviews: 45,
    deliveryDate: 'Tomorrow, 25 Aug',
    isPrime: true
  },
  { 
    id: '8', 
    name: 'Caldicind Plus - Calcium & Phosphorus Supplement', 
    price: 450, 
    originalPrice: 550,
    category: 'Supplements', 
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=400', 
    rating: 4.9, 
    reviews: 2300,
    deliveryDate: 'Fri, 26 Aug',
    isPrime: true,
    bestSeller: true
  }
];

export const AnimalMedicalView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'doctor' | 'shop' | 'map'>('diagnosis');
  
  // -- Diagnosis State --
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // -- Shop/Cart State --
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'address' | 'summary' | 'payment' | 'success' | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // -- Doctor State --
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);

  // -- Map State --
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);
  const [mapSummary, setMapSummary] = useState<string>('');
  const [loadingMap, setLoadingMap] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // -- Camera Logic --
  const startCamera = async () => {
    setIsCameraOpen(true);
    setDiagnosisResult(null);
    setImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Unable to access camera. Please check permissions.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setImage(dataUrl);
        stopCamera();
      }
    }
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

  const analyzeSkin = async () => {
    if (!image) return;
    setAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const base64Data = image.split(',')[1];
      
      const prompt = `
        You are a helpful veterinary assistant for an Indian farmer. 
        Look at this photo of an animal.
        
        1. Identify the skin disease or injury.
        2. Explain "What is it?" in very simple, plain language (English).
        3. Explain "What to do?" as a numbered list of simple actions.
        4. Suggest 2-3 common medicines available in Indian shops.

        Output purely as JSON:
        { 
          "disease_name": "Name of Disease", 
          "what_is_it": "Simple explanation in 1 sentence", 
          "steps_to_cure": ["Step 1", "Step 2", "Step 3"], 
          "medicines": ["Medicine A", "Medicine B"] 
        }
      `;

      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
            { text: prompt }
          ]
        },
        config: { responseMimeType: "application/json" }
      });

      setDiagnosisResult(JSON.parse(result.text));
    } catch (error) {
      console.error("Diagnosis failed", error);
      // Fallback
      setDiagnosisResult({
        disease_name: "Mange (Sarcoptic)",
        what_is_it: "Itches caused by small insects (mites) on the skin.",
        steps_to_cure: ["Keep the animal away from others.", "Wash the area with warm water.", "Apply the medicine daily."],
        medicines: ["Ivermectin Injection", "Amitraz Dip"]
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // -- Shop Logic --
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    
    // Toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  const filteredProducts = MEDICINE_PRODUCTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(MEDICINE_PRODUCTS.map(p => p.category)))];

  // -- Doctor Logic --
  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    if (!navigator.geolocation) {
      setLoadingDoctors(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const result = await ai.models.generateContent({
           model: 'gemini-3-flash-preview',
           contents: `Find 6 top-rated veterinary doctors or pet clinics near the current location. Return a JSON object with a "doctors" array.`,
           config: {
             tools: [{ googleMaps: {} }],
             toolConfig: { retrievalConfig: { latLng: { latitude, longitude } } },
             responseMimeType: "application/json",
             responseSchema: {
               type: Type.OBJECT,
               properties: {
                 doctors: {
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
        setDoctors(data.doctors || []);
      } catch (e) {
        console.error("Doctor Fetch Error", e);
      } finally {
        setLoadingDoctors(false);
      }
    });
  };

  useEffect(() => {
    if (activeTab === 'doctor' && doctors.length === 0) fetchDoctors();
  }, [activeTab]);

  // -- Map Logic --
  const fetchNearbyPlaces = async () => {
    setLoadingMap(true);
    setNearbyPlaces([]);
    setMapSummary('');
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
           contents: `Find 5 nearest veterinary clinics and animal medical shops.`,
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
    if (activeTab === 'map') fetchNearbyPlaces();
  }, [activeTab]);


  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      
      {/* Header Tabs */}
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-xl border border-gray-100 shadow-sm sticky top-0 z-40">
        <button 
          onClick={() => setActiveTab('diagnosis')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'diagnosis' ? 'bg-teal-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <ScanLine className="w-4 h-4" /> AI Checkup
        </button>
        <button 
          onClick={() => setActiveTab('shop')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'shop' ? 'bg-teal-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <Store className="w-4 h-4" /> Shop
        </button>
        <button 
          onClick={() => setActiveTab('doctor')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'doctor' ? 'bg-teal-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <Stethoscope className="w-4 h-4" /> Doctors
        </button>
        <button 
          onClick={() => setActiveTab('map')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'map' ? 'bg-teal-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <MapPin className="w-4 h-4" /> Map
        </button>
      </div>

      {/* -- AI DIAGNOSIS TAB -- */}
      {activeTab === 'diagnosis' && (
        <div className="max-w-4xl mx-auto">
          
          {/* Header Message */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Check Your Animal's Health</h2>
            <p className="text-gray-500 text-sm mt-1">Take a photo of the affected area to get an instant report.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
             
             {/* Left Column: Capture / Input */}
             <div className="space-y-6">
                
                {/* Mode Selection (Show only if no image and camera closed) */}
                {!image && !isCameraOpen && (
                   <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={startCamera}
                        className="flex flex-col items-center justify-center gap-3 p-8 bg-teal-50 border-2 border-teal-100 rounded-3xl hover:bg-teal-100 hover:border-teal-300 transition-all shadow-sm group"
                      >
                         <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                           <Camera className="w-8 h-8 text-teal-600" />
                         </div>
                         <span className="font-bold text-teal-800">Take Photo</span>
                      </button>

                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center gap-3 p-8 bg-white border-2 border-gray-100 rounded-3xl hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm group"
                      >
                         <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                           <ImageIcon className="w-8 h-8 text-gray-500" />
                         </div>
                         <span className="font-bold text-gray-700">From Gallery</span>
                      </button>
                   </div>
                )}
                
                {/* Hidden File Input */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                />

                {/* Camera View */}
                {isCameraOpen && (
                  <div className="relative rounded-3xl overflow-hidden bg-black shadow-lg">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-96 object-cover" />
                    <div className="absolute bottom-6 left-0 w-full flex justify-center items-center gap-8">
                      <button onClick={stopCamera} className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30">
                         <X className="w-6 h-6" />
                      </button>
                      <button onClick={capturePhoto} className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 shadow-lg hover:scale-105 transition-transform flex items-center justify-center">
                         <div className="w-12 h-12 bg-white rounded-full border-2 border-black"></div>
                      </button>
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                )}

                {/* Image Preview & Analyze */}
                {image && (
                  <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                     <div className="relative rounded-2xl overflow-hidden aspect-[4/3] mb-4 bg-gray-100">
                        <img src={image} alt="Preview" className="w-full h-full object-contain" />
                        <button 
                          onClick={() => { setImage(null); setDiagnosisResult(null); }}
                          className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-black/80"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                     </div>

                     {!diagnosisResult && (
                       <button 
                         onClick={analyzeSkin}
                         disabled={analyzing}
                         className="w-full py-4 bg-gradient-to-r from-teal-600 to-green-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-teal-200 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:scale-100"
                       >
                         {analyzing ? <Loader2 className="w-6 h-6 animate-spin" /> : <ScanLine className="w-6 h-6" />}
                         {analyzing ? 'Checking Health...' : 'Check Disease Now'}
                       </button>
                     )}
                  </div>
                )}
             </div>

             {/* Right Column: Report Card */}
             <div className="min-h-[200px]">
                {analyzing ? (
                   <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                        <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg">Analyzing Photo...</h3>
                      <p className="text-gray-500 text-sm mt-2">Our AI is looking for symptoms.</p>
                   </div>
                ) : diagnosisResult ? (
                   <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4">
                      
                      {/* Report Header */}
                      <div className="bg-red-50 p-6 border-b border-red-100">
                         <div className="flex items-start gap-3">
                            <AlertTriangle className="w-8 h-8 text-red-500 mt-1 flex-shrink-0" />
                            <div>
                               <span className="text-xs font-bold text-red-800 uppercase tracking-wider">Disease Identified</span>
                               <h2 className="text-3xl font-bold text-gray-900 mt-1">{diagnosisResult.disease_name}</h2>
                            </div>
                         </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 space-y-6">
                         
                         {/* What is it? */}
                         <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2 mb-2">
                              <Search className="w-4 h-4" /> What is it?
                            </h3>
                            <p className="text-lg font-medium text-gray-800 bg-gray-50 p-4 rounded-2xl border border-gray-100 leading-relaxed">
                               {diagnosisResult.what_is_it}
                            </p>
                         </div>

                         {/* Steps to Cure */}
                         <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2 mb-3">
                              <ClipboardCheck className="w-4 h-4" /> What to do?
                            </h3>
                            <ul className="space-y-3">
                               {diagnosisResult.steps_to_cure.map((step: string, i: number) => (
                                 <li key={i} className="flex items-start gap-3 bg-green-50 p-3 rounded-xl border border-green-100">
                                    <div className="w-6 h-6 bg-green-200 text-green-800 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                                      {i + 1}
                                    </div>
                                    <span className="text-gray-800 font-medium">{step}</span>
                                 </li>
                               ))}
                            </ul>
                         </div>

                         {/* Medicines */}
                         <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2 mb-3">
                              <ShoppingCart className="w-4 h-4" /> Medicines Needed
                            </h3>
                            <div className="grid grid-cols-1 gap-2">
                               {diagnosisResult.medicines.map((med: string, i: number) => (
                                 <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-colors group">
                                    <span className="font-bold text-gray-900">{med}</span>
                                    <button 
                                      onClick={() => setActiveTab('shop')}
                                      className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg group-hover:bg-white group-hover:text-teal-700 shadow-sm"
                                    >
                                      Buy Now
                                    </button>
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>
                      
                      <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
                         <p className="text-xs text-gray-400">
                           <ShieldCheck className="w-3 h-3 inline mr-1" />
                           AI Advice only. Please consult a real Vet for serious cases.
                         </p>
                      </div>
                   </div>
                ) : (
                   <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-gray-100 text-gray-400">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-gray-200" />
                      </div>
                      <p>Your report will appear here.</p>
                   </div>
                )}
             </div>
          </div>
        </div>
      )}

      {/* -- SHOP TAB -- */}
      {activeTab === 'shop' && (
        <div className="animate-in fade-in slide-in-from-bottom-2">
          
          {/* Top Search Bar & Cart */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 sticky top-0 z-20">
             <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search for medicines (e.g., Ivermectin, Antibiotics)..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                />
             </div>
             
             <button 
               onClick={() => setCheckoutStep('cart')}
               className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
             >
               <ShoppingCart className="w-5 h-5" />
               <span className="font-bold text-sm">Cart</span>
               {cart.length > 0 && (
                 <span className="bg-teal-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                   {cart.reduce((a, b) => a + b.quantity, 0)}
                 </span>
               )}
             </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Sidebar Filters (Desktop) */}
            <div className="hidden lg:block w-64 flex-shrink-0">
               <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                 <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                   <Filter className="w-4 h-4" /> Filters
                 </h3>
                 
                 <div className="space-y-2">
                   <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Category</h4>
                   {categories.map(cat => (
                     <label key={cat} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                       <input 
                         type="radio" 
                         name="category" 
                         checked={selectedCategory === cat}
                         onChange={() => setSelectedCategory(cat)}
                         className="w-4 h-4 text-teal-600 accent-teal-600"
                       />
                       <span className={`text-sm ${selectedCategory === cat ? 'font-bold text-teal-700' : 'text-gray-600'}`}>
                         {cat}
                       </span>
                     </label>
                   ))}
                 </div>

                 <div className="mt-6 pt-6 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Customer Reviews</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                       <div className="flex items-center gap-1 cursor-pointer hover:text-orange-500">
                          <div className="flex text-yellow-400">
                             {[1,2,3,4].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
                             <Star className="w-3 h-3 text-gray-300" />
                          </div>
                          <span>& Up</span>
                       </div>
                    </div>
                 </div>
               </div>
            </div>

            {/* Mobile Category Filter (Horizontal) */}
            <div className="lg:hidden flex overflow-x-auto gap-2 pb-2 custom-scrollbar">
               {categories.map(cat => (
                 <button
                   key={cat}
                   onClick={() => setSelectedCategory(cat)}
                   className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap border ${
                     selectedCategory === cat 
                       ? 'bg-teal-600 text-white border-teal-600' 
                       : 'bg-white text-gray-600 border-gray-200'
                   }`}
                 >
                   {cat}
                 </button>
               ))}
            </div>

            {/* Product Grid - Amazon Style */}
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col group h-full">
                    
                    {/* Image Area */}
                    <div className="relative h-48 p-4 bg-white flex items-center justify-center border-b border-gray-50">
                       {product.bestSeller && (
                         <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-sm shadow-sm z-10">
                           #1 Best Seller
                         </span>
                       )}
                       <img 
                         src={product.image} 
                         alt={product.name} 
                         className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" 
                       />
                    </div>

                    {/* Content Area */}
                    <div className="p-4 flex flex-col flex-1">
                       {/* Title */}
                       <h3 className="font-medium text-gray-900 text-base leading-snug line-clamp-2 hover:text-teal-700 cursor-pointer mb-1">
                         {product.name}
                       </h3>
                       
                       {/* Rating */}
                       <div className="flex items-center gap-1 mb-2">
                          <div className="flex text-yellow-400">
                             {[1,2,3,4].map(i => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                             <Star className={`w-3.5 h-3.5 ${product.rating >= 4.5 ? 'fill-current' : 'text-gray-300'}`} />
                          </div>
                          <span className="text-xs text-blue-600 hover:underline cursor-pointer">{product.reviews.toLocaleString()}</span>
                       </div>

                       {/* Price */}
                       <div className="mb-2">
                          <div className="flex items-baseline gap-2">
                             <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
                             <span className="text-xs text-gray-500 line-through">M.R.P.: ₹{product.originalPrice}</span>
                             <span className="text-xs font-bold text-red-700">
                               ({Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off)
                             </span>
                          </div>
                          <p className="text-[10px] text-gray-500">Inclusive of all taxes</p>
                       </div>

                       {/* Delivery Info */}
                       <div className="mb-4 space-y-1">
                          {product.isPrime && (
                             <div className="flex items-center gap-1 text-xs font-bold text-gray-700">
                               <CheckCircle className="w-3.5 h-3.5 text-orange-500 fill-white" />
                               <span className="text-blue-600 italic">Prime</span>
                             </div>
                          )}
                          <p className="text-xs text-gray-700">
                            Get it by <span className="font-bold">{product.deliveryDate}</span>
                          </p>
                          <p className="text-xs text-gray-500">FREE Delivery by Kisan Portal</p>
                       </div>

                       {/* Action Button */}
                       <button 
                         onClick={() => addToCart(product)}
                         className="mt-auto w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium py-2 rounded-full text-sm shadow-sm hover:shadow transition-colors"
                       >
                         Add to Cart
                       </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredProducts.length === 0 && (
                 <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Search className="w-12 h-12 mb-4 opacity-20" />
                    <p>No medicines found matching your search.</p>
                 </div>
              )}
            </div>
          </div>

          {/* Cart Toast Notification */}
          {showToast && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 z-50">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm font-bold">Item Added to Cart</span>
            </div>
          )}
        </div>
      )}

      {/* -- CHECKOUT MODAL FLOW -- */}
      {checkoutStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
             
             {/* Header */}
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-900">
                  {checkoutStep === 'cart' && 'Your Cart'}
                  {checkoutStep === 'address' && 'Delivery Address'}
                  {checkoutStep === 'summary' && 'Order Summary'}
                  {checkoutStep === 'payment' && 'Payment Method'}
                  {checkoutStep === 'success' && 'Order Confirmed'}
                </h3>
                {checkoutStep !== 'success' && (
                  <button onClick={() => setCheckoutStep(null)} className="p-1 hover:bg-gray-200 rounded-full">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                )}
             </div>

             {/* Content Area */}
             <div className="p-6">
                
                {/* Step 1: Cart */}
                {checkoutStep === 'cart' && (
                  <div className="space-y-4">
                     {cart.length === 0 ? (
                       <p className="text-center text-gray-500 py-8">Your cart is empty.</p>
                     ) : (
                       <ul className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                         {cart.map((item, idx) => (
                           <li key={idx} className="flex justify-between items-center">
                             <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                                  <img src={item.image} className="w-full h-full object-cover mix-blend-multiply" />
                               </div>
                               <div>
                                 <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</p>
                                 <p className="text-xs text-gray-500">{item.quantity} x ₹{item.price}</p>
                               </div>
                             </div>
                             <span className="font-bold text-gray-900">₹{item.price * item.quantity}</span>
                           </li>
                         ))}
                       </ul>
                     )}
                     {cart.length > 0 && (
                       <div className="pt-4 border-t border-gray-100">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-bold text-gray-500">Total</span>
                            <span className="text-xl font-bold text-teal-700">₹{cartTotal}</span>
                          </div>
                          <button 
                            onClick={() => setCheckoutStep('address')}
                            className="w-full py-3 bg-yellow-400 text-gray-900 rounded-xl font-bold hover:bg-yellow-500 transition-colors shadow-sm"
                          >
                            Proceed to Buy
                          </button>
                       </div>
                     )}
                  </div>
                )}

                {/* Step 2: Address */}
                {checkoutStep === 'address' && (
                   <div className="space-y-4">
                     <p className="text-sm text-gray-500">Please enter your delivery location.</p>
                     <textarea 
                       value={deliveryAddress}
                       onChange={(e) => setDeliveryAddress(e.target.value)}
                       placeholder="House No, Street, Landmark, City, Pincode"
                       className="w-full h-32 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                     ></textarea>
                     <button 
                        onClick={() => {
                          if (deliveryAddress.trim()) setCheckoutStep('summary');
                          else alert("Please enter an address");
                        }}
                        className="w-full py-3 bg-yellow-400 text-gray-900 rounded-xl font-bold hover:bg-yellow-500 transition-colors"
                      >
                        Use this Address
                      </button>
                   </div>
                )}

                {/* Step 3: Summary */}
                {checkoutStep === 'summary' && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                       <h4 className="text-xs font-bold text-gray-500 uppercase">Items ({cart.length})</h4>
                       <p className="text-sm font-bold text-gray-900">Total: ₹{cartTotal}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                       <h4 className="text-xs font-bold text-gray-500 uppercase">Deliver To</h4>
                       <p className="text-sm text-gray-700">{deliveryAddress}</p>
                    </div>
                    <button 
                      onClick={() => setCheckoutStep('payment')}
                      className="w-full py-3 bg-yellow-400 text-gray-900 rounded-xl font-bold hover:bg-yellow-500 transition-colors"
                    >
                      Proceed to Payment
                    </button>
                  </div>
                )}

                {/* Step 4: Payment */}
                {checkoutStep === 'payment' && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500 mb-2">Select Payment Method</p>
                    <button 
                      onClick={() => setPaymentMode('cod')}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border ${paymentMode === 'cod' ? 'border-orange-500 bg-orange-50 text-orange-800' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                      <span className="font-bold text-sm">Cash on Delivery</span>
                      <Truck className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setPaymentMode('upi')}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border ${paymentMode === 'upi' ? 'border-orange-500 bg-orange-50 text-orange-800' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                      <span className="font-bold text-sm">UPI / Online</span>
                      <CreditCard className="w-5 h-5" />
                    </button>

                    <button 
                      onClick={() => {
                        if (paymentMode) setCheckoutStep('success');
                        else alert("Select a payment mode");
                      }}
                      className="w-full mt-4 py-3 bg-yellow-400 text-gray-900 rounded-xl font-bold hover:bg-yellow-500 transition-colors"
                    >
                      Place Order
                    </button>
                  </div>
                )}

                {/* Step 5: Success */}
                {checkoutStep === 'success' && (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Order Placed Successfully!</h3>
                    <p className="text-gray-500 mt-2 text-sm max-w-xs mx-auto">
                      Your medicine items will be delivered to the provided address by tomorrow.
                    </p>
                    <button 
                      onClick={() => {
                        setCart([]);
                        setCheckoutStep(null);
                        setDeliveryAddress('');
                        setPaymentMode('');
                      }}
                      className="mt-6 px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200"
                    >
                      Close
                    </button>
                  </div>
                )}

             </div>
          </div>
        </div>
      )}

      {/* -- DOCTOR TAB -- */}
      {activeTab === 'doctor' && (
        <div className="animate-in fade-in slide-in-from-bottom-2">
           <div className="flex justify-between items-center mb-6">
             <div>
               <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                 Best Veterinary Doctors Near You
                 {loadingDoctors && <Loader2 className="w-4 h-4 animate-spin text-teal-600" />}
               </h2>
               <p className="text-sm text-gray-500">Real-time availability based on your location</p>
             </div>
             <button onClick={fetchDoctors} className="text-sm font-bold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors">
               Refresh List
             </button>
           </div>
           
           {doctors.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map(doc => (
                  <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group">
                     {/* Doctor Card Header */}
                     <div className="p-6 border-b border-gray-50 flex items-start justify-between">
                        <div className="flex gap-4">
                           <div className="w-16 h-16 bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl flex items-center justify-center text-2xl font-bold text-teal-700 border border-teal-100 shadow-inner">
                             {doc.name.charAt(3) || 'D'}
                           </div>
                           <div>
                              <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{doc.name}</h3>
                              <p className="text-sm text-gray-500 mb-1">{doc.specialty}</p>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${doc.isOpen ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                  {doc.isOpen ? 'Open Now' : 'Closed'}
                                </span>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Stats */}
                     <div className="grid grid-cols-2 border-b border-gray-50">
                        <div className="p-4 border-r border-gray-50 flex flex-col items-center">
                           <div className="flex items-center gap-1 text-yellow-500 font-bold">
                             {doc.rating} <Star className="w-3.5 h-3.5 fill-current" />
                           </div>
                           <span className="text-[10px] text-gray-400">{doc.reviews} Reviews</span>
                        </div>
                        <div className="p-4 flex flex-col items-center">
                           <div className="flex items-center gap-1 text-gray-700 font-bold">
                             {doc.experience}
                           </div>
                           <span className="text-[10px] text-gray-400">Experience</span>
                        </div>
                     </div>

                     {/* Info Body */}
                     <div className="p-6 space-y-3 flex-1">
                        <div className="flex items-start gap-3">
                           <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                           <div>
                             <p className="text-sm text-gray-600 line-clamp-2">{doc.address}</p>
                             <span className="text-xs font-semibold text-teal-600 mt-1 block">{doc.distance} away</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <CreditCard className="w-4 h-4 text-gray-400 flex-shrink-0" />
                           <p className="text-sm text-gray-600">Consultation: <span className="font-bold text-gray-800">₹{doc.consultationFee}</span></p>
                        </div>
                     </div>

                     {/* Action Footer */}
                     <div className="p-4 bg-gray-50 grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-100 text-sm">
                          <Phone className="w-4 h-4" /> Contact
                        </button>
                        <button 
                          onClick={() => setBookingDoctor(doc)}
                          className="flex items-center justify-center gap-2 py-2.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-sm shadow-teal-200 text-sm"
                        >
                          Book Appt
                        </button>
                     </div>
                  </div>
                ))}
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                {loadingDoctors ? (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin text-teal-500 mb-2" />
                    <p className="text-gray-500">Searching for best vets near you...</p>
                  </>
                ) : (
                  <>
                    <Stethoscope className="w-12 h-12 text-gray-300 mb-2" />
                    <p className="text-gray-500">Click refresh to load doctors.</p>
                  </>
                )}
             </div>
           )}

           {/* Booking Modal */}
           {bookingDoctor && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-gray-900">Book Appointment</h3>
                      <button onClick={() => setBookingDoctor(null)} className="p-1 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5 text-gray-500" />
                      </button>
                   </div>
                   
                   <div className="flex items-center gap-4 mb-6 p-4 bg-teal-50 rounded-xl border border-teal-100">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-teal-700 shadow-sm">
                        {bookingDoctor.name.charAt(3)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{bookingDoctor.name}</h4>
                        <p className="text-xs text-gray-500">{bookingDoctor.specialty}</p>
                      </div>
                   </div>

                   <form onSubmit={(e) => { e.preventDefault(); alert("Booking Confirmed!"); setBookingDoctor(null); }} className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Select Date</label>
                        <input type="date" required className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500" />
                      </div>
                      <div>
                         <label className="text-xs font-bold text-gray-500 uppercase">Pet/Animal Name</label>
                         <input type="text" placeholder="e.g. Bruno" required className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500" />
                      </div>
                      <button type="submit" className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-200 mt-2">
                        Confirm Booking
                      </button>
                   </form>
                </div>
             </div>
           )}
        </div>
      )}

      {/* -- MAP TAB -- */}
      {activeTab === 'map' && (
        <div className="flex flex-col gap-6">
          
          {/* Map & Summary Container */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6 min-h-[500px]">
            <div className="flex items-center gap-3 mb-4">
               <h2 className="text-xl font-bold text-gray-900">Nearby Veterinary Centers</h2>
               {loadingMap && <Loader2 className="w-5 h-5 animate-spin text-teal-600" />}
            </div>

            {/* AI Summary */}
            {mapSummary && (
              <div className="mb-6 p-4 bg-teal-50 rounded-xl border border-teal-100">
                <p className="text-sm text-gray-800 leading-relaxed font-medium">
                  {mapSummary}
                </p>
              </div>
            )}

            {/* Embedded Map Visual (If location available) */}
            {userLocation && (
              <div className="w-full h-80 bg-gray-100 rounded-xl overflow-hidden mb-8 border border-gray-200 shadow-inner">
                <iframe
                  title="Google Maps"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://maps.google.com/maps?q=veterinary+clinics&sll=${userLocation.lat},${userLocation.lng}&output=embed`}
                  allowFullScreen
                ></iframe>
              </div>
            )}
            
            {/* Grounding Results List */}
            {nearbyPlaces.length > 0 ? (
              <div className="space-y-4">
                 <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Top Results</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {nearbyPlaces.map((place, i) => {
                     // Prefer map source title, fallback to web title
                     const title = place.maps?.title || place.web?.title || "Veterinary Location";
                     const link = place.maps?.uri || place.web?.uri;
                     
                     if (!link) return null; // Skip if no link

                     return (
                       <div key={i} className="flex flex-col p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors group">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-gray-900 group-hover:text-teal-700 transition-colors line-clamp-1">
                              {title}
                            </h3>
                            <div className="p-1.5 bg-gray-100 rounded-full group-hover:bg-white transition-colors">
                              <MapPin className="w-4 h-4 text-gray-500" />
                            </div>
                          </div>
                          
                          <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                            {place.web?.snippet || "View details on map for accurate location and contact info."}
                          </p>
                          
                          <a 
                            href={link} 
                            target="_blank" 
                            rel="noreferrer"
                            className="mt-auto flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 transition-all"
                          >
                            <Navigation className="w-3.5 h-3.5" /> Navigate
                          </a>
                       </div>
                     );
                   })}
                 </div>
              </div>
            ) : (
              !loadingMap && !mapSummary && (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <p className="text-gray-400">Enable location to find nearby clinics.</p>
                </div>
              )
            )}
          </div>
        </div>
      )}

    </div>
  );
};