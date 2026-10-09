import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { TicketCategory, TicketPriority, Ticket } from '../../types';
import {
  Wrench,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Send,
  MessageSquare,
  Image as ImageIcon,
  MapPin,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';

interface StudentMaintenanceProps {
  initialOpenRaiseModal?: boolean;
}

export const StudentMaintenance: React.FC<StudentMaintenanceProps> = ({
  initialOpenRaiseModal = false,
}) => {
  const { currentUser } = useAuth();
  const { tickets, createTicket, addTicketComment, reopenTicket } = useData();

  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(initialOpenRaiseModal);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Form state
  const [category, setCategory] = useState<TicketCategory>('Electrical');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Aryabhatta Hostel, Room B-304');
  const [priority, setPriority] = useState<TicketPriority>('Medium');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');

  const categories: TicketCategory[] = [
    'Electrical',
    'Plumbing',
    'Cleaning',
    'Internet/WiFi',
    'Furniture',
    'Hostel Room',
    'Water',
    'Other',
  ];

  const priorities: TicketPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

  const myTickets = tickets.filter(
    (t) => t.userId === currentUser?.id || t.userName === currentUser?.name
  );

  const filteredTickets = myTickets.filter((t) => {
    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchCat = categoryFilter === 'All' || t.category === categoryFilter;
    return matchStatus && matchCat;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    await createTicket({
      userId: currentUser?.id || 'user-student-1',
      userName: currentUser?.name || 'Aman Sahu',
      category,
      title,
      description,
      location,
      priority,
      imageUrl: imagePreview || undefined,
    });

    setIsSubmitting(false);
    setIsRaiseModalOpen(false);
    setTitle('');
    setDescription('');
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fakeUrl = URL.createObjectURL(file);
      setImagePreview(fakeUrl);
    }
  };

  const handleSendComment = (ticketId: string) => {
    if (!newCommentText.trim()) return;
    addTicketComment(ticketId, newCommentText);
    setNewCommentText('');
    // refresh selected ticket
    const updated = tickets.find((t) => t.id === ticketId);
    if (updated) setSelectedTicket(updated);
  };

  const handleReopen = (ticketId: string) => {
    reopenTicket(ticketId);
    setSelectedTicket((prev) => (prev ? { ...prev, status: 'In Progress' } : null));
  };

  const getStatusBadge = (status: Ticket['status']) => {
    switch (status) {
      case 'Submitted':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Submitted</span>;
      case 'Assigned':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">Assigned</span>;
      case 'In Progress':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">In Progress</span>;
      case 'Resolved':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Resolved</span>;
      case 'Closed':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">Closed</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Maintenance & Complaints</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Lodge campus repairs, electrical, plumbing, furniture, and network tickets with full lifecycle tracking
          </p>
        </div>

        <button
          onClick={() => setIsRaiseModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-blue-500/20 transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Raise New Ticket</span>
        </button>
      </div>

      {/* Lifecycle Progress Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Ticket Lifecycle Roadmap
        </p>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          {['Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed'].map((step, idx) => (
            <div key={step} className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center">
                {idx + 1}
              </span>
              <span className="font-semibold text-slate-700">{step}</span>
              {idx < 4 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden sm:inline" />}
            </div>
          ))}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700">Filter By:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden bg-white"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No Tickets Found</p>
            <p className="text-xs text-slate-500 mt-1">
              You do not have any complaints matching the filter criteria.
            </p>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">#{ticket.id}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                    {ticket.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      ticket.priority === 'Urgent' || ticket.priority === 'High'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {ticket.priority} Priority
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(ticket.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mt-2">{ticket.title}</h4>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{ticket.description}</p>

                <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-2">
                  <span className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                    {ticket.location}
                  </span>
                  {ticket.assignedTo && (
                    <span className="font-medium text-slate-700">
                      Staff: {ticket.assignedTo}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                {getStatusBadge(ticket.status)}
                <span className="text-xs text-blue-600 font-semibold hover:underline flex items-center">
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Raise Ticket Modal */}
      <Modal
        isOpen={isRaiseModalOpen}
        onClose={() => setIsRaiseModalOpen(false)}
        title="Raise Maintenance Ticket"
        subtitle="Report an infrastructure, electrical, plumbing, or room defect"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TicketCategory)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p} Priority
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Washroom tap leaking continuously"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Block B, Room 304 or 3rd Floor Washroom"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact details of what is broken or malfunctioning..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Upload Photo (Optional)</label>
            <div className="flex items-center space-x-3">
              <label className="cursor-pointer px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-600 flex items-center space-x-1.5">
                <ImageIcon className="w-4 h-4 text-slate-400" />
                <span>Choose Image</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              {imagePreview && (
                <div className="flex items-center space-x-2 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Image attached</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsRaiseModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center space-x-1 shadow-xs shadow-blue-500/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Lodging...' : 'Submit Ticket'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Ticket Details & Lifecycle Modal */}
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Ticket #${selectedTicket.id}`}
          subtitle={`${selectedTicket.category} &bull; ${selectedTicket.location}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            {/* Header info */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <span className="text-slate-500">Status: </span>
                {getStatusBadge(selectedTicket.status)}
              </div>
              <div>
                <span className="text-slate-500">Priority: </span>
                <span className="font-bold text-slate-900">{selectedTicket.priority}</span>
              </div>
              <div>
                <span className="text-slate-500">Assigned: </span>
                <span className="font-bold text-slate-900">
                  {selectedTicket.assignedTo || 'Unassigned'}
                </span>
              </div>
            </div>

            {/* Title & Description */}
            <div>
              <h4 className="text-sm font-bold text-slate-900">{selectedTicket.title}</h4>
              <p className="text-slate-700 mt-1 leading-relaxed">{selectedTicket.description}</p>
            </div>

            {/* Resolution Note if resolved */}
            {selectedTicket.resolution && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <p className="font-bold text-emerald-900">Resolution Details:</p>
                <p className="text-emerald-800 mt-0.5">{selectedTicket.resolution}</p>
              </div>
            )}

            {/* Reopen Ticket Option (Section 10) */}
            {selectedTicket.status === 'Resolved' && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-amber-900">Is the issue still not fixed?</p>
                  <p className="text-amber-800 text-[11px]">You can reopen this ticket for further inspection.</p>
                </div>
                <button
                  onClick={() => handleReopen(selectedTicket.id)}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center space-x-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reopen Ticket</span>
                </button>
              </div>
            )}

            {/* Comments thread */}
            <div>
              <h5 className="font-bold text-slate-900 mb-2 flex items-center space-x-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>Ticket Log & Discussion</span>
              </h5>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(selectedTicket.comments || []).map((c) => (
                  <div key={c.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                      <span className="font-bold text-slate-800">{c.authorName} ({c.authorRole})</span>
                      <span>{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-700 text-xs">{c.text}</p>
                  </div>
                ))}
              </div>

              {/* Add comment */}
              <div className="mt-3 flex space-x-2">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Add a remark or update..."
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => handleSendComment(selectedTicket.id)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center space-x-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Post</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
