import { useState, useEffect, useCallback } from 'react';

export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const [startY, setStartY] = useState(0);

  const handleTouchStart = (e: TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].pageY);
    }
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (startY === 0 || window.scrollY > 0 || isRefreshing) return;

    const currentY = e.touches[0].pageY;
    const diff = currentY - startY;

    if (diff > 0) {
      const progress = Math.min(diff / 150, 1);
      setPullProgress(progress);
      if (progress > 0.1 && e.cancelable) {
        e.preventDefault();
      }
    }
  }, [startY, isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (pullProgress > 0.8 && !isRefreshing) {
      setIsRefreshing(true);
      await onRefresh();
      // Artificial delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsRefreshing(false);
    }
    setPullProgress(0);
    setStartY(0);
  }, [pullProgress, isRefreshing, onRefresh]);

  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchMove, handleTouchEnd]);

  return { isRefreshing, pullProgress };
}
