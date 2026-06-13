import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './slices';
import { authApi } from '../features/auth/authApi';
import { superAdminApi } from '../features/super-admin/superAdminApi';
import { hospitalAdminApi } from '../features/hospital-admin/hospitalAdminApi';
import { patientApi } from '../features/patients/api/patientApi';
import { doctorApi } from '../features/doctors/api/doctorApi';
import { staffApi } from '../features/staff/api/staffApi';
import { ehrApi } from '../features/ehr/api/ehrApi';
import { pharmacyApi } from '../features/pharmacy/api/pharmacyApi';
import { labApi } from '../features/lab/api/labApi';
import { billingApi } from '../features/billing/api/billingApi';
import { emergencyApi } from '../features/emergency/api/emergencyApi';
import { icuApi } from '../features/icu/api/icuApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [superAdminApi.reducerPath]: superAdminApi.reducer,
    [hospitalAdminApi.reducerPath]: hospitalAdminApi.reducer,
    [patientApi.reducerPath]: patientApi.reducer,
    [doctorApi.reducerPath]: doctorApi.reducer,
    [staffApi.reducerPath]: staffApi.reducer,
    [ehrApi.reducerPath]: ehrApi.reducer,
    [pharmacyApi.reducerPath]: pharmacyApi.reducer,
    [labApi.reducerPath]: labApi.reducer,
    [billingApi.reducerPath]: billingApi.reducer,
    [emergencyApi.reducerPath]: emergencyApi.reducer,
    [icuApi.reducerPath]: icuApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware, 
      superAdminApi.middleware, 
      hospitalAdminApi.middleware,
      patientApi.middleware,
      doctorApi.middleware,
      staffApi.middleware,
      ehrApi.middleware,
      pharmacyApi.middleware,
      labApi.middleware,
      billingApi.middleware,
      emergencyApi.middleware,
      icuApi.middleware
    ),
  devTools: import.meta.env.MODE !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
