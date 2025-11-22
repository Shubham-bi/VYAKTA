import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';


interface AuthState {
  user: {
    userId: string | null;
    email: string | null;
    fullNameIntLang?: string | null;
  } | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthState['user']; token: string }>
    ) => {
      state.user = {
        userId: action.payload.user?.userId || null,
        email: action.payload.user?.email || null,
        fullNameIntLang: action.payload.user?.fullNameIntLang || null,
      };
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;

