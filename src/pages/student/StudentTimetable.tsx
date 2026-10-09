import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  GraduationCap,
} from 'lucide-react';

export const StudentTimetable: React.FC = () => {
  const { timetable } = useData();

  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  const [selectedDay, setSelectedDay] = useState<string>('Monday');

  const slots = timetable.filter((s) => s.day === selectedDay);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Weekly Lecture Timetable</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Classes, laboratory slots, faculty instructor assignments, and lecture hall locations
        </p>
      </div>

      {/* Day Selector Pills */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs flex items-center space-x-1.5 overflow-x-auto">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedDay === d
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Daily Class Slots Timeline */}
      <div className="space-y-3">
        {slots.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
            No scheduled classes on {selectedDay}. Free for self-study and projects.
          </div>
        ) : (
          slots.map((slot, idx) => (
            <div
              key={slot.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-blue-200 transition"
            >
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-xs shrink-0">
                  #{idx + 1}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-slate-900">{slot.subject}</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                      {slot.branch} - {slot.semester}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
                    <span className="flex items-center">
                      <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {slot.faculty}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      Room: {slot.room}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-100 flex items-center space-x-2 text-xs font-semibold text-slate-700 self-stretch sm:self-auto justify-center">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  {slot.startTime} - {slot.endTime}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
