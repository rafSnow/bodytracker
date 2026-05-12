import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckInRow } from './CheckInRow';
import { CheckIn } from '../../types/checkin';
import { useCheckins } from '../../hooks/useCheckins';
import { Skeleton } from '../ui/Skeleton';

interface CheckInTableProps {
  fromDate?: Date;
  toDate?: Date;
  onClick: (checkin: CheckIn) => void;
  onEdit: (checkin: CheckIn) => void;
  onDelete: (id: number) => void;
  onTotalCountChange?: (total: number) => void;
  hiddenIds?: number[];
}

const PAGE_SIZE = 20;

export const CheckInTable: React.FC<CheckInTableProps> = ({
  fromDate,
  toDate,
  onClick,
  onEdit,
  onDelete,
  onTotalCountChange,
  hiddenIds = [],
}) => {
  const { getPaginatedCheckins } = useCheckins();
  const [data, setData] = useState<CheckIn[]>([]);
  
  // ... rest of state

  // Filter data to hide items in hiddenIds
  const visibleData = data.filter(item => !item.id || !hiddenIds.includes(item.id));
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const loadData = async (reset = false) => {
    setLoading(true);
    try {
      const currentPage = reset ? 0 : page;
      const result = await getPaginatedCheckins(currentPage, PAGE_SIZE, fromDate, toDate);
      
      if (reset) {
        setData(result.data);
      } else {
        setData(prev => [...prev, ...result.data]);
      }
      
      setHasMore(result.hasMore);
      onTotalCountChange?.(result.total);
    } catch (error) {
      console.error('Failed to load paginated check-ins', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setData([]);
    setPage(0);
    setHasMore(true);
    loadData(true);
  }, [fromDate, toDate]);

  useEffect(() => {
    if (page > 0) {
      loadData();
    }
  }, [page]);

  if (!loading && data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <p className="text-slate-500 dark:text-slate-400">
          Nenhum registro encontrado para este período.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Table Header */}
      <div className="sticky top-0 z-20 bg-slate-50 dark:bg-slate-950 px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <div className="min-w-[3rem] pr-4">Data</div>
        <div className="flex-1 grid grid-cols-4 gap-2">
          <span>Peso</span>
          <span>%G</span>
          <span>IMC</span>
          <span>Cint.</span>
        </div>
        <div className="w-5" /> {/* Arrow space */}
      </div>

      <div className="flex flex-col">
        {visibleData.map((checkin, index) => (
          <div key={checkin.id || index} ref={index === visibleData.length - 1 ? lastElementRef : null}>
            <CheckInRow
              checkin={checkin}
              onClick={onClick}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        ))}

        {loading && (
          <div className="flex flex-col">
            {[1, 2, 3].map(i => (
              <div key={i} className="px-4 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1 grid grid-cols-4 gap-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
