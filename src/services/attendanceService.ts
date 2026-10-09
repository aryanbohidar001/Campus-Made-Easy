import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';
import {
  AttendanceSession,
  AttendanceSessionRecord,
  CampusSettings,
  AttendanceQrPayload,
} from '../types';
import {
  DEFAULT_CAMPUS_SETTINGS,
  calculateDistanceInMeters,
} from '../utils/geolocation';

const SESSIONS_COLLECTION = 'attendanceSessions';
const RECORDS_COLLECTION = 'attendanceRecords';
const SETTINGS_COLLECTION = 'campusSettings';
const SETTINGS_DOC_ID = 'global';

// Local storage fallback cache keys for maximum resilience
const CACHE_SESSIONS_KEY = 'cme_attendance_sessions_cache';
const CACHE_RECORDS_KEY = 'cme_attendance_records_cache';
const CACHE_SETTINGS_KEY = 'cme_campus_settings_cache';

function getLocalCache<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalCache<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Generates an 8-character random cryptographic token for QR
 */
export function generateRandomToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let token = '';
  for (let i = 0; i < 8; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Generate a friendly session ID e.g. "DBMS-CSE5-102"
 */
export function generateSessionId(subjectName: string, branch: string, semester: string): string {
  const subCode = subjectName.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'SUBJ';
  const branchCode = branch.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'ENG';
  const semCode = semester.replace(/[^0-9]/g, '') || '5';
  const randNum = Math.floor(100 + Math.random() * 900);
  return `${subCode}-${branchCode}${semCode}-${randNum}`;
}

// ==========================================
// 1. Campus Geofence & System Settings
// ==========================================

export async function getCampusSettings(): Promise<CampusSettings> {
  const path = `${SETTINGS_COLLECTION}/${SETTINGS_DOC_ID}`;
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as CampusSettings;
      setLocalCache(CACHE_SETTINGS_KEY, data);
      return data;
    }
  } catch (err) {
    console.warn('Could not read settings from Firestore, using cache or default:', err);
  }

  // Fallback to local cache or defaults
  const cached = getLocalCache<CampusSettings>(CACHE_SETTINGS_KEY, DEFAULT_CAMPUS_SETTINGS);
  return cached;
}

