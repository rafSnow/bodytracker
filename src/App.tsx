import { Switch, Route, useLocation, Router } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { InstallPWAModal } from './components/InstallPWAModal';
import { ProfessionalProfile } from './components/ProfessionalProfile';
import { ClientList } from './components/ClientList';
import { ClientForm } from './components/ClientForm';
import { ClientDashboard } from './components/ClientDashboard';
import { EvaluationForm } from './components/EvaluationForm';
import { DataBackupManager } from './components/DataBackupManager';
import { ThemeToggle } from './components/ThemeToggle';
import { LogOut } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db/db';
import { Toaster } from 'react-hot-toast';

// Componente Wrapper das Rotas Privadas (com Layout)
function PrivateRoutes() {
  const { profissionalId, logout } = useAuth();
  const [, setLocation] = useLocation();

  if (!profissionalId) return null;

  return (
    <Layout>
      <Switch>
        {/* Rota Home: Lista de Clientes */}
        <Route path="/">
          <ClientList 
            profissionalId={profissionalId} 
            onAddClient={() => setLocation('/client/new')}
            onSelectClient={(cliente) => setLocation(`/client/${cliente.id}`)}
          />
        </Route>

        {/* Adicionar Novo Cliente */}
        <Route path="/client/new">
          <div className="p-4">
            <ClientForm 
              profissionalId={profissionalId}
              onSuccess={() => setLocation('/')}
              onCancel={() => setLocation('/')}
            />
          </div>
        </Route>

        {/* Dashboard do Cliente Específico */}
        <Route path="/client/:id">
          {(params) => <ClientDashboardRoute clienteId={params.id} />}
        </Route>

        {/* Nova Avaliação para um Cliente */}
        <Route path="/client/:id/evaluate">
          {(params) => (
            <div className="p-4">
              <EvaluationForm 
                clienteId={params.id}
                onSuccess={() => setLocation(`/client/${params.id}`)}
                onCancel={() => setLocation(`/client/${params.id}`)}
              />
            </div>
          )}
        </Route>

        {/* Configurações (Ajustes) */}
        <Route path="/settings">
          <div className="flex flex-col h-full w-full bg-[#F2F2F7] dark:bg-slate-950 min-h-screen pb-24">
            <div className="sticky top-0 z-30 bg-[#F2F2F7] dark:bg-slate-950/80 backdrop-blur-xl pt-12 pb-4 px-4 border-b border-slate-200/50">
              <div className="flex justify-between items-center">
  <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Ajustes</h1>
  <ThemeToggle />
</div>
            </div>
            
            <div className="p-4 flex flex-col gap-6 mt-2">
              <DataBackupManager />
              
              <div className="bg-white dark:bg-slate-900 rounded-[10px] shadow-sm border border-slate-200/60 dark:border-slate-800 overflow-hidden">
                <div className="p-4 flex flex-col gap-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-[17px]">Sair da Conta</h3>
                  <p className="text-[14px] text-slate-500 dark:text-slate-400 leading-snug">Ao sair, os dados continuam no navegador (Dexie.js), mas você precisará recriar o perfil de acesso.</p>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={() => {
                      if (window.confirm('Tem certeza que deseja sair?')) {
                        logout();
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-white dark:bg-slate-900 text-red-500 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 active:bg-slate-100 transition-colors text-[17px]"
                  >
                    <LogOut size={20} />
                    Sair do Aplicativo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Route>
      </Switch>
    </Layout>
  );
}

// Wrapper para carregar o cliente antes do Dashboard
function ClientDashboardRoute({ clienteId }: { clienteId: string }) {
  const [, setLocation] = useLocation();
  const cliente = useLiveQuery(() => db.clientes.get(clienteId), [clienteId]);

  if (cliente === undefined) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-[#F2F2F7] dark:bg-slate-950 animate-pulse">
        <div className="sticky top-0 z-30 bg-[#F2F2F7] dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 pt-12 pb-3 flex flex-col px-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 opacity-50">
              <div className="w-8 h-8 rounded-full bg-slate-200 ml-2" />
              <div className="w-16 h-5 bg-slate-200 rounded-md" />
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-200 mr-2 opacity-50" />
          </div>
          <div className="px-4 mt-2">
            <div className="w-48 h-8 bg-slate-200 rounded-lg" />
            <div className="w-32 h-4 bg-slate-200 rounded-md mt-2" />
          </div>
        </div>
        <div className="px-4 pt-6 pb-24 flex flex-col gap-6">
          <div className="bg-white rounded-[10px] shadow-sm border border-slate-200/60 p-4 h-32" />
          <div className="bg-white rounded-[10px] shadow-sm border border-slate-200/60 p-4 h-64" />
        </div>
      </div>
    );
  }
  if (cliente === null) {
    setLocation('/');
    return null;
  }

  return (
    <ClientDashboard 
      cliente={cliente}
      onBack={() => setLocation('/')}
      onNewEvaluation={() => setLocation(`/client/${cliente.id}/evaluate`)}
    />
  );
}

// Raiz da Aplicação
function AppContent() {
  const { profissionalId, login } = useAuth();

  if (!profissionalId) {
    return (
      <>
        <InstallPWAModal />
        <div className="min-h-screen bg-[#F2F2F7] dark:bg-slate-950 flex flex-col justify-center">
          <ProfessionalProfile onRegister={login} />
        </div>
      </>
    );
  }

  return (
    <>
      <InstallPWAModal />
      <PrivateRoutes />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router hook={useHashLocation}>
        <AppContent />
      </Router>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            color: '#1e293b',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            borderRadius: '100px',
            padding: '12px 20px',
            fontSize: '15px',
            fontWeight: 500,
            border: '1px solid rgba(226, 232, 240, 0.6)'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  );
}
