export interface ParsedTransaction {
  accountId: string; // e.g., 'bkash', 'nagad'
  amount: number;
  type: 'in' | 'out';
  merchantText: string;
  timestamp: number;
}

// Basic regex for bKash and Nagad. 
// bKash Cash In example: "Cash In Tk 500.00 from 017XXXXX. Fee Tk 0.00. Balance Tk 1500.00. TrxID XXXXXX at 12/08/2023 14:05"
// bKash Payment example: "Payment Tk 200.00 to Daraz. Fee Tk 0.00. Balance Tk 1300.00. TrxID XXXXXX at..."

export const parseBkashSms = (smsBody: string, timestamp: number): ParsedTransaction | null => {
  const body = smsBody.toLowerCase();
  
  if (!body.includes('bkash')) {
    // Some bKash SMS might not have the word 'bkash' but come from 'bKash' sender. 
    // We assume sender is verified before calling this.
  }

  let type: 'in' | 'out' = 'out';
  let amount = 0;
  let merchantText = '';

  // Extract amount: common pattern is "tk [amount]"
  const amountMatch = smsBody.match(/Tk\s*([\d,]+\.?\d*)/i);
  if (amountMatch && amountMatch[1]) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  } else {
    return null; // Cannot parse amount
  }

  // Determine type and merchant
  if (body.startsWith('cash in') || body.startsWith('received money') || body.startsWith('add money')) {
    type = 'in';
    const fromMatch = smsBody.match(/from\s+([A-Za-z0-9\s]+?)\.?\s+Fee/i) || smsBody.match(/from\s+([A-Za-z0-9\s]+?)\./i);
    merchantText = fromMatch ? fromMatch[1].trim() : 'Unknown Sender';
  } 
  else if (body.startsWith('payment') || body.startsWith('send money') || body.startsWith('cash out') || body.startsWith('mobile recharge')) {
    type = 'out';
    const toMatch = smsBody.match(/to\s+([A-Za-z0-9\s]+?)\.?\s+Fee/i) || smsBody.match(/to\s+([A-Za-z0-9\s]+?)\./i) || smsBody.match(/for\s+([A-Za-z0-9\s]+?)\.?\s+Fee/i);
    merchantText = toMatch ? toMatch[1].trim() : 'Unknown Merchant';
  } else {
    // If it's a promotional or other SMS, return null
    return null;
  }

  return {
    accountId: 'bkash', // Assuming a static ID for MVP
    amount,
    type,
    merchantText,
    timestamp,
  };
};

export const parseNagadSms = (smsBody: string, timestamp: number): ParsedTransaction | null => {
  const body = smsBody.toLowerCase();
  
  let type: 'in' | 'out' = 'out';
  let amount = 0;
  let merchantText = '';

  // Nagad often uses "Amount: Tk [amount]" or just "Tk [amount]"
  const amountMatch = smsBody.match(/Amount:\s*Tk\s*([\d,]+\.?\d*)/i) || smsBody.match(/Tk\s*([\d,]+\.?\d*)/i);
  if (amountMatch && amountMatch[1]) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  } else {
    return null;
  }

  if (body.includes('cash in') || body.includes('received')) {
    type = 'in';
    const fromMatch = smsBody.match(/From:\s*([A-Za-z0-9\s]+)/i);
    merchantText = fromMatch ? fromMatch[1].trim() : 'Unknown Sender';
  } else if (body.includes('payment') || body.includes('send money') || body.includes('cash out')) {
    type = 'out';
    const toMatch = smsBody.match(/To:\s*([A-Za-z0-9\s]+)/i);
    merchantText = toMatch ? toMatch[1].trim() : 'Unknown Merchant';
  } else {
    return null;
  }

  return {
    accountId: 'nagad',
    amount,
    type,
    merchantText,
    timestamp,
  };
};

export const parseSms = (sender: string, body: string, timestamp: number): ParsedTransaction | null => {
  const normalizedSender = sender.toLowerCase();
  if (normalizedSender.includes('bkash')) {
    return parseBkashSms(body, timestamp);
  } else if (normalizedSender.includes('nagad')) {
    return parseNagadSms(body, timestamp);
  }
  return null;
};
