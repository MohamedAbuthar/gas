'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import DataTable from '../../components/DataTable';
import { listMembers, deleteMember, type MemberRecord } from '@/lib/db';

export default function MemberDetailsPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<MemberRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    const data = await listMembers();
    setMembers(data);
  };

  useEffect(() => {
    load();
  }, []);

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'joinDate', label: 'Join Date', sortable: true },
    { key: 'status', label: 'Status', sortable: true }
  ];

  const handleAddNew = () => {
    router.push('/member-details/add');
  };

  const onEdit = (row: MemberRecord) => {
    if (!row.id) return;
    router.push(`/member-details/edit/${row.id}`);
  };

  const onDelete = (row: MemberRecord) => {
    setDeleteConfirm(row);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm?.id) return;
    setDeleting(true);
    try {
      await deleteMember(deleteConfirm.id);
      await load();
      setDeleteConfirm(null);
      toast.success('Member deleted successfully');
    } catch (err) {
      console.error('Delete failed', err);
      toast.error('Failed to delete member. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Member Details</h1>
              <p className="text-gray-600">View and manage all gas operations team member information</p>
            </div>
          </div>
        </div>
        
        <DataTable
          columns={columns}
          data={members}
          title="Gas Operations Team"
          onAddNew={isAdmin() ? handleAddNew : undefined}
          addButtonText="Add Member"
          onEdit={isAdmin() ? onEdit : undefined}
          onDelete={isAdmin() ? onDelete : undefined}
          idKey="id"
        />
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Delete Member</h3>
              </div>
              <p className="text-gray-600 mb-2">
                Are you sure you want to delete <span className="font-semibold text-gray-900">{deleteConfirm.name}</span>?
              </p>
              <p className="text-sm text-gray-500 mb-6">
                This action cannot be undone. All member data will be permanently removed.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {deleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
    </ProtectedRoute>
  );
} 