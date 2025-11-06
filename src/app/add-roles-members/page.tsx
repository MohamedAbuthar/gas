'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';

interface Role extends Record<string, unknown> {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  department: string;
}

interface Member extends Record<string, unknown> {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  joinDate: string;
  status: 'active' | 'inactive';
}

export default function AddRolesMembersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'roles' | 'members'>('roles');
  
  const [roles] = useState<Role[]>([
    {
      id: 1,
      name: 'Pipeline Operator',
      description: 'Responsible for monitoring and controlling gas pipeline operations',
      permissions: ['read', 'write', 'monitor'],
      department: 'Operations'
    },
    {
      id: 2,
      name: 'Safety Inspector',
      description: 'Ensures compliance with safety regulations and conducts inspections',
      permissions: ['read', 'write', 'inspect', 'report'],
      department: 'Safety'
    },
    {
      id: 3,
      name: 'Maintenance Technician',
      description: 'Performs routine maintenance and repairs on gas infrastructure',
      permissions: ['read', 'write', 'maintain'],
      department: 'Maintenance'
    },
    {
      id: 4,
      name: 'Field Supervisor',
      description: 'Manages field operations and coordinates team activities',
      permissions: ['read', 'write', 'manage', 'admin'],
      department: 'Management'
    }
  ]);

  const [members] = useState<Member[]>([
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@gascompany.com',
      role: 'Pipeline Operator',
      department: 'Operations',
      joinDate: '2023-01-15',
      status: 'active'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@gascompany.com',
      role: 'Safety Inspector',
      department: 'Safety',
      joinDate: '2023-02-20',
      status: 'active'
    },
    {
      id: 3,
      name: 'Mike Davis',
      email: 'mike.davis@gascompany.com',
      role: 'Maintenance Technician',
      department: 'Maintenance',
      joinDate: '2023-03-10',
      status: 'active'
    },
    {
      id: 4,
      name: 'Lisa Wilson',
      email: 'lisa.wilson@gascompany.com',
      role: 'Field Supervisor',
      department: 'Management',
      joinDate: '2023-01-05',
      status: 'active'
    }
  ]);

  const roleColumns = [
    { key: 'name', label: 'Role Name', sortable: true },
    { key: 'description', label: 'Description', sortable: true },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'permissions', label: 'Permissions', sortable: false }
  ];

  const memberColumns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'joinDate', label: 'Join Date', sortable: true },
    { key: 'status', label: 'Status', sortable: true }
  ];

  const handleAddRole = () => {
    router.push('/add-roles-members/add-role');
  };

  const handleAddMember = () => {
    router.push('/add-roles-members/add-member');
  };

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
              <h1 className="text-3xl font-bold text-gray-900">Add Roles & Members</h1>
              <p className="text-gray-600">Create new roles and add team members to your gas operations</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6 overflow-hidden">
          <div className="border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('roles')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'roles'
                    ? 'border-amber-500 text-amber-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Manage Roles
                </div>
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'members'
                    ? 'border-amber-500 text-amber-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  Manage Members
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'roles' && (
              <DataTable<Role>
                columns={roleColumns}
                data={roles}
                title="Gas Operations Roles"
                onAddNew={handleAddRole}
                addButtonText="Add Role"
              />
            )}

            {activeTab === 'members' && (
              <DataTable<Member>
                columns={memberColumns}
                data={members}
                title="Gas Operations Team"
                onAddNew={handleAddMember}
                addButtonText="Add Member"
              />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
