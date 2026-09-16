import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db, type Cliente } from '../db/db';
import { calculateIdade } from '../utils/dateUtils';
import {
  calculateUSNavyBF,
  calculateRFM,
  calculateDeurenbergBF,
  calculateBoerLBM,
  calculateIMC,
  calculateRCQ,
  calculateRCEst,
} from '../utils/calculator';
import { Activity, ArrowLeft } from 'lucide-react';

interface EvaluationFormProps {
  clienteId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EvaluationForm({ clienteId, onSuccess, onCancel }: EvaluationFormProps) {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  
  // States para as medidas
  const [peso, setPeso] = useState('');
  const [pescoco, setPescoco] = useState('');
  const [cintura, setCintura] = useState('');
  const [quadril, setQuadril] = useState('');
  const [abdomen, setAbdomen] = useState('');
  const [braco, setBraco] = useState('');
  const [coxa, setCoxa] = useState('');
  const [panturrilha, setPanturrilha] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    db.clientes.get(clienteId).then(c => {
      if (c) setCliente(c);
    });
  }, [clienteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente || !peso || !cintura) return;

    setIsSubmitting(true);
    
    try {
      const numPeso = parseFloat(peso);
      const numPescoco = parseFloat(pescoco) || 0;
      const numCintura = parseFloat(cintura);
      const numQuadril = parseFloat(quadril) || 0;
      
      const idade = calculateIdade(cliente.data_nascimento);
      
      // Avaliação Raw
      const avaliacaoId = uuidv4();
      const novaAvaliacao = {
        id: avaliacaoId,
        cliente_id: clienteId,
        data_avaliacao: new Date(),
        peso_kg: numPeso,
        medidas: {
          pescoco: numPescoco,
          cintura: numCintura,
          quadril: numQuadril,
          abdomen: parseFloat(abdomen) || 0,
          braco: parseFloat(braco) || 0,
          coxa: parseFloat(coxa) || 0,
          panturrilha: parseFloat(panturrilha) || 0,
        }
      };

      // Cálculos em Snapshot
      const calculos = {
        imc: calculateIMC(numPeso, cliente.altura_cm),
        rcq: calculateRCQ(numCintura, numQuadril),
        rcEst: calculateRCEst(numCintura, cliente.altura_cm),
        bfNavy: calculateUSNavyBF(cliente.sexo, cliente.altura_cm, numPescoco, numCintura, numQuadril),
        bfRfm: calculateRFM(cliente.sexo, cliente.altura_cm, numCintura),
        bfDeurenberg: calculateDeurenbergBF(cliente.sexo, numPeso, cliente.altura_cm, idade),
        lbmBoer: calculateBoerLBM(cliente.sexo, numPeso, cliente.altura_cm)
      };

      const novoResultado = {
        id: uuidv4(),
        avaliacao_id: avaliacaoId,
        calculos
      };

      // Inserção Transacional Segura
      await db.transaction('rw', db.avaliacoes, db.resultados, async () => {
        await db.avaliacoes.add(novaAvaliacao);
        await db.resultados.add(novoResultado);
      });

      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cliente) return <div className="p-4 text-center">Carregando dados...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 p-4 pb-24">
      <div className="flex items-center mb-6 gap-3">
        <button 
          onClick={onCancel}
          className="p-3 bg-white border border-slate-200 rounded-full text-slate-600 active:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-semibold text-slate-800">Nova Avaliação</h1>
      </div>

      <div className="w-full bg-white border border-slate-100 rounded-3xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Activity size={24} />
          </div>
          <div>
            <h2 className="font-medium text-slate-800">{cliente.nome}</h2>
            <p className="text-sm text-slate-500">Insira as medidas atuais</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="Peso (kg)" value={peso} onChange={setPeso} required />
            <InputGroup label="Pescoço (cm)" value={pescoco} onChange={setPescoco} />
            <InputGroup label="Cintura (cm)" value={cintura} onChange={setCintura} required />
            <InputGroup label="Quadril (cm)" value={quadril} onChange={setQuadril} />
            <InputGroup label="Abdômen (cm)" value={abdomen} onChange={setAbdomen} />
            <InputGroup label="Braço (cm)" value={braco} onChange={setBraco} />
            <InputGroup label="Coxa (cm)" value={coxa} onChange={setCoxa} />
            <InputGroup label="Panturrilha (cm)" value={panturrilha} onChange={setPanturrilha} />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !peso || !cintura}
            className="w-full h-14 mt-4 font-medium text-white bg-indigo-600 rounded-2xl shadow-sm hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Processando Cálculos...' : 'Calcular Resultados'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Subcomponente para manter consistência nos inputs numéricos com alvo de toque (48px)
function InputGroup({ 
  label, 
  value, 
  onChange, 
  required = false 
}: { 
  label: string; 
  value: string; 
  onChange: (val: string) => void;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700 ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="number"
        inputMode="decimal"
        pattern="[0-9]*"
        step="0.1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder="0.0"
        className="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
      />
    </div>
  );
}
