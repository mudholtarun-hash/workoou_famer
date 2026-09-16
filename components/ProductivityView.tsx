import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Calculator, CalendarCheck, Droplets, Sprout, Sun, 
  Wrench, Users, BarChart3, TrendingUp, Archive, FlaskConical, 
  LineChart, Wallet, FileText, CheckCircle, AlertTriangle, 
  ChevronRight, Loader2, Play, Pause, Video, Wifi, Settings,
  Download, Plus, Trash2
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface ProductivityViewProps {
  onBack: () => void;
}

// -- Tool Definitions --
const TOOLS = [
  { id: 'yield', title: 'Crop Yield Calculator', icon: Calculator, color: 'text-green-600', bg: 'bg-green-50', desc: 'Estimate production & profit' },
  { id: 'tasks', title: 'Farm Task Planner', icon: CalendarCheck, color: 'text-blue-600', bg: 'bg-blue-50', desc: 'Reminders for irrigation & pests' },
  { id: 'irrigation', title: 'Smart Irrigation', icon: Droplets, color: 'text-cyan-600', bg: 'bg-cyan-50', desc: 'IoT controls & water advice' },
  { id: 'fertilizer', title: 'Fertilizer Optimizer', icon: Sprout, color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Exact quantity & savings' },
  { id: 'sowing', title: 'Sow Time Calculator', icon: Sun, color: 'text-orange-600', bg: 'bg-orange-50', desc: 'Best window based on weather' },
  { id: 'machine', title: 'Machine Tips', icon: Wrench, color: 'text-gray-600', bg: 'bg-gray-50', desc: 'Maintenance & fuel saving' },
  { id: 'labor', title: 'Labor Manager', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', desc: 'Track worker efficiency' },
  { id: 'water', title: 'Water Usage Meter', icon: BarChart3, color: 'text-blue-500', bg: 'bg-blue-50', desc: 'Track consumption & wastage' },
  { id: 'profit', title: 'Profit Comparison', icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-50', desc: 'Compare two crops side-by-side' },
  { id: 'storage', title: 'Storage Tool', icon: Archive, color: 'text-amber-600', bg: 'bg-amber-50', desc: 'Reduce post-harvest loss' },
  { id: 'soil', title: 'Nutrient Balance', icon: FlaskConical, color: 'text-rose-600', bg: 'bg-rose-50', desc: 'NPK imbalance corrector' },
  { id: 'trends', title: 'Seasonal Trends', icon: LineChart, color: 'text-indigo-600', bg: 'bg-indigo-50', desc: 'Productivity graphs' },
  { id: 'budget', title: 'Budget Planner', icon: Wallet, color: 'text-green-700', bg: 'bg-green-100', desc: 'Plan crops by investment' },
  { id: 'report', title: 'Farm Report Card', icon: FileText, color: 'text-slate-600', bg: 'bg-slate-100', desc: 'Download comprehensive PDF' },
];

export const ProductivityView: React.FC<ProductivityViewProps> = ({ onBack }) => {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  // -- Render Content Switcher --
  const renderTool = () => {
    switch (activeTool) {
      case 'yield': return <YieldCalculator onBack={() => setActiveTool(null)} />;
      case 'tasks': return <TaskPlanner onBack={() => setActiveTool(null)} />;
      case 'irrigation': return <SmartIrrigation onBack={() => setActiveTool(null)} />;
      case 'budget': return <BudgetPlanner onBack={() => setActiveTool(null)} />;
      case 'profit': return <ProfitComparison onBack={() => setActiveTool(null)} />;
      case 'soil': return <SoilNutrientManager onBack={() => setActiveTool(null)} />;
      case 'report': return <FarmReportCard onBack={() => setActiveTool(null)} />;
      default: return <GenericAiTool toolId={activeTool!} onBack={() => setActiveTool(null)} />;
    }
  };

  return (
    <div className="animate-in fade-in duration-300 pb-12">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={activeTool ? () => setActiveTool(null) : onBack}
          className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {activeTool ? TOOLS.find(t => t.id === activeTool)?.title : 'Farm Productivity Hub'}
          </h2>
          <p className="text-sm text-gray-500">
            {activeTool ? 'Optimize your farming operations' : 'Tools to calculate, plan, and improve your yield'}
          </p>
        </div>
      </div>

      {activeTool ? (
        renderTool()
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all text-left group flex flex-col h-full"
            >
              <div className={`w-12 h-12 rounded-xl ${tool.bg} ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <tool.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">{tool.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">{tool.desc}</p>
              <div className="flex items-center text-teal-600 text-sm font-bold mt-auto">
                Open Tool <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// --- SUB COMPONENTS ---

// 1. Yield Calculator
const YieldCalculator = ({ onBack }: { onBack: () => void }) => {
  const [formData, setFormData] = useState({ crop: 'Wheat', acres: 5, soil: 'Loamy', fertilizer: 'DAP & Urea' });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    setLoading(true);
    setTimeout(() => {
      const avgYield = formData.crop === 'Wheat' ? 20 : 15; 
      const price = 2125; 
      const totalYield = avgYield * formData.acres;
      const revenue = totalYield * price;
      const cost = 12000 * formData.acres; 
      
      setResult({
        yield: totalYield,
        unit: 'Quintals',
        revenue: revenue,
        cost: cost,
        profit: revenue - cost,
        tips: "Use Zinc Sulphate for 10% extra yield based on your soil type."
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Crop Type</label>
          <select 
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
            value={formData.crop}
            onChange={e => setFormData({...formData, crop: e.target.value})}
          >
            <option>Wheat</option><option>Rice</option><option>Sugarcane</option><option>Cotton</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Land Size (Acres)</label>
          <input 
            type="number" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
            value={formData.acres} onChange={e => setFormData({...formData, acres: Number(e.target.value)})}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Soil Type</label>
          <select 
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
            value={formData.soil} onChange={e => setFormData({...formData, soil: e.target.value})}
          >
            <option>Loamy</option><option>Clay</option><option>Sandy</option><option>Black</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Fertilizer Used</label>
          <input 
            type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
            value={formData.fertilizer} onChange={e => setFormData({...formData, fertilizer: e.target.value})}
          />
        </div>
      </div>
      
      <button 
        onClick={calculate}
        disabled={loading}
        className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors flex justify-center items-center gap-2"
      >
        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
        Calculate Potential
      </button>

      {result && (
        <div className="mt-8 bg-green-50 p-6 rounded-2xl border border-green-100 animate-in slide-in-from-bottom-4">
           <h3 className="font-bold text-lg mb-4 text-green-900">Estimation Results</h3>
           <div className="grid grid-cols-3 gap-4 text-center mb-4">
             <div className="bg-white p-3 rounded-xl shadow-sm">
                <div className="text-xs text-gray-500 uppercase font-bold">Expected Yield</div>
                <div className="text-xl font-bold text-gray-900">{result.yield} {result.unit}</div>
             </div>
             <div className="bg-white p-3 rounded-xl shadow-sm">
                <div className="text-xs text-gray-500 uppercase font-bold">Est. Cost</div>
                <div className="text-xl font-bold text-red-600">₹{result.cost.toLocaleString()}</div>
             </div>
             <div className="bg-white p-3 rounded-xl shadow-sm border border-green-200">
                <div className="text-xs text-gray-500 uppercase font-bold">Net Profit</div>
                <div className="text-xl font-bold text-green-700">₹{result.profit.toLocaleString()}</div>
             </div>
           </div>
           <p className="text-sm text-green-800 flex items-start gap-2">
             <div className="mt-1"><Sprout className="w-4 h-4" /></div>
             <strong>Tip:</strong> {result.tips}
           </p>
        </div>
      )}
    </div>
  );
};

// 2. Task Planner
const TaskPlanner = ({ onBack }: { onBack: () => void }) => {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Morning Irrigation (North Field)', completed: false, time: '06:00 AM' },
    { id: 2, text: 'Apply Urea Fertilizer', completed: true, time: '10:00 AM' },
    { id: 3, text: 'Check for Pest (Stem Borer)', completed: false, time: '04:00 PM' },
  ]);
  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if(!newTask) return;
    setTasks([...tasks, { id: Date.now(), text: newTask, completed: false, time: '09:00 AM' }]);
    setNewTask('');
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><CalendarCheck className="w-5 h-5 text-blue-600"/> Today's Schedule</h3>
        <div className="flex gap-2 mb-6">
          <input 
            type="text" 
            placeholder="Add new farming task..." 
            className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl"
            value={newTask} onChange={e => setNewTask(e.target.value)}
          />
          <button onClick={addTask} className="bg-blue-600 text-white px-4 rounded-xl font-bold hover:bg-blue-700"><Plus className="w-5 h-5"/></button>
        </div>
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task.id} className={`flex items-center gap-3 p-4 rounded-xl border ${task.completed ? 'bg-gray-50 border-gray-100' : 'bg-white border-blue-100 shadow-sm'}`}>
               <button onClick={() => toggleTask(task.id)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
                 {task.completed && <CheckCircle className="w-4 h-4" />}
               </button>
               <div className="flex-1">
                 <p className={`font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.text}</p>
                 <span className="text-xs text-gray-500">{task.time}</span>
               </div>
               <button onClick={() => setTasks(tasks.filter(t => t.id !== task.id))} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white p-6 rounded-2xl flex flex-col justify-between h-80">
         <div>
           <h3 className="font-bold text-lg">Weekly Overview</h3>
           <p className="opacity-80 text-sm">You have completed 65% of this week's tasks.</p>
         </div>
         <div className="grid grid-cols-7 gap-1 text-center">
            {['M','T','W','T','F','S','S'].map((d,i) => (
              <div key={i} className={`p-2 rounded-lg text-xs font-bold ${i===3 ? 'bg-white text-blue-700' : 'bg-white/20'}`}>
                {d}
              </div>
            ))}
         </div>
         <button className="bg-white/20 backdrop-blur hover:bg-white/30 py-2 rounded-lg text-sm font-bold">View Full Calendar</button>
      </div>
    </div>
  );
};

// 3. Smart Irrigation
const SmartIrrigation = ({ onBack }: { onBack: () => void }) => {
  const [isOn, setIsOn] = useState(false);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
         <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Pump Control</h3>
              <p className="text-sm text-gray-500">Zone A: Wheat Field</p>
            </div>
            <div className={`w-3 h-3 rounded-full ${isOn ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
         </div>
         
         <div className="flex justify-center py-8">
            <button 
              onClick={() => setIsOn(!isOn)}
              className={`w-32 h-32 rounded-full border-8 flex flex-col items-center justify-center transition-all duration-300 shadow-xl
                ${isOn ? 'border-green-100 bg-green-50 text-green-600' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'}
              `}
            >
              <Wrench className="w-8 h-8 mb-2" />
              <span className="font-bold uppercase tracking-wider">{isOn ? 'ON' : 'OFF'}</span>
            </button>
         </div>

         <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="p-4 bg-gray-50 rounded-xl text-center">
               <div className="text-xs text-gray-500 uppercase font-bold mb-1">Moisture</div>
               <div className="text-lg font-bold text-blue-600">42%</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl text-center">
               <div className="text-xs text-gray-500 uppercase font-bold mb-1">Flow Rate</div>
               <div className="text-lg font-bold text-gray-800">{isOn ? '120 L/m' : '0 L/m'}</div>
            </div>
         </div>
       </div>

       <div className="space-y-4">
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
             <Wifi className="w-8 h-8 text-blue-600 mt-1" />
             <div>
               <h4 className="font-bold text-blue-900">Remote Access Active</h4>
               <p className="text-sm text-blue-700 mt-1">Control your system from anywhere. Next automated cycle starts at 5:00 PM based on weather data.</p>
             </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-start gap-4 hover:shadow-md transition-all cursor-pointer">
             <Video className="w-8 h-8 text-gray-400 mt-1" />
             <div>
               <h4 className="font-bold text-gray-900">Field Surveillance</h4>
               <p className="text-sm text-gray-500 mt-1">View live feed from Camera 01 located at the pump house.</p>
             </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-start gap-4 hover:shadow-md transition-all cursor-pointer">
             <AlertTriangle className="w-8 h-8 text-orange-500 mt-1" />
             <div>
               <h4 className="font-bold text-gray-900">Leak Detection</h4>
               <p className="text-sm text-gray-500 mt-1">System status: Normal. No leaks or pressure drops detected in the last 24 hours.</p>
             </div>
          </div>
       </div>
    </div>
  );
};

// 4. Profit Comparison
const ProfitComparison = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
       <h3 className="font-bold text-lg mb-6">Crop Profitability Comparison (Per Acre)</h3>
       <div className="grid grid-cols-2 gap-px bg-gray-200 border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-white p-6">
             <div className="text-center mb-6">
                <select className="bg-gray-50 p-2 rounded-lg font-bold text-lg text-center w-full">
                  <option>Wheat</option>
                </select>
             </div>
             <div className="space-y-4 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Cost</span> <span className="font-medium">₹12,000</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Yield</span> <span className="font-medium">20 Qtl</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Price</span> <span className="font-medium">₹2,125</span></div>
                <div className="pt-3 border-t flex justify-between text-lg text-green-600 font-bold">
                  <span>Profit</span> <span>₹30,500</span>
                </div>
             </div>
          </div>
          <div className="bg-white p-6">
             <div className="text-center mb-6">
                <select className="bg-gray-50 p-2 rounded-lg font-bold text-lg text-center w-full">
                  <option>Mustard</option>
                  <option>Potato</option>
                </select>
             </div>
             <div className="space-y-4 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Cost</span> <span className="font-medium">₹8,500</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Yield</span> <span className="font-medium">8 Qtl</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Price</span> <span className="font-medium">₹5,400</span></div>
                <div className="pt-3 border-t flex justify-between text-lg text-green-600 font-bold">
                  <span>Profit</span> <span>₹34,700</span>
                </div>
             </div>
          </div>
       </div>
       <p className="text-center text-sm text-gray-500 mt-4 bg-yellow-50 p-2 rounded-lg border border-yellow-100">
         <strong>Winner:</strong> Mustard is currently 14% more profitable due to high market prices.
       </p>
    </div>
  );
};

// 5. Budget Planner
const BudgetPlanner = ({ onBack }: { onBack: () => void }) => {
  const [budget, setBudget] = useState(50000);
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
      <h3 className="font-bold text-xl mb-6 text-center">Plan Crops by Investment</h3>
      <div className="mb-8">
        <label className="block text-sm font-bold text-gray-700 mb-2">My Available Budget</label>
        <div className="flex items-center gap-4">
           <input 
             type="range" min="10000" max="500000" step="5000" 
             value={budget} onChange={e => setBudget(Number(e.target.value))}
             className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
           />
           <div className="bg-green-100 text-green-800 font-bold px-4 py-2 rounded-xl border border-green-200 min-w-[120px] text-center">
             ₹{budget.toLocaleString()}
           </div>
        </div>
      </div>
      
      <div className="space-y-4">
         <h4 className="font-bold text-gray-600 uppercase text-xs">Recommended Crops for your budget</h4>
         <div className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="flex justify-between mb-1">
              <span className="font-bold text-gray-900">Potato (3 Acres)</span>
              <span className="text-green-600 font-bold">Est. Profit: ₹1.2L</span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
               <div className="bg-green-500 h-full w-[90%]"></div>
            </div>
            <p className="text-xs text-gray-400 mt-1">Utilizes 90% of budget</p>
         </div>
         <div className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="flex justify-between mb-1">
              <span className="font-bold text-gray-900">Wheat (4 Acres)</span>
              <span className="text-green-600 font-bold">Est. Profit: ₹1.1L</span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
               <div className="bg-yellow-500 h-full w-[80%]"></div>
            </div>
            <p className="text-xs text-gray-400 mt-1">Utilizes 80% of budget (Low Risk)</p>
         </div>
      </div>
    </div>
  );
};

// 6. Generic AI Tool Template 
const GenericAiTool = ({ toolId, onBack }: { toolId: string, onBack: () => void }) => {
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userInput, setUserInput] = useState('');

  const toolInfo = TOOLS.find(t => t.id === toolId);

  const getAdvice = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Act as an expert agriculture consultant. The user is using the "${toolInfo?.title}" tool. 
      Context/Input: ${userInput || 'General advice for Indian farmers'}.
      Provide 3-4 specific, high-value, actionable productivity tips or calculations relevant to this tool. Format clearly with bullet points. Use ₹ for currency. Keep it concise.`;
      
      const result = await ai.models.generateContent({ 
        model: 'gemini-3-flash-preview',
        contents: prompt 
      });
      setResponse(result.text);
    } catch (e) {
      setResponse("Unable to fetch advice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
       <div className={`w-12 h-12 rounded-xl ${toolInfo?.bg} ${toolInfo?.color} flex items-center justify-center mb-6`}>
          {toolInfo?.icon && <toolInfo.icon className="w-6 h-6" />}
       </div>
       
       <h3 className="text-xl font-bold mb-4">{toolInfo?.title}</h3>
       <p className="text-gray-500 mb-6">{toolInfo?.desc}. Ask our AI for specific advice tailored to your farm.</p>

       <div className="flex gap-2 mb-6">
          <input 
             className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl"
             placeholder={`Enter details (e.g., Crop name, Machinery type, NPK values)...`}
             value={userInput}
             onChange={e => setUserInput(e.target.value)}
          />
          <button 
            onClick={getAdvice}
            disabled={loading}
            className="bg-teal-600 text-white px-6 rounded-xl font-bold hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin"/> : 'Analyze'}
          </button>
       </div>

       {response && (
         <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 animate-in fade-in">
           <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
             {response}
           </div>
         </div>
       )}
    </div>
  );
};

// 7. Farm Report Card
const FarmReportCard = ({ onBack }: { onBack: () => void }) => {
  const handleDownload = () => {
    alert("Downloading PDF Report...");
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-4xl mx-auto">
       <div className="flex justify-between items-start border-b border-gray-100 pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Farm Productivity Report</h1>
            <p className="text-sm text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
          </div>
          <div className="text-right">
             <div className="text-3xl font-bold text-green-600">A+</div>
             <div className="text-xs text-gray-500 uppercase font-bold">Overall Score</div>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
             <h4 className="font-bold text-gray-700 mb-4 border-b pb-2">Productivity Metrics</h4>
             <div className="space-y-3">
               <div className="flex justify-between"><span className="text-gray-600">Soil Health</span> <span className="font-bold text-green-600">Excellent</span></div>
               <div className="flex justify-between"><span className="text-gray-600">Water Efficiency</span> <span className="font-bold text-blue-600">92%</span></div>
               <div className="flex justify-between"><span className="text-gray-600">Crop Yield</span> <span className="font-bold text-gray-900">22 Qtl/Acre</span></div>
               <div className="flex justify-between"><span className="text-gray-600">Labor Efficiency</span> <span className="font-bold text-yellow-600">High</span></div>
             </div>
          </div>
          <div>
             <h4 className="font-bold text-gray-700 mb-4 border-b pb-2">Financial Overview</h4>
             <div className="space-y-3">
               <div className="flex justify-between"><span className="text-gray-600">Total Investment</span> <span className="font-bold text-gray-900">₹45,000</span></div>
               <div className="flex justify-between"><span className="text-gray-600">Gross Revenue</span> <span className="font-bold text-gray-900">₹1,20,000</span></div>
               <div className="flex justify-between"><span className="text-gray-600">Net Profit</span> <span className="font-bold text-green-600">₹75,000</span></div>
             </div>
          </div>
       </div>

       <div className="bg-blue-50 p-4 rounded-xl mb-8">
          <h4 className="font-bold text-blue-900 mb-2">AI Recommendation for Improvement</h4>
          <p className="text-sm text-blue-800">
            Based on your inputs, your soil nitrogen levels are slightly low. Consider a crop rotation with legumes next season to naturally fix nitrogen. 
            Increasing drip irrigation usage by 10% can further reduce water costs.
          </p>
       </div>

       <div className="flex justify-center">
          <button onClick={handleDownload} className="flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-colors shadow-lg">
             <Download className="w-5 h-5" /> Download Full PDF Report
          </button>
       </div>
    </div>
  );
};

// 8. Soil Nutrient Manager (Mini version)
const SoilNutrientManager = ({ onBack }: { onBack: () => void }) => {
  const [npk, setNpk] = useState({ n: 120, p: 40, k: 30 });
  return (
     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
        <h3 className="font-bold text-lg mb-6 text-center">Soil Nutrient Balance Indicator</h3>
        <div className="flex justify-center gap-8 mb-8 items-end h-40 border-b border-gray-200 pb-0">
           {['N', 'P', 'K'].map((nut, i) => {
             const val = i===0 ? npk.n : i===1 ? npk.p : npk.k;
             const max = 200;
             const height = (val / max) * 100;
             const color = val < 50 ? 'bg-red-400' : val > 150 ? 'bg-yellow-400' : 'bg-green-500';
             return (
               <div key={nut} className="flex flex-col items-center gap-2 w-16 group relative">
                 <div style={{height: `${height}%`}} className={`w-full rounded-t-lg transition-all duration-500 ${color}`}></div>
                 <span className="font-bold">{nut}</span>
                 <div className="absolute bottom-full mb-1 text-xs font-bold">{val}</div>
               </div>
             )
           })}
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
           <input type="number" value={npk.n} onChange={e => setNpk({...npk, n: +e.target.value})} className="p-2 border rounded-lg text-center" placeholder="N"/>
           <input type="number" value={npk.p} onChange={e => setNpk({...npk, p: +e.target.value})} className="p-2 border rounded-lg text-center" placeholder="P"/>
           <input type="number" value={npk.k} onChange={e => setNpk({...npk, k: +e.target.value})} className="p-2 border rounded-lg text-center" placeholder="K"/>
        </div>
        <div className="bg-orange-50 p-4 rounded-xl text-sm text-orange-800">
           <strong>Status:</strong> {npk.n < 100 ? 'Low Nitrogen' : 'Balanced'}. {npk.p < 30 ? 'Add Phosphorus' : ''}.
        </div>
     </div>
  )
};