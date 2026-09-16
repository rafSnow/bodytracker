import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AuthContextType {
  profissionalId: string | null;
  login: (id: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profissionalId, setProfissionalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedId = localStorage.getItem('profissional_id');
    if (savedId) setProfissionalId(savedId);
    setLoading(false);
  }, []);

  const login = (id: string) => {
    localStorage.setItem('profissional_id', id);
    setProfissionalId(id);
  };

  const logout = () => {
    localStorage.removeItem('profissional_id');
    localStorage.removeItem('disclaimer_accepted');
    setProfissionalId(null);
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ profissionalId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
