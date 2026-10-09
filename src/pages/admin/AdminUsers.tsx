import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, UserRole } from '../../types';
import {
  Users,
  Search,
  PlusCircle,
  UserPlus,
  Edit2,
  Trash2,
  Key,
  Shield,
  CheckCircle2,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';

interface AdminUsersProps {
  initialOpenCreateModal?: boolean;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ initialOpenCreateModal = false }) => {
  const { allUsers, setAllUsers } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(initialOpenCreateModal);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<User | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // New user form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');

  const filteredUsers = allUsers.filter((u) => {
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    const matchSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchRole && matchSearch;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      phone,
      department,
      createdAt: new Date().toISOString().split('T')[0],
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      status: 'active',
    };

    setAllUsers((prev) => [newUser, ...prev]);
    setIsCreateModalOpen(false);
    setName('');
    setEmail('');
    setFeedbackNotice(`User "${name}" created successfully with role ${role.toUpperCase()}!`);
    setTimeout(() => setFeedbackNotice(null), 2500);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setAllUsers((prev) =>
      prev.map((u) => (u.id === editingUser.id ? { ...editingUser } : u))
    );
    setEditingUser(null);
    setFeedbackNotice('User record updated successfully!');
    setTimeout(() => setFeedbackNotice(null), 2000);
  };

  const handleConfirmReset = () => {
    if (!resetUser) return;
    setFeedbackNotice(`Password for ${resetUser.name} reset to "campus123" successfully.`);
    setResetUser(null);
    setTimeout(() => setFeedbackNotice(null), 2500);
  };

  const handleConfirmDelete = () => {
    if (!confirmDeleteUser) return;
    setAllUsers((prev) => prev.filter((u) => u.id !== confirmDeleteUser.id));
    setFeedbackNotice(`User account ${confirmDeleteUser.name} deactivated and removed.`);
    setConfirmDeleteUser(null);
    setTimeout(() => setFeedbackNotice(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">User Management & Access Control</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full lifecycle administration for students, faculty, hostel wardens, and system operators
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-purple-500/20 transition self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create Campus User</span>
        </button>
      </div>

      {feedbackNotice && (
        <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, department..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:border-purple-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1 text-xs border border-slate-200 rounded-xl focus:border-purple-500 focus:outline-hidden bg-white"
          >
            <option value="All">All Roles</option>
            <option value="student">Students</option>
            <option value="teacher">Faculty</option>
            <option value="warden">Wardens</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 text-[11px] uppercase">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={u.name}
                        className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'student'
                          ? 'bg-blue-100 text-blue-800'
                          : u.role === 'teacher'
                          ? 'bg-emerald-100 text-emerald-800'
                          : u.role === 'warden'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{u.department || 'General'}</td>
                  <td className="py-3 px-4 text-slate-600">{u.phone || '—'}</td>
                  <td className="py-3 px-4 text-slate-400">{u.createdAt}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        title="Edit User"
                        onClick={() => setEditingUser(u)}
                        className="p-1.5 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        title="Reset Password"
                        onClick={() => setResetUser(u)}
                        className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        title="Deactivate User"
                        onClick={() => setConfirmDeleteUser(u)}
                        className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Provision New Campus User"
        subtitle="Add a student, teacher, warden, or administrator account"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Priya Verma"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-purple-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">College Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@campus.edu"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-purple-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-purple-500 focus:outline-hidden"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher / Faculty</option>
                <option value="warden">Hostel Warden</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Contact</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-purple-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-purple-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl"
            >
              Create User
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      {editingUser && (
        <Modal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          title="Edit Campus User"
          subtitle={`Modifying profile for ${editingUser.name}`}
        >
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={editingUser.name}
                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-purple-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-purple-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-purple-500 focus:outline-hidden"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher / Faculty</option>
                  <option value="warden">Hostel Warden</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={editingUser.department || ''}
                onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-purple-500 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl"
              >
                Save Updates
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reset Password Confirmation Dialog */}
      {resetUser && (
        <Modal
          isOpen={!!resetUser}
          onClose={() => setResetUser(null)}
          title="Reset User Password"
          subtitle="Confirm password reset authorization"
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Are you sure you want to reset password for <span className="font-bold text-slate-900">{resetUser.name}</span>?
              A default temporary password will be assigned.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setResetUser(null)}
                className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete User Confirmation Dialog */}
      {confirmDeleteUser && (
        <Modal
          isOpen={!!confirmDeleteUser}
          onClose={() => setConfirmDeleteUser(null)}
          title="Deactivate User Account"
          subtitle="Destructive Action Confirmation"
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
              Warning: Deactivating <span className="font-bold">{confirmDeleteUser.name}</span> will revoke access to all campus services immediately.
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setConfirmDeleteUser(null)}
                className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                Deactivate User
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
