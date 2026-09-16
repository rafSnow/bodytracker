import { useState, useRef } from 'react';
import { db } from '../db/db';
import { DownloadCloud, UploadCloud, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function DataBackupManager() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportData = async () => {
    setIsExporting(true);
    setMessage(null);
    try {
      // Coleta todos os dados de forma concorrente
      const [profissionais, clientes, avaliacoes, resultados] = await Promise.all([
        db.profissionais.toArray(),
        db.clientes.toArray(),
        db.avaliacoes.toArray(),
        db.resultados.toArray(),
      ]);

      const backupData = {
        version: 1,
        timestamp: new Date().toISOString(),
        data: { profissionais, clientes, avaliacoes, resultados }
      };

      const blob = new Blob([JSON.stringify(backupData)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-composicao-corporal-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      setMessage({ text: 'Backup exportado com sucesso!', type: 'success' });
    } catch (error) {
      console.error('Erro ao exportar:', error);
      setMessage({ text: 'Falha ao exportar os dados.', type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setMessage(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonContent = event.target?.result as string;
        const parsed = JSON.parse(jsonContent);

        // Validação estrutural básica
        if (!parsed.version || !parsed.data || !parsed.data.profissionais) {
          throw new Error('Formato de backup inválido.');
        }

        const { profissionais, clientes, avaliacoes, resultados } = parsed.data;

        // Transação para restaurar tudo atomicamente
        await db.transaction('rw', db.profissionais, db.clientes, db.avaliacoes, db.resultados, async () => {
          await db.profissionais.clear();
          await db.clientes.clear();
          await db.avaliacoes.clear();
          await db.resultados.clear();

          if (profissionais.length) await db.profissionais.bulkAdd(profissionais);
          if (clientes.length) await db.clientes.bulkAdd(clientes);
          if (avaliacoes.length) await db.avaliacoes.bulkAdd(avaliacoes);
          if (resultados.length) await db.resultados.bulkAdd(resultados);
        });

        setMessage({ text: 'Dados restaurados com sucesso!', type: 'success' });
        // Recarregar a página para o React pegar o novo contexto se necessário
        setTimeout(() => window.location.reload(), 2000);
      } catch (error) {
        console.error('Erro de importação:', error);
        setMessage({ text: 'Arquivo inválido ou corrompido.', type: 'error' });
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
      setMessage({ text: 'Erro na leitura do arquivo.', type: 'error' });
      setIsImporting(false);
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full bg-white border border-slate-100 rounded-3xl shadow-sm p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-slate-100 text-slate-700 rounded-2xl">
          <DownloadCloud size={24} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Backup e Restauração</h2>
          <p className="text-sm text-slate-500">Exporte seus dados para não perdê-los.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <button
          onClick={handleExportData}
          disabled={isExporting || isImporting}
          className="flex-1 flex items-center justify-center gap-2 h-14 bg-slate-800 text-white font-medium rounded-2xl hover:bg-slate-900 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <DownloadCloud size={20} />
          Exportar JSON
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isExporting || isImporting}
          className="flex-1 flex items-center justify-center gap-2 h-14 bg-white border border-slate-200 text-slate-700 font-medium rounded-2xl hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <UploadCloud size={20} />
          Importar JSON
        </button>
        <input 
          type="file" 
          accept=".json" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleImportFileChange} 
        />
      </div>

      {message && (
        <div className={`mt-4 p-4 rounded-2xl flex items-center gap-3 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}
    </div>
  );
}
