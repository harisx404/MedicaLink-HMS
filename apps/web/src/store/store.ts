import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './slices';
import { authApi } from '../features/auth/authApi';
import { superAdminApi } from '../features/super-admin/superAdminApi';
import { hospitalAdminApi } from '../features/hospital-admin/hospitalAdminApi';
import { patientApi } from '../features/patients/api/patientApi';
import { doctorApi } from '../features/doctors/api/doctorApi';
import { staffApi } from '../features/staff/api/staffApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [superAdminApi.reducerPath]: superAdminApi.reducer,
    [hospitalAdminApi.reducerPath]: hospitalAdminApi.reducer,
    [patientApi.reducerPath]: patientApi.reducer,
    [doctorApi.reducerPath]: doctorApi.reducer,
    [staffApi.reducerPath]: staffApi.reducer,
    // Other reducers will be added here (e.g. ui, patient, etc.)
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware, 
      superAdminApi.middleware, 
      hospitalAdminApi.middleware,
      patientApi.middleware,
      doctorApi.middleware,
      staffApi.middleware
    ),
  devTools: import.meta.env.MODE !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
