import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  GraduationCap,
  Building2,
  UtensilsCrossed,
  Wrench,
  Megaphone,
  CalendarCheck,
  BookOpen,
  CreditCard,
  FileText,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Send,
  Star,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';

interface LandingPageProps {
  onGoToAuth: (initialRole?: UserRole, isRegister?: boolean) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGoToAuth }) => {
  const { loginAsDemo } = useAuth();
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setShowContactModal(false);
      setContactForm({ name: '', email: '', subject: '', message: '' });
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Public Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight block leading-none">
                Campus Made Easy
              </span>
              <span className="text-[10px] text-blue-600 font-semibold tracking-wide">
                Simplify Everyday Campus Life
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-xs font-medium text-slate-600">
            <a href="#hero" className="hover:text-blue-600 transition">
              Home
            </a>
            <a href="#features" className="hover:text-blue-600 transition">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-blue-600 transition">
              How It Works
            </a>
            <a href="#roles" className="hover:text-blue-600 transition">
              Portals
            </a>
            <button
              onClick={() => setShowContactModal(true)}
              className="hover:text-blue-600 transition"
            >
              Contact
            </button>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onGoToAuth('student', false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 transition"
            >
              Sign In
            </button>
            <button
              onClick={() => onGoToAuth('student', true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs shadow-blue-600/30 transition flex items-center space-x-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-6 border border-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>The All-In-One Modern College Operating System</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Simplify Your <span className="text-blue-600 underline decoration-blue-300 decoration-wavy">Campus Life</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            One smart platform for hostel management, mess feedback, maintenance complaints, announcements, attendance and everyday student services.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onGoToAuth('student', false)}
              className="px-6 py-3.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/25 transition flex items-center space-x-2"
            >
              <span>Explore Student Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#features"
              className="px-6 py-3.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition"
            >
              Explore Features
            </a>
          </div>

          {/* Quick Demo Launch Pills */}
          <div className="mt-10 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm max-w-3xl mx-auto">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              One-Click Instant Role Demo:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => loginAsDemo('student')}
                className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-800 text-xs font-medium flex items-center justify-center space-x-1.5 transition"
              >
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>Student Portal</span>
              </button>
              <button
                onClick={() => loginAsDemo('teacher')}
                className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-800 text-xs font-medium flex items-center justify-center space-x-1.5 transition"
              >
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Faculty Portal</span>
              </button>
              <button
                onClick={() => loginAsDemo('warden')}
                className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100 text-amber-800 text-xs font-medium flex items-center justify-center space-x-1.5 transition"
              >
                <UserCheck className="w-4 h-4 text-amber-600" />
                <span>Warden Portal</span>
              </button>
              <button
                onClick={() => loginAsDemo('admin')}
                className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-purple-800 text-xs font-medium flex items-center justify-center space-x-1.5 transition"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Admin Portal</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Prominent 4 Feature Cards (as requested in Section 36) */}
      <section id="features" className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Core Campus Pillars
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Designed specifically to resolve the biggest day-to-day pain points of university living.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Hostel Management */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4 shadow-sm shadow-blue-600/30">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Hostel Management</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Manage room details, bed allocation, warden contacts, hostel rules, and submit leave passes or room transfer requests.
              </p>
              <div className="mt-4 pt-4 border-t border-blue-100/80 flex items-center text-xs font-semibold text-blue-700">
                <span>Real-time Occupancy Tracker</span>
              </div>
            </div>

            {/* 2. Mess Feedback */}
            <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-6 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-4 shadow-sm shadow-amber-600/30">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Mess Feedback</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                View breakfast, lunch, snacks & dinner menus with weekly rotation. Rate meals with 1-5 stars and receive direct responses from mess wardens.
              </p>
              <div className="mt-4 pt-4 border-t border-amber-100/80 flex items-center text-xs font-semibold text-amber-700">
                <span>Daily Star Ratings & Replies</span>
              </div>
            </div>

            {/* 3. Maintenance */}
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-sm shadow-emerald-600/30">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Maintenance Ticketing</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Report electrical, plumbing, furniture, and WiFi grievances in seconds. Track full lifecycle: Submitted &rarr; Assigned &rarr; In Progress &rarr; Resolved.
              </p>
              <div className="mt-4 pt-4 border-t border-emerald-100/80 flex items-center text-xs font-semibold text-emerald-700">
                <span>Lifecycle Status & Reopening</span>
              </div>
            </div>

            {/* 4. Announcements */}
            <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-6 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-4 shadow-sm shadow-purple-600/30">
                <Megaphone className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Announcements</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Never miss important campus updates. Categorized bulletins for exams, events, emergencies, hostels, and academic notices with attachments.
              </p>
              <div className="mt-4 pt-4 border-t border-purple-100/80 flex items-center text-xs font-semibold text-purple-700">
                <span>Instant Alerts & Categories</span>
              </div>
            </div>
          </div>

          {/* Secondary Features Grid */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <CalendarCheck className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-900">Attendance</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Subject-wise tracking</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <GraduationCap className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-900">Academic Marks</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Internal & exam grades</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <BookOpen className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-900">Study Materials</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Notes, slides & PDFs</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <CreditCard className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-900">Fees & Dues</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Simulated fee receipts</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <FileText className="w-6 h-6 text-rose-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-900">Documents</p>
              <p className="text-[11px] text-slate-500 mt-0.5">ID & bonafide certificates</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <ShieldCheck className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-900">Secure RBAC</p>
              <p className="text-[11px] text-slate-500 mt-0.5">4 distinct role portals</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (Section 4) */}
      <section id="how-it-works" className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">How It Works</h2>
            <p className="mt-2 text-sm text-slate-600">
              Campus workflows streamlined in 5 simple, automated steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {[
              { step: '1', title: 'Login', desc: 'Sign in with your campus role or Google Auth' },
              { step: '2', title: 'Dashboard', desc: 'Access your tailored role-specific control center' },
              { step: '3', title: 'Use Services', desc: 'Submit tickets, rate food, view grades or post notices' },
              { step: '4', title: 'Track Requests', desc: 'Real-time timeline and assignment tracking' },
              { step: '5', title: 'Notifications', desc: 'Stay updated with live alerts on your bell icon' },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-xs">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-3">
                  {item.step}
                </div>
                <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 User Roles Showcase */}
      <section id="roles" className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Dedicated Portals for Every Campus Role
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Complete separation of concerns, custom dashboards, and strict permissions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Student */}
            <div className="rounded-2xl border border-blue-200 p-5 bg-gradient-to-b from-blue-50/50 to-white flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-blue-600 mb-3">
                  <GraduationCap className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Student Role</span>
                </div>
                <h4 className="text-base font-bold text-slate-900">Student Portal</h4>
                <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Hostel & room details</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Daily & weekly mess menu feedback</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Maintenance ticket tracking</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Attendance & marks progress</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => loginAsDemo('student')}
                className="mt-6 w-full py-2 text-xs font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-xl transition"
              >
                Preview Student Portal
              </button>
            </div>

            {/* Teacher */}
            <div className="rounded-2xl border border-emerald-200 p-5 bg-gradient-to-b from-emerald-50/50 to-white flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-emerald-600 mb-3">
                  <BookOpen className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Faculty Role</span>
                </div>
                <h4 className="text-base font-bold text-slate-900">Teacher Portal</h4>
                <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Subject-wise attendance marking</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Internal & exam marks grading</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Upload lecture notes & slides</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Publish academic announcements</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => loginAsDemo('teacher')}
                className="mt-6 w-full py-2 text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition"
              >
                Preview Faculty Portal
              </button>
            </div>

            {/* Warden */}
            <div className="rounded-2xl border border-amber-200 p-5 bg-gradient-to-b from-amber-50/50 to-white flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-amber-600 mb-3">
                  <UserCheck className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Warden Role</span>
                </div>
                <h4 className="text-base font-bold text-slate-900">Warden Portal</h4>
                <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Hostel rooms & bed occupancy</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Student room allocations</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Hostel complaints & staff assignment</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Mess menu & reviews oversight</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => loginAsDemo('warden')}
                className="mt-6 w-full py-2 text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-xl transition"
              >
                Preview Warden Portal
              </button>
            </div>

            {/* Admin */}
            <div className="rounded-2xl border border-purple-200 p-5 bg-gradient-to-b from-purple-50/50 to-white flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-purple-600 mb-3">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Admin Role</span>
                </div>
                <h4 className="text-base font-bold text-slate-900">Administrator Portal</h4>
                <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Campus-wide analytics & reports</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>User management & role assignment</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Hostel & fees administration</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Export CSV reports</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => loginAsDemo('admin')}
                className="mt-6 w-full py-2 text-xs font-semibold text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-xl transition"
              >
                Preview Admin Portal
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 text-white font-bold text-base mb-2">
                <GraduationCap className="w-5 h-5 text-blue-500" />
                <span>Campus Made Easy</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Simplifying everyday campus life for students, faculty, wardens, and administrators.
              </p>
            </div>

            <div>
              <h5 className="text-white font-semibold mb-3">Campus Portals</h5>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => loginAsDemo('student')} className="hover:text-white transition">
                    Student Dashboard
                  </button>
                </li>
                <li>
                  <button onClick={() => loginAsDemo('teacher')} className="hover:text-white transition">
                    Faculty Portal
                  </button>
                </li>
                <li>
                  <button onClick={() => loginAsDemo('warden')} className="hover:text-white transition">
                    Hostel Warden Desk
                  </button>
                </li>
                <li>
                  <button onClick={() => loginAsDemo('admin')} className="hover:text-white transition">
                    Campus Administrator
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="text-white font-semibold mb-3">Platform Services</h5>
              <ul className="space-y-2">
                <li>Hostel Management & Room Status</li>
                <li>Mess Feedback & Menus</li>
                <li>Maintenance Grievance Desk</li>
                <li>Announcements & Examination Bulletins</li>
              </ul>
            </div>

            <div>
              <h5 className="text-white font-semibold mb-3">Support & Contact</h5>
              <p className="text-slate-400 flex items-center space-x-1.5 mb-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>support@campusmadeeasy.edu</span>
              </p>
              <p className="text-slate-400 flex items-center space-x-1.5 mb-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span>+91 (0674) 258-9000</span>
              </p>
              <p className="text-slate-400 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>Main Administrative Block, Campus Square</span>
              </p>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-500">
            <p>&copy; {new Date().getFullYear()} Campus Made Easy. All rights reserved.</p>
            <div className="flex space-x-4 mt-2 sm:mt-0">
              <a href="#hero" className="hover:text-slate-300 transition">Privacy Policy</a>
              <a href="#hero" className="hover:text-slate-300 transition">Terms of Service</a>
              <button onClick={() => setShowContactModal(true)} className="hover:text-slate-300 transition">
                Help & Support
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Contact Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title="Contact Campus Support"
        subtitle="Submit your query to the campus administration helpdesk"
      >
        {contactSubmitted ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Message Received!</h4>
            <p className="text-xs text-slate-600 mt-1">
              Thank you, {contactForm.name}. A campus administrator will respond to {contactForm.email} shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleContactSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                placeholder="e.g. Aman Sahu"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                placeholder="e.g. amansahu@campus.edu"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                required
                value={contactForm.subject}
                onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                placeholder="Grievance / Query / Feedback"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
              <textarea
                required
                rows={3}
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                placeholder="Describe your query in detail..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden resize-none"
              />
            </div>
            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Message</span>
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
