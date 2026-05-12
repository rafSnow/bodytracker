import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  withPadding?: boolean;
  withBottomNav?: boolean;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ 
  children, 
  className,
  withPadding = true,
  withBottomNav = true
}) => {
  return (
    <div className={twMerge(
      clsx(
        'w-full bg-surface dark:bg-surface-dark overflow-y-auto flex flex-col',
        className
      )
    )}>
      {/* Content Area */}
      <main className={twMerge(
        clsx(
          'flex-1',
          withPadding && 'px-4',
          className
        )
      )}>
        {children}
      </main>

      {/* Bottom Spacer: BottomNav Height + Safe Area */}
      <div className={clsx(
        'shrink-0',
        withBottomNav ? 'h-32' : 'h-10 safe-bottom'
      )} />
    </div>
  );
};
