import { useState, useEffect } from 'react';
import { X, Share, PlusSquare, Download } from 'lucide-react';

export function InstallPWAModal() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;

    if (isStandaloneMode) {
      return; // Already installed, do nothing
    }

    // Check if prompt was dismissed recently by the user
    const dismissed = localStorage.getItem('pwa_prompt_dismissed');
    if (dismissed === 'true') {
      return;
    }

    // Device Detection for iOS (including iPadOS 13+)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = 
      /iphone|ipad|ipod/.test(userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      
    setIsIOS(isIosDevice);

    if (isIosDevice) {
      // Show iOS prompt after a short delay
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2500);
      return () => clearTimeout(timer);
    }

    // Android / Chrome - handle global event
    const handleDeferredPrompt = (e: any) => {
      setDeferredPrompt(e);
      setTimeout(() => setShowPrompt(true), 1500);
    };

    if ((window as any).deferredPWAInstallPrompt) {
      handleDeferredPrompt((window as any).deferredPWAInstallPrompt);
    } else {
      const onReady = () => handleDeferredPrompt((window as any).deferredPWAInstallPrompt);
      window.addEventListener('pwa-prompt-ready', onReady);
      
      // Fallback: Just in case it fires while we are mounted
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        handleDeferredPrompt(e);
      };
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener('pwa-prompt-ready', onReady);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }

    // Also listen for successful installation to dismiss modal
    const handleAppInstalled = () => {
      setShowPrompt(false);
      localStorage.setItem('pwa_prompt_dismissed', 'true');
    };
    
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember the user's choice to not be annoying
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center px-4 pb-24 pt-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 relative animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-500">
        
        <button 
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-1.5 rounded-full transition-colors"
          aria-label="Fechar instrução de instalação"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-inner flex-shrink-0">
            <Download size={28} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 leading-tight">Instale o BioStats</h3>
            <p className="text-sm text-slate-500 mt-0.5">Uso offline, rápido e nativo</p>
          </div>
        </div>

        {isIOS ? (
          <div className="bg-slate-50 rounded-2xl p-4 mb-2 border border-slate-100">
            <p className="text-sm text-slate-700 font-medium mb-3">
              Para instalar no seu iPhone ou iPad:
            </p>
            <ol className="text-sm text-slate-600 space-y-3">
              <li className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-sm border border-slate-200 text-indigo-600 font-semibold text-xs flex-shrink-0">1</span>
                <span>Toque em <strong>Compartilhar</strong> <Share size={16} className="inline text-blue-500 mb-1" /> na barra de opções inferior.</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-sm border border-slate-200 text-indigo-600 font-semibold text-xs flex-shrink-0">2</span>
                <span>Role o menu e toque em <strong>Adicionar à Tela Inicial</strong> <PlusSquare size={16} className="inline text-slate-600 mb-1" />.</span>
              </li>
            </ol>
          </div>
        ) : (
          <div className="mb-6 mt-2">
            <p className="text-sm text-slate-600">
              Adicione o BioStats à sua tela inicial para acessar os dados dos seus pacientes instantaneamente, como um aplicativo nativo.
            </p>
          </div>
        )}

        {!isIOS && (
          <button 
            onClick={handleInstallClick}
            className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-semibold shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
          >
            Adicionar à Tela Inicial
          </button>
        )}
      </div>
    </div>
  );
}
