import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import meetingReducer from '../features/meeting/meetingSlice';
import rtcReducer from '../features/rtc/rtcSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    meeting: meetingReducer,
    rtc: rtcReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

