import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { UserRole } from './types';

// Layout & Common Components
import { DemoCredentialsBanner } from './components/common/DemoCredentialsBanner';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Modal } from './components/common/Modal';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentHostel } from './pages/student/StudentHostel';
import { StudentMess } from './pages/student/StudentMess';
import { StudentMaintenance } from './pages/student/StudentMaintenance';
import { StudentAnnouncements } from './pages/student/StudentAnnouncements';
import { StudentAttendance } from './pages/student/StudentAttendance';
import { StudentTimetable } from './pages/student/StudentTimetable';
import { StudentAcademics } from './pages/student/StudentAcademics';
import { StudentStudyMaterials } from './pages/student/StudentStudyMaterials';
import { StudentFees } from './pages/student/StudentFees';
import { StudentDocuments } from './pages/student/StudentDocuments';
import { StudentProfile } from './pages/student/StudentProfile';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherStudents } from './pages/teacher/TeacherStudents';
import { TeacherAttendance } from './pages/teacher/TeacherAttendance';
import { TeacherMarks } from './pages/teacher/TeacherMarks';
import { TeacherMaterials } from './pages/teacher/TeacherMaterials';
import { TeacherRequests } from './pages/teacher/TeacherRequests';

// Warden Pages
import { WardenDashboard } from './pages/warden/WardenDashboard';
import { WardenRooms } from './pages/warden/WardenRooms';
import { WardenAllocations } from './pages/warden/WardenAllocations';
import { WardenComplaints } from './pages/warden/WardenComplaints';
import { WardenMess } from './pages/warden/WardenMess';
import { WardenVisitors } from './pages/warden/WardenVisitors';
import { WardenReports } from './pages/warden/WardenReports';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminAttendanceSettings } from './pages/admin/AdminAttendanceSettings';

// Common Pages
import { NotificationsPage } from './pages/common/NotificationsPage';
import { SettingsPage } from './pages/common/SettingsPage';

// Smart Digital Gate Pass Pages
import { StudentGatePass } from './pages/student/StudentGatePass';
import { WardenGatePassRequests } from './pages/warden/WardenGatePassRequests';
import { SecurityGatePassPanel } from './pages/security/SecurityGatePassPanel';

