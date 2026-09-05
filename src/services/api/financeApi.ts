import apiClient from './client';

export interface CreateExpensePayload {
  title: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  customCategory?: string | null;
  fromBill:boolean;
  paymentType: string;
  paymentTo: string;
}

export interface CreateBillPayload {
  title: string;
  description: string;
  amount: number;
  paidTo: string;
  dueDate: string;
  recurring: boolean;
  recurrenceType: string | null;
}

export interface BillItem {
  id: number;
  title: string;
  description: string;
  amount: number;
  paidTo: string;
  dueDate: string;
  paid: boolean;
  recurring: boolean;
  recurrenceType: string | null;
  paidOn: string | null; 
}


export interface BillListResponse {
  bills: BillItem[];
  upcomingCount: number;
  paidCount: number;
  overdueCount: number;
}

export interface ExpenseItem {
  id: number;
  title: string;
  description: string;
  category: string;
  customCategory: string | null;
  amount: number;
  date: string;
  paymentType: string;
  paymentTo: string;
  fromBill: boolean;
}
export interface BudgetCategoryPayload {
  category: string;
  allocatedAmount: number;
}
export interface BudgetItem {
  id: number;
  month: number;
  year: number;
  totalAmount: number;
  categories: BudgetCategoryPayload[];

}

export type PeriodType = 'WEEK' | 'MONTH' | 'YEAR';
export type BillStatus = 'UPCOMING' | 'OVERDUE' | 'PAID';

export interface CreateMonthlyBudgetPayload {
  month: number;
  year: number;
  totalAmount: number;
  categories: BudgetCategoryPayload[];
}

export const createExpense = (payload: CreateExpensePayload) =>
  apiClient.post('/expenses', payload);

export const createBill = (payload: CreateBillPayload) =>
  apiClient.post('/bills', payload);

export const getFinanceOverview = (period: PeriodType) =>
  apiClient.get('/finance/overview', { params: { period } });

export const getBills = (status: BillStatus) =>
  apiClient.get<BillListResponse>('/bills', { params: { status } });

export const getBillById = (id: number) =>
  apiClient.get<BillItem>(`/bills/${id}`);

export const markBillAsPaid = (id: number) =>
  apiClient.patch(`/bills/${id}/pay`);

export const deleteBillById = (id: number) =>
  apiClient.delete(`/bills/${id}`);

export const getExpenses = () =>
  apiClient.get<ExpenseItem[]>('/expenses');

export const deleteExpenseById=(id: number)=>
  apiClient.delete(`/expenses/${id}`);

export const createMonthlyBudget = (payload: CreateMonthlyBudgetPayload) =>
  apiClient.post('/budgets', payload);

export const createBudget = (payload: BudgetItem) =>
  apiClient.post('/budgets', payload);
