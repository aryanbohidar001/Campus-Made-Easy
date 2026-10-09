import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Users,
  GraduationCap,
  Building2,
  Wrench,
  UtensilsCrossed,
  CreditCard,
  Filter,
} from 'lucide-react';

export const AdminReports: React.FC = () => {
  const { allUsers } = useAuth();
  const { rooms, hostels, tickets, messFeedbacks, fees, attendance } = useData();

  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [reportType, setReportType] = useState('overview');

  const students = allUsers.filter((u) => u.role === 'student');
  const teachers = allUsers.filter((u) => u.role === 'teacher');
  const wardens = allUsers.filter((u) => u.role === 'warden');

  const totalBeds = rooms.reduce((acc, curr) => acc + curr.totalBeds, 0);
  const occupiedBeds = rooms.reduce((acc, curr) => acc + curr.occupiedBeds, 0);

  const totalFeeCollected = fees.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalFeePending = fees.reduce((acc, curr) => acc + curr.pendingAmount, 0);

  const exportStudentsCSV = () => {
    let csv = 'ID,Name,Email,Role,Department,Phone,Status\n';
    allUsers.forEach((u) => {
      csv += `"${u.id}","${u.name}","${u.email}","${u.role}","${u.department || 'N/A'}","${u.phone || 'N/A'}","${u.status || 'active'}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Campus_Users_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportMaintenanceCSV = () => {
    let csv = 'TicketID,Title,Category,Priority,Status,Location,ReportedBy,AssignedTo\n';
    tickets.forEach((t) => {
      csv += `"${t.id}","${t.title}","${t.category}","${t.priority}","${t.status}","${t.location}","${t.userName}","${t.assignedTo || 'Unassigned'}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Maintenance_Tickets_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Campus Analytics & Auditing Reports</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical summaries across enrollments, hostel allocations, maintenance SLA and fee recovery
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportStudentsCSV}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs shadow-purple-500/20 transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Users CSV</span>
          </button>
          <button
            onClick={exportMaintenanceCSV}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs shadow-blue-500/20 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Tickets CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Campus Population</span>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{allUsers.length}</p>
          <p className="text-xs text-slate-500 mt-1">
            {students.length} Students &bull; {teachers.length} Faculty &bull; {wardens.length} Wardens
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Residential Occupancy</span>
          <p className="text-3xl font-extrabold text-blue-600 mt-1">
            {Math.round((occupiedBeds / totalBeds) * 100)}%
          </p>
          <p className="text-xs text-slate-500 mt-1">{occupiedBeds} occupied / {totalBeds} total beds</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Ticket Resolution Rate</span>
          <p className="text-3xl font-extrabold text-emerald-600 mt-1">
            {Math.round(
              (tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length /
                tickets.length) *
                100
            )}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length} of {tickets.length} resolved
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Fee Collection Ratio</span>
          <p className="text-3xl font-extrabold text-indigo-600 mt-1">
            {Math.round((totalFeeCollected / (totalFeeCollected + totalFeePending)) * 100)}%
          </p>
          <p className="text-xs text-slate-500 mt-1">₹{totalFeeCollected.toLocaleString()} collected</p>
        </div>
      </div>

      {/* Reports Breakdown Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Roster Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
            <GraduationCap className="w-4 h-4 text-purple-600" />
            <span>Academic Department Student Counts</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-900">Computer Science & Engineering</p>
                <p className="text-slate-500">Autonomous B.Tech & M.Tech Programs</p>
              </div>
              <span className="font-extrabold text-purple-700 bg-purple-100 px-3 py-1 rounded-xl">
                240 Students
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-900">Electronics & Communication</p>
                <p className="text-slate-500">Signal Processing & VLSI Specializations</p>
              </div>
              <span className="font-extrabold text-purple-700 bg-purple-100 px-3 py-1 rounded-xl">
                120 Students
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-900">Mechanical & Automation</p>
                <p className="text-slate-500">Robotics & Thermal Engineering</p>
              </div>
              <span className="font-extrabold text-purple-700 bg-purple-100 px-3 py-1 rounded-xl">
                60 Students
              </span>
            </div>
          </div>
        </div>

        {/* Maintenance Categories Audit */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
            <Wrench className="w-4 h-4 text-blue-600" />
            <span>Maintenance Grievances by Category</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            {['Electrical', 'Plumbing', 'Internet/WiFi', 'Water', 'Furniture'].map((cat) => {
              const count = tickets.filter((t) => t.category === cat).length;
              return (
                <div key={cat} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                  <span className="font-semibold text-slate-800">{cat}</span>
                  <span className="font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full text-[11px]">
                    {count} Tickets
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
