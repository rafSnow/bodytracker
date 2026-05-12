import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { parseCSVForImport, importCSVCheckins } from '../../lib/importCsv';
import { CheckIn } from '../../types/checkin';
import { db } from '../../db/database';
import { Upload, AlertTriangle, ArrowRight } from 'lucide-react';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

const CHECKIN_FIELDS: { label: string; value: keyof CheckIn }[] = [
  { label: 'Data', value: 'date' },
  { label: 'Peso (kg)', value: 'weightKg' },
  { label: 'Cintura (cm)', value: 'waistCm' },
  { label: 'Pescoço (cm)', value: 'neckCm' },
  { label: 'Quadril (cm)', value: 'hipCm' },
  { label: 'Notas', value: 'notes' },
];

export const CSVImportModal: React.FC<CSVImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [csvInfo, setCsvInfo] = useState<{ headers: string[]; preview: Record<string, string>[]; rowCount: number } | null>(null);
  const [mapping, setMapping] = useState<Record<string, keyof CheckIn>>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      try {
        const info = await parseCSVForImport(selectedFile);
        setFile(selectedFile);
        setCsvInfo(info);
        
        // Auto-detect mapping
        const initialMapping: Record<string, keyof CheckIn> = {};
        info.headers.forEach(header => {
          const lower = header.toLowerCase();
          if (lower.includes('data')) initialMapping[header] = 'date';
          else if (lower.includes('peso')) initialMapping[header] = 'weightKg';
          else if (lower.includes('cintura')) initialMapping[header] = 'waistCm';
          else if (lower.includes('pescoço') || lower.includes('pescoco')) initialMapping[header] = 'neckCm';
          else if (lower.includes('quadril')) initialMapping[header] = 'hipCm';
          else if (lower.includes('notas')) initialMapping[header] = 'notes';
        });
        setMapping(initialMapping);
        setStep(2);
      } catch (err) {
        alert('Erro ao processar CSV');
      }
    }
  };

  const handleMappingChange = (header: string, field: keyof CheckIn | '') => {
    const newMapping = { ...mapping };
    if (field === '') {
      delete newMapping[header];
    } else {
      newMapping[header] = field;
    }
    setMapping(newMapping);
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const result = await importCSVCheckins(file, mapping, db);
      if (result.errors.length > 0) {
        setErrors(result.errors);
        setStep(4);
      } else {
        onSuccess(result.imported);
        reset();
        onClose();
      }
    } catch (err: any) {
      setErrors([err.message || 'Erro desconhecido']);
      setStep(4);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setFile(null);
    setCsvInfo(null);
    setMapping({});
    setErrors([]);
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { reset(); onClose(); }} title="Importar CSV">
      <div className="space-y-6">
        {step === 1 && (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center">
            <Upload className="text-slate-400 mb-4" size={48} />
            <p className="text-slate-600 dark:text-slate-400 mb-6">Selecione um arquivo CSV para importar check-ins</p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload">
              <Button type="button" onClick={() => document.getElementById('csv-upload')?.click()}>
                Selecionar Arquivo
              </Button>
            </label>
          </div>
        )}

        {step === 2 && csvInfo && (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">Mapear Colunas</h3>
            <p className="text-sm text-slate-500">Relacione as colunas do seu arquivo com os campos do app.</p>
            
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {csvInfo.headers.map(header => (
                <div key={header} className="flex items-center gap-3">
                  <div className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                    {header}
                  </div>
                  <ArrowRight size={16} className="text-slate-400" />
                  <select
                    value={mapping[header] || ''}
                    onChange={(e) => handleMappingChange(header, e.target.value as keyof CheckIn | '')}
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-sm"
                  >
                    <option value="">Ignorar</option>
                    {CHECKIN_FIELDS.map(f => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="pt-4 flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setStep(1)}>Voltar</Button>
              <Button fullWidth onClick={() => setStep(3)}>Preview</Button>
            </div>
          </div>
        )}

        {step === 3 && csvInfo && (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">Preview (5 primeiras linhas)</h3>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500">
                  <tr>
                    {csvInfo.headers.map(h => (
                      <th key={h} className="px-3 py-2 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {csvInfo.preview.map((row, i) => (
                    <tr key={i}>
                      {csvInfo.headers.map(h => (
                        <td key={h} className="px-3 py-2 truncate max-w-[100px]">{row[h]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-slate-500">Total de registros: {csvInfo.rowCount}</p>
            
            <div className="pt-4 flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setStep(2)}>Voltar</Button>
              <Button fullWidth isLoading={loading} onClick={handleImport}>Confirmar Importação</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="flex flex-col items-center text-center">
              <AlertTriangle className="text-amber-500 mb-2" size={48} />
              <h3 className="font-bold text-slate-900 dark:text-white">Importação Concluída com Alertas</h3>
              <p className="text-sm text-slate-500 mt-2">
                Algumas linhas não puderam ser importadas.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl max-h-48 overflow-y-auto">
              <ul className="text-xs text-red-500 space-y-1">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>

            <Button fullWidth onClick={() => { reset(); onClose(); }}>Fechar</Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
