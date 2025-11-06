"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import DashboardLayout from '../../../../components/DashboardLayout';
import { getMember, updateMember, type MemberRecord } from '@/lib/db';

export default function EditMemberPage() {
  const params = useParams();
  const id = String(params?.id || '');
  const router = useRouter();
  const [form, setForm] = useState<MemberRecord | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const doc = await getMember(id);
      if (mounted) setForm(doc);
    })();
    return () => { mounted = false; };
  }, [id]);

  const onChange = (field: keyof MemberRecord, value: MemberRecord[keyof MemberRecord]) => setForm(prev => prev ? ({ ...prev, [field]: value }) : prev);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form?.id) return;
    setSaving(true);
    try {
      await updateMember(form.id, {
        name: form.name,
        email: form.email,
        role: form.role,
        department: form.department,
        joinDate: form.joinDate,
        status: form.status,
      });
      toast.success('Member updated successfully');
      router.push('/member-details');
    } catch (err) {
      console.error('Update failed', err);
      toast.error('Failed to update member. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!form) {
    return (
      <DashboardLayout>
        <div className="p-6">Loading...</div>
      </DashboardLayout>
    );
  }

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-gray-900 placeholder-gray-500';

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Member</h1>
              <p className="text-gray-600">Update member information</p>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-6 max-w-3xl">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input className={inputCls} value={form.name || ''} onChange={(e)=>onChange('name', e.target.value)} placeholder="Enter name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input className={inputCls} type="email" value={form.email || ''} onChange={(e)=>onChange('email', e.target.value)} placeholder="Enter email" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <input className={inputCls} value={form.role || ''} onChange={(e)=>onChange('role', e.target.value)} placeholder="Enter role" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <input className={inputCls} value={form.department || ''} onChange={(e)=>onChange('department', e.target.value)} placeholder="Enter department" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Join Date</label>
                <input type="date" className={inputCls} value={form.joinDate || ''} onChange={(e)=>onChange('joinDate', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select className={inputCls} value={form.status || 'active'} onChange={(e)=>onChange('status', e.target.value)}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={()=>router.push('/member-details')} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-6 py-3 rounded-lg text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
