import { createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/apiClient';
import { setCredentials, clearCredentials } from './authSlice';

// ------------------------- Interfaces -------------------------

interface RegisterPayload {
  fullNameIntLang: string;
  email: string;
}

interface LoginPayload {
  email: string;
}

interface RegisterResponse {
  userId: string;
  email: string;
  fullName?: string;
  token?: string;
}

interface LoginResponse {
  userId: string;
  token: string;
}

// ------------------------- Register User -------------------------

export const registerUser = createAsyncThunk(
  'auth/register',
  async (payload: RegisterPayload, { rejectWithValue, dispatch }) => {
    try {
      const response = await apiClient.callApi(
        "Main",
        "register",
        "POST",
        {
          salutation: "",
          fullNameIntLang: payload.fullNameIntLang,
          email: payload.email,
          mobileNumber: ""
        }
      );

      const authData: RegisterResponse = response.data;

      // Save to Redux
      dispatch(
        setCredentials({
          user: {
            userId: authData.userId,
            email: authData.email,
            fullNameIntLang: payload.fullNameIntLang,
          },
          token: authData.token || authData.userId, // fallback
        })
      );

      // Save to localStorage
      localStorage.setItem("userId", authData.userId);
      localStorage.setItem("tk_9xf1BzX", authData.token || authData.userId);

      return authData;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Registration failed"
      );
    }
  }
);

// ------------------------- Login User -------------------------

export const loginUser = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, { rejectWithValue, dispatch }) => {
    try {
      const response = await apiClient.callApi(
        "Main",
        "login",
        "POST",
        { email: payload.email }
      );

      const authData: LoginResponse = response.data;

      dispatch(
        setCredentials({
          user: {
            userId: authData.userId,
            email: payload.email,
            fullNameIntLang: "",
          },
          token: authData.token,
        })
      );

      // Save token
      localStorage.setItem("userId", authData.userId);
      localStorage.setItem("tk_9xf1BzX", authData.token);

      return authData;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Login failed"
      );
    }
  }
);

// ------------------------- Logout -------------------------

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    localStorage.removeItem("userId");
    localStorage.removeItem("tk_9xf1BzX");
    dispatch(clearCredentials());
  }
);
