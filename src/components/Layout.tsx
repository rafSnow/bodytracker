import { type ReactNode } from 'react';
import { useLocation } from 'wouter';
import { Users, Settings } from 'lucide-react';
import { OfflineIndicator } from './OfflineIndicator';
import { LegalDisclaimerModal } from './LegalDisclaimerModal';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();

  const isSettings = location === '/settings';
  // Considerando a raiz ou sub-rotas de clientes como a tab de Pacientes
  const isClients = !isSettings;

  return (
    <div className="min-h-screen bg-[#F2F2F7] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
      <OfflineIndicator />
      <LegalDisclaimerModal />
      
      {/* Container Principal Mobile-First */}
      <main className="flex-1 w-full max-w-md mx-auto relative pb-24">
        {children}
      </main>

      {/* iOS Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/85 backdrop-blur-xl border-t border-slate-200/60 pb-safe">
        <div className="flex items-center justify-around h-[83px] pb-5 pt-2 max-w-md mx-auto px-4">
          <button 
            onClick={() => setLocation('/')}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
              isClients ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Users size={24} strokeWidth={isClients ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Pacientes</span>
          </button>
          
          <button 
            onClick={() => setLocation('/settings')}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
              isSettings ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Settings size={24} strokeWidth={isSettings ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Ajustes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
