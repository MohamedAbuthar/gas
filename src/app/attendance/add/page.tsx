'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import DashboardLayout from '../../../components/DashboardLayout';
import { createAttendance, type AttendanceRecord } from '@/lib/db';

interface AttendanceForm {
  date: string;
  deliveryManId: string;
  deliveryManName: string;
  employeeId: string;
  phone: string;
  status: 'present' | 'absent' | 'late' | 'half-day' | 'leave';
  checkInTime: string;
  checkOutTime: string;
  totalHours: string;
  location: string;
  vehicleNumber: string;
  notes: string;
  overtime: number;
  lateMinutes: number;
  earlyDeparture: number;
}

export default function AddAttendancePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<AttendanceForm>({
    date: new Date().toISOString().split('T')[0],
    deliveryManId: '',
    deliveryManName: '',
    employeeId: '',
    phone: '',
    status: 'present',
    checkInTime: '',
    checkOutTime: '',
    totalHours: '',
    location: '',
    vehicleNumber: '',
    notes: '',
    overtime: 0,
    lateMinutes: 0,
    earlyDeparture: 0
  });
  const [saving, setSaving] = useState(false);

  const deliveryMen = [
    { id: 'DM001', name: 'Ponnusamy', employeeId: 'DM001', phone: '+91 98765 43210' },
    { id: 'DM002', name: 'Moorthy', employeeId: 'DM002', phone: '+91 98765 43211' },
    { id: 'DM003', name: 'VENKITASAMY', employeeId: 'DM003', phone: '+91 98765 43212' },
    { id: 'DM004', name: 'Rajendran', employeeId: 'DM004', phone: '+91 98765 43213' },
    { id: 'DM005', name: 'Ranjith', employeeId: 'DM005', phone: '+91 98765 43214' },
    { id: 'DM006', name: 'Ronalt Victor', employeeId: 'DM006', phone: '+91 98765 43215' },
    { id: 'DM007', name: 'Shenbagaraja', employeeId: 'DM007', phone: '+91 98765 43216' }
  ];

  const zones = [
    'North Zone',
    'South Zone', 
    'East Zone',
    'West Zone',
    'Central Zone'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: AttendanceRecord = {
        ...formData,
        totalHours: formData.totalHours || calculateTotalHours(),
      };
      await createAttendance(payload);
      toast.success('Attendance record created successfully');
      router.push('/attendance');
    } catch (err) {
      console.error('Create attendance failed', err);
      toast.error('Failed to save attendance. Please check Firestore rules and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof AttendanceForm, value: AttendanceForm[keyof AttendanceForm]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeliveryManChange = (deliveryManId: string) => {
    const selectedDeliveryMan = deliveryMen.find(dm => dm.id === deliveryManId);
    if (selectedDeliveryMan) {
      setFormData(prev => ({
        ...prev,
        deliveryManId: selectedDeliveryMan.id,
        deliveryManName: selectedDeliveryMan.name,
        employeeId: selectedDeliveryMan.employeeId,
        phone: selectedDeliveryMan.phone
      }));
    }
  };

  const calculateTotalHours = () => {
    if (formData.checkInTime && formData.checkOutTime) {
      const checkIn = new Date(`2000-01-01T${formData.checkInTime}`);
      const checkOut = new Date(`2000-01-01T${formData.checkOutTime}`);
      const diffMs = checkOut.getTime() - checkIn.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${diffHours}:${diffMinutes.toString().padStart(2, '0')}`;
    }
    return '';
  };

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-gray-900 placeholder-gray-500';

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add Attendance Record</h1>
              <p className="text-gray-600">Record attendance and working hours for gas delivery personnel</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input type="date" className={inputCls} value={formData.date} onChange={(e) => handleInputChange('date', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Man</label>
                <select value={formData.deliveryManId} onChange={(e) => handleDeliveryManChange(e.target.value)} className={inputCls}>
                  <option value="">Select Delivery Man</option>
                  {deliveryMen.map((dm) => (
                    <option key={dm.id} value={dm.id}>{dm.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                <input type="text" className={inputCls + ' bg-gray-50'} value={formData.employeeId} readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input type="text" className={inputCls + ' bg-gray-50'} value={formData.phone} readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select value={formData.status} onChange={(e) => handleInputChange('status', e.target.value)} className={inputCls}>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="half-day">Half Day</option>
                  <option value="leave">Leave</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Zone</label>
                <select value={formData.location} onChange={(e) => handleInputChange('location', e.target.value)} className={inputCls}>
                  <option value="">Select Zone</option>
                  {zones.map((zone) => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Time Tracking */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Time Tracking
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check In Time</label>
                <input type="time" className={inputCls} value={formData.checkInTime} onChange={(e) => handleInputChange('checkInTime', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check Out Time</label>
                <input type="time" className={inputCls} value={formData.checkOutTime} onChange={(e) => handleInputChange('checkOutTime', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Hours</label>
                <input type="text" className={inputCls + ' bg-gray-50'} value={formData.totalHours || calculateTotalHours()} readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Overtime (Hours)</label>
                <input type="number" className={inputCls} value={formData.overtime} onChange={(e) => handleInputChange('overtime', Number(e.target.value))} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Late Minutes</label>
                <input type="number" className={inputCls} value={formData.lateMinutes} onChange={(e) => handleInputChange('lateMinutes', Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Early Departure (Minutes)</label>
                <input type="number" className={inputCls} value={formData.earlyDeparture} onChange={(e) => handleInputChange('earlyDeparture', Number(e.target.value))} />
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V7a2 2 0 012-2h4a2 2 0 012 2v0M8 7v10a2 2 0 002 2h4a2 2 0 002-2V7M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
              </svg>
              Vehicle Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Number</label>
                <input type="text" className={inputCls} value={formData.vehicleNumber} onChange={(e) => handleInputChange('vehicleNumber', e.target.value)} placeholder="TN-01-AB-1234" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                <select className={inputCls}>
                  <option value="">Select Vehicle Type</option>
                  <option value="bike">Bike</option>
                  <option value="auto">Auto Rickshaw</option>
                  <option value="truck">Truck</option>
                  <option value="van">Van</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Additional Notes
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea className={inputCls} rows={4} value={formData.notes} onChange={(e) => handleInputChange('notes', e.target.value)} placeholder="Any additional notes..." />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={() => router.push('/attendance')} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
} 