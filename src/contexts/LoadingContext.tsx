import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

interface LoadingContextType {
  isLoading: boolean;
  showLoading: (slow?: boolean) => void;
  hideLoading: () => void;
  setIsLoading: (v: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// Páginas que carregam dados mais pesados – avisa o utilizador
const HEAVY_ROUTES = ['/equipe', '/detalhes', '/recarregar', '/retirar', '/reproducao'];

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSlow, setIsSlow] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 4000);
  };

  const showLoading = (slow = false) => {
    setIsSlow(slow);
    setIsLoading(true);

    if (timerRef.current) clearTimeout(timerRef.current);

    // Timeout global de 20s
    timerRef.current = setTimeout(() => {
      setIsLoading(false);
      showError('O servidor demorou muito a responder. Verifique a sua conexão de internet e tente de novo.');
    }, 20000);
  };

  const hideLoading = () => {
    setIsLoading(false);
    setIsSlow(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleSetIsLoading = (v: boolean) => {
    if (v) showLoading(false);
    else hideLoading();
  };

  // Monitor Global de Conexão à Internet
  useEffect(() => {
    const handleOffline = () => {
      hideLoading();
      showError('Aviso: Sem conexão com a internet. Por favor, verifique a sua rede.');
    };

    const handleOnline = () => {
      showError('Conexão com a internet restabelecida! ✅');
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading, setIsLoading: handleSetIsLoading }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/5 backdrop-blur-[1px]">
          <div className="spinner spinner-dark !w-7 !h-7 !border-[3px]"></div>
        </div>
      )}

      {/* Global Toast Error / Warnings */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
            className="fixed top-1/2 left-1/2 bg-black/85 text-white px-6 py-4 rounded-xl text-[12.5px] font-medium shadow-2xl z-[10000] text-center min-w-[280px] leading-relaxed"
          >
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export const RouteTransitionLoader = () => {
  const location = useLocation();
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    const isHeavy = HEAVY_ROUTES.includes(location.pathname);
    showLoading(isHeavy);
    const timer = setTimeout(() => {
      hideLoading();
    }, isHeavy ? 600 : 350);

    return () => {
      clearTimeout(timer);
      hideLoading();
    };
  }, [location.pathname]);

  return null;
};
