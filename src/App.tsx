import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from './context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy loading pages
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const NewCheckInPage = lazy(() => import('./pages/NewCheckInPage').then(module => ({ default: module.NewCheckInPage })));
const HistoryPage = lazy(() => import('./pages/HistoryPage').then(module => ({ default: module.HistoryPage })));
const ChartsPage = lazy(() => import('./pages/ChartsPage').then(module => ({ default: module.ChartsPage })));
const GalleryPage = lazy(() => import('./pages/GalleryPage').then(module => ({ default: module.GalleryPage })));
const GoalPage = lazy(() => import('./pages/GoalPage').then(module => ({ default: module.GoalPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(module => ({ default: module.SettingsPage })));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage').then(module => ({ default: module.OnboardingPage })));

const PageSkeleton = () => (
  <div className="flex flex-col h-screen bg-surface dark:bg-surface-dark">
    <div className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center px-4">
      <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
    </div>
    <div className="flex-1 p-4 space-y-4">
      <div className="h-32 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-24 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
        <div className="h-24 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
      </div>
    </div>
  </div>
);

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { profile, loading } = useAppContext();
  
  if (loading) return null;
  if (!profile) return <Navigate to="/onboarding" replace />;
  
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { profile, loading } = useAppContext();
  
  if (loading) return null;
  if (profile) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="h-full w-full"
      >
        <Suspense fallback={<PageSkeleton />}>
          <Routes location={location}>
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/onboarding" 
              element={
                <PublicRoute>
                  <OnboardingPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/checkin/new" 
              element={
                <PrivateRoute>
                  <NewCheckInPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/history" 
              element={
                <PrivateRoute>
                  <HistoryPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/charts" 
              element={
                <PrivateRoute>
                  <ChartsPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/gallery" 
              element={
                <PrivateRoute>
                  <GalleryPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/goal" 
              element={
                <PrivateRoute>
                  <GoalPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <PrivateRoute>
                  <SettingsPage />
                </PrivateRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
};

import { UpdateBanner } from './components/UpdateBanner';

function App() {
  const { loading } = useAppContext();

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-primary font-bold">Carregando...</div>
    </div>
  );

  return (
    <HashRouter>
      <AnimatedRoutes />
      <UpdateBanner />
    </HashRouter>
  );
}

export default App;
