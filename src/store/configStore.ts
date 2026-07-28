import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';
import { authSlice } from '@/features/auth/authSlice';
import { cartSlice } from '@/features/cart/cartSlice';
import { chatSlice } from '@/features/chat/chatSlice';
import { shippingSlice } from '@/features/shipping/shippingSlice';
import { injectStore } from '@/api/api';

const createNoopStorage = () => {
  return {
    getItem(key: string): Promise<null> {
      void key;
      return Promise.resolve(null);
    },
    setItem(key: string, value: string): Promise<string> {
      void key;
      return Promise.resolve(value);
    },
    removeItem(key: string): Promise<void> {
      void key;
      return Promise.resolve();
    },
  };
};

const storage = typeof window !== 'undefined' ? createWebStorage('local') : createNoopStorage();

export const rootReducer = combineReducers({
  auth: authSlice.reducer,
  cart: cartSlice.reducer,
  chat: chatSlice.reducer,
  shipping: shippingSlice.reducer,
});

const persistConfig = {
  key: 'root_ecommerce_v1',
  storage,
  whitelist: ['auth', 'cart'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
      },
    }),
});

injectStore(store);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
