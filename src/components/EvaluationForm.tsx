import React, { useState, useEffect } from 'react';
import { db, type Cliente } from '../db/db';
import { v4 as uuidv4 } from 'uuid';
import { calculateIdade } from '../utils/dateUtils';
import { compressImage } from '../utils/imageUtils';
import { 
  calculateUSNavyBF,
  calculateRFM,
  calculateDeurenbergBF,
  calculateBoerLBM,
  calculateIMC,
  calculateRCQ,
  calculateRCEst,
  calculateKatchMcArdleBMR,
  calculateTDEE,
  calculateIBW,
  calculateMacrosAndGoals,
  calculateBAI,
  calculateBRI,
  calculateCI,
  type Objetivo
} from '../utils/calculator';
import { Activity, ArrowLeft, Camera } from 'lucide-react';

interface EvaluationFormProps {
  clienteId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EvaluationForm({ clienteId, onSuccess, onCancel }: EvaluationFormProps) {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  
  // States - Medidas
  const [peso, setPeso] = useState('');
  const [pescoco, setPescoco] = useState('');
  const [cintura, setCintura] = useState('');
  const [quadril, setQuadril] = useState('');
  const [abdomen, setAbdomen] = useState('');
  const [braco, setBraco] = useState('');
  const [coxa, setCoxa] = useState('');
  const [panturrilha, setPanturrilha] = useState('');
  const [nivelAtividade, setNivelAtividade] = useState('1.2'); // default: sedentário
  const [objetivo, setObjetivo] = useState<Objetivo>('manutencao');

  // States - Fotos
  const [fotoFrente, setFotoFrente] = useState<string | null>(null);
  const [fotoLado, setFotoLado] = useState<string | null>(null);
  const [fotoCostas, setFotoCostas] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    db.clientes.get(clienteId).then(data => {
      if (data) setCliente(data);
    });
  }, [clienteId]);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>, tipo: 'frente' | 'lado' | 'costas') => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImage(file, 800, 0.7);
      if (tipo === 'frente') setFotoFrente(base64);
      if (tipo === 'lado') setFotoLado(base64);
      if (tipo === 'costas') setFotoCostas(base64);
    } catch (err) {
      console.error('Erro ao comprimir foto:', err);
      alert('Erro ao carregar a imagem. Tente uma foto menor.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente) return;
    setIsSubmitting(true);

    try {
      const numPeso = parseFloat(peso);
      const numPescoco = parseFloat(pescoco) || 0;
      const numCintura = parseFloat(cintura);
      const numQuadril = parseFloat(quadril) || 0;
      const numNivelAtividade = parseFloat(nivelAtividade);
      
      const idade = calculateIdade(cliente.data_nascimento);
      
      // Avaliação Raw
      const avaliacaoId = uuidv4();
      const novaAvaliacao = {
        id: avaliacaoId,
        cliente_id: clienteId,
        data_avaliacao: new Date(),
        peso_kg: numPeso,
        nivel_atividade: numNivelAtividade,
        objetivo: objetivo,
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

      // Cálculos base
      const lbmBoer = calculateBoerLBM(cliente.sexo, numPeso, cliente.altura_cm);
      const bmrKatch = calculateKatchMcArdleBMR(lbmBoer);
      const tdee = calculateTDEE(bmrKatch, numNivelAtividade);

      // FASE 6: IBW e Metas
      const ibw = calculateIBW(cliente.sexo, cliente.altura_cm);
      const macrosAndGoals = calculateMacrosAndGoals(tdee, objetivo);

      // FASE 7: Índices Avançados
      const bai = calculateBAI(numQuadril, cliente.altura_cm);
      const bri = calculateBRI(numCintura, cliente.altura_cm);
      const ci = calculateCI(numCintura, numPeso, cliente.altura_cm);

      // Cálculos em Snapshot
      const calculos = {
        imc: calculateIMC(numPeso, cliente.altura_cm),
        rcq: calculateRCQ(numCintura, numQuadril),
        rcEst: calculateRCEst(numCintura, cliente.altura_cm),
        bfNavy: calculateUSNavyBF(cliente.sexo, cliente.altura_cm, numPescoco, numCintura, numQuadril),
        bfRfm: calculateRFM(cliente.sexo, cliente.altura_cm, numCintura),
        bfDeurenberg: calculateDeurenbergBF(cliente.sexo, numPeso, cliente.altura_cm, idade),
        lbmBoer,
        bmrKatch,
        tdee,
        ibw,
        macros: macrosAndGoals,
        bai,
        bri,
        ci
      };

      const novoResultado = {
        id: uuidv4(),
        avaliacao_id: avaliacaoId,
        calculos
      };

      const novasFotos: any[] = [];
      const dataAtual = new Date();
      if (fotoFrente) novasFotos.push({ id: uuidv4(), avaliacao_id: avaliacaoId, cliente_id: clienteId, tipo: 'frente', foto_base64: fotoFrente, criado_em: dataAtual });
      if (fotoLado) novasFotos.push({ id: uuidv4(), avaliacao_id: avaliacaoId, cliente_id: clienteId, tipo: 'lado', foto_base64: fotoLado, criado_em: dataAtual });
      if (fotoCostas) novasFotos.push({ id: uuidv4(), avaliacao_id: avaliacaoId, cliente_id: clienteId, tipo: 'costas', foto_base64: fotoCostas, criado_em: dataAtual });

      // Inserção Transacional Segura
      await db.transaction('rw', db.avaliacoes, db.resultados, db.fotos, async () => {
        await db.avaliacoes.add(novaAvaliacao);
        await db.resultados.add(novoResultado);
        if (novasFotos.length > 0) {
          await db.fotos.bulkAdd(novasFotos);
        }
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

          <div className="flex flex-col gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <h3 className="font-semibold text-slate-700 text-sm">Metabolismo e Metas</h3>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-600 ml-1">Nível de Atividade</label>
              <select
                value={nivelAtividade}
                onChange={(e) => setNivelAtividade(e.target.value)}
                className="w-full h-14 px-4 bg-white border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
              >
                <option value="1.2">Sedentário (Pouco ou nenhum exercício)</option>
                <option value="1.375">Levemente Ativo (Exercício leve 1-3 dias/sem)</option>
                <option value="1.55">Moderadamente Ativo (Exercício 3-5 dias/sem)</option>
                <option value="1.725">Muito Ativo (Exercício pesado 6-7 dias/sem)</option>
                <option value="1.9">Extremamente Ativo (Treino pesado, trabalho físico)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-600 ml-1">Objetivo Nutricional</label>
              <select
                value={objetivo}
                onChange={(e) => setObjetivo(e.target.value as Objetivo)}
                className="w-full h-14 px-4 bg-white border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
              >
                <option value="emagrecimento">Emagrecimento (-500 kcal)</option>
                <option value="manutencao">Manutenção (TDEE exato)</option>
                <option value="hipertrofia">Hipertrofia (+300 kcal)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <Camera size={18} className="text-slate-500" />
              <h3 className="font-semibold text-slate-700 text-sm">Galeria de Evolução (Opcional)</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <PhotoUploader label="Frente" photo={fotoFrente} onSelect={(e) => handlePhotoSelect(e, 'frente')} onClear={() => setFotoFrente(null)} />
              <PhotoUploader label="Lado" photo={fotoLado} onSelect={(e) => handlePhotoSelect(e, 'lado')} onClear={() => setFotoLado(null)} />
              <PhotoUploader label="Costas" photo={fotoCostas} onSelect={(e) => handlePhotoSelect(e, 'costas')} onClear={() => setFotoCostas(null)} />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !peso || !cintura}
            className="w-full h-14 mt-2 font-medium text-white bg-indigo-600 rounded-2xl shadow-sm hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Processando Cálculos...' : 'Calcular Resultados'}
          </button>
        </form>
      </div>
    </div>
  );
}

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
        type="text"
        inputMode="decimal"
        pattern="[0-9.,]*"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.'))}
        required={required}
        placeholder="0.0"
        className="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
      />
    </div>
  );
}

function PhotoUploader({ label, photo, onSelect, onClear }: { label: string, photo: string | null, onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void, onClear: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <div className="relative w-full aspect-[3/4] bg-white border-2 border-dashed border-slate-200 rounded-xl overflow-hidden flex items-center justify-center hover:border-indigo-400 transition-colors">
        {photo ? (
          <>
            <img src={photo} alt={label} className="w-full h-full object-cover" />
            <button 
              type="button" 
              onClick={onClear}
              className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
            >
              <span className="text-xs font-semibold">Remover</span>
            </button>
          </>
        ) : (
          <>
            <input type="file" accept="image/*" onChange={onSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <Camera size={24} className="text-slate-300" />
          </>
        )}
      </div>
    </div>
  );
}
