import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { MessMenu } from '../../types';
import {
  UtensilsCrossed,
  Star,
  MessageCircle,
  Edit2,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const WardenMess: React.FC = () => {
  const { messMenus, updateMessMenu, messFeedbacks, replyToMessFeedback } = useData();

  const [selectedDay, setSelectedDay] = useState('Monday');
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);

  // Edit menu form state
  const currentMenu = messMenus.find((m) => m.dayOfWeek === selectedDay) || messMenus[0];
  const [breakfast, setBreakfast] = useState(currentMenu.breakfast);
  const [lunch, setLunch] = useState(currentMenu.lunch);
  const [snacks, setSnacks] = useState(currentMenu.snacks);
  const [dinner, setDinner] = useState(currentMenu.dinner);

  // Reply state
  const [replyingFeedbackId, setReplyingFeedbackId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleDaySelect = (day: string) => {
    setSelectedDay(day);
    const m = messMenus.find((menu) => menu.dayOfWeek === day) || messMenus[0];
    setBreakfast(m.breakfast);
    setLunch(m.lunch);
    setSnacks(m.snacks);
    setDinner(m.dinner);
  };

  const handleSaveMenu = (e: React.FormEvent) => {
    e.preventDefault();
    updateMessMenu({
      ...currentMenu,
      dayOfWeek: selectedDay,
      breakfast,
      lunch,
      snacks,
      dinner,
    });
    setIsEditMenuOpen(false);
  };

  const handleReplySubmit = (fbId: string) => {
    if (!replyText.trim()) return;
    replyToMessFeedback(fbId, replyText);
    setReplyingFeedbackId(null);
    setReplyText('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Mess Management & Catering Quality</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure weekly rotating dining menus, review student feedback ratings, and post managerial replies
          </p>
        </div>

        <button
          onClick={() => {
            handleDaySelect(selectedDay);
            setIsEditMenuOpen(true);
          }}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-amber-500/20 transition self-start sm:self-auto"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit {selectedDay}'s Menu</span>
        </button>
      </div>

      {/* Day Selector */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs flex items-center space-x-1.5 overflow-x-auto">
        {daysOfWeek.map((day) => (
          <button
            key={day}
            onClick={() => handleDaySelect(day)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedDay === day
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Selected Day Menu Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Active Menu for {selectedDay}</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold text-amber-800 uppercase block mb-1">Breakfast</span>
            <p className="text-slate-700 leading-relaxed">{currentMenu.breakfast}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold text-amber-800 uppercase block mb-1">Lunch</span>
            <p className="text-slate-700 leading-relaxed">{currentMenu.lunch}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold text-amber-800 uppercase block mb-1">Evening Snacks</span>
            <p className="text-slate-700 leading-relaxed">{currentMenu.snacks}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold text-amber-800 uppercase block mb-1">Dinner</span>
            <p className="text-slate-700 leading-relaxed">{currentMenu.dinner}</p>
          </div>
        </div>
      </div>

      {/* Student Ratings & Feedback Responses */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Student Food Ratings & Responses</h3>

        <div className="space-y-3">
          {messFeedbacks.map((fb) => (
            <div key={fb.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900">{fb.userName}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    {fb.meal}
                  </span>
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${s <= fb.rating ? 'fill-amber-400' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-[11px] text-slate-400">{fb.date}</span>
              </div>

              <p className="text-slate-700 leading-relaxed">{fb.comment}</p>

              {fb.reply ? (
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-[11px] text-blue-900">
                  <span className="font-bold">Your Response:</span> {fb.reply}
                </div>
              ) : replyingFeedbackId === fb.id ? (
                <div className="mt-2 flex space-x-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write official response..."
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-hidden"
                  />
                  <button
                    onClick={() => handleReplySubmit(fb.id)}
                    className="px-3 py-1.5 bg-amber-600 text-white font-bold rounded-xl"
                  >
                    Reply
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setReplyingFeedbackId(fb.id);
                    setReplyText('');
                  }}
                  className="text-amber-700 font-bold hover:underline flex items-center space-x-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Reply to this student</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Edit Menu Modal */}
      <Modal
        isOpen={isEditMenuOpen}
        onClose={() => setIsEditMenuOpen(false)}
        title={`Edit Menu for ${selectedDay}`}
        subtitle="Update meal items served in the central dining hall"
      >
        <form onSubmit={handleSaveMenu} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Breakfast Menu</label>
            <textarea
              rows={2}
              required
              value={breakfast}
              onChange={(e) => setBreakfast(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Lunch Menu</label>
            <textarea
              rows={2}
              required
              value={lunch}
              onChange={(e) => setLunch(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Evening Snacks</label>
            <textarea
              rows={2}
              required
              value={snacks}
              onChange={(e) => setSnacks(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Dinner Menu</label>
            <textarea
              rows={2}
              required
              value={dinner}
              onChange={(e) => setDinner(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditMenuOpen(false)}
              className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl flex items-center space-x-1"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Menu</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
