import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BarChart2, Plus, Image, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/charts', icon: BarChart2, label: 'Gráficos' },
    { to: '/checkin/new', icon: Plus, label: 'Novo Registro' },
    { to: '/gallery', icon: Image, label: 'Galeria de Fotos' },
    { to: '/settings', icon: Settings, label: 'Configurações' },
  ];

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="hidden md:flex flex-col bg-card border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0 shrink-0 overflow-hidden"
    >
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 font-black text-primary text-xl tracking-tight"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">B</div>
            BodyTracker
          </motion.div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              twMerge(
                clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all group',
                  isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                )
              )
            }
          >
            <item.icon size={22} className={clsx('shrink-0')} />
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-medium whitespace-nowrap"
              >
                {item.label}
              </motion.span>
            )}
            {isCollapsed && (
               <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100]">
                 {item.label}
               </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        {!isCollapsed && (
          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Versão</p>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              v{import.meta.env.VITE_APP_VERSION || '1.0.0'}
            </p>
          </div>
        )}
      </div>
    </motion.aside>
  );
};
