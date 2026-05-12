import React, { useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { ProfileForm } from '../components/onboarding/ProfileForm';
import { useProfile } from '../hooks/useProfile';
import { useTheme } from '../hooks/useTheme';
import { useCheckins } from '../hooks/useCheckins';
import { Button } from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';
import { db } from '../db/database';
import { 
  Moon, 
  Sun, 
  Download, 
  Upload, 
  FileJson, 
  FileSpreadsheet, 
  FileText,
  Database,
  Smartphone
} from 'lucide-react';
import { exportAllCheckinsToCSV } from '../lib/exportCsv';
import { exportBackupJSON, importBackupJSON } from '../lib/exportJson';
import { CSVImportModal } from '../components/settings/CSVImportModal';
import { PDFPeriodModal } from '../components/settings/PDFPeriodModal';
import { usePWA } from '../hooks/usePWA';

export const SettingsPage: React.FC = () => {
  const { profile, updateProfile } = useProfile();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useAppContext();
  const { checkins } = useCheckins();
  const { isInstallable, isInstalled, install } = usePWA();

  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge');

  const handleUpdateProfile = async (data: any) => {
    try {
      await updateProfile(data);
      showToast('Perfil atualizado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao atualizar perfil', error);
      showToast('Erro ao atualizar perfil.', 'danger');
    }
  };

  const handleExportCSV = async () => {
    if (!profile || checkins.length === 0) {
      showToast('Não há dados para exportar.', 'warning');
      return;
    }
    try {
      await exportAllCheckinsToCSV(checkins, profile);
      showToast('CSV exportado com sucesso!', 'success');
    } catch (err) {
      showToast('Erro ao exportar CSV.', 'danger');
    }
  };

  const handleExportJSON = async () => {
    try {
      await exportBackupJSON(db);
      showToast('Backup JSON exportado com sucesso!', 'success');
    } catch (err) {
      showToast('Erro ao exportar backup JSON.', 'danger');
    }
  };

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmMsg = importMode === 'replace' 
      ? 'Atenção: Todos os dados atuais serão APAGADOS e substituídos pelo backup. Continuar?'
      : 'Os dados do backup serão adicionados aos atuais. Continuar?';

    if (!window.confirm(confirmMsg)) return;

    try {
      const result = await importBackupJSON(file, db, importMode);
      showToast(`${result.imported} registros importados com sucesso!`, 'success');
      // Refresh app
      window.location.reload();
    } catch (err) {
      showToast('Erro ao importar backup JSON.', 'danger');
    }
  };

  return (
    <MainLayout title="Configurações">
      <div className="space-y-8 mt-4 pb-20">
        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Seu Perfil</h2>
          <div className="bg-card dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            {profile ? (
              <ProfileForm 
                initialValues={profile} 
                onSubmit={handleUpdateProfile} 
                submitLabel="Atualizar Perfil" 
              />
            ) : (
              <p className="text-slate-500">Carregando perfil...</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Aparência</h2>
          <div className="bg-card dark:bg-card-dark rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Modo Escuro</h3>
              <p className="text-sm text-slate-500">Alternar tema do aplicativo</p>
            </div>
            <Button variant="ghost" onClick={toggleTheme} className="w-12 h-12 rounded-full p-0 flex justify-center items-center">
              {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
            </Button>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="text-indigo-500" size={24} />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Aplicativo</h2>
          </div>
          <div className="bg-card dark:bg-card-dark rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Instalar App</h3>
                <p className="text-sm text-slate-500">
                  {isInstalled 
                    ? 'O aplicativo já está instalado no seu dispositivo.' 
                    : 'Acesse rapidamente da sua tela de início.'}
                </p>
              </div>
              {isInstalled && (
                <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">
                  INSTALADO
                </div>
              )}
            </div>
            
            {!isInstalled && (
              <Button 
                fullWidth 
                onClick={install} 
                disabled={!isInstallable}
                variant={isInstallable ? 'primary' : 'secondary'}
              >
                {isInstallable ? 'Baixar Body Tracker' : 'Instalação não disponível'}
              </Button>
            )}
            
            {!isInstalled && !isInstallable && (
              <p className="text-[10px] text-slate-400 mt-2 text-center">
                Se o botão não estiver disponível, use a opção "Adicionar à tela de início" do seu navegador.
              </p>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Download className="text-indigo-500" size={24} />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Exportar Dados</h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <Button variant="secondary" className="justify-start gap-3 h-auto py-4" onClick={handleExportCSV}>
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg text-emerald-600 dark:text-emerald-400">
                <FileSpreadsheet size={20} />
              </div>
              <div className="text-left">
                <div className="font-semibold">Exportar CSV</div>
                <div className="text-xs text-slate-500">Planilha com todas as métricas</div>
              </div>
            </Button>

            <Button variant="secondary" className="justify-start gap-3 h-auto py-4" onClick={handleExportJSON}>
              <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg text-amber-600 dark:text-amber-400">
                <FileJson size={20} />
              </div>
              <div className="text-left">
                <div className="font-semibold">Exportar JSON</div>
                <div className="text-xs text-slate-500">Backup completo dos dados</div>
              </div>
            </Button>

            <Button variant="secondary" className="justify-start gap-3 h-auto py-4" onClick={() => setIsPdfModalOpen(true)}>
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg text-red-600 dark:text-red-400">
                <FileText size={20} />
              </div>
              <div className="text-left">
                <div className="font-semibold">Gerar Relatório PDF</div>
                <div className="text-xs text-slate-500">Resumo visual de progresso</div>
              </div>
            </Button>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Upload className="text-indigo-500" size={24} />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Importar Dados</h2>
          </div>
          <div className="bg-card dark:bg-card-dark rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-emerald-500" />
                Importar de Planilha (CSV)
              </h3>
              <p className="text-sm text-slate-500">Use esta opção para trazer dados de outros aplicativos ou planilhas manuais.</p>
              <Button fullWidth onClick={() => setIsCsvImportOpen(true)}>Iniciar Importação CSV</Button>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Database size={18} className="text-amber-500" />
                Restaurar Backup (JSON)
              </h3>
              
              <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg">
                <button 
                  onClick={() => setImportMode('merge')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${importMode === 'merge' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600' : 'text-slate-500'}`}
                >
                  Mesclar Dados
                </button>
                <button 
                  onClick={() => setImportMode('replace')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${importMode === 'replace' ? 'bg-white dark:bg-slate-800 shadow-sm text-red-600' : 'text-slate-500'}`}
                >
                  Substituir Tudo
                </button>
              </div>

              <input
                type="file"
                accept=".json"
                id="json-import"
                className="hidden"
                onChange={handleImportJSON}
              />
              <Button variant="secondary" fullWidth onClick={() => document.getElementById('json-import')?.click()}>
                Selecionar Backup JSON
              </Button>
            </div>
          </div>
        </section>

        <section className="text-center pt-8 pb-4">
          <p className="text-sm text-slate-400">
            Body Tracker v{import.meta.env.VITE_APP_VERSION || '1.0.0'}
          </p>
        </section>
      </div>

      <CSVImportModal 
        isOpen={isCsvImportOpen} 
        onClose={() => setIsCsvImportOpen(false)} 
        onSuccess={(count) => showToast(`${count} registros importados!`, 'success')}
      />

      <PDFPeriodModal 
        isOpen={isPdfModalOpen} 
        onClose={() => setIsPdfModalOpen(false)} 
      />
    </MainLayout>
  );
};
