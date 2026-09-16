import React, { useState } from 'react';
import { 
  Heart, MessageCircle, Share2, MoreHorizontal, Image as ImageIcon, 
  Send, UserPlus, MapPin, TrendingUp, Sprout, Droplets, Scale, 
  ThumbsUp, Camera, X, Award, BarChart3, Users, Leaf
} from 'lucide-react';

// --- Types ---
interface SocialPost {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    location: string;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  // Agri Specifics
  agriData?: {
    crop: string;
    fertilizer: string;
    pesticide: string;
    quantity: string;
    growth: string; // e.g., "+20% vs last year"
  };
}

interface UserProfile {
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  location: string;
  stats: {
    followers: number;
    following: number;
    posts: number;
    acres: number;
  };
  crops: string[];
}

// --- Mock Data ---
const MOCK_USER: UserProfile = {
  name: 'Sukhwinder Singh',
  handle: '@sukh_farmer',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  bio: 'Passionate wheat & rice farmer. 15 years experience. Adopting organic methods slowly.',
  location: 'Ludhiana, Punjab',
  stats: { followers: 1250, following: 45, posts: 89, acres: 12 },
  crops: ['Wheat (HD-2967)', 'Basmati Rice', 'Mustard']
};

const INITIAL_POSTS: SocialPost[] = [
  {
    id: 'p1',
    author: {
      name: 'Rajinder Kumar',
      handle: '@raj_kheti',
      avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&q=80&w=200',
      location: 'Karnal, Haryana'
    },
    content: 'Finally harvested my bumper crop of Wheat! This year I reduced Urea by 10% and used Zinc additives. The grain quality is shiny and bold. See the results!',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800',
    timestamp: '2 hours ago',
    likes: 245,
    comments: 42,
    isLiked: false,
    agriData: {
      crop: 'Wheat (HD-3086)',
      fertilizer: 'Urea (40kg/acre) + Zinc',
      pesticide: 'Minimal (Neem Oil)',
      quantity: '24 Quintal/Acre',
      growth: '+15% Profit'
    }
  },
  {
    id: 'p2',
    author: {
      name: 'Anita Devi',
      handle: '@organic_anita',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
      location: 'Pune, Maharashtra'
    },
    content: 'Switching to drip irrigation for my onions was the best decision. Water usage down by 40% and crop size is uniform. Sharing my setup photos.',
    image: 'https://images.unsplash.com/photo-1627920769843-27eb69932089?auto=format&fit=crop&q=80&w=800',
    timestamp: '5 hours ago',
    likes: 890,
    comments: 156,
    isLiked: true,
    agriData: {
      crop: 'Red Onion',
      fertilizer: 'Vermicompost',
      pesticide: 'None (Organic)',
      quantity: '180 Bags',
      growth: 'Water Saved: 40%'
    }
  }
];

const SUGGESTED_FARMERS = [
  { name: 'Dr. Ramesh (Agri)', handle: '@expert_ramesh', role: 'Scientist' },
  { name: 'Kisan Ekta Group', handle: '@kisan_group', role: 'Community' },
  { name: 'Vijay Patil', handle: '@vijay_grapes', role: 'Grape Expert' },
];

