'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';
import { listAttendanceByDate, deleteAttendance, type AttendanceRecord } from '@/lib/db';

export default function AttendancePage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryMen, setDeliveryMen] = useState<AttendanceRecord[]>([]);

  const load = async (date: string) => {
    const data = await listAttendanceByDate(date);
    setDeliveryMen(data);
  };

  useEffect(() => {
    load(selectedDate);
  }, [selectedDate]);

  const columns = [
    { key: 'deliveryManName', label: 'Delivery Man', sortable: true },
    { key: 'employeeId', label: 'Employee ID', sortable: true },
    { key: 'phone', label: 'Phone', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'checkInTime', label: 'Check In', sortable: true },
    { key: 'checkOutTime', label: 'Check Out', sortable: true },
    { key: 'totalHours', label: 'Total Hours', sortable: true },
    { key: 'location', label: 'Zone', sortable: true },
    { key: 'vehicleNumber', label: 'Vehicle No.', sortable: true },
    { key: 'notes', label: 'Notes', sortable: true }
  ];

  const handleAddNew = () => {
    router.push('/attendance/add');
  };

  const onEdit = (row: AttendanceRecord) => {
    if (!row.id) return;
    router.push(`/attendance/edit/${row.id}`);
  };

  const onDelete = async (row: AttendanceRecord) => {
    if (!row.id) return;
    await deleteAttendance(row.id);
    await load(selectedDate);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  const getAttendanceStats = () => {
    const total = deliveryMen.length;
    const present = deliveryMen.filter(dm => dm.status === 'present').length;
    const absent = deliveryMen.filter(dm => dm.status === 'absent').length;
    const late = deliveryMen.filter(dm => dm.status === 'late').length;
    const halfDay = deliveryMen.filter(dm => dm.status === 'half-day').length;
    const leave = deliveryMen.filter(dm => dm.status === 'leave').length;

    return { total, present, absent, late, halfDay, leave };
  };

  const stats = getAttendanceStats();

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header and controls remain the same */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Delivery Men Attendance</h1>
              <p className="text-gray-600">Track daily attendance and working hours of gas delivery personnel</p>
            </div>
          </div>
        </div>

        {/* Date Selector */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedDate(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0])}
                className="px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Previous Day
              </button>
              <button
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="px-3 py-2 text-sm text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setSelectedDate(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])}
                className="px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Next Day
              </button>
            </div>
          </div>
        </div>

        {/* Stats (unchanged) */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          {/* cards using stats */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Present</p>
                <p className="text-xl font-bold text-gray-900">{stats.present}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Absent</p>
                <p className="text-xl font-bold text-gray-900">{stats.absent}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Late</p>
                <p className="text-xl font-bold text-gray-900">{stats.late}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Half Day</p>
                <p className="text-xl font-bold text-gray-900">{stats.halfDay}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Leave</p>
                <p className="text-xl font-bold text-gray-900">{stats.leave}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <DataTable
          columns={columns}
          data={deliveryMen}
          title="Daily Attendance Report"
          onAddNew={handleAddNew}
          addButtonText="Add Attendance"
          onEdit={onEdit}
          onDelete={onDelete}
          idKey="id"
        />
      </div>
    </DashboardLayout>
  );
} 