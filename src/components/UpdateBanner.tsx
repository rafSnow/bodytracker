import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from './ui/Button';
import { RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const UpdateBanner: React.FC = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: any) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error: any) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <AnimatePresence>
      {(offlineReady || needRefresh) && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 left-4 right-4 z-[100] md:left-auto md:right-8 md:bottom-8 md:w-80"
        >
          <div className="bg-slate-900 dark:bg-slate-800 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-bold text-sm">
                  {needRefresh ? 'Nova versão disponível!' : 'App pronto para uso offline'}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {needRefresh 
                    ? 'Uma atualização foi baixada. Clique em atualizar para aplicar.' 
                    : 'O Body Tracker agora funciona sem internet.'}
                </p>
              </div>
              <button onClick={close} className="text-slate-500 hover:text-white p-1">
                <X size={16} />
              </button>
            </div>
            
            {needRefresh && (
              <Button 
                size="sm" 
                onClick={() => updateServiceWorker(true)}
                className="w-full gap-2"
              >
                <RefreshCw size={14} />
                Atualizar Agora
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
