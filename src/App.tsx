import { useState, useEffect } from 'react';
import { ReceiptCapture } from './components/ReceiptCapture';
import { ExpenseSpreadsheet, type Expense } from './components/ExpenseSpreadsheet';
import { processReceiptImage } from './lib/ocr';
import { getExpenses, saveExpense, updateExpense, deleteExpense } from './lib/api';
import { toast } from 'sonner@2.0.3';
import { Toaster } from './components/ui/sonner';
import { Receipt } from 'lucide-react';

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load expenses on mount
  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setIsLoading(true);
      const data = await getExpenses();
      setExpenses(data);
    } catch (error) {
      console.error('Error loading expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageCapture = async (file: File) => {
    setIsProcessing(true);
    
    try {
      toast.info('Processing receipt...');
      
      const extractedData = await processReceiptImage(file);
      
      const newExpense: Expense = {
        id: Date.now().toString(),
        date: extractedData.date || new Date().toISOString().split('T')[0],
        merchant: extractedData.merchant || 'Unknown',
        amount: extractedData.amount || '$0.00',
        category: extractedData.category || 'Other',
        description: extractedData.description || '',
      };
      
      // Save to backend
      await saveExpense(newExpense);
      setExpenses(prev => [newExpense, ...prev]);
      toast.success('Receipt processed successfully!');
      
    } catch (error) {
      console.error('Error processing receipt:', error);
      toast.error('Failed to process receipt. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id);
      setExpenses(prev => prev.filter(exp => exp.id !== id));
      toast.success('Expense deleted');
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
    }
  };

  const handleUpdateExpense = async (id: string, updatedExpense: Expense) => {
    try {
      await updateExpense(id, updatedExpense);
      setExpenses(prev => prev.map(exp => exp.id === id ? updatedExpense : exp));
      toast.success('Expense updated');
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('Failed to update expense');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      
      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Receipt className="h-8 w-8" />
            <h1>Receipt Reader</h1>
          </div>
          <p className="text-muted-foreground">
            Capture receipts, extract expense data automatically, and manage your spending
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="lg:sticky lg:top-8 h-fit">
            <ReceiptCapture 
              onImageCapture={handleImageCapture}
              isProcessing={isProcessing}
            />
          </div>
          
          <div>
            <ExpenseSpreadsheet 
              expenses={expenses}
              onDeleteExpense={handleDeleteExpense}
              onUpdateExpense={handleUpdateExpense}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
