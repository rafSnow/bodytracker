import React, { useState } from 'react';
import { BottomNav } from './BottomNav';
import { FAB } from './FAB';
import { Header } from './Header';
import { PageWrapper } from './PageWrapper';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
  headerLeftAction?: React.ReactNode;
  headerRightAction?: React.ReactNode;
  showFAB?: boolean;
  showBottomNav?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  title,
  headerLeftAction,
  headerRightAction,
  showFAB = true,
  showBottomNav = true,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-surface dark:bg-surface-dark overflow-hidden">
      {/* Sidebar for Desktop */}
      {showBottomNav && (
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          setIsCollapsed={setIsSidebarCollapsed} 
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 relative">
        <Header 
          title={title} 
          leftAction={headerLeftAction}
          rightAction={headerRightAction} 
        />
        
        <PageWrapper withBottomNav={showBottomNav} className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </PageWrapper>

        {/* FAB and BottomNav for Mobile */}
        {showFAB && (
          <div className="md:hidden">
            <FAB />
          </div>
        )}
        
        {showBottomNav && (
          <div className="md:hidden">
            <BottomNav />
          </div>
        )}

        {/* Floating FAB for Desktop? 
            Usually on desktop we might prefer it inside the content or sidebar.
            The prompt says sidebar replaces BottomNav.
            I'll keep FAB only on mobile for now as per "substituir BottomNav por sidebar".
        */}
      </div>
    </div>
  );
};
