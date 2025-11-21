import { createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/apiClient';
import { setCredentials, clearCredentials } from './authSlice';

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
  message?: string;
}

interface LoginResponse {
  userId: string;
  message: string;
}

export const registerUser = createAsyncThunk(
  'auth/register',
  async (payload: RegisterPayload, { rejectWithValue, dispatch }) => {
    try {
      const response = await apiClient.post<RegisterResponse>('/api/User/register', {
        fullNameIntLang: payload.fullNameIntLang,
        email: payload.email,
      });

      const authData = response.data;
      
      // Dispatch credentials to store
      dispatch(
        setCredentials({
          user: {
            id: authData.userId,
            email: payload.email,
            fullName: payload.fullNameIntLang,
          },
          token: authData.userId, // Using userId as token for now
        })
      );

      // Store userId in localStorage
      localStorage.setItem('userId', authData.userId);
      localStorage.setItem('token', authData.userId);

      return authData;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed. Please try again.'
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, { rejectWithValue, dispatch }) => {
    try {
      const response = await apiClient.post<LoginResponse>('/api/Auth/login', {
        email: payload.email,
      });

      const authData = response.data;

      // Dispatch credentials to store
      dispatch(
        setCredentials({
          user: {
            id: authData.userId,
            email: payload.email,
            fullName: '',
          },
          token: authData.userId, // Using userId as token for now
        })
      );

      // Store userId in localStorage
      localStorage.setItem('userId', authData.userId);
      localStorage.setItem('token', authData.userId);

      return authData;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed. Please try again.'
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    dispatch(clearCredentials());
  }
);
