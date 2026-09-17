import { Switch, Route, useLocation, Router } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { ProfessionalProfile } from './components/ProfessionalProfile';
import { ClientList } from './components/ClientList';
import { ClientForm } from './components/ClientForm';
import { ClientDashboard } from './components/ClientDashboard';
import { EvaluationForm } from './components/EvaluationForm';
import { DataBackupManager } from './components/DataBackupManager';
import { LogOut } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db/db';

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
          <div className="p-4 flex flex-col gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-2">
              <h2 className="text-2xl font-bold text-slate-800 mb-1">Configurações</h2>
              <p className="text-slate-500 text-sm">Gerencie seus dados locais</p>
            </div>
            
            <DataBackupManager />
            
            <div className="bg-white border border-rose-100 rounded-3xl shadow-sm p-6 flex flex-col gap-4">
              <h3 className="font-semibold text-slate-800">Sair da Conta</h3>
              <p className="text-sm text-slate-500">Ao sair, os dados continuam no navegador (Dexie.js), mas você precisará recriar o perfil de acesso.</p>
              <button 
                onClick={() => {
                  if (window.confirm('Tem certeza que deseja sair?')) {
                    logout();
                  }
                }}
                className="flex items-center justify-center gap-2 h-14 bg-rose-50 text-rose-600 font-medium rounded-2xl hover:bg-rose-100 active:scale-[0.98] transition-all"
              >
                <LogOut size={20} />
                Sair do Aplicativo
              </button>
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

  if (cliente === undefined) return <div className="p-8 text-center text-slate-500">Carregando...</div>;
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
      <div className="min-h-screen bg-slate-50 flex flex-col p-4 justify-center">
        <ProfessionalProfile onRegister={login} />
      </div>
    );
  }

  return <PrivateRoutes />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router hook={useHashLocation}>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
