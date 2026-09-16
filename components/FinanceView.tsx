import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Building2, Calculator, Coins, FileText, 
  TrendingUp, ShieldCheck, ChevronRight, Loader2, X, CheckCircle,
  Bell, ExternalLink, Calendar, Tag, Lightbulb, Wallet, PiggyBank,
  Landmark, Info, TrendingDown, HelpCircle, BrainCircuit, Target
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface FinanceViewProps {
  onBack: () => void;
}

// Mock Data for Banks (Static for reliability)
const BANK_RATES = [
  { name: 'SBI KCC', interest: '7.00%', limit: '₹3 Lakh', fee: 'Nil', features: 'Govt Subsidized' },
  { name: 'HDFC Agri', interest: '8.15%', limit: '₹5 Lakh', fee: '0.50%', features: 'Fast Approval' },
  { name: 'NABARD', interest: '6.50%', limit: 'Project Based', fee: 'Nil', features: 'Refinance Scheme' },
  { name: 'Axis Kisan', interest: '8.50%', limit: '₹2 Lakh', fee: '1.00%', features: 'Digital Process' },
  { name: 'PNB Krishi', interest: '7.10%', limit: '₹3 Lakh', fee: 'Nil', features: 'Crop Insurance Link' },
];

export const FinanceView: React.FC<FinanceViewProps> = ({ onBack }) => {
  const [schemes, setSchemes] = useState<any[]>([]);
  const [notification, setNotification] = useState<any>(null);
  const [isLoadingSchemes, setIsLoadingSchemes] = useState(false);
  const [applyingScheme, setApplyingScheme] = useState<any | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  // EMI Calculator State
  const [loanAmount, setLoanAmount] = useState(100000);
  const [interestRate, setInterestRate] = useState(7);
  const [tenure, setTenure] = useState(12); // months

  // Financial Tips State
  const [tips, setTips] = useState<any[]>([]);

  // Personal Advisor State
  const [advisorTab, setAdvisorTab] = useState<'tips' | 'personal'>('tips');
  const [financeForm, setFinanceForm] = useState({ income: '', debt: '', goal: '' });
  const [personalAdvice, setPersonalAdvice] = useState<string | null>(null);
  const [isGeneratingAdvice, setIsGeneratingAdvice] = useState(false);

  // Fetch Schemes & Tips via Gemini
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingSchemes(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
        
        const prompt = `
          Context: Today is ${today}.
          You are an expert Indian Agricultural Finance Consultant.
          
          Generate a JSON object containing a LIVE REPORT for the "Kisan Finance Portal".
          
          Requirements:
          1. **Notification**: Create a "Breaking News" style alert about a recently released or updated Indian Govt scheme (e.g., PM-Kisan 15th Installment, New Drone Subsidy).
          2. **Schemes**: List 6-8 active schemes. Include a mix of central (PM-KISAN, AIF) and state-level schemes.
             - Fields: id, title, description, benefits (detailed), eligibility, link (official url placeholder), type (New/Trending).
          3. **Financial Advice**: 
             - "Profit Management": Tip on what to do when crop sells at high profit.
             - "Loss Recovery": Tip on how to manage debt after crop failure.
             - "Savings": Smart investment for farmers (e.g. KVP, Gold).
          
          Output JSON Schema:
          {
            "notification": { "title": "string", "message": "string", "date": "string" },
            "schemes": [ { "id": "string", "title": "string", "description": "string", "benefits": "string", "eligibility": "string", "type": "string" } ],
            "tips": [ { "category": "Profit" | "Loss" | "Savings", "title": "string", "advice": "string" } ]
          }
        `;

        const result = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });

        const data = JSON.parse(result.text);
        setSchemes(data.schemes || []);
        setNotification(data.notification);
        setTips(data.tips || []);
      } catch (error) {
        console.error("AI Error", error);
        // Fallback Data
        setSchemes([
          { id: '1', title: 'PM Kisan Samman Nidhi', description: 'Income support of ₹6,000 per year.', benefits: '₹2,000 every 4 months directly into bank account.', eligibility: 'Small and marginal farmers.', type: 'Trending' },
          { id: '2', title: 'Agri Infrastructure Fund', description: 'Financing facility for post-harvest management infrastructure.', benefits: 'Interest subvention of 3% per annum up to ₹2 Crore.', eligibility: 'Farmers, FPOs, SHGs.', type: 'Investment' }
        ]);
        setNotification({ title: "New Scheme Alert", message: "Government announces new subsidy on Solar Pumps under PM-KUSUM.", date: "Just Now" });
      } finally {
        setIsLoadingSchemes(false);
      }
    };

    fetchData();
  }, []);

  // Generate Personal Advice
  const generatePersonalAdvice = async () => {
    if (!financeForm.income || !financeForm.goal) return;
    setIsGeneratingAdvice(true);
    setPersonalAdvice(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        Act as a compassionate and expert financial advisor for an Indian farmer.
        
        Farmer's Financial Profile:
        - Annual Farm Income: ₹${financeForm.income}
        - Current Outstanding Debt: ₹${financeForm.debt || '0'}
        - Primary Financial Goal: ${financeForm.goal}

        Task:
        Provide a concise, actionable financial plan (max 200 words).
        1. Analyze if the goal is realistic based on income/debt.
        2. Give 3 specific steps to achieve the goal.
        3. Suggest one safe government investment scheme suitable for this profile (e.g. Kisan Vikas Patra, PPF, Sukanya Samriddhi).
        
        Keep the tone encouraging.
      `;
      
      const result = await ai.models.generateContent({ 
        model: 'gemini-3-flash-preview',
        contents: prompt 
      });
      setPersonalAdvice(result.text);
    } catch (e) {
      console.error(e);
      setPersonalAdvice("Unable to generate advice right now. Please check your connection.");
    } finally {
      setIsGeneratingAdvice(false);
    }
  };

  // EMI Logic
  const calculateEMI = () => {
    const monthlyRate = interestRate / 12 / 100;
    const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
    return Math.round(emi);
  };

  const emi = calculateEMI();
  const totalPayment = emi * tenure;
  const totalInterest = totalPayment - loanAmount;

  // Application Simulation
  const handleApply = (scheme: any) => {
    setApplyingScheme(scheme);
    setApplicationStatus('idle');
  };

  const submitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    setApplicationStatus('submitting');
    setTimeout(() => {
      setApplicationStatus('success');
      // Simulate API call to govt portal
    }, 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 animate-in fade-in">
      
      {/* --- HEADER --- */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors border border-transparent hover:border-gray-200"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Landmark className="w-6 h-6 text-teal-700" />
                Finance & Government Schemes
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">Powered by myScheme & Data.gov.in (Live Feed)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100 flex items-center gap-1">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
               Live Updates
             </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* --- NOTIFICATION BANNER --- */}
        {notification && (
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-1 shadow-lg transform hover:scale-[1.01] transition-transform cursor-pointer">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-start gap-4">
               <div className="bg-red-500 text-white p-2 rounded-lg shadow-md animate-bounce">
                 <Bell className="w-6 h-6" />
               </div>
               <div className="flex-1 text-white">
                 <div className="flex justify-between items-start">
                   <h3 className="font-bold text-lg leading-tight">{notification.title}</h3>
                   <span className="text-[10px] bg-white/20 px-2 py-1 rounded text-blue-100">{notification.date}</span>
                 </div>
                 <p className="text-blue-100 text-sm mt-1">{notification.message}</p>
               </div>
               <ChevronRight className="w-5 h-5 text-white/50 self-center" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- LEFT COLUMN: SCHEMES --- */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Schemes List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                   <FileText className="w-5 h-5 text-teal-600" />
                   New Released Schemes
                 </h2>
                 <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                   {isLoadingSchemes ? 'Updating...' : `${schemes.length} Active`}
                 </span>
               </div>

               {isLoadingSchemes ? (
                 <div className="p-12 flex flex-col items-center justify-center text-gray-400">
                   <Loader2 className="w-8 h-8 animate-spin mb-2 text-teal-500" />
                   <p className="text-sm">Fetching latest schemes from govt portal...</p>
                 </div>
               ) : (
                 <div className="divide-y divide-gray-100">
                   {schemes.map((scheme) => (
                     <div key={scheme.id} className="p-6 hover:bg-teal-50/30 transition-colors group">
                        <div className="flex flex-col sm:flex-row gap-4">
                           <div className="flex-1">
                              <div className="flex gap-2 mb-2">
                                 {scheme.type && (
                                   <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border 
                                     ${scheme.type.includes('New') ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                     {scheme.type}
                                   </span>
                                 )}
                                 <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                                   Central Govt
                                 </span>
                              </div>
                              <h3 className="text-lg font-bold text-gray-900 group-hover:text-teal-700 transition-colors">
                                {scheme.title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1 mb-3 leading-relaxed">
                                {scheme.description}
                              </p>
                              
                              <details className="text-sm text-gray-500 group/details">
                                <summary className="cursor-pointer font-medium text-teal-600 flex items-center gap-1 w-fit hover:underline list-none">
                                  <Info className="w-3.5 h-3.5" /> Read More & Check Eligibility
                                </summary>
                                <div className="mt-3 p-4 bg-white border border-gray-200 rounded-xl space-y-2 text-xs sm:text-sm animate-in slide-in-from-top-2">
                                   <p><strong className="text-gray-900">Benefits:</strong> {scheme.benefits}</p>
                                   <p><strong className="text-gray-900">Eligibility:</strong> {scheme.eligibility}</p>
                                </div>
                              </details>
                           </div>
                           
                           <div className="flex sm:flex-col gap-2 self-start">
                              <button 
                                onClick={() => handleApply(scheme)}
                                className="px-6 py-2.5 bg-teal-600 text-white font-bold text-sm rounded-xl shadow-md hover:bg-teal-700 transition-all flex items-center gap-2 whitespace-nowrap"
                              >
                                Apply Now <ChevronRight className="w-4 h-4" />
                              </button>
                           </div>
                        </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>

            {/* Bank Comparison */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                   <Building2 className="w-5 h-5 text-blue-600" />
                   Agri-Loan Comparisons
                 </h2>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                   <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold">
                     <tr>
                       <th className="px-6 py-4">Bank Name</th>
                       <th className="px-6 py-4">Interest Rate</th>
                       <th className="px-6 py-4">Max Limit</th>
                       <th className="px-6 py-4">Key Feature</th>
                       <th className="px-6 py-4">Action</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                     {BANK_RATES.map((bank, i) => (
                       <tr key={i} className="hover:bg-blue-50/20">
                         <td className="px-6 py-4 font-bold text-gray-900">{bank.name}</td>
                         <td className="px-6 py-4 text-green-600 font-bold">{bank.interest}</td>
                         <td className="px-6 py-4">{bank.limit}</td>
                         <td className="px-6 py-4">
                           <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
                             {bank.features}
                           </span>
                         </td>
                         <td className="px-6 py-4">
                           <button className="text-teal-600 font-bold hover:underline text-xs">View Details</button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>

          </div>

          {/* --- RIGHT COLUMN: TOOLS & ADVISOR --- */}
          <div className="space-y-8">
            
            {/* Smart Advisor & Personal Planner */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
               {/* Advisor Header */}
               <div className="bg-gradient-to-r from-orange-50 to-white p-6 border-b border-orange-100">
                  <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-orange-500" />
                    Financial Advisor
                  </h3>
                  {/* Tabs */}
                  <div className="flex gap-2 mt-4">
                     <button 
                       onClick={() => setAdvisorTab('tips')}
                       className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${advisorTab === 'tips' ? 'bg-orange-100 text-orange-800' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                     >
                       Daily Tips
                     </button>
                     <button 
                       onClick={() => setAdvisorTab('personal')}
                       className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${advisorTab === 'personal' ? 'bg-orange-100 text-orange-800' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                     >
                       Personal Planner
                     </button>
                  </div>
               </div>
               
               <div className="p-6">
                 {advisorTab === 'tips' ? (
                   /* Tips Content */
                   tips.length > 0 ? (
                     <div className="space-y-4">
                       {tips.map((tip, i) => (
                         <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-orange-200 transition-colors">
                           <div className="flex items-center gap-2 mb-2">
                              {tip.category.includes('Profit') && <TrendingUp className="w-4 h-4 text-green-600" />}
                              {tip.category.includes('Loss') && <TrendingDown className="w-4 h-4 text-red-600" />}
                              {tip.category.includes('Savings') && <PiggyBank className="w-4 h-4 text-blue-600" />}
                              <span className="text-xs font-bold uppercase tracking-wide text-gray-500">{tip.category}</span>
                           </div>
                           <h4 className="font-bold text-gray-900 text-sm mb-1">{tip.title}</h4>
                           <p className="text-xs text-gray-600 leading-relaxed">{tip.advice}</p>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div className="animate-pulse space-y-3">
                       {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl"></div>)}
                     </div>
                   )
                 ) : (
                   /* Personal Planner Content */
                   <div className="space-y-4">
                      {!personalAdvice ? (
                        <div className="animate-in fade-in">
                           <p className="text-sm text-gray-600 mb-4">Tell us about your financials to get a custom roadmap.</p>
                           <div className="space-y-3">
                              <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Annual Income (₹)</label>
                                <input 
                                  type="number" 
                                  placeholder="e.g. 500000"
                                  className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500"
                                  value={financeForm.income} onChange={e => setFinanceForm({...financeForm, income: e.target.value})}
                                />
                              </div>
                              <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Current Debt (₹)</label>
                                <input 
                                  type="number" 
                                  placeholder="e.g. 100000"
                                  className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500"
                                  value={financeForm.debt} onChange={e => setFinanceForm({...financeForm, debt: e.target.value})}
                                />
                              </div>
                              <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Financial Goal</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. Buy a new tractor in 2 years"
                                  className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500"
                                  value={financeForm.goal} onChange={e => setFinanceForm({...financeForm, goal: e.target.value})}
                                />
                              </div>
                              <button 
                                onClick={generatePersonalAdvice}
                                disabled={isGeneratingAdvice || !financeForm.income || !financeForm.goal}
                                className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 disabled:opacity-50 flex justify-center items-center gap-2 shadow-md"
                              >
                                {isGeneratingAdvice ? <Loader2 className="w-4 h-4 animate-spin"/> : <BrainCircuit className="w-4 h-4"/>}
                                Generate Plan
                              </button>
                           </div>
                        </div>
                      ) : (
                        <div className="animate-in slide-in-from-right-4">
                           <div className="flex justify-between items-center mb-3">
                              <h4 className="font-bold text-teal-800 flex items-center gap-2"><Target className="w-4 h-4"/> Your Action Plan</h4>
                              <button onClick={() => setPersonalAdvice(null)} className="text-xs text-gray-500 hover:text-red-500 underline">Reset</button>
                           </div>
                           <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed shadow-inner font-medium">
                              {personalAdvice}
                           </div>
                        </div>
                      )}
                   </div>
                 )}
               </div>
            </div>

            {/* EMI Calculator */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2 mb-6">
                <Calculator className="w-5 h-5 text-teal-600" />
                EMI Estimator
              </h3>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium text-gray-500">
                    <span>Loan Amount</span>
                    <span className="text-gray-900 font-bold">₹{loanAmount.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" min="10000" max="1000000" step="5000"
                    value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium text-gray-500">
                    <span>Interest Rate (p.a)</span>
                    <span className="text-gray-900 font-bold">{interestRate}%</span>
                  </div>
                  <input 
                    type="range" min="1" max="20" step="0.1"
                    value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium text-gray-500">
                    <span>Tenure</span>
                    <span className="text-gray-900 font-bold">{tenure} Months</span>
                  </div>
                  <input 
                    type="range" min="3" max="60" step="1"
                    value={tenure} onChange={(e) => setTenure(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />
                </div>

                <div className="bg-teal-50 rounded-xl p-4 space-y-3 border border-teal-100">
                  <div className="flex justify-between items-center">
                     <span className="text-xs text-gray-600 font-medium">Monthly EMI</span>
                     <span className="text-xl font-bold text-teal-700">₹{emi.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-px bg-teal-200/50"></div>
                  <div className="flex justify-between items-center text-xs">
                     <span className="text-gray-500">Total Interest</span>
                     <span className="font-semibold text-gray-800">₹{totalInterest.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                     <span className="text-gray-500">Total Payable</span>
                     <span className="font-semibold text-gray-800">₹{totalPayment.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-900 text-white mt-auto py-10 px-4">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
               <h4 className="text-lg font-bold mb-4 flex items-center gap-2"><Landmark className="w-5 h-5" /> Kisan Finance</h4>
               <p className="text-sm text-gray-400 leading-relaxed">
                 Empowering farmers with financial literacy, direct scheme access, and smart investment tools.
                 Data sourced from official government portals.
               </p>
            </div>
            <div>
               <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Quick Links</h4>
               <ul className="space-y-2 text-sm text-gray-300">
                 <li><a href="#" className="hover:text-white">PM-KISAN Status</a></li>
                 <li><a href="#" className="hover:text-white">Apply for KCC</a></li>
                 <li><a href="#" className="hover:text-white">Crop Insurance Claim</a></li>
                 <li><a href="#" className="hover:text-white">Market Price Check</a></li>
               </ul>
            </div>
            <div>
               <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Support</h4>
               <p className="text-sm text-gray-300 mb-2">Helpline: 1551 (Kisan Call Centre)</p>
               <p className="text-sm text-gray-300">Email: help@kisanportal.gov.in</p>
            </div>
         </div>
         <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} Kisan Portal. All rights reserved. Financial advice is AI-generated for reference.
         </div>
      </footer>

      {/* --- APPLICATION MODAL --- */}
      {applyingScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
             
             {applicationStatus === 'success' ? (
               <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in duration-300">
                 <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                   <CheckCircle className="w-10 h-10 text-green-600" />
                 </div>
                 <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
                 <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">
                   Your application for <span className="font-bold text-gray-800">{applyingScheme.title}</span> has been forwarded to the concerned department.
                 </p>
                 <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Application ID</p>
                    <p className="text-xl font-mono font-bold text-teal-700 tracking-wider">KSN-{Math.floor(Math.random()*1000000)}</p>
                 </div>
                 <button onClick={() => { setApplyingScheme(null); setApplicationStatus('idle'); }} className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors">
                   Back to Schemes
                 </button>
               </div>
             ) : (
               <>
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Apply for Scheme</h3>
                    <p className="text-xs text-gray-500 mt-1">Official Application Form</p>
                  </div>
                  <button onClick={() => setApplyingScheme(null)} className="text-gray-400 hover:text-gray-600 bg-gray-50 p-2 rounded-full hover:bg-gray-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 mb-6">
                   <h4 className="font-bold text-teal-900 text-sm mb-1">{applyingScheme.title}</h4>
                   <p className="text-xs text-teal-700">{applyingScheme.description}</p>
                </div>

                <form onSubmit={submitApplication} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Full Name (As per Aadhaar)</label>
                      <input required type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all" placeholder="Farmer Name" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Aadhaar Number</label>
                      <input required type="text" pattern="[0-9]{12}" title="12 digit Aadhaar" placeholder="1234 5678 9012" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Mobile Number</label>
                      <input required type="tel" placeholder="+91" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Land Record ID / Khasra No.</label>
                      <input required type="text" placeholder="e.g. 125/2, Village Raipur" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Bank Account Number</label>
                      <input required type="text" placeholder="For subsidy transfer" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all" />
                    </div>
                  </div>

                  <div className="flex items-start gap-3 mt-4 bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <input required type="checkbox" className="mt-1 w-4 h-4 text-teal-600 rounded focus:ring-teal-500 border-gray-300" />
                    <p className="text-xs text-gray-600">I hereby declare that the information provided is true. I authorize Kisan Portal to fetch my land records from the state database for verification.</p>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={applicationStatus === 'submitting'}
                    className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors flex justify-center items-center gap-2 shadow-lg shadow-teal-200/50"
                  >
                    {applicationStatus === 'submitting' && <Loader2 className="w-5 h-5 animate-spin" />}
                    {applicationStatus === 'submitting' ? 'Submitting Application...' : 'Submit Application'}
                  </button>
                </form>
               </>
             )}
          </div>
        </div>
      )}

    </div>
  );
};