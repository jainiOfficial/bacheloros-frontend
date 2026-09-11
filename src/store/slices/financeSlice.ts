import { createAsyncThunk, createSlice } from '@reduxjs/toolkit/react';
import { getFinanceOverview } from '../../services/api/financeApi';

export type Overview = {
  billsPendingCount: number;
  budgetRemaining: number;
  monthExpense: number;
  percentChangeVsLastPeriod: number | null;
  overdueBillsAmount: number;
  overdueBillsCount: number;
  totalBudgetAmount: number;
};
export type financeState = {
  overview: Overview | null;
  loading: boolean;
  error: string | null;
  refresh?: boolean;
};
const initialState: financeState = {
  overview: null,
  loading: false,
  error: null,
  refresh: false,
};

export const fetchFinanceOverview = createAsyncThunk(
  'finance/fetchFinanceOverview',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getFinanceOverview();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.message ?? 'Failed to load finance overview');
    }
  }
);
const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    setFinanceOverview: (state, action) => {
      state.overview = action.payload;
    },
    setFinanceLoading: (state, action) => {
      state.loading = action.payload;
    },
    setFinanceError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchFinanceOverview.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchFinanceOverview.fulfilled, (state, action) => {
      state.loading = false;
      state.overview = action.payload;
      state.refresh = false;
    });
    builder.addCase(fetchFinanceOverview.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setFinanceOverview, setFinanceLoading, setFinanceError } = financeSlice.actions;
export default financeSlice.reducer;
