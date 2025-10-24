import { createWorker } from 'tesseract.js';
import type { Expense } from '../components/ExpenseSpreadsheet';

export async function processReceiptImage(file: File): Promise<Partial<Expense>> {
  const worker = await createWorker('eng');
  
  try {
    const { data: { text } } = await worker.recognize(file);
    
    // Parse the OCR text to extract receipt information
    const expense = parseReceiptText(text);
    
    return expense;
  } finally {
    await worker.terminate();
  }
}

function parseReceiptText(text: string): Partial<Expense> {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  // Extract date
  const dateRegex = /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})|(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/;
  const dateMatch = text.match(dateRegex);
  const date = dateMatch ? formatDate(dateMatch[0]) : new Date().toISOString().split('T')[0];
  
  // Extract merchant name (usually in first few lines)
  const merchant = lines.slice(0, 3).find(line => 
    line.length > 3 && 
    line.length < 50 && 
    !line.match(/^\d/) &&
    !line.toLowerCase().includes('receipt')
  ) || 'Unknown Merchant';
  
  // Extract total amount
  const amountRegex = /(?:total|amount|sum)[\s:$]*(\d+[.,]\d{2})|(?:^|\s)(\d+[.,]\d{2})(?:\s|$)/gi;
  const amounts: number[] = [];
  let match;
  
  while ((match = amountRegex.exec(text)) !== null) {
    const amountStr = (match[1] || match[2]).replace(',', '.');
    const amount = parseFloat(amountStr);
    if (!isNaN(amount) && amount > 0) {
      amounts.push(amount);
    }
  }
  
  // Take the largest amount as the total
  const amount = amounts.length > 0 
    ? `$${Math.max(...amounts).toFixed(2)}` 
    : '$0.00';
  
  // Determine category based on keywords
  const category = categorizeReceipt(text);
  
  // Create description from merchant and category
  const description = `${merchant} - ${category}`;
  
  return {
    date,
    merchant,
    amount,
    category,
    description
  };
}

function formatDate(dateStr: string): string {
  // Try to parse and format the date to YYYY-MM-DD
  const formats = [
    /(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/,  // MM/DD/YYYY or DD/MM/YYYY
    /(\d{1,2})[-\/](\d{1,2})[-\/](\d{2})/,  // MM/DD/YY or DD/MM/YY
    /(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/   // YYYY/MM/DD
  ];
  
  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      if (match[0].startsWith('20') || match[0].startsWith('19')) {
        // YYYY-MM-DD format
        const year = match[1];
        const month = match[2].padStart(2, '0');
        const day = match[3].padStart(2, '0');
        return `${year}-${month}-${day}`;
      } else {
        // Assume MM/DD/YYYY or DD/MM/YYYY (using MM/DD/YYYY for US receipts)
        let year = match[3];
        if (year.length === 2) {
          year = '20' + year;
        }
        const month = match[1].padStart(2, '0');
        const day = match[2].padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }
  }
  
  return new Date().toISOString().split('T')[0];
}

function categorizeReceipt(text: string): string {
  const lowerText = text.toLowerCase();
  
  const categories = {
    'Food & Dining': ['restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'food', 'dining', 'bar', 'grill', 'kitchen'],
    'Groceries': ['grocery', 'market', 'supermarket', 'whole foods', 'trader', 'safeway', 'walmart'],
    'Transportation': ['gas', 'fuel', 'uber', 'lyft', 'taxi', 'parking', 'transit'],
    'Shopping': ['store', 'shop', 'retail', 'mall', 'amazon', 'target'],
    'Healthcare': ['pharmacy', 'medical', 'doctor', 'clinic', 'hospital', 'cvs', 'walgreens'],
    'Entertainment': ['movie', 'cinema', 'theater', 'concert', 'ticket', 'entertainment'],
    'Utilities': ['electric', 'water', 'internet', 'phone', 'utility'],
  };
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return category;
    }
  }
  
  return 'Other';
}
