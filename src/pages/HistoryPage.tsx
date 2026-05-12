import React, { useState, useRef } from 'react';
import { Filter, X, ChevronDown, ChevronUp, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MainLayout } from '../components/layout/MainLayout';
import { CheckInTable } from '../components/history/CheckInTable';
import { CheckIn } from '../types/checkin';
import { Modal } from '../components/ui/Modal';
import { CheckInDetail } from '../components/checkin/CheckInDetail';
import { CheckInForm } from '../components/checkin/CheckInForm';
import { useCheckins } from '../hooks/useCheckins';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import clsx from 'clsx';
import { usePullToRefresh } from '../hooks/usePullToRefresh';

export const HistoryPage: React.FC = () => {
  const { deleteCheckin, updateCheckin } = useCheckins();
  const { showToast } = useAppContext();
  
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [totalCount, setTotalCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { isRefreshing, pullProgress } = usePullToRefresh(async () => {
    setRefreshKey(prev => prev + 1);
  });
  
  const [selectedCheckin, setSelectedCheckin] = useState<CheckIn | null>(null);
  const [editingCheckin, setEditingCheckin] = useState<CheckIn | null>(null);
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [checkinToDelete, setCheckinToDelete] = useState<number | null>(null);
  const [hiddenIds, setHiddenIds] = useState<number[]>([]);
  const deleteTimerRef = useRef<NodeJS.Timeout | null>(null);

  const hasActiveFilters = fromDate !== '' || toDate !== '';

  const clearFilters = () => {
    setFromDate('');
    setToDate('');
  };

  const handleRowClick = (checkin: CheckIn) => {
    setSelectedCheckin(checkin);
    setShowDetailModal(true);
  };

  const handleEdit = (checkin: CheckIn) => {
    setEditingCheckin(checkin);
    setShowEditModal(true);
    setShowDetailModal(false);
  };

  const handleDeleteRequest = (id: number) => {
    setCheckinToDelete(id);
    setShowDeleteConfirm(true);
    setShowDetailModal(false);
  };

  const confirmDelete = async () => {
    if (checkinToDelete) {
      const id = checkinToDelete;
      setShowDeleteConfirm(false);
      setCheckinToDelete(null);

      setHiddenIds(prev => [...prev, id]);

      showToast('Registro excluído', 'success', {
        label: 'Desfazer',
        onClick: () => {
          if (deleteTimerRef.current) {
            clearTimeout(deleteTimerRef.current);
            deleteTimerRef.current = null;
          }
          setHiddenIds(prev => prev.filter(hid => hid !== id));
        }
      });

      deleteTimerRef.current = setTimeout(async () => {
        try {
          await deleteCheckin(id);
          deleteTimerRef.current = null;
          setRefreshKey(prev => prev + 1);
          setHiddenIds(prev => prev.filter(hid => hid !== id));
        } catch (error) {
          showToast('Erro ao excluir registro.', 'danger');
          setHiddenIds(prev => prev.filter(hid => hid !== id));
        }
      }, 3000);
    }
  };

  const handleUpdate = async (data: any) => {
    if (editingCheckin?.id) {
      try {
        await updateCheckin(editingCheckin.id, data);
        showToast('Registro atualizado com sucesso!', 'success');
        setShowEditModal(false);
        setEditingCheckin(null);
        setRefreshKey(prev => prev + 1);
      } catch (error) {
        showToast('Erro ao atualizar registro.', 'danger');
      }
    }
  };

  return (
    <MainLayout 
      title="Histórico"
      headerRightAction={
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={clsx(
            "relative p-2 rounded-full transition-colors",
            isFilterOpen ? "bg-primary text-white" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <Filter size={20} />
          {hasActiveFilters && (
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-danger border-2 border-white dark:border-slate-900 rounded-full" />
          )}
        </button>
      }
    >
      {/* Pull to Refresh Indicator */}
      <div 
        className="flex items-center justify-center overflow-hidden transition-all duration-300"
        style={{ height: isRefreshing ? 60 : pullProgress * 60, opacity: pullProgress > 0.1 || isRefreshing ? 1 : 0 }}
      >
        <div className={clsx(
          "bg-white dark:bg-slate-800 p-2 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 transition-transform",
          isRefreshing && "animate-spin"
        )}>
          <RefreshCcw size={20} className="text-primary" />
        </div>
      </div>

      <div className="space-y-4">
        {/* Collapsible Filters Area */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                    <Filter className="w-4 h-4 text-primary" />
                    <span>Filtrar Período</span>
                  </div>
                  {hasActiveFilters && (
                    <button 
                      onClick={clearFilters}
                      className="text-[10px] font-bold text-primary uppercase tracking-wider px-2 py-1 bg-primary/10 rounded-md"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">De</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Até</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            {hasActiveFilters ? 'Resultados Filtrados' : 'Todos os Registros'}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {totalCount} {totalCount === 1 ? 'registro' : 'registros'}
          </span>
        </div>

        {/* Table Content */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <CheckInTable
            key={refreshKey}
            fromDate={fromDate ? new Date(fromDate) : undefined}
            toDate={toDate ? new Date(toDate) : undefined}
            onClick={handleRowClick}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
            onTotalCountChange={setTotalCount}
            hiddenIds={hiddenIds}
          />
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detalhes do Registro"
        position="bottom"
      >
        {selectedCheckin && (
          <CheckInDetail
            checkin={selectedCheckin}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
          />
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Registro"
        position="bottom"
      >
        {editingCheckin && (
          <CheckInForm
            initialValues={editingCheckin}
            onSubmit={handleUpdate}
            isLoading={false}
          />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Excluir Registro"
      >
        <div className="space-y-4 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDelete}
              className="flex-1 py-3 rounded-xl font-bold text-white bg-danger transition-colors shadow-lg shadow-danger/20"
            >
              Excluir
            </button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};
