import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Camera, Scale } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FAB: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const actions = [
    {
      icon: <Camera size={20} />,
      label: 'Registrar Foto',
      onClick: () => {
        navigate('/checkin/new');
        setIsOpen(false);
      },
      color: 'bg-blue-500',
    },
    {
      icon: <Scale size={20} />,
      label: 'Novo Peso',
      onClick: () => {
        navigate('/checkin/new');
        setIsOpen(false);
      },
      color: 'bg-primary',
    },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-[60] mb-[env(safe-area-inset-bottom,16px)]">
      {/* Action Buttons */}
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col items-center gap-3 mb-4">
            {actions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3"
              >
                <span className="bg-white dark:bg-slate-800 px-3 py-1 rounded-lg text-sm font-medium shadow-sm border border-slate-100 dark:border-slate-700">
                  {action.label}
                </span>
                <button
                  onClick={action.onClick}
                  className={`w-12 h-12 ${action.color} text-white rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-90`}
                >
                  {action.icon}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={toggleMenu}
        className={`w-14 h-14 ${isOpen ? 'bg-slate-500' : 'bg-primary'} text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center transition-colors`}
        aria-label="Abrir menu de ações"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <Plus size={28} />
        </motion.div>
      </motion.button>

      {/* Backdrop when open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[-1]"
            style={{ width: '100vw', height: '100vh', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
