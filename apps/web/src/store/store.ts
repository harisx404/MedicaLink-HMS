import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './slices';
import { authApi } from '../features/auth/authApi';
import { superAdminApi } from '../features/super-admin/superAdminApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [superAdminApi.reducerPath]: superAdminApi.reducer,
    // Other reducers will be added here (e.g. ui, patient, etc.)
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, superAdminApi.middleware),
  devTools: import.meta.env.MODE !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
