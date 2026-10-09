import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_STUDENT_PROFILES } from '../../data/initialData';
import { StudentProfile } from '../../types';
import {
  Users,
  Search,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  Filter,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const TeacherStudents: React.FC = () => {
  const { allUsers } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [activeStudent, setActiveStudent] = useState<{ user: any; profile: StudentProfile } | null>(null);

  const students = allUsers.filter((u) => u.role === 'student');

  const filteredStudents = students.filter((s) => {
    const profile = INITIAL_STUDENT_PROFILES[s.id] || {
      userId: s.id,
      rollNumber: 'CSE2024089',
      course: 'B.Tech CSE',
      branch: s.department || 'Computer Science & Engineering',
      year: '3rd Year',
      semester: '5th Semester',
      cgpa: 8.78,
      hostelId: 'hostel-1',
      hostelName: 'Aryabhatta Boys Hostel',
      roomNumber: 'B-304',
      bedNumber: 'Bed 2',
      emergencyContact: '+91 94370 12345',
      address: 'Plot 42, Vani Vihar, Bhubaneswar',
    };

    const matchBranch = selectedBranch === 'All' || profile.branch.includes(selectedBranch);
    const matchSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());

    return matchBranch && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Student Directory</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Roster of students enrolled in your department and lecture batches
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student by name, roll number, email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-hidden bg-white"
          >
            <option value="All">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Electronics">Electronics & Comm.</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 text-[11px] uppercase">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Program & Year</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Hostel Room</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => {
                const profile = INITIAL_STUDENT_PROFILES[student.id] || {
                  userId: student.id,
                  rollNumber: 'CSE2024089',
                  course: 'B.Tech CSE',
                  branch: student.department || 'Computer Science & Engineering',
                  year: '3rd Year',
                  semester: '5th Semester',
                  cgpa: 8.78,
                  hostelId: 'hostel-1',
                  hostelName: 'Aryabhatta Boys Hostel',
                  roomNumber: 'B-304',
                  bedNumber: 'Bed 2',
                  emergencyContact: '+91 94370 12345',
                  address: 'Campus Hostel Block B',
                };

                return (
                  <tr key={student.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={
                            student.avatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                          }
                          alt={student.name}
                          className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{student.name}</p>
                          <p className="text-[11px] text-slate-400">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-700">{profile.rollNumber}</td>
                    <td className="py-3 px-4 text-slate-700">{profile.course} ({profile.year})</td>
                    <td className="py-3 px-4 text-slate-600">{profile.branch}</td>
                    <td className="py-3 px-4 text-slate-600">{profile.roomNumber}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setActiveStudent({ user: student, profile })}
                        className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs transition"
                      >
                        Profile & Record
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Profile Modal */}
      {activeStudent && (
        <Modal
          isOpen={!!activeStudent}
          onClose={() => setActiveStudent(null)}
          title={activeStudent.user.name}
          subtitle={`Roll No: ${activeStudent.profile.rollNumber} &bull; ${activeStudent.profile.course}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center space-x-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <img
                src={activeStudent.user.avatar}
                alt={activeStudent.user.name}
                className="w-14 h-14 rounded-xl object-cover"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-900">{activeStudent.user.name}</h4>
                <p className="text-slate-500">{activeStudent.user.email}</p>
                <p className="text-emerald-600 font-semibold mt-0.5">CGPA: {activeStudent.profile.cgpa} / 10.0</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-slate-50">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Branch</span>
                <p className="font-semibold text-slate-800">{activeStudent.profile.branch}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Semester</span>
                <p className="font-semibold text-slate-800">{activeStudent.profile.semester}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Hostel</span>
                <p className="font-semibold text-slate-800">
                  {activeStudent.profile.hostelName} ({activeStudent.profile.roomNumber})
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Emergency Contact</span>
                <p className="font-semibold text-slate-800">{activeStudent.profile.emergencyContact}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
