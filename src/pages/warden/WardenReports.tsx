import React from 'react';
import { useData } from '../../context/DataContext';
import {
  BarChart3,
  Download,
  Building2,
  CheckCircle2,
  UtensilsCrossed,
  FileSpreadsheet,
} from 'lucide-react';

export const WardenReports: React.FC = () => {
  const { rooms, hostels, tickets, messFeedbacks } = useData();

  const totalBeds = rooms.reduce((acc, curr) => acc + curr.totalBeds, 0);
  const occupiedBeds = rooms.reduce((acc, curr) => acc + curr.occupiedBeds, 0);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 90;

  const totalComplaints = tickets.length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length;
  const resolutionRate = totalComplaints > 0 ? Math.round((resolvedCount / totalComplaints) * 100) : 100;

  const avgRating =
    messFeedbacks.length > 0
      ? (messFeedbacks.reduce((acc, curr) => acc + curr.rating, 0) / messFeedbacks.length).toFixed(1)
      : '4.2';

  const exportCSV = () => {
    let csv = 'RoomNumber,Block,Type,TotalBeds,OccupiedBeds,Status\n';
    rooms.forEach((r) => {
      csv += `${r.roomNumber},${r.block},${r.roomType},${r.totalBeds},${r.occupiedBeds},${r.status}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Hostel_Occupancy_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Hostel & Facility Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical breakdown of residential occupancy, maintenance turnaround, and mess reviews
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-emerald-500/20 transition self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Metrics Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Hostel Occupancy</span>
          <p className="text-3xl font-extrabold text-blue-600 mt-1">{occupancyRate}%</p>
          <p className="text-xs text-slate-500 mt-1">{occupiedBeds} of {totalBeds} beds assigned</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Maintenance Resolution</span>
          <p className="text-3xl font-extrabold text-emerald-600 mt-1">{resolutionRate}%</p>
          <p className="text-xs text-slate-500 mt-1">{resolvedCount} of {totalComplaints} tickets resolved</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Average Mess Satisfaction</span>
          <p className="text-3xl font-extrabold text-amber-600 mt-1">{avgRating} / 5.0</p>
          <p className="text-xs text-slate-500 mt-1">Based on {messFeedbacks.length} student reviews</p>
        </div>
      </div>

      {/* Hostel Building Summary */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Building-Wise Capacity Overview</h3>

        <div className="space-y-3">
          {hostels.map((h) => {
            const pct = Math.round((h.occupiedBeds / h.totalBeds) * 100);
            return (
              <div key={h.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{h.name}</span>
                    <span className="ml-2 text-slate-500">({h.block} &bull; {h.type})</span>
                  </div>
                  <span className="font-bold text-blue-600">{pct}% Occupied</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Warden: {h.wardenName} ({h.wardenPhone})</span>
                  <span>{h.occupiedBeds} / {h.totalBeds} Beds ({h.totalBeds - h.occupiedBeds} Available)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
