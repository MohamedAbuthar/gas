'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import DashboardLayout from '../../../components/DashboardLayout';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { createDailyUpdate, type DailyUpdate, listMembers, type MemberRecord } from '@/lib/db';
import { exportToExcel, importFromExcel } from '@/lib/excel';

interface CylinderData {
  amount: number;
  quantity: number;
  total: number;
}

interface DeliveryManData {
  memberId: string;
  memberName: string;
  date: string;
  cylinder14_2kg: CylinderData;
  cylinder10kg: CylinderData;
  cylinder5kg: CylinderData;
  cylinder19kg: CylinderData;
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

export default function AddDailyUpdatePage() {
  const router = useRouter();
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [deliveryMenData, setDeliveryMenData] = useState<Record<string, DeliveryManData>>({});
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadMembers = async () => {
      const data = await listMembers();
      setMembers(data.filter(m => m.status === 'active'));
    };
    loadMembers();
  }, []);

  const getCurrentMemberData = (): DeliveryManData => {
    if (!selectedMemberId) {
      return {
        memberId: '',
        memberName: '',
        date: new Date().toISOString().split('T')[0],
        cylinder14_2kg: { amount: 0, quantity: 0, total: 0 },
        cylinder10kg: { amount: 0, quantity: 0, total: 0 },
        cylinder5kg: { amount: 0, quantity: 0, total: 0 },
        cylinder19kg: { amount: 0, quantity: 0, total: 0 },
        cylinderTotal: 0,
        onlinePayment: 0,
        cash: 0,
        cashDenomination: {
          denomination500: 0,
          denomination200: 0,
          denomination100: 0,
          denomination50: 0,
          denomination20: 0,
          denomination10: 0,
          oldPending: 0,
          oldBalance: 0,
          coins: 0,
          grandTotal: 0,
        },
        grandTotal: 0,
      };
    }
    return deliveryMenData[selectedMemberId] || {
      memberId: selectedMemberId,
      memberName: members.find(m => m.id === selectedMemberId)?.name || '',
      date: new Date().toISOString().split('T')[0],
      cylinder14_2kg: { amount: 0, quantity: 0, total: 0 },
      cylinder10kg: { amount: 0, quantity: 0, total: 0 },
      cylinder5kg: { amount: 0, quantity: 0, total: 0 },
      cylinder19kg: { amount: 0, quantity: 0, total: 0 },
      cylinderTotal: 0,
      onlinePayment: 0,
      cash: 0,
      cashDenomination: {
        denomination500: 0,
        denomination200: 0,
        denomination100: 0,
        denomination50: 0,
        denomination20: 0,
        denomination10: 0,
        oldPending: 0,
        oldBalance: 0,
        coins: 0,
        grandTotal: 0,
      },
      grandTotal: 0,
    };
  };

  const updateCurrentMemberData = (updates: Partial<DeliveryManData>) => {
    if (!selectedMemberId) return;
    const current = getCurrentMemberData();
    const updated = { ...current, ...updates };
    
    // Calculate cylinder totals
    updated.cylinder14_2kg.total = updated.cylinder14_2kg.amount * updated.cylinder14_2kg.quantity;
    updated.cylinder10kg.total = updated.cylinder10kg.amount * updated.cylinder10kg.quantity;
    updated.cylinder5kg.total = updated.cylinder5kg.amount * updated.cylinder5kg.quantity;
    updated.cylinder19kg.total = updated.cylinder19kg.amount * updated.cylinder19kg.quantity;
    
    // Calculate cylinder total
    updated.cylinderTotal = 
      updated.cylinder14_2kg.total +
      updated.cylinder10kg.total +
      updated.cylinder5kg.total +
      updated.cylinder19kg.total;
    
    // Calculate cash denomination grand total
    updated.cashDenomination.grandTotal = 
      (updated.cashDenomination.denomination500 * 500) +
      (updated.cashDenomination.denomination200 * 200) +
      (updated.cashDenomination.denomination100 * 100) +
      (updated.cashDenomination.denomination50 * 50) +
      (updated.cashDenomination.denomination20 * 20) +
      (updated.cashDenomination.denomination10 * 10) +
      updated.cashDenomination.coins +
      updated.cashDenomination.oldPending +
      updated.cashDenomination.oldBalance;
    
    // Calculate grand total
    updated.grandTotal = updated.cylinderTotal + updated.onlinePayment + updated.cash;
    
    setDeliveryMenData(prev => ({
      ...prev,
      [selectedMemberId]: updated,
    }));
  };

  const handleCylinderChange = (cylinderType: 'cylinder14_2kg' | 'cylinder10kg' | 'cylinder5kg' | 'cylinder19kg', field: 'amount' | 'quantity', value: number) => {
    const current = getCurrentMemberData();
    updateCurrentMemberData({
      [cylinderType]: {
        ...current[cylinderType],
        [field]: value,
      },
    });
  };

  const handlePaymentChange = (field: 'onlinePayment' | 'cash', value: number) => {
    updateCurrentMemberData({ [field]: value });
  };

  const handleCashDenominationChange = (field: keyof DeliveryManData['cashDenomination'], value: number) => {
    const current = getCurrentMemberData();
    updateCurrentMemberData({
      cashDenomination: {
        ...current.cashDenomination,
        [field]: value,
      },
    });
  };

  const handleDownloadExcel = () => {
    if (Object.keys(deliveryMenData).length === 0) {
      toast.warning('No data to export. Please add member data first.');
      return;
    }
    const firstMember = Object.values(deliveryMenData)[0];
    exportToExcel(deliveryMenData, firstMember.date);
    toast.success('Excel file downloaded successfully');
  };

  const handleUploadExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedData = await importFromExcel(file);
      
      // Match imported data with members
      const matchedData: Record<string, DeliveryManData> = {};
      
      for (const [memberName, excelData] of Object.entries(importedData)) {
        const member = members.find(m => 
          m.name.toLowerCase().trim() === memberName.toLowerCase().trim()
        );
        
        if (member) {
          matchedData[member.id || ''] = {
            ...excelData,
            memberId: member.id || '',
            memberName: member.name,
          };
        } else {
          // If member not found, create entry with name only
          const tempId = `temp_${Date.now()}_${Math.random()}`;
          matchedData[tempId] = {
            ...excelData,
            memberId: tempId,
            memberName: memberName,
          };
        }
      }
      
      setDeliveryMenData(matchedData);
      
      // If only one member, select it automatically
      const memberIds = Object.keys(matchedData);
      if (memberIds.length === 1) {
        setSelectedMemberId(memberIds[0]);
      } else if (memberIds.length > 0) {
        toast.info(`Imported data for ${memberIds.length} member(s). Please select a member to view their data.`);
      }
      
      toast.success(`Successfully imported data for ${Object.keys(importedData).length} member(s).`);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import Excel file. Please check the file format and try again.');
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) {
      toast.warning('Please select a member');
      return;
    }
    
    setSaving(true);
    try {
      const currentData = getCurrentMemberData();
      const payload: DailyUpdate = {
        title: `Daily Update - ${currentData.memberName} - ${currentData.date}`,
        description: JSON.stringify(deliveryMenData),
        author: currentData.memberName,
        date: currentData.date,
        status: 'completed',
      };
      await createDailyUpdate(payload);
      toast.success('Daily update created successfully');
      router.push('/daily-updates');
    } catch (err) {
      console.error('Create update failed', err);
      toast.error('Failed to save daily update. Please check Firestore rules and try again.');
    } finally {
      setSaving(false);
    }
  };

  const currentData = getCurrentMemberData();
  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-gray-900 placeholder-gray-500';

  return (
    <ProtectedRoute requireAdmin>
    <DashboardLayout>
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="mb-4 sm:mb-6">
          <div className="mb-4 gap-4">
            <div className="flex items-center mb-3 sm:mb-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Add Daily Update</h1>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600 hidden sm:block">Enter daily gas operations data and sales information</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 sm:justify-end">
              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx,.xls"
                onChange={handleUploadExcel}
                className="hidden"
                id="excel-upload"
              />
              <label
                htmlFor="excel-upload"
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="hidden sm:inline">Upload Excel</span>
                <span className="sm:hidden">Upload</span>
              </label>
              <button
                type="button"
                onClick={handleDownloadExcel}
                disabled={Object.keys(deliveryMenData).length === 0}
                className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline">Download Excel</span>
                <span className="sm:hidden">Download</span>
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Member Selection and Date */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-5 lg:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Member & Date Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Member</label>
                <select
                  className={inputCls}
                  value={selectedMemberId}
                  onChange={(e) => {
                    const memberId = e.target.value;
                    setSelectedMemberId(memberId);
                    if (memberId && !deliveryMenData[memberId]) {
                      const member = members.find(m => m.id === memberId);
                      if (member) {
                        const newData: DeliveryManData = {
                          memberId: member.id || '',
                          memberName: member.name,
                          date: new Date().toISOString().split('T')[0],
                          cylinder14_2kg: { amount: 0, quantity: 0, total: 0 },
                          cylinder10kg: { amount: 0, quantity: 0, total: 0 },
                          cylinder5kg: { amount: 0, quantity: 0, total: 0 },
                          cylinder19kg: { amount: 0, quantity: 0, total: 0 },
                          cylinderTotal: 0,
                          onlinePayment: 0,
                          cash: 0,
                          cashDenomination: {
                            denomination500: 0,
                            denomination200: 0,
                            denomination100: 0,
                            denomination50: 0,
                            denomination20: 0,
                            denomination10: 0,
                            oldPending: 0,
                            oldBalance: 0,
                            coins: 0,
                            grandTotal: 0,
                          },
                          grandTotal: 0,
                        };
                        setDeliveryMenData(prev => ({
                          ...prev,
                          [memberId]: newData,
                        }));
                      }
                    }
                  }}
                  required
                >
                  <option value="">-- Select Member --</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  className={inputCls}
                  value={currentData.date}
                  onChange={(e) => {
                    if (selectedMemberId) {
                      updateCurrentMemberData({ date: e.target.value });
                    }
                  }}
                  required
                  disabled={!selectedMemberId}
                />
              </div>
            </div>
          </div>

          {/* Cylinder Amounts Section */}
          {selectedMemberId && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-5 lg:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
                Cylinder Amounts
            </h2>
              <div className="space-y-4">
                {/* 14.2 KG */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">14.2 KG - Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      className={inputCls}
                      value={currentData.cylinder14_2kg.amount || ''}
                      onChange={(e) => handleCylinderChange('cylinder14_2kg', 'amount', parseFloat(e.target.value) || 0)}
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">14.2 KG - Quantity</label>
                    <input
                      type="number"
                      className={inputCls}
                      value={currentData.cylinder14_2kg.quantity || ''}
                      onChange={(e) => handleCylinderChange('cylinder14_2kg', 'quantity', parseInt(e.target.value) || 0)}
                      placeholder="Enter quantity"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">14.2 KG - Total</label>
                    <input
                      type="number"
                      className={inputCls + ' bg-gray-100'}
                      value={currentData.cylinder14_2kg.total.toFixed(2)}
                      readOnly
                    />
                  </div>
                </div>

                {/* 10 KG */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">10 KG - Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      className={inputCls}
                      value={currentData.cylinder10kg.amount || ''}
                      onChange={(e) => handleCylinderChange('cylinder10kg', 'amount', parseFloat(e.target.value) || 0)}
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">10 KG - Quantity</label>
                        <input
                          type="number"
                      className={inputCls}
                      value={currentData.cylinder10kg.quantity || ''}
                      onChange={(e) => handleCylinderChange('cylinder10kg', 'quantity', parseInt(e.target.value) || 0)}
                      placeholder="Enter quantity"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">10 KG - Total</label>
                        <input
                          type="number"
                      className={inputCls + ' bg-gray-100'}
                      value={currentData.cylinder10kg.total.toFixed(2)}
                      readOnly
                    />
            </div>
          </div>

                {/* 5 KG */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">5 KG - Amount</label>
                <input
                  type="number"
                      step="0.01"
                      className={inputCls}
                      value={currentData.cylinder5kg.amount || ''}
                      onChange={(e) => handleCylinderChange('cylinder5kg', 'amount', parseFloat(e.target.value) || 0)}
                      placeholder="Enter amount"
                />
              </div>
              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">5 KG - Quantity</label>
                <input
                  type="number"
                      className={inputCls}
                      value={currentData.cylinder5kg.quantity || ''}
                      onChange={(e) => handleCylinderChange('cylinder5kg', 'quantity', parseInt(e.target.value) || 0)}
                      placeholder="Enter quantity"
                />
              </div>
              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">5 KG - Total</label>
                    <input
                      type="number"
                      className={inputCls + ' bg-gray-100'}
                      value={currentData.cylinder5kg.total.toFixed(2)}
                      readOnly
                    />
                  </div>
                </div>

                {/* 19 KG */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">19 KG - Amount</label>
                <input
                  type="number"
                      step="0.01"
                      className={inputCls}
                      value={currentData.cylinder19kg.amount || ''}
                      onChange={(e) => handleCylinderChange('cylinder19kg', 'amount', parseFloat(e.target.value) || 0)}
                      placeholder="Enter amount"
                />
              </div>
              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">19 KG - Quantity</label>
                <input
                  type="number"
                      className={inputCls}
                      value={currentData.cylinder19kg.quantity || ''}
                      onChange={(e) => handleCylinderChange('cylinder19kg', 'quantity', parseInt(e.target.value) || 0)}
                      placeholder="Enter quantity"
                />
              </div>
              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">19 KG - Total</label>
                <input
                  type="number"
                      className={inputCls + ' bg-gray-100'}
                      value={currentData.cylinder19kg.total.toFixed(2)}
                      readOnly
                    />
                  </div>
                </div>

                {/* Total */}
                <div className="mt-4 p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total Cylinder Amount:</span>
                    <span className="text-2xl font-bold text-amber-600">₹{currentData.cylinderTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Information */}
          {selectedMemberId && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-5 lg:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
                Payment Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Online Payment</label>
                  <input
                    type="number"
                    step="0.01"
                    className={inputCls}
                    value={currentData.onlinePayment || ''}
                    onChange={(e) => handlePaymentChange('onlinePayment', parseFloat(e.target.value) || 0)}
                    placeholder="Enter online payment amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cash</label>
                  <input
                    type="number"
                    step="0.01"
                    className={inputCls}
                    value={currentData.cash || ''}
                    onChange={(e) => handlePaymentChange('cash', parseFloat(e.target.value) || 0)}
                    placeholder="Enter cash amount"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Cash Denomination */}
          {selectedMemberId && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-5 lg:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Cash Denomination
            </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">₹500 Notes</label>
                <input
                  type="number"
                    className={inputCls}
                    value={currentData.cashDenomination.denomination500 || ''}
                    onChange={(e) => handleCashDenominationChange('denomination500', parseInt(e.target.value) || 0)}
                    placeholder="Number of notes"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">₹200 Notes</label>
                <input
                  type="number"
                    className={inputCls}
                    value={currentData.cashDenomination.denomination200 || ''}
                    onChange={(e) => handleCashDenominationChange('denomination200', parseInt(e.target.value) || 0)}
                    placeholder="Number of notes"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">₹100 Notes</label>
                <input
                  type="number"
                    className={inputCls}
                    value={currentData.cashDenomination.denomination100 || ''}
                    onChange={(e) => handleCashDenominationChange('denomination100', parseInt(e.target.value) || 0)}
                    placeholder="Number of notes"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">₹50 Notes</label>
                <input
                  type="number"
                    className={inputCls}
                    value={currentData.cashDenomination.denomination50 || ''}
                    onChange={(e) => handleCashDenominationChange('denomination50', parseInt(e.target.value) || 0)}
                    placeholder="Number of notes"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">₹20 Notes</label>
                <input
                  type="number"
                    className={inputCls}
                    value={currentData.cashDenomination.denomination20 || ''}
                    onChange={(e) => handleCashDenominationChange('denomination20', parseInt(e.target.value) || 0)}
                    placeholder="Number of notes"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">₹10 Notes</label>
                <input
                  type="number"
                    className={inputCls}
                    value={currentData.cashDenomination.denomination10 || ''}
                    onChange={(e) => handleCashDenominationChange('denomination10', parseInt(e.target.value) || 0)}
                    placeholder="Number of notes"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Old Pending</label>
                  <input
                    type="number"
                    step="0.01"
                    className={inputCls}
                    value={currentData.cashDenomination.oldPending || ''}
                    onChange={(e) => handleCashDenominationChange('oldPending', parseFloat(e.target.value) || 0)}
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Old Balance</label>
                  <input
                    type="number"
                    step="0.01"
                    className={inputCls}
                    value={currentData.cashDenomination.oldBalance || ''}
                    onChange={(e) => handleCashDenominationChange('oldBalance', parseFloat(e.target.value) || 0)}
                    placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Coins</label>
                <input
                  type="number"
                    step="0.01"
                    className={inputCls}
                    value={currentData.cashDenomination.coins || ''}
                    onChange={(e) => handleCashDenominationChange('coins', parseFloat(e.target.value) || 0)}
                    placeholder="Enter amount"
                />
              </div>
                <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Grand Total</label>
                <input
                  type="number"
                    className={inputCls + ' bg-gray-100 font-bold text-lg'}
                    value={currentData.cashDenomination.grandTotal.toFixed(2)}
                  readOnly
                />
              </div>
              </div>
            </div>
          )}


          {/* Delivery Men Summary */}
          {selectedMemberId && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-5 lg:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Delivery Men Summary
            </h2>
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 sm:p-5 lg:p-6 border border-amber-200">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-amber-200">
                    <span className="font-medium text-gray-700">Member Name:</span>
                    <span className="font-semibold text-gray-900">{currentData.memberName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-amber-200">
                    <span className="font-medium text-gray-700">Date:</span>
                    <span className="font-semibold text-gray-900">{currentData.date}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-amber-200">
                    <span className="font-medium text-gray-700">14.2 KG Total:</span>
                    <span className="font-semibold text-gray-900">₹{currentData.cylinder14_2kg.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-amber-200">
                    <span className="font-medium text-gray-700">10 KG Total:</span>
                    <span className="font-semibold text-gray-900">₹{currentData.cylinder10kg.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-amber-200">
                    <span className="font-medium text-gray-700">5 KG Total:</span>
                    <span className="font-semibold text-gray-900">₹{currentData.cylinder5kg.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-amber-200">
                    <span className="font-medium text-gray-700">19 KG Total:</span>
                    <span className="font-semibold text-gray-900">₹{currentData.cylinder19kg.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-amber-200">
                    <span className="font-medium text-gray-700">Cylinder Total:</span>
                    <span className="font-semibold text-amber-600">₹{currentData.cylinderTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-amber-200">
                    <span className="font-medium text-gray-700">Online Payment:</span>
                    <span className="font-semibold text-gray-900">₹{currentData.onlinePayment.toFixed(2)}</span>
                    </div>
                  <div className="flex justify-between items-center py-2 border-b border-amber-200">
                    <span className="font-medium text-gray-700">Cash:</span>
                    <span className="font-semibold text-gray-900">₹{currentData.cash.toFixed(2)}</span>
                    </div>
                  <div className="flex justify-between items-center py-2 border-b border-amber-200">
                    <span className="font-medium text-gray-700">Cash Denomination Total:</span>
                    <span className="font-semibold text-gray-900">₹{currentData.cashDenomination.grandTotal.toFixed(2)}</span>
                    </div>
                  <div className="flex justify-between items-center py-3 mt-4 bg-amber-100 rounded-lg px-4">
                    <span className="text-lg font-bold text-gray-900">Grand Total:</span>
                    <span className="text-2xl font-bold text-amber-600">₹{currentData.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => router.push('/daily-updates')}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !selectedMemberId}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-60 text-sm sm:text-base"
            >
              {saving ? 'Saving...' : <><span className="hidden sm:inline">Save Daily Update</span><span className="sm:hidden">Save</span></>}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
    </ProtectedRoute>
  );
} 
