import { useState, useEffect } from 'react';
import { AlertOctagon, Check } from 'lucide-react';

export function LegalDisclaimerModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('disclaimer_accepted');
    if (!accepted) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('disclaimer_accepted', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header (Laranja para chamar atenção médica/legal) */}
        <div className="bg-orange-50 p-6 flex flex-col items-center border-b border-orange-100">
          <div className="p-4 bg-orange-100 text-orange-600 rounded-full mb-4">
            <AlertOctagon size={36} strokeWidth={2} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 text-center">
            Aviso Importante e Responsabilidade
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4 text-slate-600 text-sm leading-relaxed">
          <p>
            O <strong>BioStats</strong> é uma ferramenta desenhada exclusivamente para auxiliar no monitoramento 
            e evolução de métricas preditivas. 
          </p>
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700">
            Este aplicativo gera <strong>estimativas</strong> de composição corporal baseadas em equações 
            antropométricas validadas na literatura científica (como o Método US Navy e RFM).
          </div>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>Os resultados <strong>não representam diagnóstico médico</strong>.</li>
            <li>Este aplicativo não substitui exames clínicos, de imagem (como o DEXA Scan) ou testes de Bioimpedância elétrica de uso profissional.</li>
            <li>A responsabilidade pelo uso, interpretação e aplicação das informações na rotina do paciente é inteiramente do profissional operante.</li>
          </ul>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-2">
          <button
            onClick={handleAccept}
            className="w-full flex items-center justify-center gap-2 h-14 bg-slate-800 text-white font-medium rounded-2xl hover:bg-slate-900 active:scale-[0.98] transition-all"
          >
            <Check size={20} />
            Eu li e compreendo
          </button>
        </div>
      </div>
    </div>
  );
}
