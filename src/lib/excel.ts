import * as XLSX from 'xlsx';

export interface DeliveryManData {
  memberId: string;
  memberName: string;
  date: string;
  cylinder14_2kg: { amount: number; quantity: number; total: number };
  cylinder10kg: { amount: number; quantity: number; total: number };
  cylinder5kg: { amount: number; quantity: number; total: number };
  cylinder19kg: { amount: number; quantity: number; total: number };
  cylinderTotal: number;
  onlinePayment: number;
  cash: number;
  cashDenomination: {
    denomination500: number;
    denomination200: number;
    denomination100: number;
    denomination50: number;
    denomination20: number;
    denomination10: number;
    oldPending: number;
    oldBalance: number;
    coins: number;
    grandTotal: number;
  };
  grandTotal: number;
}

export function exportToExcel(data: Record<string, DeliveryManData>, date?: string) {
  const workbook = XLSX.utils.book_new();
  
  // Create main data sheet
  const wsData: (string | number)[][] = [];
  
  // Header row
  wsData.push([
    'D MAN',
    'Date',
    '14.2 Kg Amount',
    '14.2 Kg Quantity',
    '14.2 Kg Total',
    '10 Kg Amount',
    '10 Kg Quantity',
    '10 Kg Total',
    '5 Kg Amount',
    '5 Kg Quantity',
    '5 Kg Total',
    '19 Kg Amount',
    '19 Kg Quantity',
    '19 Kg Total',
    'Cylinder Total',
    'Online Payment',
    'Cash',
    '₹500 Notes',
    '₹200 Notes',
    '₹100 Notes',
    '₹50 Notes',
    '₹20 Notes',
    '₹10 Notes',
    'Old Pending',
    'Old Balance',
    'Coins',
    'Cash Denomination Total',
    'Grand Total'
  ]);
  
  // Data rows
  Object.values(data).forEach((memberData) => {
    wsData.push([
      memberData.memberName,
      memberData.date,
      memberData.cylinder14_2kg.amount,
      memberData.cylinder14_2kg.quantity,
      memberData.cylinder14_2kg.total,
      memberData.cylinder10kg.amount,
      memberData.cylinder10kg.quantity,
      memberData.cylinder10kg.total,
      memberData.cylinder5kg.amount,
      memberData.cylinder5kg.quantity,
      memberData.cylinder5kg.total,
      memberData.cylinder19kg.amount,
      memberData.cylinder19kg.quantity,
      memberData.cylinder19kg.total,
      memberData.cylinderTotal,
      memberData.onlinePayment,
      memberData.cash,
      memberData.cashDenomination.denomination500,
      memberData.cashDenomination.denomination200,
      memberData.cashDenomination.denomination100,
      memberData.cashDenomination.denomination50,
      memberData.cashDenomination.denomination20,
      memberData.cashDenomination.denomination10,
      memberData.cashDenomination.oldPending,
      memberData.cashDenomination.oldBalance,
      memberData.cashDenomination.coins,
      memberData.cashDenomination.grandTotal,
      memberData.grandTotal
    ]);
  });
  
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily Updates');
  
  // Generate filename
  const filename = date 
    ? `Daily_Updates_${date.replace(/-/g, '_')}.xlsx`
    : `Daily_Updates_${new Date().toISOString().split('T')[0].replace(/-/g, '_')}.xlsx`;
  
  XLSX.writeFile(workbook, filename);
}

