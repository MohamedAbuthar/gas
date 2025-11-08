"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '../../../../components/DashboardLayout';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import { getAttendance, updateAttendance, type AttendanceRecord } from '@/lib/db';

export default function EditAttendancePage() {
  const params = useParams();
  const id = String(params?.id || '');
  const router = useRouter();
  const [data, setData] = useState<AttendanceRecord | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const doc = await getAttendance(id);
      if (mounted) setData(doc);
    })();
    return () => { mounted = false; };
  }, [id]);

  const handleChange = (field: keyof AttendanceRecord, value: AttendanceRecord[keyof AttendanceRecord]) => {
    setData(prev => prev ? ({ ...prev, [field]: value }) : prev);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.id) return;
    setSaving(true);
    await updateAttendance(data.id, {
      status: data.status,
      checkInTime: data.checkInTime,
      checkOutTime: data.checkOutTime,
      totalHours: data.totalHours,
      location: data.location,
      vehicleNumber: data.vehicleNumber,
      notes: data.notes,
    });
    setSaving(false);
    router.push('/attendance');
  };

  if (!data) {
    return (
      <ProtectedRoute requireAdmin>
        <DashboardLayout>
          <div className="p-6">Loading...</div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin>
      <DashboardLayout>
      <div className="p-6">
        <form onSubmit={onSubmit} className="space-y-6 max-w-3xl">
          <h1 className="text-2xl font-bold">Edit Attendance</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={data.status} onChange={(e)=>handleChange('status', e.target.value)}>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="half-day">Half Day</option>
                <option value="leave">Leave</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Check In</label>
              <input type="time" className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={data.checkInTime} onChange={(e)=>handleChange('checkInTime', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Check Out</label>
              <input type="time" className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={data.checkOutTime} onChange={(e)=>handleChange('checkOutTime', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Hours</label>
              <input className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={data.totalHours} onChange={(e)=>handleChange('totalHours', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Zone</label>
              <input className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={data.location} onChange={(e)=>handleChange('location', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle No.</label>
              <input className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={data.vehicleNumber} onChange={(e)=>handleChange('vehicleNumber', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={data.notes} onChange={(e)=>handleChange('notes', e.target.value)} />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={()=>router.push('/attendance')} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-white bg-amber-600 hover:bg-amber-700">{saving? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
    </ProtectedRoute>
  );
}
