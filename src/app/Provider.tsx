'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/sonner';
import { useAuthPersistence } from '@/hooks/useAuthPersistence';
import { store, persistor } from '@/store/configStore';
import { TooltipProvider } from '@/components/ui/tooltip';
import { PermissionProvider } from '@/context/PermissionContext';
import { queryClient } from '@/lib/queryClient';

function AppInitializer({ children }: { children: React.ReactNode }) {
  useAuthPersistence();
  return <>{children}</>;
}

export const ReduxProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <TooltipProvider>
            <PermissionProvider>
              <AppInitializer>{children}</AppInitializer>
            </PermissionProvider>
          </TooltipProvider>
          <Toaster position="top-right" richColors />
        </PersistGate>
      </Provider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
