import React, { useState, useEffect } from 'react';
import { 
  CloudRain, TrendingUp, Leaf, MessageSquareText, Calendar, Sun, 
  Store, FlaskConical, Sprout, Stethoscope, Activity, BadgeIndianRupee, 
  HardHat, Truck, Flower, Share2, Bot, MessageSquare, Receipt, 
  Settings, ShieldCheck, ChevronDown, Wheat, LogOut, LayoutDashboard, Users
} from 'lucide-react';
import { MarketView } from './MarketView';
import { FinanceView } from './FinanceView';
import { AnimalMedicalView } from './AnimalMedicalView';
import { PlantMedicalView } from './PlantMedicalView';
import { ProductivityView } from './ProductivityView';
import { FertilizerView } from './FertilizerView';
import { MyFriend } from './MyFriend';
import { SocialView } from './SocialView';

interface DashboardProps {
  user: {
    name: string;
    email: string;
  };
  onLogout: () => void;
  onOpenChat: () => void;
}

const NavItem = ({ 
  icon: Icon, 
  label, 
  badge, 
  hasDropdown, 
  active = false,
  onClick
}: { 
  icon: any, 
  label: string, 
  badge?: string, 
  hasDropdown?: boolean, 
  active?: boolean,
  onClick?: () => void
}) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
    ${active 
      ? 'bg-teal-50 text-teal-700 font-semibold shadow-sm border border-teal-100' 
      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon className={`w-5 h-5 ${active ? 'text-teal-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
      <span className="text-sm">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {badge && (
        <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
          {badge}
        </span>
      )}
      {hasDropdown && <ChevronDown className="w-4 h-4 text-gray-400" />}
    </div>
  </button>
);

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onOpenChat }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('market'); // Default to 'market'

  useEffect(() => {
    // Update date every minute
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex w-72 bg-white border-r border-gray-200 flex-col flex-shrink-0 z-30">
        
        {/* Brand Section */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-tr from-teal-500 to-green-500 rounded-full shadow-md">
              <Wheat className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold leading-none tracking-tight">
                <span className="text-teal-700">Kisan</span>
                <span className="text-gray-800 ml-1">Portal</span>
              </span>
              <span className="text-xs uppercase tracking-wider text-green-600 font-semibold mt-0.5">SmartAgri</span>
            </div>
          </div>
        </div>

        {/* Scrollable Menu */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-6 space-y-8">
          
          {/* Main Section */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 mb-3">Main</h3>
            <div className="space-y-1">
              <NavItem 
                icon={LayoutDashboard} 
                label="Overview" 
                active={activeTab === 'overview'} 
                onClick={() => setActiveTab('overview')}
              />
              <NavItem 
                icon={Store} 
                label="Market" 
                active={activeTab === 'market'} 
                onClick={() => setActiveTab('market')}
              />
              <NavItem 
                icon={FlaskConical} 
                label="Fertilisers & Pesticides" 
                active={activeTab === 'fertilizers'}
                onClick={() => setActiveTab('fertilizers')}
              />
              <NavItem 
                icon={Flower} 
                label="Seeds & Saplings" 
                active={activeTab === 'seeds'}
                onClick={() => setActiveTab('seeds')}
              />
              <NavItem icon={Sprout} label="Soil Care" />
              <NavItem 
                icon={Stethoscope} 
                label="Animal Medical" 
                active={activeTab === 'medical'}
                onClick={() => setActiveTab('medical')}
              />
              <NavItem 
                icon={Activity} 
                label="Plant Medical" 
                active={activeTab === 'plant-medical'}
                onClick={() => setActiveTab('plant-medical')}
              />
              <NavItem 
                icon={BadgeIndianRupee} 
                label="Finance & Loans" 
                active={activeTab === 'finance'}
                onClick={() => setActiveTab('finance')}
              />
              <NavItem 
                icon={TrendingUp} 
                label="Productivity" 
                active={activeTab === 'productivity'}
                onClick={() => setActiveTab('productivity')}
              />
              <NavItem icon={HardHat} label="Skilled Workers" />
              <NavItem icon={Truck} label="Transport" />
              <NavItem 
                icon={Users} 
                label="Community" 
                active={activeTab === 'social'}
                onClick={() => setActiveTab('social')}
              />
              <NavItem icon={Share2} label="Social Media" />
              <NavItem 
                icon={Bot} 
                label="My Friend" 
                active={activeTab === 'my-friend'}
                onClick={() => setActiveTab('my-friend')} 
              />
              <NavItem icon={MessageSquare} label="Messages" badge="13" />
              <NavItem icon={Receipt} label="Transactions" />
            </div>
          </div>

          {/* General Section */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 mb-3">General</h3>
            <div className="space-y-1">
              <NavItem icon={Settings} label="Settings" />
              <NavItem icon={ShieldCheck} label="Security" />
            </div>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-teal-100 border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0">
                <span className="text-teal-700 font-bold text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-gray-900 truncate">{user.name}</span>
                <span className="text-xs text-gray-500 truncate">{user.email}</span>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header Area inside Dashboard */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {activeTab === 'market' && 'Market Intelligence'}
                {activeTab === 'overview' && 'Dashboard Overview'}
                {activeTab === 'finance' && 'Finance Hub'}
                {activeTab === 'medical' && 'Animal Wellness Center'}
                {activeTab === 'plant-medical' && 'Crop & Plant Health Center'}
                {activeTab === 'productivity' && 'Farm Productivity Hub'}
                {activeTab === 'fertilizers' && 'Agri-Inputs Marketplace'}
                {activeTab === 'seeds' && 'Seeds & Saplings Shop'}
                {activeTab === 'my-friend' && 'My Friend & Community'}
                {activeTab === 'social' && 'Farmer Community Network'}
              </h1>
              <p className="text-gray-500">
                {activeTab === 'market' && 'Real-time prices, trends, and seasonal insights'}
                {activeTab === 'finance' && 'Schemes, loans, and financial planning tools'}
                {activeTab === 'medical' && 'AI Diagnosis, Doctors, and Pet Essentials'}
                {activeTab === 'plant-medical' && 'Detect Crop Diseases, Find Experts, and Buy Inputs'}
                {activeTab === 'productivity' && 'Tools to maximize yield, manage tasks, and optimize resources'}
                {activeTab === 'fertilizers' && 'Purchase fertilizers and pesticides directly from trusted sellers'}
                {activeTab === 'seeds' && 'High-quality hybrid seeds and saplings for better yield'}
                {activeTab === 'my-friend' && 'AI Assistant, Harvest Trading, and Land Rental'}
                {activeTab === 'social' && 'Connect, share success stories, and learn from fellow farmers'}
                {activeTab === 'overview' && `Welcome back, ${user.name.split(' ')[0]}`}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm w-fit">
              <Calendar className="w-5 h-5 text-teal-600" />
              <span className="text-sm font-medium text-gray-700">{formattedDate}</span>
            </div>
          </div>

          {/* Conditional Rendering based on Tab */}
          {activeTab === 'market' && <MarketView />}
          {activeTab === 'finance' && <FinanceView onBack={() => setActiveTab('overview')} />}
          {activeTab === 'medical' && <AnimalMedicalView />}
          {activeTab === 'fertilizers' && <FertilizerView onBack={() => setActiveTab('overview')} />}
          {activeTab === 'my-friend' && <MyFriend />}
          {activeTab === 'social' && <SocialView />}
          
          {/* Reuse PlantMedicalView for seeds/saplings but not fertilizers anymore */}
          {(activeTab === 'plant-medical' || activeTab === 'seeds') && (
            <PlantMedicalView 
              key={activeTab}
              defaultTab={activeTab === 'plant-medical' ? 'diagnosis' : 'shop'}
              defaultCategory={activeTab === 'seeds' ? 'Seeds' : 'All'}
            />
          )}

          {activeTab === 'productivity' && <ProductivityView onBack={() => setActiveTab('overview')} />}
          
          {activeTab === 'overview' && (
            <>
              {/* Overview Content (Original Dashboard Widgets) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-50 rounded-xl">
                      <CloudRain className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full">Now</span>
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium">Weather</h3>
                  <div className="flex items-end gap-2 mt-1">
                    <span className="text-2xl font-bold text-gray-900">28°C</span>
                    <span className="text-sm text-gray-500 mb-1">Clear Sky</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-teal-50 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-teal-600" />
                    </div>
                    <span className="text-xs font-bold px-2 py-1 bg-teal-100 text-teal-700 rounded-full">+5%</span>
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium">Wheat Price</h3>
                  <div className="flex items-end gap-2 mt-1">
                    <span className="text-2xl font-bold text-gray-900">₹2,125</span>
                    <span className="text-sm text-gray-500 mb-1">/ Quintal</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-emerald-50 rounded-xl">
                      <Leaf className="w-6 h-6 text-emerald-600" />
                    </div>
                    <span className="text-xs font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">Healthy</span>
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium">Crop Health</h3>
                  <div className="flex items-end gap-2 mt-1">
                    <span className="text-2xl font-bold text-gray-900">92%</span>
                    <span className="text-sm text-gray-500 mb-1">Score</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <MessageSquareText className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-full">New</span>
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium">AI Alerts</h3>
                  <div className="flex items-end gap-2 mt-1">
                    <span className="text-2xl font-bold text-gray-900">2</span>
                    <span className="text-sm text-gray-500 mb-1">Suggestions</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Recommended Actions</h2>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                        <Sun className="w-6 h-6 text-yellow-600 mt-1" />
                        <div>
                          <h3 className="font-semibold text-gray-900">Irrigation Alert</h3>
                          <p className="text-sm text-gray-600 mt-1">High temperatures expected tomorrow. Consider irrigating your wheat crop this evening.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 bg-teal-50 rounded-xl border border-teal-100">
                        <TrendingUp className="w-6 h-6 text-teal-600 mt-1" />
                        <div>
                          <h3 className="font-semibold text-gray-900">Market Opportunity</h3>
                          <p className="text-sm text-gray-600 mt-1">Potato prices in Ludhiana mandi are trending up by 12%.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-teal-600 to-green-600 rounded-2xl shadow-lg p-6 text-white text-center">
                    <h3 className="font-bold text-lg mb-2">Need Expert Help?</h3>
                    <p className="text-teal-50 text-sm mb-6">Talk to our agri-experts or use our AI assistant for instant solutions.</p>
                    <button 
                      onClick={onOpenChat}
                      className="w-full bg-white text-teal-700 font-bold py-2.5 rounded-lg hover:bg-teal-50 transition-colors"
                    >
                      Chat Now
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
};