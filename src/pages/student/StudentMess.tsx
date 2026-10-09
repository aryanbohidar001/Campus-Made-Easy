import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { MealType } from '../../types';
import {
  UtensilsCrossed,
  Star,
  Clock,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Calendar,
  Send,
  MessageCircle,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';

interface StudentMessProps {
  initialOpenFeedback?: boolean;
}

export const StudentMess: React.FC<StudentMessProps> = ({ initialOpenFeedback = false }) => {
  const { currentUser } = useAuth();
  const { messMenus, messFeedbacks, submitMessFeedback } = useData();

  const [activeDay, setActiveDay] = useState('Monday');
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(initialOpenFeedback);

  // Form state
  const [selectedMeal, setSelectedMeal] = useState<MealType>('Lunch');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Today's menu (defaults to Monday or current day)
  const currentMenu = messMenus.find((m) => m.dayOfWeek === activeDay) || messMenus[0];
  const todayMenu = messMenus.find((m) => m.dayOfWeek === 'Monday') || messMenus[0];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    await submitMessFeedback({
      userId: currentUser?.id || 'user-student-1',
      userName: currentUser?.name || 'Aman Sahu',
      meal: selectedMeal,
      rating,
      comment,
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsFeedbackModalOpen(false);
      setComment('');
      setRating(5);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Mess & Dining Hall</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View daily and weekly rotating meals, dining timings, and share quality ratings
          </p>
        </div>

        <button
          onClick={() => setIsFeedbackModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-amber-500/20 transition self-start sm:self-auto"
        >
          <Star className="w-4 h-4 fill-white" />
          <span>Give Meal Feedback</span>
        </button>
      </div>

      {/* Today's Meals Cards Grid (Section 9) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <UtensilsCrossed className="w-4 h-4 text-amber-600" />
            <span>Today's Meal Schedule</span>
          </h3>
          <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
            Central Dining Hall
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Breakfast */}
          <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/60 to-white p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-900 uppercase">Breakfast</span>
              <span className="text-[10px] text-slate-500 flex items-center">
                <Clock className="w-3 h-3 mr-1 text-amber-600" />
                07:30 - 09:30 AM
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium mt-2">
              {todayMenu.breakfast}
            </p>
            <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">Dietary: Veg & Egg</span>
              <button
                onClick={() => {
                  setSelectedMeal('Breakfast');
                  setIsFeedbackModalOpen(true);
                }}
                className="text-[11px] font-semibold text-amber-700 hover:underline"
              >
                Rate meal &rarr;
              </button>
            </div>
          </div>

          {/* Lunch */}
          <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/60 to-white p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-900 uppercase">Lunch</span>
              <span className="text-[10px] text-slate-500 flex items-center">
                <Clock className="w-3 h-3 mr-1 text-amber-600" />
                12:30 - 02:30 PM
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium mt-2">
              {todayMenu.lunch}
            </p>
            <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">Includes curd & salad</span>
              <button
                onClick={() => {
                  setSelectedMeal('Lunch');
                  setIsFeedbackModalOpen(true);
                }}
                className="text-[11px] font-semibold text-amber-700 hover:underline"
              >
                Rate meal &rarr;
              </button>
            </div>
          </div>

          {/* Snacks */}
          <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/60 to-white p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-900 uppercase">Evening Snacks</span>
              <span className="text-[10px] text-slate-500 flex items-center">
                <Clock className="w-3 h-3 mr-1 text-amber-600" />
                05:00 - 06:15 PM
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium mt-2">
              {todayMenu.snacks}
            </p>
            <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">Tea, coffee, biscuits</span>
              <button
                onClick={() => {
                  setSelectedMeal('Snacks');
                  setIsFeedbackModalOpen(true);
                }}
                className="text-[11px] font-semibold text-amber-700 hover:underline"
              >
                Rate meal &rarr;
              </button>
            </div>
          </div>

          {/* Dinner */}
          <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/60 to-white p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-900 uppercase">Dinner</span>
              <span className="text-[10px] text-slate-500 flex items-center">
                <Clock className="w-3 h-3 mr-1 text-amber-600" />
                07:30 - 09:30 PM
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium mt-2">
              {todayMenu.dinner}
            </p>
            <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">Dessert included</span>
              <button
                onClick={() => {
                  setSelectedMeal('Dinner');
                  setIsFeedbackModalOpen(true);
                }}
                className="text-[11px] font-semibold text-amber-700 hover:underline"
              >
                Rate meal &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Rotating Menu Tabs (Section 9) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Weekly Mess Schedule (Monday - Sunday)</h3>
          </div>
          <span className="text-xs text-slate-500">Approved by Student Mess Committee</span>
        </div>

        {/* Day buttons */}
        <div className="flex overflow-x-auto space-x-1.5 pb-2 mb-4 scrollbar-none">
          {daysOfWeek.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeDay === day
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Selected day menu breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
          <div>
            <p className="font-bold text-slate-900 mb-1 text-amber-800">Breakfast</p>
            <p className="text-slate-600 leading-relaxed">{currentMenu.breakfast}</p>
          </div>
          <div>
            <p className="font-bold text-slate-900 mb-1 text-amber-800">Lunch</p>
            <p className="text-slate-600 leading-relaxed">{currentMenu.lunch}</p>
          </div>
          <div>
            <p className="font-bold text-slate-900 mb-1 text-amber-800">Snacks</p>
            <p className="text-slate-600 leading-relaxed">{currentMenu.snacks}</p>
          </div>
          <div>
            <p className="font-bold text-slate-900 mb-1 text-amber-800">Dinner</p>
            <p className="text-slate-600 leading-relaxed">{currentMenu.dinner}</p>
          </div>
        </div>

        {currentMenu.specialNotice && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>{currentMenu.specialNotice}</span>
          </div>
        )}
      </div>

      {/* Student Feedback & Warden Responses Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Recent Student Reviews & Warden Replies</h3>
          </div>
          <button
            onClick={() => setIsFeedbackModalOpen(true)}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            + Write Feedback
          </button>
        </div>

        <div className="space-y-3">
          {messFeedbacks.map((fb) => (
            <div key={fb.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900">{fb.userName}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    {fb.meal}
                  </span>
                  {/* Star Display */}
                  <div className="flex items-center space-x-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= fb.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-[11px] text-slate-400">{fb.date}</span>
              </div>

              <p className="text-slate-700 leading-relaxed">{fb.comment}</p>

              {/* Warden / Staff Reply */}
              {fb.reply && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start space-x-2">
                  <MessageCircle className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-blue-900 text-[11px]">
                      {fb.replyBy || 'Warden'} (Management Reply):
                    </span>
                    <p className="text-blue-800 text-xs mt-0.5">{fb.reply}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Feedback Modal */}
      <Modal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        title="Mess Meal Rating & Feedback"
        subtitle="Help improve food quality by sharing your review with the mess committee"
      >
        {isSubmitted ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-900">Feedback Submitted!</p>
            <p className="text-xs text-slate-500 mt-1">Thank you for rating. Your warden has been notified.</p>
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Which meal are you rating?</label>
              <div className="grid grid-cols-4 gap-2">
                {(['Breakfast', 'Lunch', 'Snacks', 'Dinner'] as MealType[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMeal(m)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition ${
                      selectedMeal === m
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Star Rating picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                How was today's {selectedMeal.toLowerCase()}?
              </label>
              <div className="flex items-center space-x-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-slate-300 hover:scale-125 transition"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-700 ml-2">
                  {rating} of 5 Stars
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Write your feedback / comment
              </label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Comment on taste, hygiene, quantity, warmth or replenishment..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden resize-none"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsFeedbackModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Feedback</span>
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
