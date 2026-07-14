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
import { otApi } from '../features/ot/api/otApi';
import { bloodBankApi } from '../features/bloodbank/api/bloodBankApi';
import { telemedicineApi } from '../features/telemedicine/api/telemedicineApi';
import { aiApi } from '../features/ai/api/aiApi';
import { analyticsApi } from '../features/analytics/api/analyticsApi';
import { hrApi } from '../features/hr/api/hrApi';
import { notificationApi } from '../features/notifications/api/notificationApi';
import { messageApi } from '../features/messages/api/messageApi';
import { nursingApi } from '../features/nursing/nursingApi';

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
    [otApi.reducerPath]: otApi.reducer,
    [bloodBankApi.reducerPath]: bloodBankApi.reducer,
    [telemedicineApi.reducerPath]: telemedicineApi.reducer,
    [aiApi.reducerPath]: aiApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
    [hrApi.reducerPath]: hrApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [messageApi.reducerPath]: messageApi.reducer,
    [nursingApi.reducerPath]: nursingApi.reducer,
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
      icuApi.middleware,
      otApi.middleware,
      bloodBankApi.middleware,
      telemedicineApi.middleware,
      aiApi.middleware,
      analyticsApi.middleware,
      hrApi.middleware,
      notificationApi.middleware,
      messageApi.middleware,
      nursingApi.middleware
    ),
  devTools: import.meta.env.MODE !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
