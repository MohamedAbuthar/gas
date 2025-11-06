'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import DashboardLayout from '../../../components/DashboardLayout';
import { createMember, type MemberRecord } from '@/lib/db';

export default function AddMemberPage() {
  const router = useRouter();
  const [form, setForm] = useState<MemberRecord>({
    name: '',
    email: '',
    role: '',
    department: '',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'active',
  });
  const [saving, setSaving] = useState(false);

  const onChange = (field: keyof MemberRecord, value: MemberRecord[keyof MemberRecord]) => setForm(prev => ({ ...prev, [field]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createMember(form);
      toast.success('Member created successfully');
      router.push('/member-details');
    } catch (err) {
      console.error('Create member failed', err);
      toast.error('Failed to save member. Please check Firestore rules and try again.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-gray-900 placeholder-gray-500';

  return (
    <DashboardLayout>
      <div className="p-6">
        <form onSubmit={onSubmit} className="space-y-6 max-w-3xl">
          <h1 className="text-2xl font-bold">Add Member</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input className={inputCls} placeholder="John Doe" value={form.name} onChange={(e)=>onChange('name', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input className={inputCls} type="email" placeholder="john@example.com" value={form.email} onChange={(e)=>onChange('email', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <input className={inputCls} placeholder="Pipeline Operator" value={form.role} onChange={(e)=>onChange('role', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <input className={inputCls} placeholder="Operations" value={form.department} onChange={(e)=>onChange('department', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Join Date</label>
              <input type="date" className={inputCls} value={form.joinDate} onChange={(e)=>onChange('joinDate', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select className={inputCls} value={form.status} onChange={(e)=>onChange('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={()=>router.push('/member-details')} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-60">{saving? 'Saving...' : 'Save Member'}</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
