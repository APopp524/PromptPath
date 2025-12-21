import React, { createContext, useContext, useState, useCallback } from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';

interface ToastContextType {
  showToast: (message: string, isError?: boolean) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; isError: boolean; open: boolean }>>([]);

  const showToast = useCallback((message: string, isError = false) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, isError, open: true }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      <ToastPrimitive.Provider swipeDirection="right" duration={3000}>
        {children}
        {toasts.map((toast) => (
          <ToastPrimitive.Root
            key={toast.id}
            open={toast.open}
            onOpenChange={(open) => {
              if (!open) {
                removeToast(toast.id);
              }
            }}
            className="bg-white shadow-lg rounded-md border border-gray-200 px-4 py-3 max-w-sm pointer-events-auto"
          >
            <ToastPrimitive.Title className={`text-sm ${toast.isError ? 'text-red-700' : 'text-green-700'}`}>
              {toast.message}
            </ToastPrimitive.Title>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 w-full max-w-sm p-4" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
