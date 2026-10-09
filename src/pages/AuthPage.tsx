import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  GraduationCap,
  BookOpen,
  UserCheck,
  ShieldCheck,
  Shield,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';

interface AuthPageProps {
  initialRole?: UserRole;
  initialIsRegister?: boolean;
  onBackToLanding: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialRole = 'student',
  initialIsRegister = false,
  onBackToLanding,
}) => {
  const { login, loginWithGoogle, loginAsDemo, registerStudent, isLoading } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(initialIsRegister);

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Registration form state (for students)
  const [regForm, setRegForm] = useState({
    fullName: '',
    rollNumber: '',
    email: '',
    phone: '',
    course: 'B.Tech CSE',
    branch: 'Computer Science & Engineering',
    year: '3rd Year',
    semester: '5th Semester',
    password: '',
    confirmPassword: '',
  });

  const handleRoleTabChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    setSuccessMessage(null);
    // Fill realistic identifier hint
    if (role === 'student') setIdentifier('CSE2024089');
    else if (role === 'teacher') setIdentifier('rajesh.sharma@campus.edu');
    else if (role === 'warden') setIdentifier('ramesh.patil@campus.edu');
    else if (role === 'security') setIdentifier('security@campus.edu');
    else setIdentifier('admin@campus.edu');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Please enter your college email or roll number.');
      return;
    }

    const result = await login({
      identifier,
      password,
      role: selectedRole,
    });

    if (!result.success) {
      setErrorMessage(result.message || 'Invalid credentials.');
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    const result = await loginWithGoogle();
    if (!result.success) {
      setErrorMessage(result.message || 'Google sign in failed.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (regForm.password !== regForm.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (regForm.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    const result = await registerStudent({
      fullName: regForm.fullName,
      rollNumber: regForm.rollNumber,
      email: regForm.email,
      phone: regForm.phone,
      course: regForm.course,
      branch: regForm.branch,
      year: regForm.year,
      semester: regForm.semester,
      password: regForm.password,
    });

    if (!result.success) {
      setErrorMessage(result.message || 'Registration failed.');
    } else {
      setSuccessMessage('Student account created successfully! Welcome to campus.');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSent(true);
    setTimeout(() => {
      setForgotSent(false);
      setShowForgotModal(false);
      setForgotEmail('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-8 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <button
          onClick={onBackToLanding}
          className="inline-flex items-center text-xs text-slate-500 hover:text-blue-600 transition mb-4 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Campus Made Easy Home
        </button>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 mb-3">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isRegisterMode ? 'Student Registration' : 'Sign in to Campus'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isRegisterMode
              ? 'Join your university digital campus portal'
              : 'Select your role to access your personalized campus services'}
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Role Selector Tabs (when not registering) */}
        {!isRegisterMode && (
          <div className="grid grid-cols-5 gap-1 p-1 bg-slate-200/80 rounded-2xl mb-4 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => handleRoleTabChange('student')}
              className={`py-2 rounded-xl transition flex flex-col items-center justify-center space-y-1 ${
                selectedRole === 'student'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleTabChange('teacher')}
              className={`py-2 rounded-xl transition flex flex-col items-center justify-center space-y-1 ${
                selectedRole === 'teacher'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Faculty</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleTabChange('warden')}
              className={`py-2 rounded-xl transition flex flex-col items-center justify-center space-y-1 ${
                selectedRole === 'warden'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Warden</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleTabChange('security')}
              className={`py-2 rounded-xl transition flex flex-col items-center justify-center space-y-1 ${
                selectedRole === 'security'
                  ? 'bg-white text-teal-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Security</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleTabChange('admin')}
              className={`py-2 rounded-xl transition flex flex-col items-center justify-center space-y-1 ${
                selectedRole === 'admin'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin</span>
            </button>
          </div>
        )}

        {/* Card Container */}
        <div className="bg-white py-6 px-6 sm:px-8 shadow-xl rounded-2xl border border-slate-100">
          {/* Quick Demo Fill Pill */}
          {!isRegisterMode && (
            <div className="mb-4 p-2.5 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5 text-blue-800">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="font-semibold capitalize">Demo {selectedRole}:</span>
                <span className="text-[11px] text-blue-600 hidden sm:inline">
                  {selectedRole === 'student'
                    ? 'Aryan Bohidar'
                    : selectedRole === 'teacher'
                    ? 'Dr. Rajesh Sharma'
                    : selectedRole === 'warden'
                    ? 'Ramesh Patil'
                    : selectedRole === 'security'
                    ? 'Balwant Singh'
                    : 'Dr. Arvind Mehra'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => loginAsDemo(selectedRole)}
                className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[10px] transition"
              >
                Instant 1-Click
              </button>
            </div>
          )}

          {/* Feedback banners */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {!isRegisterMode ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {selectedRole === 'student'
                    ? 'Roll Number / College Email'
                    : 'College Email / Staff ID'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      selectedRole === 'student' ? 'e.g. CSE2024089 or amansahu@campus.edu' : 'e.g. staff@campus.edu'
                    }
                    className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-9 pr-9 py-2.5 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-600">Remember me</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition disabled:opacity-50"
              >
                {isLoading ? 'Signing In...' : `Sign In as ${selectedRole.toUpperCase()}`}
              </button>

              {/* Google Sign-in with Firebase Auth */}
              <div className="pt-2">
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-white px-2 text-slate-400 font-semibold">Or continue with</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-2.5 px-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition flex items-center justify-center space-x-2 shadow-xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google Sign-In with Firebase</span>
                </button>
              </div>

              {/* Student Registration Toggle */}
              {selectedRole === 'student' && (
                <div className="pt-3 text-center border-t border-slate-100">
                  <p className="text-xs text-slate-600">
                    New student at campus?{' '}
                    <button
                      type="button"
                      onClick={() => setIsRegisterMode(true)}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      Register here
                    </button>
                  </p>
                </div>
              )}
            </form>
          ) : (
            /* Student Registration Form (Section 5) */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={regForm.fullName}
                    onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                    placeholder="e.g. Aman Sahu"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Roll Number</label>
                  <input
                    type="text"
                    required
                    value={regForm.rollNumber}
                    onChange={(e) => setRegForm({ ...regForm, rollNumber: e.target.value })}
                    placeholder="e.g. CSE2024099"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">College Email</label>
                  <input
                    type="email"
                    required
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    placeholder="name@campus.edu"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    placeholder="+91 98765 00000"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Course</label>
                  <select
                    value={regForm.course}
                    onChange={(e) => setRegForm({ ...regForm, course: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
                  >
                    <option>B.Tech CSE</option>
                    <option>B.Tech ECE</option>
                    <option>B.Tech Mechanical</option>
                    <option>B.Tech Civil</option>
                    <option>M.Tech CSE</option>
                    <option>MCA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Branch</label>
                  <input
                    type="text"
                    required
                    value={regForm.branch}
                    onChange={(e) => setRegForm({ ...regForm, branch: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Year</label>
                  <select
                    value={regForm.year}
                    onChange={(e) => setRegForm({ ...regForm, year: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
                  >
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Semester</label>
                  <select
                    value={regForm.semester}
                    onChange={(e) => setRegForm({ ...regForm, semester: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
                  >
                    <option>1st Semester</option>
                    <option>2nd Semester</option>
                    <option>3rd Semester</option>
                    <option>4th Semester</option>
                    <option>5th Semester</option>
                    <option>6th Semester</option>
                    <option>7th Semester</option>
                    <option>8th Semester</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Password</label>
                  <input
                    type="password"
                    required
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    placeholder="Min 6 chars"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={regForm.confirmPassword}
                    onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                    placeholder="Re-type password"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition disabled:opacity-50"
                >
                  {isLoading ? 'Creating Account...' : 'Complete Student Registration'}
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(false)}
                  className="text-xs text-blue-600 font-bold hover:underline"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        title="Reset Campus Password"
        subtitle="We will send a password reset link to your verified college email"
      >
        {forgotSent ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-900">Reset Link Dispatched</p>
            <p className="text-xs text-slate-600 mt-1">
              Instructions have been sent to {forgotEmail}. Please check your inbox.
            </p>
          </div>
        ) : (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                College Email Address
              </label>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="e.g. amansahu@campus.edu"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
              >
                Send Reset Link
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
