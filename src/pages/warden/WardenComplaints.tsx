import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Ticket, TicketStatus } from '../../types';
import {
  Wrench,
  UserCheck,
  CheckCircle2,
  Clock,
  Send,
  MessageSquare,
  Filter,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const WardenComplaints: React.FC = () => {
  const { tickets, updateTicketStatus, assignTicket, addTicketComment } = useData();

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Action states inside modal
  const [assignedStaff, setAssignedStaff] = useState('');
  const [newStatus, setNewStatus] = useState<TicketStatus>('In Progress');
  const [resolutionNote, setResolutionNote] = useState('');
  const [newComment, setNewComment] = useState('');

  const staffOptions = [
    'Mahesh (Electrician Team)',
    'Sanjay (Plumber)',
    'Ramesh (Carpenter / Furniture)',
    'IT Network Support Helpdesk',
    'Campus Housekeeping Staff',
  ];

  const filteredTickets = tickets.filter((t) => {
    return statusFilter === 'All' || t.status === statusFilter;
  });

  const handleOpenDetail = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setAssignedStaff(ticket.assignedTo || staffOptions[0]);
    setNewStatus(ticket.status);
    setResolutionNote(ticket.resolution || '');
  };

  const handleAssignSubmit = (ticketId: string) => {
    if (!assignedStaff) return;
    assignTicket(ticketId, assignedStaff);
    setSelectedTicket((prev) => (prev ? { ...prev, assignedTo: assignedStaff, status: 'Assigned' } : null));
  };

  const handleStatusUpdate = (ticketId: string) => {
    updateTicketStatus(ticketId, newStatus, resolutionNote);
    setSelectedTicket((prev) => (prev ? { ...prev, status: newStatus, resolution: resolutionNote } : null));
  };

  const handleAddComment = (ticketId: string) => {
    if (!newComment.trim()) return;
    addTicketComment(ticketId, newComment);
    setNewComment('');
    const updated = tickets.find((t) => t.id === ticketId);
    if (updated) setSelectedTicket(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Hostel Maintenance & Grievance Desk</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Assign maintenance technicians, track resolution workflows and log resident complaints
        </p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1 text-xs border border-slate-200 rounded-xl focus:border-amber-500 focus:outline-hidden bg-white"
          >
            <option value="All">All Complaints</option>
            <option value="Submitted">Submitted</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
        <span className="text-xs text-slate-500">{filteredTickets.length} Complaints</span>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.map((t) => (
          <div
            key={t.id}
            onClick={() => handleOpenDetail(t)}
            className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:border-amber-300 hover:shadow-md transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xs text-slate-900">#{t.id}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  {t.category}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    t.priority === 'Urgent' || t.priority === 'High'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {t.priority}
                </span>
                <span className="text-[11px] text-slate-400">{t.location}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-1">{t.title}</h4>
              <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{t.description}</p>
              <p className="text-[11px] text-slate-400 mt-1">Reported by {t.userName}</p>
            </div>

            <div className="text-right shrink-0">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 block mb-1">
                {t.status}
              </span>
              <span className="text-[11px] text-amber-700 font-semibold">
                {t.assignedTo ? `Assigned: ${t.assignedTo}` : 'Unassigned'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Manage Ticket Modal */}
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Manage Ticket #${selectedTicket.id}`}
          subtitle={`${selectedTicket.category} &bull; ${selectedTicket.location}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <h4 className="font-bold text-slate-900">{selectedTicket.title}</h4>
              <p className="text-slate-600">{selectedTicket.description}</p>
              <p className="text-slate-400 text-[11px] pt-1">Student: {selectedTicket.userName}</p>
            </div>

            {/* Assign Staff */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <label className="block font-bold text-slate-800 mb-1.5">Assign Staff / Technician</label>
              <div className="flex space-x-2">
                <select
                  value={assignedStaff}
                  onChange={(e) => setAssignedStaff(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl focus:border-amber-500 focus:outline-hidden"
                >
                  {staffOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleAssignSubmit(selectedTicket.id)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  Assign
                </button>
              </div>
            </div>

            {/* Status & Resolution Update */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
              <label className="block font-bold text-slate-800">Update Ticket Lifecycle Status</label>
              <div className="grid grid-cols-4 gap-2">
                {(['Assigned', 'In Progress', 'Resolved', 'Closed'] as TicketStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setNewStatus(st)}
                    className={`py-1.5 px-2 rounded-xl font-bold border transition ${
                      newStatus === st
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mt-2 mb-1">
                  Resolution Notes (When completing or closing)
                </label>
                <textarea
                  rows={2}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="e.g. Capacitor replaced and fan speed tested normal..."
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:border-amber-500 focus:outline-hidden resize-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleStatusUpdate(selectedTicket.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  Save Status & Resolution
                </button>
              </div>
            </div>

            {/* Log / Comment Thread */}
            <div>
              <h5 className="font-bold text-slate-900 mb-2">Remarks & Notes</h5>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {(selectedTicket.comments || []).map((c) => (
                  <div key={c.id} className="p-2 rounded-lg bg-slate-50 text-[11px]">
                    <span className="font-bold text-slate-800">{c.authorName}: </span>
                    <span className="text-slate-600">{c.text}</span>
                  </div>
                ))}
              </div>
              <div className="flex space-x-2 mt-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add note as warden..."
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl focus:border-amber-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => handleAddComment(selectedTicket.id)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