export function importFromExcel(file: File): Promise<Record<string, DeliveryManData>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];
        
        if (jsonData.length < 2) {
          reject(new Error('Invalid Excel file format'));
          return;
        }
        
        const headers = jsonData[0];
        const result: Record<string, DeliveryManData> = {};
        
        // Find column indices
        const getColIndex = (name: string) => headers.findIndex(h => String(h).includes(name));
        
        const memberNameIdx = getColIndex('D MAN') !== -1 ? getColIndex('D MAN') : getColIndex('Member');
        const dateIdx = getColIndex('Date');
        const amount14_2Idx = getColIndex('14.2 Kg Amount');
        const qty14_2Idx = getColIndex('14.2 Kg Quantity');
        const amount10Idx = getColIndex('10 Kg Amount');
        const qty10Idx = getColIndex('10 Kg Quantity');
        const amount5Idx = getColIndex('5 Kg Amount');
        const qty5Idx = getColIndex('5 Kg Quantity');
        const amount19Idx = getColIndex('19 Kg Amount');
        const qty19Idx = getColIndex('19 Kg Quantity');
        const onlinePaymentIdx = getColIndex('Online Payment');
        const cashIdx = getColIndex('Cash');
        const notes500Idx = getColIndex('₹500 Notes') !== -1 ? getColIndex('₹500 Notes') : getColIndex('500 Notes');
        const notes200Idx = getColIndex('₹200 Notes') !== -1 ? getColIndex('₹200 Notes') : getColIndex('200 Notes');
        const notes100Idx = getColIndex('₹100 Notes') !== -1 ? getColIndex('₹100 Notes') : getColIndex('100 Notes');
        const notes50Idx = getColIndex('₹50 Notes') !== -1 ? getColIndex('₹50 Notes') : getColIndex('50 Notes');
        const notes20Idx = getColIndex('₹20 Notes') !== -1 ? getColIndex('₹20 Notes') : getColIndex('20 Notes');
        const notes10Idx = getColIndex('₹10 Notes') !== -1 ? getColIndex('₹10 Notes') : getColIndex('10 Notes');
        const oldPendingIdx = getColIndex('Old Pending');
        const oldBalanceIdx = getColIndex('Old Balance');
        const coinsIdx = getColIndex('Coins');
        
        // Process data rows
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row[memberNameIdx]) continue;
          
          const memberName = String(row[memberNameIdx] || '').trim();
          if (!memberName) continue;
          
          const getValue = (idx: number, defaultValue: number = 0) => {
            if (idx === -1) return defaultValue;
            const val = row[idx];
            if (val === null || val === undefined || val === '') return defaultValue;
            return typeof val === 'number' ? val : parseFloat(String(val)) || defaultValue;
          };
          
          const date = row[dateIdx] ? String(row[dateIdx]) : new Date().toISOString().split('T')[0];
          
          const cylinder14_2kg = {
            amount: getValue(amount14_2Idx),
            quantity: getValue(qty14_2Idx),
            total: 0
          };
          cylinder14_2kg.total = cylinder14_2kg.amount * cylinder14_2kg.quantity;
          
          const cylinder10kg = {
            amount: getValue(amount10Idx),
            quantity: getValue(qty10Idx),
            total: 0
          };
          cylinder10kg.total = cylinder10kg.amount * cylinder10kg.quantity;
          
          const cylinder5kg = {
            amount: getValue(amount5Idx),
            quantity: getValue(qty5Idx),
            total: 0
          };
          cylinder5kg.total = cylinder5kg.amount * cylinder5kg.quantity;
          
          const cylinder19kg = {
            amount: getValue(amount19Idx),
            quantity: getValue(qty19Idx),
            total: 0
          };
          cylinder19kg.total = cylinder19kg.amount * cylinder19kg.quantity;
          
          const cylinderTotal = cylinder14_2kg.total + cylinder10kg.total + cylinder5kg.total + cylinder19kg.total;
          const onlinePayment = getValue(onlinePaymentIdx);
          const cash = getValue(cashIdx);
          
          const cashDenomination = {
            denomination500: getValue(notes500Idx),
            denomination200: getValue(notes200Idx),
            denomination100: getValue(notes100Idx),
            denomination50: getValue(notes50Idx),
            denomination20: getValue(notes20Idx),
            denomination10: getValue(notes10Idx),
            oldPending: getValue(oldPendingIdx),
            oldBalance: getValue(oldBalanceIdx),
            coins: getValue(coinsIdx),
            grandTotal: 0
          };
          
          cashDenomination.grandTotal = 
            (cashDenomination.denomination500 * 500) +
            (cashDenomination.denomination200 * 200) +
            (cashDenomination.denomination100 * 100) +
            (cashDenomination.denomination50 * 50) +
            (cashDenomination.denomination20 * 20) +
            (cashDenomination.denomination10 * 10) +
            cashDenomination.coins +
            cashDenomination.oldPending +
            cashDenomination.oldBalance;
          
          const grandTotal = cylinderTotal + onlinePayment + cash;
          
          const memberData: DeliveryManData = {
            memberId: '', // Will be set when matching with members
            memberName,
            date,
            cylinder14_2kg,
            cylinder10kg,
            cylinder5kg,
            cylinder19kg,
            cylinderTotal,
            onlinePayment,
            cash,
            cashDenomination,
            grandTotal
          };
          
          result[memberName] = memberData;
        }
        
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

