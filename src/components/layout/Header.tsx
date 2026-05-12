import React from 'react';

interface HeaderProps {
  title: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, leftAction, rightAction }) => {
  return (
    <header className="bg-surface dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 z-40 shadow-sm shrink-0">
      <div className="safe-top" />
      <div className="h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 overflow-hidden">
          {leftAction}
          <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate">
            {title}
          </h1>
        </div>
        <div className="flex items-center space-x-2 shrink-0" aria-label="Ações de cabeçalho">
          {rightAction}
        </div>
      </div>
    </header>
  );
};