export const SocialView: React.FC = () => {
  const [view, setView] = useState<'feed' | 'profile'>('feed');
  const [posts, setPosts] = useState<SocialPost[]>(INITIAL_POSTS);
  const [isCreating, setIsCreating] = useState(false);
  
  // New Post Form State
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [agriDetails, setAgriDetails] = useState({
    crop: '', fertilizer: '', pesticide: '', quantity: '', growth: ''
  });

  const handleLike = (id: string) => {
    setPosts(posts.map(p => p.id === id ? { ...p, likes: p.isLiked ? p.likes - 1 : p.likes + 1, isLiked: !p.isLiked } : p));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewPostImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const submitPost = () => {
    if (!newPostText) return;
    
    const newPost: SocialPost = {
      id: Date.now().toString(),
      author: {
        name: MOCK_USER.name,
        handle: MOCK_USER.handle,
        avatar: MOCK_USER.avatar,
        location: MOCK_USER.location
      },
      content: newPostText,
      image: newPostImage || undefined,
      timestamp: 'Just Now',
      likes: 0,
      comments: 0,
      isLiked: false,
      agriData: agriDetails.crop ? agriDetails : undefined
    };

    setPosts([newPost, ...posts]);
    setIsCreating(false);
    setNewPostText('');
    setNewPostImage(null);
    setAgriDetails({ crop: '', fertilizer: '', pesticide: '', quantity: '', growth: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50 animate-in fade-in">
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 p-4 sm:p-6">
        
        {/* --- LEFT SIDEBAR: PROFILE CARD --- */}
        <div className="hidden lg:block lg:col-span-1 space-y-6">
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              <div className="h-24 bg-gradient-to-r from-teal-600 to-emerald-600"></div>
              <div className="px-6 pb-6 relative">
                 <div className="absolute -top-12 left-6">
                    <img src={MOCK_USER.avatar} alt="Profile" className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover" />
                 </div>
                 <div className="mt-14">
                    <h2 className="text-lg font-bold text-gray-900">{MOCK_USER.name}</h2>
                    <p className="text-xs text-gray-500">{MOCK_USER.handle}</p>
                    <p className="text-sm text-gray-600 mt-2 leading-snug">{MOCK_USER.bio}</p>
                    
                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                       <MapPin className="w-3 h-3" /> {MOCK_USER.location}
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-6 border-t border-gray-100 pt-4 text-center">
                       <div>
                          <div className="font-bold text-gray-900">{MOCK_USER.stats.posts}</div>
                          <div className="text-[10px] text-gray-500 uppercase">Posts</div>
                       </div>
                       <div>
                          <div className="font-bold text-gray-900">{MOCK_USER.stats.followers}</div>
                          <div className="text-[10px] text-gray-500 uppercase">Followers</div>
                       </div>
                       <div>
                          <div className="font-bold text-gray-900">{MOCK_USER.stats.acres}</div>
                          <div className="text-[10px] text-gray-500 uppercase">Acres</div>
                       </div>
                    </div>

                    <button onClick={() => setView('profile')} className="w-full mt-6 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                       View My Profile
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* --- CENTER: FEED --- */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* Navigation Tabs (Mobile/Desktop) */}
           <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1">
              <button 
                onClick={() => setView('feed')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors ${view === 'feed' ? 'bg-teal-50 text-teal-700' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                Community Feed
              </button>
              <button 
                onClick={() => setView('profile')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors ${view === 'profile' ? 'bg-teal-50 text-teal-700' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                My Profile
              </button>
           </div>

           {/* Create Post Input */}
           {view === 'feed' && (
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex gap-4">
                   <img src={MOCK_USER.avatar} className="w-10 h-10 rounded-full object-cover" />
                   <button 
                     onClick={() => setIsCreating(true)}
                     className="flex-1 text-left bg-gray-50 rounded-full px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-100 transition-colors"
                   >
                     Share your farming success or ask a question...
                   </button>
                </div>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-50 px-2">
                   <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-green-600">
                      <ImageIcon className="w-5 h-5 text-green-500" /> Photo
                   </button>
                   <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-orange-600">
                      <Award className="w-5 h-5 text-orange-500" /> Showcase Success
                   </button>
                   <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600">
                      <BarChart3 className="w-5 h-5 text-blue-500" /> Stats
                   </button>
                </div>
             </div>
           )}

           {/* Posts List */}
           {view === 'feed' && (
             <div className="space-y-6">
                {posts.map(post => (
                   <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-2">
                      {/* Post Header */}
                      <div className="p-4 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                               <h3 className="font-bold text-gray-900 text-sm">{post.author.name}</h3>
                               <p className="text-xs text-gray-500">{post.author.location} • {post.timestamp}</p>
                            </div>
                         </div>
                         <button className="text-gray-400 hover:bg-gray-50 p-1 rounded-full"><MoreHorizontal className="w-5 h-5" /></button>
                      </div>

                      {/* Post Content */}
                      <div className="px-4 pb-2">
                         <p className="text-sm text-gray-800 whitespace-pre-wrap">{post.content}</p>
                      </div>

                      {/* Agri Data Showcase (If exists) */}
                      {post.agriData && (
                         <div className="mx-4 mt-3 mb-3 bg-teal-50 rounded-xl p-4 border border-teal-100">
                            <h4 className="text-xs font-bold text-teal-800 uppercase mb-3 flex items-center gap-1">
                               <Award className="w-3.5 h-3.5" /> Success Highlights
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                               <div>
                                  <span className="text-gray-500 block mb-0.5">Crop Variety</span>
                                  <span className="font-bold text-gray-900 flex items-center gap-1"><Sprout className="w-3 h-3 text-green-600"/> {post.agriData.crop}</span>
                               </div>
                               <div>
                                  <span className="text-gray-500 block mb-0.5">Yield Qty</span>
                                  <span className="font-bold text-gray-900 flex items-center gap-1"><Scale className="w-3 h-3 text-orange-600"/> {post.agriData.quantity}</span>
                               </div>
                               <div>
                                  <span className="text-gray-500 block mb-0.5">Inputs Used</span>
                                  <span className="font-bold text-gray-900 flex items-center gap-1"><Droplets className="w-3 h-3 text-blue-600"/> {post.agriData.fertilizer}</span>
                               </div>
                               <div>
                                  <span className="text-gray-500 block mb-0.5">Performance</span>
                                  <span className="font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded w-fit flex items-center gap-1"><TrendingUp className="w-3 h-3"/> {post.agriData.growth}</span>
                               </div>
                            </div>
                         </div>
                      )}

                      {/* Post Image */}
                      {post.image && (
                         <div className="mt-2 w-full max-h-[500px] overflow-hidden bg-gray-100">
                            <img src={post.image} alt="Post content" className="w-full h-full object-cover" />
                         </div>
                      )}

                      {/* Post Footer */}
                      <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                         <div className="flex gap-4">
                            <button 
                              onClick={() => handleLike(post.id)}
                              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                            >
                               <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} /> {post.likes}
                            </button>
                            <button className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-blue-500 transition-colors">
                               <MessageCircle className="w-5 h-5" /> {post.comments}
                            </button>
                         </div>
                         <button className="text-gray-500 hover:bg-gray-50 p-2 rounded-full"><Share2 className="w-5 h-5" /></button>
                      </div>
                   </div>
                ))}
             </div>
           )}

           {/* Profile View */}
           {view === 'profile' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in">
                 <div className="h-40 bg-gradient-to-r from-teal-700 to-green-600 relative">
                    <div className="absolute inset-0 bg-black/10"></div>
                 </div>
                 <div className="px-8 pb-8">
                    <div className="relative -top-16 flex justify-between items-end">
                       <img src={MOCK_USER.avatar} className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white" />
                       <button className="mb-4 px-6 py-2 bg-teal-600 text-white font-bold rounded-full hover:bg-teal-700 shadow-md">Edit Profile</button>
                    </div>
                    
                    <div className="-mt-12 mb-6">
                       <h1 className="text-2xl font-bold text-gray-900">{MOCK_USER.name}</h1>
                       <p className="text-gray-500">{MOCK_USER.handle}</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
                       <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Leaf className="w-4 h-4 text-green-600"/> Farm Profile</h3>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                             <span className="text-xs text-gray-500 uppercase font-bold">Location</span>
                             <p className="font-medium text-gray-800">{MOCK_USER.location}</p>
                          </div>
                          <div>
                             <span className="text-xs text-gray-500 uppercase font-bold">Land Size</span>
                             <p className="font-medium text-gray-800">{MOCK_USER.stats.acres} Acres</p>
                          </div>
                          <div className="col-span-2">
                             <span className="text-xs text-gray-500 uppercase font-bold">Main Crops</span>
                             <div className="flex gap-2 mt-1 flex-wrap">
                                {MOCK_USER.crops.map(c => <span key={c} className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-md">{c}</span>)}
                             </div>
                          </div>
                       </div>
                    </div>

                    <h3 className="font-bold text-lg mb-4">My Posts</h3>
                    <div className="grid grid-cols-1 gap-4">
                       {posts.filter(p => p.author.name === MOCK_USER.name).map(post => (
                          <div key={post.id} className="border border-gray-100 rounded-xl p-4 flex gap-4 hover:bg-gray-50 cursor-pointer">
                             {post.image && <img src={post.image} className="w-24 h-24 rounded-lg object-cover bg-gray-200" />}
                             <div className="flex-1">
                                <p className="text-sm text-gray-800 line-clamp-2 font-medium">{post.content}</p>
                                <span className="text-xs text-gray-400 mt-2 block">{post.timestamp}</span>
                                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                   <span className="flex items-center gap-1"><Heart className="w-3 h-3"/> {post.likes}</span>
                                   <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3"/> {post.comments}</span>
                                </div>
                             </div>
                          </div>
                       ))}
                       {posts.filter(p => p.author.name === MOCK_USER.name).length === 0 && (
                          <div className="text-center py-10 text-gray-400">No posts yet.</div>
                       )}
                    </div>
                 </div>
              </div>
           )}
        </div>

        {/* --- RIGHT SIDEBAR: SUGGESTIONS --- */}
        <div className="hidden lg:block lg:col-span-1 space-y-6">
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                 <Users className="w-4 h-4 text-teal-600" /> Farmers to Follow
              </h3>
              <div className="space-y-4">
                 {SUGGESTED_FARMERS.map((farmer, i) => (
                    <div key={i} className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500">
                             {farmer.name.charAt(0)}
                          </div>
                          <div>
                             <p className="text-sm font-bold text-gray-900 line-clamp-1">{farmer.name}</p>
                             <p className="text-xs text-gray-500">{farmer.role}</p>
                          </div>
                       </div>
                       <button className="text-teal-600 hover:bg-teal-50 p-2 rounded-full"><UserPlus className="w-4 h-4" /></button>
                    </div>
                 ))}
              </div>
              <button className="w-full mt-4 text-xs font-bold text-teal-600 hover:underline">View More Suggestions</button>
           </div>

           <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100">
              <h3 className="font-bold text-green-900 text-sm mb-2">Trending Topic</h3>
              <p className="text-xs text-green-800 font-bold mb-1">#OrganicRevolution</p>
              <p className="text-xs text-green-700 leading-relaxed">
                 Over 5,000 farmers are sharing their organic pesticide recipes this week. Join the conversation!
              </p>
           </div>
        </div>

      </div>

      {/* --- CREATE POST MODAL --- */}
      {isCreating && (
         <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
               <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="font-bold text-lg text-gray-900">Create Post</h3>
                  <button onClick={() => setIsCreating(false)}><X className="w-6 h-6 text-gray-500 hover:text-gray-700"/></button>
               </div>
               
               <div className="p-6 overflow-y-auto custom-scrollbar">
                  <div className="flex gap-3 mb-4">
                     <img src={MOCK_USER.avatar} className="w-12 h-12 rounded-full object-cover" />
                     <div className="flex-1">
                        <textarea 
                           placeholder="Share your farming journey, tips, or success story..." 
                           className="w-full h-24 p-0 border-none resize-none focus:ring-0 text-gray-800 placeholder:text-gray-400 text-base"
                           value={newPostText}
                           onChange={(e) => setNewPostText(e.target.value)}
                        ></textarea>
                     </div>
                  </div>

                  {newPostImage && (
                     <div className="relative mb-6 rounded-xl overflow-hidden group">
                        <img src={newPostImage} className="w-full h-48 object-cover" />
                        <button onClick={() => setNewPostImage(null)} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"><X className="w-4 h-4"/></button>
                     </div>
                  )}

                  {/* Agri Data Inputs */}
                  <div className="bg-teal-50 rounded-xl p-4 border border-teal-100 mb-4">
                     <h4 className="text-xs font-bold text-teal-800 uppercase mb-3 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" /> Highlight Farm Success (Optional)
                     </h4>
                     <div className="grid grid-cols-2 gap-3">
                        <div>
                           <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Crop Name</label>
                           <input 
                              type="text" placeholder="e.g. Wheat"
                              className="w-full p-2 text-sm border border-teal-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                              value={agriDetails.crop} onChange={e => setAgriDetails({...agriDetails, crop: e.target.value})}
                           />
                        </div>
                        <div>
                           <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Yield Qty</label>
                           <input 
                              type="text" placeholder="e.g. 20 Qtl"
                              className="w-full p-2 text-sm border border-teal-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                              value={agriDetails.quantity} onChange={e => setAgriDetails({...agriDetails, quantity: e.target.value})}
                           />
                        </div>
                        <div>
                           <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Fertilizer Used</label>
                           <input 
                              type="text" placeholder="e.g. Urea 40kg"
                              className="w-full p-2 text-sm border border-teal-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                              value={agriDetails.fertilizer} onChange={e => setAgriDetails({...agriDetails, fertilizer: e.target.value})}
                           />
                        </div>
                        <div>
                           <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Pesticide</label>
                           <input 
                              type="text" placeholder="e.g. Neem Oil"
                              className="w-full p-2 text-sm border border-teal-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                              value={agriDetails.pesticide} onChange={e => setAgriDetails({...agriDetails, pesticide: e.target.value})}
                           />
                        </div>
                        <div className="col-span-2">
                           <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Growth/Profit</label>
                           <input 
                              type="text" placeholder="e.g. +15% profit compared to last year"
                              className="w-full p-2 text-sm border border-teal-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                              value={agriDetails.growth} onChange={e => setAgriDetails({...agriDetails, growth: e.target.value})}
                           />
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-2">
                     <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors">
                        <Camera className="w-4 h-4" /> Add Photo
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                     </label>
                  </div>
               </div>

               <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                  <button 
                     onClick={submitPost}
                     disabled={!newPostText}
                     className="bg-teal-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg shadow-teal-200"
                  >
                     <Send className="w-4 h-4" /> Post
                  </button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};