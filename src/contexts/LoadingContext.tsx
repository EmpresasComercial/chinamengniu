import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

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

  const showLoading = (slow = false) => {
    setIsSlow(slow);
    setIsLoading(true);
  };
  const hideLoading = () => {
    setIsLoading(false);
    setIsSlow(false);
  };

  return (
    <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading, setIsLoading }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/5 backdrop-blur-[1px]">
          <div className="spinner spinner-dark !w-7 !h-7 !border-[3px]"></div>
        </div>
      )}
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
