import { useState } from 'react';
import { Trash2, Download, Edit2, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

export interface Expense {
  id: string;
  date: string;
  merchant: string;
  amount: string;
  category: string;
  description: string;
}

interface ExpenseSpreadsheetProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  onUpdateExpense: (id: string, expense: Expense) => void;
}

export function ExpenseSpreadsheet({ 
  expenses, 
  onDeleteExpense,
  onUpdateExpense 
}: ExpenseSpreadsheetProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Expense | null>(null);

  const startEditing = (expense: Expense) => {
    setEditingId(expense.id);
    setEditForm({ ...expense });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEditing = () => {
    if (editForm) {
      onUpdateExpense(editForm.id, editForm);
      setEditingId(null);
      setEditForm(null);
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Merchant', 'Amount', 'Category', 'Description'];
    const rows = expenses.map(exp => [
      exp.date,
      exp.merchant,
      exp.amount,
      exp.category,
      exp.description
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalAmount = expenses.reduce((sum, exp) => {
    const amount = parseFloat(exp.amount.replace(/[^0-9.-]+/g, '')) || 0;
    return sum + amount;
  }, 0);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2>Expense Spreadsheet</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            disabled={expenses.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {expenses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No expenses yet. Start by capturing a receipt!</p>
          </div>
        ) : (
          <>
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Merchant</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        {editingId === expense.id && editForm ? (
                          <>
                            <TableCell>
                              <Input
                                type="date"
                                value={editForm.date}
                                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                className="h-8"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={editForm.merchant}
                                onChange={(e) => setEditForm({ ...editForm, merchant: e.target.value })}
                                className="h-8"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={editForm.amount}
                                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                                className="h-8"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={editForm.category}
                                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                className="h-8"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                className="h-8"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  onClick={saveEditing}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  onClick={cancelEditing}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>{expense.date}</TableCell>
                            <TableCell>{expense.merchant}</TableCell>
                            <TableCell>{expense.amount}</TableCell>
                            <TableCell>{expense.category}</TableCell>
                            <TableCell>{expense.description}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  onClick={() => startEditing(expense)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  onClick={() => onDeleteExpense(expense.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            <div className="flex justify-end">
              <div className="bg-muted px-4 py-2 rounded-lg">
                <span className="mr-4">Total:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
