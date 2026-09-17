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
import { ArrowLeft, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

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

      toast.success('Avaliação salva com sucesso!');
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      toast.error('Erro ao salvar avaliação');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cliente) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-[#F2F2F7] animate-pulse">
        <div className="sticky top-0 z-30 bg-[#F2F2F7]/80 backdrop-blur-xl border-b border-slate-200/50">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="w-8 h-8 bg-slate-200 rounded-full" />
            <div className="w-32 h-6 bg-slate-200 rounded-md" />
            <div className="w-8 h-8 bg-transparent" />
          </div>
        </div>
        <div className="px-4 py-6 flex flex-col gap-6">
          <div className="bg-white rounded-[10px] border border-slate-200/60 p-4 h-48" />
          <div className="bg-white rounded-[10px] border border-slate-200/60 p-4 h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F2F2F7]">
      {/* HIG Header */}
      <div className="sticky top-0 z-10 bg-[#F2F2F7]/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="flex items-center justify-between px-4 h-14">
          <button 
            onClick={onCancel}
            className="flex items-center justify-center min-h-[44px] min-w-[44px] -ml-2 text-indigo-600 active:opacity-70 transition-opacity"
            aria-label="Voltar"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-[17px] font-semibold text-slate-900 truncate px-2">{cliente.nome.split(' ')[0]} - Nova Avaliação</h1>
          <div className="w-11"></div>
        </div>
      </div>

      <div className="p-4 pb-24">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Medidas Corporais */}
          <div>
            <h2 className="text-[13px] font-medium text-slate-500 uppercase tracking-wider ml-4 mb-2">Medidas Corporais</h2>
            <div className="bg-white rounded-[10px] overflow-hidden shadow-sm border border-slate-200/60 divide-y divide-slate-100">
              <InputRow label="Peso" value={peso} onChange={setPeso} required unit="kg" />
              <InputRow label="Pescoço" value={pescoco} onChange={setPescoco} unit="cm" />
              <InputRow label="Cintura" value={cintura} onChange={setCintura} required unit="cm" />
              <InputRow label="Quadril" value={quadril} onChange={setQuadril} unit="cm" />
              <InputRow label="Abdômen" value={abdomen} onChange={setAbdomen} unit="cm" />
              <InputRow label="Braço" value={braco} onChange={setBraco} unit="cm" />
              <InputRow label="Coxa" value={coxa} onChange={setCoxa} unit="cm" />
              <InputRow label="Panturrilha" value={panturrilha} onChange={setPanturrilha} unit="cm" />
            </div>
          </div>

          {/* Metabolismo e Metas */}
          <div>
            <h2 className="text-[13px] font-medium text-slate-500 uppercase tracking-wider ml-4 mb-2">Metabolismo e Metas</h2>
            <div className="bg-white rounded-[10px] overflow-hidden shadow-sm border border-slate-200/60 divide-y divide-slate-100">
              
              <div className="flex items-center min-h-[44px] px-4 py-2">
                <label className="text-[17px] text-slate-900 w-1/3 shrink-0">Atividade</label>
                <select
                  value={nivelAtividade}
                  onChange={(e) => setNivelAtividade(e.target.value)}
                  className="flex-1 w-full text-[17px] text-slate-900 text-right bg-transparent outline-none appearance-none pr-0"
                  dir="rtl"
                >
                  <option value="1.2">Sedentário (Pouco/Nenhum)</option>
                  <option value="1.375">Leve (1-3 dias/sem)</option>
                  <option value="1.55">Moderado (3-5 dias/sem)</option>
                  <option value="1.725">Muito (6-7 dias/sem)</option>
                  <option value="1.9">Extremo (Trabalho físico)</option>
                </select>
              </div>

              <div className="flex items-center min-h-[44px] px-4 py-2">
                <label className="text-[17px] text-slate-900 w-1/3 shrink-0">Objetivo</label>
                <select
                  value={objetivo}
                  onChange={(e) => setObjetivo(e.target.value as Objetivo)}
                  className="flex-1 w-full text-[17px] text-slate-900 text-right bg-transparent outline-none appearance-none pr-0"
                  dir="rtl"
                >
                  <option value="emagrecimento">Emagrecimento</option>
                  <option value="manutencao">Manutenção</option>
                  <option value="hipertrofia">Hipertrofia</option>
                </select>
              </div>

            </div>
          </div>

          {/* Galeria de Evolução */}
          <div>
            <div className="flex items-center gap-2 ml-4 mb-2">
              <Camera size={16} className="text-slate-500" />
              <h2 className="text-[13px] font-medium text-slate-500 uppercase tracking-wider">Galeria de Fotos (Opcional)</h2>
            </div>
            <div className="bg-white rounded-[10px] shadow-sm border border-slate-200/60 p-4">
              <div className="grid grid-cols-3 gap-3">
                <PhotoUploader label="Frente" photo={fotoFrente} onSelect={(e) => handlePhotoSelect(e, 'frente')} onClear={() => setFotoFrente(null)} />
                <PhotoUploader label="Lado" photo={fotoLado} onSelect={(e) => handlePhotoSelect(e, 'lado')} onClear={() => setFotoLado(null)} />
                <PhotoUploader label="Costas" photo={fotoCostas} onSelect={(e) => handlePhotoSelect(e, 'costas')} onClear={() => setFotoCostas(null)} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !peso || !cintura}
            className="w-full min-h-[50px] mt-2 font-semibold text-[17px] text-white bg-indigo-600 rounded-xl shadow-sm hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center"
          >
            {isSubmitting ? 'Calculando...' : 'Calcular Resultados'}
          </button>
        </form>
      </div>
    </div>
  );
}

function InputRow({ 
  label, 
  value, 
  onChange, 
  required = false,
  unit
}: { 
  label: string; 
  value: string; 
  onChange: (val: string) => void;
  required?: boolean;
  unit: string;
}) {
  return (
    <div className="flex items-center min-h-[44px] px-4 py-2">
      <label className="text-[17px] text-slate-900 w-1/3 shrink-0 flex items-center gap-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex-1 flex items-center justify-end gap-1">
        <input
          type="text"
          inputMode="decimal"
          pattern="[0-9.,]*"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.'))}
          required={required}
          placeholder="0.0"
          className="w-16 text-[17px] text-slate-900 text-right bg-transparent outline-none placeholder:text-slate-400"
        />
        <span className="text-[17px] text-slate-400">{unit}</span>
      </div>
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
