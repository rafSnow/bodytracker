import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BarChart2, Plus, Image, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/charts', icon: BarChart2, label: 'Gráficos' },
    { to: '/checkin/new', icon: Plus, label: 'Add', isFab: true },
    { to: '/gallery', icon: Image, label: 'Galeria' },
    { to: '/settings', icon: Settings, label: 'Config' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-slate-200 dark:border-slate-800 safe-bottom z-50">
      <div className="flex justify-around items-center h-16 relative">
        {navItems.map((item) => {
          if (item.isFab) {
            return (
              <div 
                key="fab-spacer" 
                className="w-full h-full pointer-events-none" 
                aria-hidden="true" 
              />
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              aria-label={item.label}
              className={({ isActive }) =>
                twMerge(
                  clsx(
                    'flex flex-col items-center justify-center w-full h-full text-slate-500 dark:text-slate-400 transition-colors',
                    isActive && 'text-primary dark:text-primary-dark'
                  )
                )
              }
            >
              <item.icon size={24} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
