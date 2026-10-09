import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { AnnouncementCategory, Announcement } from '../../types';
import {
  Megaphone,
  Search,
  Calendar,
  User,
  Paperclip,
  Download,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const StudentAnnouncements: React.FC = () => {
  const { announcements } = useData();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAnnouncement, setActiveAnnouncement] = useState<Announcement | null>(null);

  const categories = ['All', 'College', 'Hostel', 'Academic', 'Exam', 'Emergency', 'Events'];

  const filtered = announcements.filter((ann) => {
    const matchCat = selectedCategory === 'All' || ann.category === selectedCategory;
    const matchQuery =
      ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Campus Bulletins & Announcements</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Official notices from university administration, academic deans, hostel wardens, and exam controllers
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bulletins..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:border-purple-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-3.5">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
            No announcements found matching your criteria.
          </div>
        ) : (
          filtered.map((ann) => (
            <div
              key={ann.id}
              onClick={() => setActiveAnnouncement(ann)}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-purple-300 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                    {ann.category}
                  </span>
                  {ann.isImportant && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 animate-pulse flex items-center space-x-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Important Notice</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center text-[11px] text-slate-400 space-x-3">
                  <span className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    {ann.date}
                  </span>
                  <span className="flex items-center">
                    <User className="w-3.5 h-3.5 mr-1" />
                    {ann.authorName} ({ann.authorRole})
                  </span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900">{ann.title}</h3>
              <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                {ann.content}
              </p>

              {ann.attachmentName && (
                <div className="mt-3 inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium">
                  <Paperclip className="w-3 h-3 text-slate-500" />
                  <span>{ann.attachmentName}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Announcement Detail Modal */}
      {activeAnnouncement && (
        <Modal
          isOpen={!!activeAnnouncement}
          onClose={() => setActiveAnnouncement(null)}
          title={activeAnnouncement.title}
          subtitle={`${activeAnnouncement.category} &bull; Published by ${activeAnnouncement.authorName} (${activeAnnouncement.authorRole}) on ${activeAnnouncement.date}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
              {activeAnnouncement.content}
            </div>

            {activeAnnouncement.attachmentName && (
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-purple-900 font-semibold">
                  <Paperclip className="w-4 h-4 text-purple-600" />
                  <span>{activeAnnouncement.attachmentName}</span>
                </div>
                <button
                  onClick={() => alert(`Downloading attachment: ${activeAnnouncement.attachmentName}`)}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
