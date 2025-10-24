import { projectId, publicAnonKey } from '../utils/supabase/info';
import type { Expense } from '../components/ExpenseSpreadsheet';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-3ca8e58f`;

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
}

export async function getExpenses(): Promise<Expense[]> {
  const data = await fetchAPI('/expenses');
  return data.expenses || [];
}

export async function saveExpense(expense: Expense): Promise<Expense> {
  const data = await fetchAPI('/expenses', {
    method: 'POST',
    body: JSON.stringify(expense),
  });
  return data.expense;
}

export async function updateExpense(id: string, expense: Expense): Promise<Expense> {
  const data = await fetchAPI(`/expenses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(expense),
  });
  return data.expense;
}

export async function deleteExpense(id: string): Promise<void> {
  await fetchAPI(`/expenses/${id}`, {
    method: 'DELETE',
  });
}
