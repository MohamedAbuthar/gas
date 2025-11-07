'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import DashboardLayout from '../../components/DashboardLayout';
import { listDailyUpdates, deleteDailyUpdate, type DailyUpdate } from '@/lib/db';
import { exportToExcel } from '@/lib/excel';

interface ParsedDeliveryManData {
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

export default function DailyUpdatesPage() {
  const router = useRouter();
  const [updates, setUpdates] = useState<DailyUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUpdate, setSelectedUpdate] = useState<DailyUpdate | null>(null);
  const [parsedData, setParsedData] = useState<Record<string, ParsedDeliveryManData>>({});
  const [selectedUpdates, setSelectedUpdates] = useState<Set<string>>(new Set());

  const load = async () => {
    setLoading(true);
    try {
      const data = await listDailyUpdates();
      setUpdates(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const parseDescription = (description: string): Record<string, ParsedDeliveryManData> => {
    try {
      return JSON.parse(description);
    } catch {
      return {};
    }
  };

  const handleViewDetails = (update: DailyUpdate) => {
    setSelectedUpdate(update);
    if (update.description) {
      setParsedData(parseDescription(update.description));
    }
  };

  const handleDownloadUpdate = (update: DailyUpdate) => {
    if (!update.description) {
      toast.error('No data to export');
      return;
    }
    const data = parseDescription(update.description);
    if (Object.keys(data).length === 0) {
      toast.error('No data to export');
      return;
    }
    exportToExcel(data, update.date);
    toast.success('Excel file downloaded successfully');
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = new Set(updates.filter(u => u.id).map(u => u.id!));
      setSelectedUpdates(allIds);
    } else {
      setSelectedUpdates(new Set());
    }
  };

  const handleSelectUpdate = (updateId: string, checked: boolean) => {
    const newSelected = new Set(selectedUpdates);
    if (checked) {
      newSelected.add(updateId);
    } else {
      newSelected.delete(updateId);
    }
    setSelectedUpdates(newSelected);
  };

  const handleBulkDownload = () => {
    if (selectedUpdates.size === 0) {
      toast.warning('Please select at least one update to download');
      return;
    }

    // Combine all selected updates data
    const combinedData: Record<string, ParsedDeliveryManData> = {};
    
    updates.forEach(update => {
      if (update.id && selectedUpdates.has(update.id) && update.description) {
        const data = parseDescription(update.description);
        Object.assign(combinedData, data);
      }
    });

    if (Object.keys(combinedData).length === 0) {
      toast.error('No data to export');
      return;
    }

    const firstUpdate = updates.find(u => u.id && selectedUpdates.has(u.id));
    exportToExcel(combinedData, firstUpdate?.date);
    toast.success(`Successfully downloaded ${selectedUpdates.size} update(s)`);
  };

  const handleAddNew = () => {
    router.push('/daily-updates/add');
  };

  const onEdit = (row: DailyUpdate) => {
    if (!row.id) return;
    router.push(`/daily-updates/edit/${row.id}`);
  };

  const onDelete = async (row: DailyUpdate) => {
    if (!row.id) return;
    if (confirm('Are you sure you want to delete this update?')) {
      try {
    await deleteDailyUpdate(row.id);
    await load();
        toast.success('Daily update deleted successfully');
      } catch {
        toast.error('Failed to delete daily update');
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
              <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Daily Updates</h1>
              <p className="text-sm sm:text-base text-gray-600 hidden sm:block">Track and manage daily progress updates from your gas operations team</p>
            </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {selectedUpdates.size > 0 && (
                  <button
                    onClick={handleBulkDownload}
                    className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm sm:text-base"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="hidden sm:inline">Download Selected</span>
                    <span className="sm:hidden">Download</span>
                    <span className="sm:inline">({selectedUpdates.size})</span>
                  </button>
                )}
                <button
                  onClick={handleAddNew}
                  className="px-3 sm:px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center gap-2 text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="hidden sm:inline">Add Update</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
            </div>
        </div>

        {/* Updates List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    <input
                      type="checkbox"
                      checked={updates.length > 0 && selectedUpdates.size === updates.filter(u => u.id).length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : updates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No updates found</td>
                  </tr>
                ) : (
                  updates.map((update) => {
                    const data = update.description ? parseDescription(update.description) : {};
                    const members = Object.values(data);
                    const firstMember = members[0];
                    const isSelected = update.id ? selectedUpdates.has(update.id) : false;
                    
                    return (
                      <tr key={update.id} className={`hover:bg-gray-50 ${isSelected ? 'bg-amber-50' : ''}`}>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => update.id && handleSelectUpdate(update.id, e.target.checked)}
                            className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                          />
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{update.date}</td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {firstMember?.memberName || update.author || 'N/A'}
                          {members.length > 1 && ` (+${members.length - 1} more)`}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            update.status === 'completed' ? 'bg-green-100 text-green-800' :
                            update.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {update.status}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2 lg:gap-4">
                            <button
                              onClick={() => handleViewDetails(update)}
                              className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDownloadUpdate(update)}
                              className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                              title="Download Excel"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => onEdit(update)}
                              className="p-2 text-amber-600 hover:text-amber-900 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => onDelete(update)}
                              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-200">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : updates.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No updates found</div>
            ) : (
              updates.map((update) => {
                const data = update.description ? parseDescription(update.description) : {};
                const members = Object.values(data);
                const firstMember = members[0];
                const isSelected = update.id ? selectedUpdates.has(update.id) : false;
                
                return (
                  <div key={update.id} className={`p-4 ${isSelected ? 'bg-amber-50' : 'bg-white'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => update.id && handleSelectUpdate(update.id, e.target.checked)}
                          className="rounded border-gray-300 text-amber-600 focus:ring-amber-500 mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {firstMember?.memberName || update.author || 'N/A'}
                            {members.length > 1 && ` (+${members.length - 1} more)`}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{update.date}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                        update.status === 'completed' ? 'bg-green-100 text-green-800' :
                        update.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {update.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleViewDetails(update)}
                        className="flex-1 p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="text-xs">View</span>
                      </button>
                      <button
                        onClick={() => handleDownloadUpdate(update)}
                        className="flex-1 p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-xs">Download</span>
                      </button>
                      <button
                        onClick={() => onEdit(update)}
                        className="flex-1 p-2 text-amber-600 hover:text-amber-900 hover:bg-amber-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="text-xs">Edit</span>
                      </button>
                      <button
                        onClick={() => onDelete(update)}
                        className="flex-1 p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span className="text-xs">Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        {/* Details Modal */}
        {selectedUpdate && (
          <div className="fixed inset-0 bg-black/10 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-auto">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Daily Update Details</h2>
                    <p className="text-gray-600 mt-1">
                      {selectedUpdate.date} - {selectedUpdate.author}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadUpdate(selectedUpdate)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Excel
                    </button>
                    <button
                      onClick={() => setSelectedUpdate(null)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>

                {Object.keys(parsedData).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No data available</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                      <thead className="bg-gradient-to-r from-amber-50 to-orange-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase border-b border-gray-300">D MAN</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase border-b border-gray-300">Date</th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase border-b border-gray-300" colSpan={3}>14.2 KG</th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase border-b border-gray-300" colSpan={3}>10 KG</th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase border-b border-gray-300" colSpan={3}>5 KG</th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase border-b border-gray-300" colSpan={3}>19 KG</th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase border-b border-gray-300">Cylinder Total</th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase border-b border-gray-300">Online</th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase border-b border-gray-300">Cash</th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase border-b border-gray-300">Grand Total</th>
                        </tr>
                        <tr>
                          <th></th>
                          <th></th>
                          <th className="px-2 py-2 text-xs font-medium text-gray-600 border-b border-gray-200">Amount</th>
                          <th className="px-2 py-2 text-xs font-medium text-gray-600 border-b border-gray-200">Qty</th>
                          <th className="px-2 py-2 text-xs font-medium text-gray-600 border-b border-gray-200">Total</th>
                          <th className="px-2 py-2 text-xs font-medium text-gray-600 border-b border-gray-200">Amount</th>
                          <th className="px-2 py-2 text-xs font-medium text-gray-600 border-b border-gray-200">Qty</th>
                          <th className="px-2 py-2 text-xs font-medium text-gray-600 border-b border-gray-200">Total</th>
                          <th className="px-2 py-2 text-xs font-medium text-gray-600 border-b border-gray-200">Amount</th>
                          <th className="px-2 py-2 text-xs font-medium text-gray-600 border-b border-gray-200">Qty</th>
                          <th className="px-2 py-2 text-xs font-medium text-gray-600 border-b border-gray-200">Total</th>
                          <th className="px-2 py-2 text-xs font-medium text-gray-600 border-b border-gray-200">Amount</th>
                          <th className="px-2 py-2 text-xs font-medium text-gray-600 border-b border-gray-200">Qty</th>
                          <th className="px-2 py-2 text-xs font-medium text-gray-600 border-b border-gray-200">Total</th>
                          <th></th>
                          <th></th>
                          <th></th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Object.values(parsedData).map((data, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">{data.memberName}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">{data.date}</td>
                            <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-700 text-center border-r border-gray-200">{data.cylinder14_2kg.amount.toFixed(2)}</td>
                            <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-700 text-center border-r border-gray-200">{data.cylinder14_2kg.quantity}</td>
                            <td className="px-2 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 text-center border-r border-gray-200">{data.cylinder14_2kg.total.toFixed(2)}</td>
                            <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-700 text-center border-r border-gray-200">{data.cylinder10kg.amount.toFixed(2)}</td>
                            <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-700 text-center border-r border-gray-200">{data.cylinder10kg.quantity}</td>
                            <td className="px-2 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 text-center border-r border-gray-200">{data.cylinder10kg.total.toFixed(2)}</td>
                            <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-700 text-center border-r border-gray-200">{data.cylinder5kg.amount.toFixed(2)}</td>
                            <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-700 text-center border-r border-gray-200">{data.cylinder5kg.quantity}</td>
                            <td className="px-2 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 text-center border-r border-gray-200">{data.cylinder5kg.total.toFixed(2)}</td>
                            <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-700 text-center border-r border-gray-200">{data.cylinder19kg.amount.toFixed(2)}</td>
                            <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-700 text-center border-r border-gray-200">{data.cylinder19kg.quantity}</td>
                            <td className="px-2 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 text-center border-r border-gray-200">{data.cylinder19kg.total.toFixed(2)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-amber-600 text-center border-r border-gray-200">{data.cylinderTotal.toFixed(2)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center border-r border-gray-200">{data.onlinePayment.toFixed(2)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center border-r border-gray-200">{data.cash.toFixed(2)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-green-600 text-center">{data.grandTotal.toFixed(2)}</td>
                          </tr>
                        ))}
                        {/* Total Row */}
                        {Object.values(parsedData).length > 1 && (
                          <tr className="bg-amber-50 font-bold">
                            <td className="px-4 py-3 whitespace-nowrap text-sm border-r border-gray-300">TOTAL</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm border-r border-gray-300"></td>
                            <td className="px-2 py-3 whitespace-nowrap text-sm text-center border-r border-gray-300">
                              {Object.values(parsedData).reduce((sum, d) => sum + d.cylinder14_2kg.amount, 0).toFixed(2)}
                            </td>
                            <td className="px-2 py-3 whitespace-nowrap text-sm text-center border-r border-gray-300">
                              {Object.values(parsedData).reduce((sum, d) => sum + d.cylinder14_2kg.quantity, 0)}
                            </td>
                            <td className="px-2 py-3 whitespace-nowrap text-sm text-center border-r border-gray-300">
                              {Object.values(parsedData).reduce((sum, d) => sum + d.cylinder14_2kg.total, 0).toFixed(2)}
                            </td>
                            <td className="px-2 py-3 whitespace-nowrap text-sm text-center border-r border-gray-300">
                              {Object.values(parsedData).reduce((sum, d) => sum + d.cylinder10kg.amount, 0).toFixed(2)}
                            </td>
                            <td className="px-2 py-3 whitespace-nowrap text-sm text-center border-r border-gray-300">
                              {Object.values(parsedData).reduce((sum, d) => sum + d.cylinder10kg.quantity, 0)}
                            </td>
                            <td className="px-2 py-3 whitespace-nowrap text-sm text-center border-r border-gray-300">
                              {Object.values(parsedData).reduce((sum, d) => sum + d.cylinder10kg.total, 0).toFixed(2)}
                            </td>
                            <td className="px-2 py-3 whitespace-nowrap text-sm text-center border-r border-gray-300">
                              {Object.values(parsedData).reduce((sum, d) => sum + d.cylinder5kg.amount, 0).toFixed(2)}
                            </td>
                            <td className="px-2 py-3 whitespace-nowrap text-sm text-center border-r border-gray-300">
                              {Object.values(parsedData).reduce((sum, d) => sum + d.cylinder5kg.quantity, 0)}
                            </td>
                            <td className="px-2 py-3 whitespace-nowrap text-sm text-center border-r border-gray-300">
                              {Object.values(parsedData).reduce((sum, d) => sum + d.cylinder5kg.total, 0).toFixed(2)}
                            </td>
                            <td className="px-2 py-3 whitespace-nowrap text-sm text-center border-r border-gray-300">
                              {Object.values(parsedData).reduce((sum, d) => sum + d.cylinder19kg.amount, 0).toFixed(2)}
                            </td>
                            <td className="px-2 py-3 whitespace-nowrap text-sm text-center border-r border-gray-300">
                              {Object.values(parsedData).reduce((sum, d) => sum + d.cylinder19kg.quantity, 0)}
                            </td>
                            <td className="px-2 py-3 whitespace-nowrap text-sm text-center border-r border-gray-300">
                              {Object.values(parsedData).reduce((sum, d) => sum + d.cylinder19kg.total, 0).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center border-r border-gray-300">
                              {Object.values(parsedData).reduce((sum, d) => sum + d.cylinderTotal, 0).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center border-r border-gray-300">
                              {Object.values(parsedData).reduce((sum, d) => sum + d.onlinePayment, 0).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center border-r border-gray-300">
                              {Object.values(parsedData).reduce((sum, d) => sum + d.cash, 0).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                              {Object.values(parsedData).reduce((sum, d) => sum + d.grandTotal, 0).toFixed(2)}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                    {/* Cash Denomination Table */}
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Denomination</h3>
                      <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                        <thead className="bg-gradient-to-r from-amber-50 to-orange-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase border-b border-gray-300">Member</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase border-b border-gray-300">₹500</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase border-b border-gray-300">₹200</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase border-b border-gray-300">₹100</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase border-b border-gray-300">₹50</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase border-b border-gray-300">₹20</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase border-b border-gray-300">₹10</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase border-b border-gray-300">Old Pending</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase border-b border-gray-300">Old Balance</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase border-b border-gray-300">Coins</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase border-b border-gray-300">Grand Total</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {Object.values(parsedData).map((data, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">{data.memberName}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center border-r border-gray-200">{data.cashDenomination.denomination500}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center border-r border-gray-200">{data.cashDenomination.denomination200}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center border-r border-gray-200">{data.cashDenomination.denomination100}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center border-r border-gray-200">{data.cashDenomination.denomination50}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center border-r border-gray-200">{data.cashDenomination.denomination20}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center border-r border-gray-200">{data.cashDenomination.denomination10}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center border-r border-gray-200">{data.cashDenomination.oldPending.toFixed(2)}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center border-r border-gray-200">{data.cashDenomination.oldBalance.toFixed(2)}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center border-r border-gray-200">{data.cashDenomination.coins.toFixed(2)}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-green-600 text-center">{data.cashDenomination.grandTotal.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 
