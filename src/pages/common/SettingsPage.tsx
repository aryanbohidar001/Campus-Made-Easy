import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Settings,
  Bell,
  Lock,
  Moon,
  Sun,
  Shield,
  RotateCcw,
  CheckCircle2,
  Sliders,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { currentUser, changePassword } = useAuth();
  const { resetToDemoData } = useData();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [ticketAlerts, setTicketAlerts] = useState(true);
  const [messAlerts, setMessAlerts] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo data (tickets, mess feedback, notices) back to default initial state?')) {
      resetToDemoData();
      alert('Demo data restored to initial campus state!');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Account & Platform Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure notification alerts, privacy preferences, and application testing controls
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Preferences saved successfully!</span>
        </div>
      )}

      {/* Notification Preferences */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <Bell className="w-4 h-4 text-blue-600" />
          <span>Communication & Push Alerts</span>
        </h3>

        <form onSubmit={handleSavePreferences} className="space-y-4 text-xs">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <p className="font-semibold text-slate-800">Email Notifications</p>
              <p className="text-slate-500 text-[11px]">Receive announcements and exam schedules in your college inbox</p>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <p className="font-semibold text-slate-800">Emergency SMS Alerts</p>
              <p className="text-slate-500 text-[11px]">Receive urgent campus shutdown and weather alerts via text</p>
            </div>
            <input
              type="checkbox"
              checked={smsAlerts}
              onChange={(e) => setSmsAlerts(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <p className="font-semibold text-slate-800">Maintenance Ticket Updates</p>
              <p className="text-slate-500 text-[11px]">Instant alert when a technician is assigned or your ticket is resolved</p>
            </div>
            <input
              type="checkbox"
              checked={ticketAlerts}
              onChange={(e) => setTicketAlerts(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-semibold text-slate-800">Mess Menu Updates</p>
              <p className="text-slate-500 text-[11px]">Notify when warden posts weekly menu or answers food reviews</p>
            </div>
            <input
              type="checkbox"
              checked={messAlerts}
              onChange={(e) => setMessAlerts(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
            >
              Save Notification Preferences
            </button>
          </div>
        </form>
      </div>

      {/* Demo State Reset for Testing */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center space-x-2">
          <RotateCcw className="w-4 h-4 text-amber-600" />
          <span>Evaluation & Demo Data Management</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          Reset all locally created tickets, mess feedback ratings, and room assignments back to the initial sample campus dataset.
        </p>
        <button
          onClick={handleResetData}
          className="px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Data to Factory Initial</span>
        </button>
      </div>
    </div>
  );
};