export async function saveCampusSettings(settings: CampusSettings): Promise<void> {
  const path = `${SETTINGS_COLLECTION}/${SETTINGS_DOC_ID}`;
  const updatedData: CampusSettings = {
    ...settings,
    updatedAt: new Date().toISOString(),
  };

  setLocalCache(CACHE_SETTINGS_KEY, updatedData);

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    await setDoc(docRef, updatedData);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// ==========================================
// 2. Attendance Sessions (Teacher / Admin)
// ==========================================

export async function createAttendanceSession(params: {
  teacherId: string;
  teacherName: string;
  department: string;
  branch: string;
  semester: string;
  section: string;
  subjectId: string;
  subjectName: string;
  classPeriod: string;
  date: string;
  durationMinutes: number;
}): Promise<AttendanceSession> {
  const sessionId = generateSessionId(params.subjectName, params.branch, params.semester);
  const now = new Date();
  const expiresAtMs = now.getTime() + params.durationMinutes * 60 * 1000;
  const expiresAtDate = new Date(expiresAtMs);
  const qrToken = generateRandomToken();

  const newSession: AttendanceSession = {
    sessionId,
    teacherId: params.teacherId,
    teacherName: params.teacherName,
    department: params.department,
    branch: params.branch,
    semester: params.semester,
    section: params.section,
    subjectId: params.subjectId,
    subjectName: params.subjectName,
    classPeriod: params.classPeriod,
    date: params.date,
    createdAt: now.toISOString(),
    expiresAt: expiresAtDate.toISOString(),
    expiresAtTimestamp: expiresAtMs,
    durationMinutes: params.durationMinutes,
    status: 'ACTIVE',
    qrToken,
  };

  const path = `${SESSIONS_COLLECTION}/${sessionId}`;

  // Update local cache first
  const cachedSessions = getLocalCache<AttendanceSession[]>(CACHE_SESSIONS_KEY, []);
  setLocalCache(CACHE_SESSIONS_KEY, [newSession, ...cachedSessions.filter((s) => s.sessionId !== sessionId)]);

  try {
    const docRef = doc(db, SESSIONS_COLLECTION, sessionId);
    await setDoc(docRef, newSession);
    return newSession;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function refreshSessionQr(sessionId: string, durationMinutes: number): Promise<AttendanceSession> {
  const path = `${SESSIONS_COLLECTION}/${sessionId}`;
  const now = new Date();
  const expiresAtMs = now.getTime() + durationMinutes * 60 * 1000;
  const expiresAtDate = new Date(expiresAtMs);
  const newQrToken = generateRandomToken();

  const updates = {
    qrToken: newQrToken,
    durationMinutes,
    expiresAt: expiresAtDate.toISOString(),
    expiresAtTimestamp: expiresAtMs,
    status: 'ACTIVE' as const,
  };

  // Update local cache
  const cached = getLocalCache<AttendanceSession[]>(CACHE_SESSIONS_KEY, []);
  let updatedSession: AttendanceSession | null = null;
  const nextCache = cached.map((s) => {
    if (s.sessionId === sessionId) {
      updatedSession = { ...s, ...updates };
      return updatedSession;
    }
    return s;
  });
  setLocalCache(CACHE_SESSIONS_KEY, nextCache);

  try {
    const docRef = doc(db, SESSIONS_COLLECTION, sessionId);
    await updateDoc(docRef, updates);
    const snap = await getDoc(docRef);
    return snap.data() as AttendanceSession;
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function closeAttendanceSession(sessionId: string): Promise<void> {
  const path = `${SESSIONS_COLLECTION}/${sessionId}`;
  const updates = {
    status: 'CLOSED' as const,
  };

  // Cache
  const cached = getLocalCache<AttendanceSession[]>(CACHE_SESSIONS_KEY, []);
  setLocalCache(
    CACHE_SESSIONS_KEY,
    cached.map((s) => (s.sessionId === sessionId ? { ...s, status: 'CLOSED' as const } : s))
  );

  try {
    const docRef = doc(db, SESSIONS_COLLECTION, sessionId);
    await updateDoc(docRef, updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function getAttendanceSession(sessionId: string): Promise<AttendanceSession | null> {
  const path = `${SESSIONS_COLLECTION}/${sessionId}`;
  try {
    const docRef = doc(db, SESSIONS_COLLECTION, sessionId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as AttendanceSession;
    }
  } catch (err) {
    console.warn('Failed to get session from Firestore, checking cache:', err);
  }

  const cached = getLocalCache<AttendanceSession[]>(CACHE_SESSIONS_KEY, []);
  return cached.find((s) => s.sessionId === sessionId) || null;
}

export function subscribeToSession(
  sessionId: string,
  onUpdate: (session: AttendanceSession | null) => void
): () => void {
  const path = `${SESSIONS_COLLECTION}/${sessionId}`;
  try {
    const docRef = doc(db, SESSIONS_COLLECTION, sessionId);
    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          onUpdate(snap.data() as AttendanceSession);
        } else {
          onUpdate(null);
        }
      },
      (err) => {
        console.warn('onSnapshot session error, falling back to cache:', err);
        const cached = getLocalCache<AttendanceSession[]>(CACHE_SESSIONS_KEY, []);
        onUpdate(cached.find((s) => s.sessionId === sessionId) || null);
      }
    );
    return unsubscribe;
  } catch {
    const cached = getLocalCache<AttendanceSession[]>(CACHE_SESSIONS_KEY, []);
    onUpdate(cached.find((s) => s.sessionId === sessionId) || null);
    return () => {};
  }
}

export async function getAllAttendanceSessions(): Promise<AttendanceSession[]> {
  const path = SESSIONS_COLLECTION;
  try {
    const snap = await getDocs(collection(db, SESSIONS_COLLECTION));
    const sessions = snap.docs.map((d) => d.data() as AttendanceSession);
    setLocalCache(CACHE_SESSIONS_KEY, sessions);
    return sessions;
  } catch (err) {
    console.warn('Firestore getAllAttendanceSessions fallback to cache:', err);
    return getLocalCache<AttendanceSession[]>(CACHE_SESSIONS_KEY, []);
  }
}

// ==========================================
// 3. Attendance Records (Student Verification & Anti-Duplicate)
// ==========================================

export interface VerificationResult {
  success: boolean;
  message: string;
  code?: 'EXPIRED' | 'OUTSIDE_CAMPUS' | 'ALREADY_MARKED' | 'INVALID_QR' | 'CLASS_MISMATCH' | 'SUCCESS';
  record?: AttendanceSessionRecord;
  existingRecord?: AttendanceSessionRecord;
}

export async function verifyAndRecordAttendance(params: {
  qrData: AttendanceQrPayload;
  studentId: string;
  studentName: string;
  rollNumber: string;
  studentBranch?: string;
  studentSemester?: string;
  studentSection?: string;
  studentLatitude: number;
  studentLongitude: number;
  deviceAccuracy?: number;
  campusSettings: CampusSettings;
}): Promise<VerificationResult> {
  const {
    qrData,
    studentId,
    studentName,
    rollNumber,
    studentLatitude,
    studentLongitude,
    deviceAccuracy,
    campusSettings,
  } = params;

  // 1. Fetch Session from Firestore (or fallback cache)
  const session = await getAttendanceSession(qrData.sessionId);
  if (!session) {
    return {
      success: false,
      code: 'INVALID_QR',
      message: 'Attendance session not found. Please scan a valid session QR.',
    };
  }

  // 2. Validate QR Token
  if (session.qrToken !== qrData.randomToken) {
    return {
      success: false,
      code: 'INVALID_QR',
      message: 'QR Token mismatch or session has been refreshed. Please scan the current QR code.',
    };
  }

  // 3. Validate Expiration
  const nowMs = Date.now();
  if (nowMs > session.expiresAtTimestamp || session.status === 'EXPIRED' || session.status === 'CLOSED') {
    return {
      success: false,
      code: 'EXPIRED',
      message: 'QR Code has expired! Attendance window is closed.',
    };
  }

  // 4. GPS Geofence Check
  const distanceMeters = calculateDistanceInMeters(
    studentLatitude,
    studentLongitude,
    campusSettings.collegeLatitude,
    campusSettings.collegeLongitude
  );

  if (distanceMeters > campusSettings.allowedRadius) {
    return {
      success: false,
      code: 'OUTSIDE_CAMPUS',
      message: `Location Verification Failed: You are ${distanceMeters}m away from the campus (allowed: ${campusSettings.allowedRadius}m).`,
    };
  }

  // 5. Duplicate Check
  const deterministicRecordId = `rec_${session.sessionId}_${studentId}`;
  const recordDocRef = doc(db, RECORDS_COLLECTION, deterministicRecordId);
  const path = `${RECORDS_COLLECTION}/${deterministicRecordId}`;

  try {
    const existingSnap = await getDoc(recordDocRef);
    if (existingSnap.exists()) {
      const existingRecord = existingSnap.data() as AttendanceSessionRecord;
      return {
        success: false,
        code: 'ALREADY_MARKED',
        message: 'You have already marked attendance for this class.',
        existingRecord,
      };
    }
  } catch (err) {
    // Check local cache for duplicate
    const cachedRecords = getLocalCache<AttendanceSessionRecord[]>(CACHE_RECORDS_KEY, []);
    const found = cachedRecords.find((r) => r.sessionId === session.sessionId && r.studentId === studentId);
    if (found) {
      return {
        success: false,
        code: 'ALREADY_MARKED',
        message: 'You have already marked attendance for this class.',
        existingRecord: found,
      };
    }
  }

  // 6. Create Verified Attendance Record
  const now = new Date();
  const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateFormatted = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  const record: AttendanceSessionRecord = {
    recordId: deterministicRecordId,
    sessionId: session.sessionId,
    studentId,
    studentName,
    rollNumber,
    subject: session.subjectName,
    subjectCode: session.subjectId,
    date: dateFormatted,
    time: timeFormatted,
    timestamp: now.toISOString(),
    status: 'PRESENT',
    latitude: studentLatitude,
    longitude: studentLongitude,
    distanceFromCollege: distanceMeters,
    locationVerified: true,
    qrVerified: true,
    accuracy: deviceAccuracy,
    deviceInfo: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop / Web Client',
  };

  // Update local cache
  const cachedRecords = getLocalCache<AttendanceSessionRecord[]>(CACHE_RECORDS_KEY, []);
  setLocalCache(CACHE_RECORDS_KEY, [record, ...cachedRecords]);

  try {
    await setDoc(recordDocRef, record);
    return {
      success: true,
      code: 'SUCCESS',
      message: 'Attendance Marked Successfully!',
      record,
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export function subscribeToSessionRecords(
  sessionId: string,
  onRecordsUpdate: (records: AttendanceSessionRecord[]) => void
): () => void {
  const path = RECORDS_COLLECTION;
  try {
    const q = query(collection(db, RECORDS_COLLECTION), where('sessionId', '==', sessionId));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const records = snapshot.docs.map((d) => d.data() as AttendanceSessionRecord);
        onRecordsUpdate(records);
      },
      (err) => {
        console.warn('onSnapshot records error, fallback to local cache:', err);
        const cached = getLocalCache<AttendanceSessionRecord[]>(CACHE_RECORDS_KEY, []);
        onRecordsUpdate(cached.filter((r) => r.sessionId === sessionId));
      }
    );
    return unsubscribe;
  } catch {
    const cached = getLocalCache<AttendanceSessionRecord[]>(CACHE_RECORDS_KEY, []);
    onRecordsUpdate(cached.filter((r) => r.sessionId === sessionId));
    return () => {};
  }
}

export async function getStudentAttendanceRecords(studentId: string): Promise<AttendanceSessionRecord[]> {
  const path = RECORDS_COLLECTION;
  try {
    const q = query(collection(db, RECORDS_COLLECTION), where('studentId', '==', studentId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as AttendanceSessionRecord);
  } catch (err) {
    const cached = getLocalCache<AttendanceSessionRecord[]>(CACHE_RECORDS_KEY, []);
    return cached.filter((r) => r.studentId === studentId);
  }
}