// Shared Actions
import { Megaphone, Send } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isAuthenticated, currentRole, currentUser } = useAuth();
  const { createAnnouncement } = useData();

  // Navigation and view state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isAuthView, setIsAuthView] = useState<boolean>(false);
  const [initialAuthRole, setInitialAuthRole] = useState<UserRole>('student');
  const [initialIsRegister, setInitialIsRegister] = useState<boolean>(false);

  // Global Action Modals triggered from quick action buttons
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annCategory, setAnnCategory] = useState<any>('College');
  const [annContent, setAnnContent] = useState('');
  const [annImportant, setAnnImportant] = useState(false);

  const handleCreateAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    await createAnnouncement({
      title: annTitle,
      content: annContent,
      category: annCategory,
      authorName: currentUser?.name || 'Administrator',
      authorRole: currentRole.toUpperCase(),
      isImportant: annImportant,
    });

    setIsAnnouncementModalOpen(false);
    setAnnTitle('');
    setAnnContent('');
    setAnnImportant(false);
    setActiveTab('announcements');
  };

  // If user is not authenticated, show Landing or Auth Page
  if (!isAuthenticated) {
    if (isAuthView) {
      return (
        <div className="min-h-screen flex flex-col bg-slate-50">
          <DemoCredentialsBanner />
          <AuthPage
            initialRole={initialAuthRole}
            initialIsRegister={initialIsRegister}
            onBackToLanding={() => setIsAuthView(false)}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <DemoCredentialsBanner />
        <LandingPage
          onGoToAuth={(role = 'student', isRegister = false) => {
            setInitialAuthRole(role);
            setInitialIsRegister(isRegister);
            setIsAuthView(true);
          }}
        />
      </div>
    );
  }

  // Render role-based active view
  const renderActiveView = () => {
    // Common routes across all roles
    if (activeTab === 'notifications') {
      return <NotificationsPage setActiveTab={setActiveTab} />;
    }
    if (activeTab === 'settings') {
      return <SettingsPage />;
    }

    // Role-specific routing
    if (currentRole === 'student') {
      switch (activeTab) {
        case 'dashboard':
          return (
            <StudentDashboard
              setActiveTab={setActiveTab}
              onOpenRaiseTicket={() => setActiveTab('maintenance')}
              onOpenMessFeedback={() => setActiveTab('mess')}
            />
          );
        case 'hostel':
          return <StudentHostel />;
        case 'mess':
          return <StudentMess />;
        case 'maintenance':
          return <StudentMaintenance />;
        case 'gatepass':
          return <StudentGatePass />;
        case 'announcements':
          return <StudentAnnouncements />;
        case 'attendance':
          return <StudentAttendance />;
        case 'timetable':
          return <StudentTimetable />;
        case 'academic':
          return <StudentAcademics />;
        case 'materials':
          return <StudentStudyMaterials />;
        case 'fees':
          return <StudentFees />;
        case 'documents':
          return <StudentDocuments />;
        case 'profile':
          return <StudentProfile />;
        default:
          return (
            <StudentDashboard
              setActiveTab={setActiveTab}
              onOpenRaiseTicket={() => setActiveTab('maintenance')}
              onOpenMessFeedback={() => setActiveTab('mess')}
            />
          );
      }
    }

    if (currentRole === 'teacher') {
      switch (activeTab) {
        case 'dashboard':
          return (
            <TeacherDashboard
              setActiveTab={setActiveTab}
              onOpenUploadMaterial={() => setActiveTab('materials')}
              onOpenAnnouncement={() => setIsAnnouncementModalOpen(true)}
            />
          );
        case 'students':
          return <TeacherStudents />;
        case 'attendance':
          return <TeacherAttendance />;
        case 'marks':
          return <TeacherMarks />;
        case 'materials':
          return <TeacherMaterials />;
        case 'timetable':
          return <StudentTimetable />;
        case 'announcements':
          return <StudentAnnouncements />;
        case 'requests':
          return <TeacherRequests />;
        case 'gatepass-requests':
        case 'gatepass-outside':
          return <WardenGatePassRequests />;
        case 'profile':
          return <StudentProfile />;
        default:
          return (
            <TeacherDashboard
              setActiveTab={setActiveTab}
              onOpenUploadMaterial={() => setActiveTab('materials')}
              onOpenAnnouncement={() => setIsAnnouncementModalOpen(true)}
            />
          );
      }
    }

    if (currentRole === 'warden') {
      switch (activeTab) {
        case 'dashboard':
          return (
            <WardenDashboard
              setActiveTab={setActiveTab}
              onOpenNewRoom={() => setActiveTab('rooms')}
              onOpenNotice={() => setIsAnnouncementModalOpen(true)}
            />
          );
        case 'hostels':
          return <StudentHostel />;
        case 'rooms':
          return <WardenRooms />;
        case 'allocations':
          return <WardenAllocations />;
        case 'complaints':
          return <WardenComplaints />;
        case 'mess':
          return <WardenMess />;
        case 'announcements':
          return <StudentAnnouncements />;
        case 'visitors':
          return <WardenVisitors />;
        case 'gatepass-requests':
        case 'gatepass-outside':
          return <WardenGatePassRequests />;
        case 'reports':
          return <WardenReports />;
        case 'profile':
          return <StudentProfile />;
        default:
          return (
            <WardenDashboard
              setActiveTab={setActiveTab}
              onOpenNewRoom={() => setActiveTab('rooms')}
              onOpenNotice={() => setIsAnnouncementModalOpen(true)}
            />
          );
      }
    }

    if (currentRole === 'security') {
      switch (activeTab) {
        case 'gatepass-security':
          return <SecurityGatePassPanel />;
        case 'gatepass-outside':
          return <WardenGatePassRequests />;
        case 'visitors':
          return <WardenVisitors />;
        case 'announcements':
          return <StudentAnnouncements />;
        case 'profile':
          return <StudentProfile />;
        default:
          return <SecurityGatePassPanel />;
      }
    }

    if (currentRole === 'admin') {
      switch (activeTab) {
        case 'dashboard':
          return (
            <AdminDashboard
              setActiveTab={setActiveTab}
              onOpenNewUser={() => setActiveTab('users')}
              onOpenAnnouncement={() => setIsAnnouncementModalOpen(true)}
            />
          );
        case 'users':
        case 'students':
        case 'teachers':
        case 'wardens':
          return <AdminUsers />;
        case 'gatepass-requests':
        case 'gatepass-outside':
          return <WardenGatePassRequests />;
        case 'gatepass-security':
          return <SecurityGatePassPanel />;
        case 'hostels':
        case 'rooms':
          return <WardenRooms />;
        case 'mess':
          return <WardenMess />;
        case 'maintenance':
          return <WardenComplaints />;
        case 'announcements':
          return <StudentAnnouncements />;
        case 'attendance':
          return <TeacherAttendance />;
        case 'attendance-settings':
          return <AdminAttendanceSettings />;
        case 'timetable':
          return <StudentTimetable />;
        case 'materials':
          return <TeacherMaterials />;
        case 'fees':
          return <StudentFees />;
        case 'documents':
          return <StudentDocuments />;
        case 'reports':
          return <AdminReports />;
        default:
          return (
            <AdminDashboard
              setActiveTab={setActiveTab}
              onOpenNewUser={() => setActiveTab('users')}
              onOpenAnnouncement={() => setIsAnnouncementModalOpen(true)}
            />
          );
      }
    }

    return (
      <StudentDashboard
        setActiveTab={setActiveTab}
        onOpenRaiseTicket={() => setActiveTab('maintenance')}
        onOpenMessFeedback={() => setActiveTab('mess')}
      />
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Quick Demo Switcher Bar */}
      <DemoCredentialsBanner />

      {/* Main Top Navigation */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* App Body: Sidebar + Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Create Announcement Modal */}
      <Modal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        title="Broadcast Campus Announcement"
        subtitle="Publish a formal notice to student and faculty portals"
      >
        <form onSubmit={handleCreateAnnouncementSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notice Category</label>
            <select
              value={annCategory}
              onChange={(e) => setAnnCategory(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
            >
              <option value="College">College Wide Notice</option>
              <option value="Academic">Academic & Department</option>
              <option value="Exam">Examination Controller</option>
              <option value="Hostel">Hostel & Residential</option>
              <option value="Emergency">Emergency Alert</option>
              <option value="Events">Campus Events & Fest</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Announcement Title</label>
            <input
              type="text"
              required
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              placeholder="e.g. Schedule for End-Semester Practical Examinations"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notice Body / Description</label>
            <textarea
              required
              rows={4}
              value={annContent}
              onChange={(e) => setAnnContent(e.target.value)}
              placeholder="Provide complete instructions, dates, requirements, or guidelines..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden resize-none"
            />
          </div>

          <label className="flex items-center space-x-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={annImportant}
              onChange={(e) => setAnnImportant(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
            />
            <span className="font-semibold text-slate-700">Flag as Important / Urgent Notice</span>
          </label>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAnnouncementModalOpen(false)}
              className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center space-x-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish Notice</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
