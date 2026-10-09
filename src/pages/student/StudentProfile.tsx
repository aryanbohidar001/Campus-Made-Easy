import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Key,
  GraduationCap,
  Building2,
  Edit2,
  Camera,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const StudentProfile: React.FC = () => {
  const { currentUser, studentProfile, updateProfile, changePassword } = useAuth();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Edit form state
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(studentProfile?.address || '');
  const [emergencyContact, setEmergencyContact] = useState(studentProfile?.emergencyContact || '');
  const [bloodGroup, setBloodGroup] = useState(studentProfile?.bloodGroup || 'O+');

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      phone,
      address,
      emergencyContact,
      bloodGroup,
    });
    setIsEditModalOpen(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordStatus('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStatus('Password must be at least 6 characters');
      return;
    }

    const res = await changePassword(oldPassword, newPassword);
    if (res.success) {
      setPasswordStatus('Password changed successfully!');
      setTimeout(() => {
        setPasswordStatus(null);
        setIsPasswordModalOpen(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }, 1500);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateProfile({ avatar: url });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Student Profile</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Personal information, academic enrollment, residential allocation, and security credentials
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs shadow-blue-500/20 transition"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Change Password</span>
          </button>
        </div>
      </div>

      {/* Main Profile Card Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="relative group">
            <img
              src={
                currentUser?.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
              }
              alt={currentUser?.name}
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-blue-50 shadow-md"
            />
            <label className="absolute inset-0 bg-slate-900/40 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition">
              <Camera className="w-6 h-6" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{currentUser?.name}</h3>
                <p className="text-xs font-semibold text-blue-600 mt-0.5">
                  Roll Number: {studentProfile?.rollNumber}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 self-center sm:self-start">
                Enrolled Student
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{currentUser?.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{currentUser?.phone || '+91 98765 43210'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-slate-400" />
                <span>{studentProfile?.course} &bull; {studentProfile?.branch}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>{studentProfile?.hostelName} ({studentProfile?.roomNumber})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Details */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>Academic Information</span>
          </h4>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Degree Course:</span>
              <span className="font-bold text-slate-800">{studentProfile?.course}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Department / Branch:</span>
              <span className="font-bold text-slate-800">{studentProfile?.branch}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Academic Year:</span>
              <span className="font-bold text-slate-800">{studentProfile?.year}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Current Semester:</span>
              <span className="font-bold text-slate-800">{studentProfile?.semester}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Cumulative CGPA:</span>
              <span className="font-bold text-emerald-600">{studentProfile?.cgpa} / 10.0</span>
            </div>
          </div>
        </div>

        {/* Contact & Personal Information */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
            <User className="w-4 h-4 text-blue-600" />
            <span>Personal & Emergency Details</span>
          </h4>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Blood Group:</span>
              <span className="font-bold text-slate-800">{studentProfile?.bloodGroup || 'O+'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Emergency Contact:</span>
              <span className="font-bold text-slate-800">{studentProfile?.emergencyContact}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Permanent Home Address:</span>
              <span className="font-medium text-slate-800 text-right max-w-xs">{studentProfile?.address}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Hostel Accommodation:</span>
              <span className="font-bold text-slate-800">{studentProfile?.roomNumber}, {studentProfile?.bedNumber}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Personal Information"
        subtitle="Update contact number, residential address and emergency numbers"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
              <input
                type="text"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Emergency Contact</label>
            <input
              type="text"
              required
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Permanent Address</label>
            <textarea
              rows={3}
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden resize-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Update Account Password"
        subtitle="Ensure your new password contains at least 6 characters"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
          {passwordStatus && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800">
              {passwordStatus}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 6 characters"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type new password"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(false)}
              className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
            >
              Update Password
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
