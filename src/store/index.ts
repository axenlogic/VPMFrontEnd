import { configureStore } from '@reduxjs/toolkit';
import intakeReducer from './slices/intakeSlice';
// Future slices can be added here:
// import dashboardReducer from './slices/dashboardSlice';
// import adminReducer from './slices/adminSlice';

/**
 * Redux Store Configuration
 * 
 * This is the central store for the application. As new modules are added,
 * their slices should be imported and added to the store configuration.
 * 
 * Architecture:
 * - Each feature/module has its own slice
 * - Slices are organized by domain (intake, dashboard, admin, etc.)
 * - Middleware is configured for async operations and error handling
 */
export const store = configureStore({
  reducer: {
    intake: intakeReducer,
    // Future reducers:
    // dashboard: dashboardReducer,
    // admin: adminReducer,
    // auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for file uploads
        ignoredActions: ['intake/submitForm/pending', 'intake/submitForm/fulfilled'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.insurance_information.insurance_card_front', 'payload.insurance_information.insurance_card_back'],
        // Ignore these paths in the state
        ignoredPaths: ['intake.formData.insurance_information.insurance_card_front', 'intake.formData.insurance_information.insurance_card_back'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

