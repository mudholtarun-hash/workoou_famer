import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FloatingControls } from './components/FloatingControls';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { ChatBot } from './components/ChatBot';

type ViewState = 'home' | 'auth' | 'dashboard';

interface UserData {
  name: string;
  email: string;
}

function App() {
  const [view, setView] = useState<ViewState>('home');
  const [user, setUser] = useState<UserData | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleStartExploring = () => {
    setView('auth');
  };

  const handleLoginSuccess = (userData: UserData) => {
    setUser(userData);
    setView('dashboard');
  };

  const handleBackToHome = () => {
    setView('home');
  };

  const handleLogout = () => {
    setUser(null);
    setView('home');
    setIsChatOpen(false);
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
      {/* Show Header only on Home. Dashboard has its own sidebar. */}
      {view === 'home' && <Header />}
      
      <main>
        {view === 'home' && <Hero onStartExploring={handleStartExploring} />}
        {view === 'auth' && <AuthPage onLoginSuccess={handleLoginSuccess} onBack={handleBackToHome} />}
        {view === 'dashboard' && user && (
          <Dashboard 
            user={user} 
            onLogout={handleLogout} 
            onOpenChat={() => setIsChatOpen(true)}
          />
        )}
      </main>

      {/* Show Floating Controls on Home and Dashboard */}
      {view !== 'auth' && (
        <FloatingControls onOpenChat={toggleChat} />
      )}
      
      {/* Global ChatBot */}
      <ChatBot 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        userName={user?.name.split(' ')[0]} 
      />
    </div>
  );
}

export default App;