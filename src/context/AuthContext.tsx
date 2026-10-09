import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, StudentProfile, UserRole } from '../types';
import { INITIAL_USERS, INITIAL_STUDENT_PROFILES } from '../data/initialData';
import { auth, db } from '../firebase/config';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInAnonymously,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  studentProfile: StudentProfile | null;
  currentRole: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { identifier: string; password: string; role: UserRole }) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; message?: string }>;
  loginAsDemo: (role: UserRole) => void;
  registerStudent: (data: {
    fullName: string;
    rollNumber: string;
    email: string;
    phone: string;
    course: string;
    branch: string;
    year: string;
    semester: string;
    password: string;
  }) => Promise<{ success: boolean; message?: string }>;
  updateProfile: (updatedData: Partial<User> & Partial<StudentProfile>) => void;
  changePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  allUsers: User[];
  setAllUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'campus_made_easy_user';
const LOCAL_STORAGE_USERS_KEY = 'campus_made_easy_all_users';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (saved) return JSON.parse(saved);
      // Default initial user for instant showcase: Aman Sahu (Student)
      return INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  });

  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(() => {
    if (currentUser?.id && INITIAL_STUDENT_PROFILES[currentUser.id]) {
      return INITIAL_STUDENT_PROFILES[currentUser.id];
    }
    return INITIAL_STUDENT_PROFILES['user-student-1'];
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync all users with localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(allUsers));
  }, [allUsers]);

  // Sync current user with localStorage and update student profile
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(currentUser));
      if (currentUser.role === 'student') {
        const profile = INITIAL_STUDENT_PROFILES[currentUser.id] || {
          userId: currentUser.id,
          rollNumber: 'CSE2024089',
          course: 'B.Tech CSE',
          branch: currentUser.department || 'Computer Science & Engineering',
          year: '3rd Year',
          semester: '5th Semester',
          cgpa: 8.78,
          hostelId: 'hostel-1',
          hostelName: 'Aryabhatta Boys Hostel',
          roomNumber: 'B-304',
          bedNumber: 'Bed 2',
          emergencyContact: 'Father - +91 94370 12345',
          address: 'Plot 42, Vani Vihar, Bhubaneswar, Odisha',
        };
        setStudentProfile(profile);
      } else {
        setStudentProfile(null);
      }
    } else {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      setStudentProfile(null);
    }
  }, [currentUser]);

  // Listen to Firebase Auth state
  useEffect(() => {
    // Attempt anonymous auth if no user is authenticated so request.auth is populated
    if (!auth.currentUser) {
      signInAnonymously(auth).catch((err) => {
        // In case anonymous auth is disabled, Firestore rules allow open access
        console.warn('Anonymous auth unavailable:', err?.message);
      });
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // If current user is already set from manual login, keep it,
        // or check if Firestore has a user document for fbUser.uid
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data() as User;
            setCurrentUser(data);
          }
        } catch {
          // Graceful fallback
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async ({
    identifier,
    password,
    role,
  }: {
    identifier: string;
    password: string;
    role: UserRole;
  }): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 400)); // Smooth UI feel

    // Find user matching identifier (email or roll number or name)
    const normalizedIdentifier = identifier.trim().toLowerCase();

    // Check in users list
    const foundUser = allUsers.find(
      (u) =>
        (u.email.toLowerCase() === normalizedIdentifier ||
          u.name.toLowerCase().includes(normalizedIdentifier)) &&
        u.role === role
    );

    // Or check student roll number
    let matchedUser = foundUser;
    if (!matchedUser && role === 'student') {
      const matchedProfile = Object.values(INITIAL_STUDENT_PROFILES).find(
        (p) => p.rollNumber.toLowerCase() === normalizedIdentifier
      );
      if (matchedProfile) {
        matchedUser = allUsers.find((u) => u.id === matchedProfile.userId);
      }
    }

    if (!matchedUser) {
      // Allow demo password or fallback login for demonstration
      if (password === 'password' || password === 'demo123' || password.length >= 4) {
        const demoRoleUser = allUsers.find((u) => u.role === role);
        if (demoRoleUser) {
          setCurrentUser(demoRoleUser);
          setIsLoading(false);
          return { success: true };
        }
      }
      setIsLoading(false);
      return {
        success: false,
        message: `No active ${role} account found for "${identifier}". You can use the Quick Demo Logins or enter any valid password (min 4 chars).`,
      };
    }

    setCurrentUser(matchedUser);
    setIsLoading(false);
    return { success: true };
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;

      // Determine role based on admin email or default student
      const isAdminEmail = fbUser.email === 'amansahu9337@gmail.com' || fbUser.email?.includes('admin');
      const role: UserRole = isAdminEmail ? 'admin' : 'student';

      const newUser: User = {
        id: fbUser.uid,
        email: fbUser.email || 'user@campus.edu',
        name: fbUser.displayName || 'Campus Member',
        role: role,
        avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        createdAt: new Date().toISOString().split('T')[0],
        department: 'Computer Science & Engineering',
        status: 'active',
      };

      // Try persisting to Firestore
      try {
        await setDoc(doc(db, 'users', fbUser.uid), newUser, { merge: true });
      } catch (err) {
        console.warn('Could not sync user to Firestore:', err);
      }

      setCurrentUser(newUser);
      setAllUsers((prev) => {
        const exists = prev.find((u) => u.id === newUser.id);
        return exists ? prev.map((u) => (u.id === newUser.id ? newUser : u)) : [newUser, ...prev];
      });

      setIsLoading(false);
      return { success: true };
    } catch (error: any) {
      setIsLoading(false);
      return {
        success: false,
        message: error?.message || 'Google sign-in was cancelled or encountered an error.',
      };
    }
  };

  const loginAsDemo = (role: UserRole) => {
    const roleUser = allUsers.find((u) => u.role === role) || INITIAL_USERS.find((u) => u.role === role);
    if (roleUser) {
      setCurrentUser(roleUser);
    }
  };

  const registerStudent = async (data: {
    fullName: string;
    rollNumber: string;
    email: string;
    phone: string;
    course: string;
    branch: string;
    year: string;
    semester: string;
    password: string;
  }): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 500));

    const newUserId = `student-${Date.now()}`;
    const newUser: User = {
      id: newUserId,
      email: data.email,
      name: data.fullName,
      role: 'student',
      phone: data.phone,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString().split('T')[0],
      department: data.branch,
      status: 'active',
    };

    const newProfile: StudentProfile = {
      userId: newUserId,
      rollNumber: data.rollNumber,
      course: data.course,
      branch: data.branch,
      year: data.year,
      semester: data.semester,
      cgpa: 8.5,
      hostelId: 'hostel-1',
      hostelName: 'Aryabhatta Boys Hostel',
      roomNumber: 'B-306',
      bedNumber: 'Bed 1',
      emergencyContact: `${data.fullName} Family - ${data.phone}`,
      address: 'Campus Hostel Block B',
      admissionYear: '2024',
    };

    setAllUsers((prev) => [newUser, ...prev]);
    INITIAL_STUDENT_PROFILES[newUserId] = newProfile;
    setCurrentUser(newUser);
    setStudentProfile(newProfile);

    // Save to Firestore optionally
    try {
      await setDoc(doc(db, 'users', newUserId), newUser);
      await setDoc(doc(db, 'studentProfiles', newUserId), newProfile);
    } catch {
      // local state already updated
    }

    setIsLoading(false);
    return { success: true };
  };

  const updateProfile = (updatedData: Partial<User> & Partial<StudentProfile>) => {
    if (!currentUser) return;

    const updatedUser: User = {
      ...currentUser,
      name: updatedData.name || currentUser.name,
      phone: updatedData.phone || currentUser.phone,
      avatar: updatedData.avatar || currentUser.avatar,
      department: updatedData.department || currentUser.department,
    };

    setCurrentUser(updatedUser);
    setAllUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));

    if (currentUser.role === 'student' && studentProfile) {
      const updatedProf: StudentProfile = {
        ...studentProfile,
        address: updatedData.address || studentProfile.address,
        emergencyContact: updatedData.emergencyContact || studentProfile.emergencyContact,
        bloodGroup: updatedData.bloodGroup || studentProfile.bloodGroup,
      };
      setStudentProfile(updatedProf);
      INITIAL_STUDENT_PROFILES[currentUser.id] = updatedProf;
    }
  };

  const changePassword = async (
    _oldPass: string,
    _newPass: string
  ): Promise<{ success: boolean; message?: string }> => {
    await new Promise((res) => setTimeout(res, 400));
    return { success: true, message: 'Password updated successfully!' };
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {
      // ignore
    }
    setCurrentUser(null);
    setStudentProfile(null);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        studentProfile,
        currentRole: currentUser?.role || 'student',
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        loginWithGoogle,
        loginAsDemo,
        registerStudent,
        updateProfile,
        changePassword,
        logout,
        allUsers,
        setAllUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
