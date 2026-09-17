import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}

export function ActionSheet({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Excluir',
  cancelText = 'Cancelar'
}: ActionSheetProps) {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      // Small delay to allow the DOM to render before triggering the slide animation
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setIsVisible(false);
      // Wait for the animation to finish before removing from DOM
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      
      {/* Sheet Content */}
      <div 
        className={`relative z-10 w-full px-4 pb-8 transition-transform duration-300 ease-out ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="bg-[#F2F2F7]/95 backdrop-blur-xl rounded-[14px] overflow-hidden flex flex-col mb-2 shadow-sm">
          <div className="p-4 text-center border-b border-slate-200/60 bg-white/60">
            <h3 className="text-[13px] font-semibold text-slate-500">{title}</h3>
            {description && <p className="text-[13px] text-slate-500 mt-1 leading-tight">{description}</p>}
          </div>
          
          <button 
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(50);
              onConfirm();
              onClose();
            }}
            className="w-full py-4 text-[20px] font-normal text-red-500 bg-white/80 hover:bg-slate-100/80 active:bg-slate-200/80 transition-colors"
          >
            {confirmText}
          </button>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-4 text-[20px] font-semibold text-indigo-600 bg-white rounded-[14px] hover:bg-slate-50 active:scale-[0.98] transition-all shadow-sm"
        >
          {cancelText}
        </button>
      </div>
    </div>,
    document.body
  );
}
