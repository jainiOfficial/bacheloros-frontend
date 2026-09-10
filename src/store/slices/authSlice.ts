import { asyncThunkCreator, createAsyncThunk } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../services/api/client';
import { login as loginApi } from '../../services/api/authApis';
import { signup as signupApi } from '../../services/api/authApis';

type User = {
  id?: string | number;
  name?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
};

type AuthState = {
  token: string | null;
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  token: null,
  user: null,
  isLoggedIn: false,
  isLoading: true,
  error: null,
};
//login THUNK
export const loginSuccess = createAsyncThunk(
  'auth/loginSuccess',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await loginApi(credentials);
      const token = response.data?.token;

      if (!token) {
        throw new Error('Token not found in login response');
      }

      await AsyncStorage.setItem('token', token);

    //   const userResponse = await apiClient.get('/users/me');
      return { token };
    } catch (error: any) {
      return rejectWithValue(error?.message??'Login failed');
    }
  },
);
// SINGUP THUNK
export const signupSuccess = createAsyncThunk(
  'auth/signupSuccess',
  async (credentials: { name: string; email: string; phone: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await signupApi(credentials);
      const token = response.data?.token;

      if (!token) {
        throw new Error('Token not found in signup response');
      }

      await AsyncStorage.setItem('token', token);

    //   const userResponse = await apiClient.get('/users/me');
      return { token };
    } catch (error: any) {
      return rejectWithValue(error?.message??'Signup failed');
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },

    restoreSession: (state, action) => {
      state.token = action.payload.token;
      state.isLoggedIn = !!action.payload.token;
      state.isLoading = false;
      state.error = null;
    },

    logout: state => {
      state.token = null;
      state.user = null;
      state.isLoggedIn = false;
      state.isLoading = false;
      state.error = null;
    },

    setAuthError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
  extraReducers: (builder)=> {
     // ---- LOGIN ----
    builder.addCase(loginSuccess.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginSuccess.fulfilled, (state, action) => {
      state.token = action.payload.token;
      state.isLoggedIn = true;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(loginSuccess.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
     // ---- Signin ----
     builder.addCase(signupSuccess.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(signupSuccess.fulfilled, (state, action) => {
      state.token = action.payload.token;
      state.isLoggedIn = true;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(signupSuccess.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    }); 
  }
});

export const {
  setLoading,
  restoreSession,
  logout,
  setAuthError,
  setUser,
} = authSlice.actions;

export default authSlice.reducer;


