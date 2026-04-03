import React, { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface LoadingContextType {
  isLoading: boolean;
  showLoading: (slow?: boolean) => void;
  hideLoading: () => void;
  setIsLoading: (v: boolean) => void;
  /** Register a pending data fetch. Returns a done() callback to call when fetch completes. */
  registerFetch: () => () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// Páginas que carregam dados mais pesados – avisa o utilizador
const HEAVY_ROUTES = ['/equipe', '/detalhes', '/recarregar', '/retirar', '/reproducao'];

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoadingState] = useState(false);
  const [isSlow, setIsSlow] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Counter of active (pending) data fetches registered via registerFetch()
  const pendingFetchesRef = useRef(0);
  // Whether loading was triggered by showLoading() explicitly
  const isExplicitRef = useRef(false);

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 4000);
  };

  const showLoading = useCallback((slow = false) => {
    setIsSlow(slow);
    setIsLoadingState(true);
    isExplicitRef.current = true;

    if (timerRef.current) clearTimeout(timerRef.current);

    // Timeout global de 20s
    timerRef.current = setTimeout(() => {
      setIsLoadingState(false);
      isExplicitRef.current = false;
      showError('Sem conecção. Verifique a internet e tente novamente');
    }, 20000);
  }, []);

  const hideLoading = useCallback(() => {
    // Only hide if there are no pending fetches
    if (pendingFetchesRef.current > 0) return;
    setIsLoadingState(false);
    setIsSlow(false);
    isExplicitRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  /**
   * Register a pending async fetch.
   * Returns a `done` function to call when the fetch is complete.
   * Loading will only stop once ALL registered fetches are done.
   */
  const registerFetch = useCallback((): (() => void) => {
    pendingFetchesRef.current += 1;
    // Show loading immediately, ensuring spinner is visible
    setIsLoadingState(true);

    let released = false;
    const done = () => {
      if (released) return;
      released = true;
      pendingFetchesRef.current = Math.max(0, pendingFetchesRef.current - 1);
      if (pendingFetchesRef.current === 0) {
        // All fetches done – hide loading (and clear timeout if any)
        setIsLoadingState(false);
        setIsSlow(false);
        if (timerRef.current) clearTimeout(timerRef.current);
        isExplicitRef.current = false;
      }
    };

    // Safety timeout for this specific fetch (15s max)
    const safetyTimer = setTimeout(() => {
      done();
    }, 15000);

    return () => {
      clearTimeout(safetyTimer);
      done();
    };
  }, []);

  const handleSetIsLoading = useCallback((v: boolean) => {
    if (v) showLoading(false);
    else hideLoading();
  }, [showLoading, hideLoading]);

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
  }, [hideLoading]);

  return (
    <LoadingContext.Provider value={{ isLoading: isLoading, showLoading, hideLoading, setIsLoading: handleSetIsLoading, registerFetch }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/5 backdrop-blur-[1px]">
          <div className="spinner spinner-dark !w-7 !h-7 !border-[3px]"></div>
          {isSlow && (
            <p className="mt-3 text-[11px] text-gray-500 font-serif text-center px-6 leading-relaxed">
              este conteúdo pode demorar alguns segundos a carregar...
            </p>
          )}
        </div>
      )}

      {/* Global Toast Error / Warnings */}
      {errorMessage && (
        <div className="fixed inset-0 pointer-events-none z-[10000] flex items-center justify-center p-4">
          <div className="bg-black/80 backdrop-blur-sm text-white px-5 py-3 rounded-2xl text-[12.5px] shadow-xl text-center max-w-[85vw] whitespace-normal break-words leading-relaxed pointer-events-auto fade-in">
            {errorMessage}
          </div>
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
  const { registerFetch } = useLoading();

  useEffect(() => {
    const isHeavy = HEAVY_ROUTES.some(r => location.pathname.startsWith(r));
    const done = registerFetch();
    // Give the page a short grace period
    const timer = setTimeout(() => {
      done();
    }, isHeavy ? 500 : 250);

    return () => {
      clearTimeout(timer);
      done();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return null;
};
