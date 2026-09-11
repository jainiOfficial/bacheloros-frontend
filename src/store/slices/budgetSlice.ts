import { createAsyncThunk, createSlice } from "@reduxjs/toolkit/react";
import { BudgetOverviewResponse, getBudgetOverview } from "../../services/api/financeApi";

type BudgetState = {
  selectedMonth: number;
  selectedYear: number;
  overview: BudgetOverviewResponse | null;
  loading: boolean;
  error: string | null;
  editDraft: Record<string, string>;
};

const initialState: BudgetState = {
  selectedMonth: new Date().getMonth() + 1,
  selectedYear: new Date().getFullYear(),
  overview: null,
  loading: false,
  error: null,
  editDraft: {},
};

export const loadBudgetOverview = createAsyncThunk(
  'budget/loadBudgetOverview',
  async (period: { month: number; year: number }, { rejectWithValue }) => {
    try {
      const response = await getBudgetOverview(period.month, period.year);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.message ?? 'Failed to load budget overview');
    }
  }
);
export const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
   setMonth:(state, action) => {
      state.selectedMonth = action.payload;
    },
    setYear:(state, action) => {
      state.selectedYear = action.payload;
    },
    setPeriod: (state, action) => {
      state.selectedMonth = action.payload.month;
      state.selectedYear = action.payload.year;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadBudgetOverview.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loadBudgetOverview.fulfilled, (state, action) => {
      state.overview = action.payload;
      state.loading = false;
      state.error = null;
    });
    builder.addCase(loadBudgetOverview.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) ?? action.error.message ?? 'Failed to load budget overview';
    });
  },
  },
);

export const { setMonth, setYear,setPeriod} = budgetSlice.actions;

export default budgetSlice.reducer;