import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Bell,
  CheckCheck,
  Megaphone,
  Wrench,
  UtensilsCrossed,
  CalendarCheck,
  BookOpen,
  Building2,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';

interface NotificationsPageProps {
  setActiveTab: (tab: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ setActiveTab }) => {
  const { currentUser } = useAuth();
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    unreadNotificationCount,
  } = useData();

  const userNotifications = notifications.filter(
    (n) => n.userId === currentUser?.id || n.userId === 'all'
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-purple-600" />;
      case 'ticket':
        return <Wrench className="w-4 h-4 text-blue-600" />;
      case 'mess':
        return <UtensilsCrossed className="w-4 h-4 text-amber-600" />;
      case 'attendance':
        return <CalendarCheck className="w-4 h-4 text-emerald-600" />;
      case 'material':
        return <BookOpen className="w-4 h-4 text-indigo-600" />;
      case 'hostel':
        return <Building2 className="w-4 h-4 text-cyan-600" />;
      case 'fees':
        return <CreditCard className="w-4 h-4 text-rose-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Notifications & Alerts</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time activity log of hostel updates, tickets, mess replies, and academic announcements
          </p>
        </div>

        {unreadNotificationCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-xs">
        {userNotifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            No notifications available. You're completely up to date!
          </div>
        ) : (
          userNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                markNotificationRead(notif.id);
                if (notif.actionUrl) setActiveTab(notif.actionUrl);
              }}
              className={`p-4 hover:bg-slate-50 cursor-pointer transition flex items-start space-x-3.5 ${
                !notif.isRead ? 'bg-blue-50/40' : ''
              }`}
            >
              <div className="p-2 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">{notif.title}</h4>
                  <span className="text-[11px] text-slate-400">
                    {new Date(notif.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                {notif.actionUrl && (
                  <span className="text-blue-600 font-semibold text-[11px] mt-2 inline-block hover:underline">
                    View in {notif.actionUrl} &rarr;
                  </span>
                )}
              </div>

              {!notif.isRead && (
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 self-center" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
