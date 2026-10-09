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
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';
import {
  GatePass,
  GatePassStatus,
  GatePassType,
  GatePassQrPayload,
} from '../types';

const GATEPASS_COLLECTION = 'gatePasses';
const CACHE_GATEPASS_KEY = 'cme_gate_passes_cache';

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
    // Ignore cache storage error
  }
}

/**
 * Generate a unique Pass ID like GP-20261009-001
 */
export function generatePassId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const rand = Math.floor(100 + Math.random() * 900);
  return `GP-${year}${month}${day}-${rand}`;
}

/**
 * Generate secure random QR token (e.g. X7K92P8Q)
 */
export function generateRandomQrToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let token = '';
  for (let i = 0; i < 8; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Initial sample seed passes if Firestore is empty
 */
export const INITIAL_GATE_PASSES: GatePass[] = [
  {
    passId: 'GP-20261009-001',
    studentId: 'user-student-1',
    studentName: 'Aryan Bohidar',
    rollNumber: 'CSE001',
    department: 'Computer Science & Engineering',
    semester: '5th',
    reason: 'Medical appointment at City Health Clinic',
    destination: 'Bolangir',
    type: 'Normal',
    leavingDate: '2026-10-09',
    leavingTime: '02:00 PM',
    expectedReturnTime: '06:00 PM',
    expectedReturnTimestamp: new Date().setHours(18, 0, 0, 0),
    optionalNote: 'Prescription appointment with Dr. Dash.',
    status: 'APPROVED',
    approvedBy: 'user-warden-1',
    approvedByName: 'Ramesh Patil (Chief Warden)',
    approvedAt: '2026-10-09T10:15:00.000Z',
    qrToken: 'X7K92P8Q',
    createdAt: '2026-10-09T08:30:00.000Z',
    updatedAt: '2026-10-09T10:15:00.000Z',
  },
  {
    passId: 'GP-20261009-002',
    studentId: 'user-student-2',
    studentName: 'Priya Sharma',
    rollNumber: 'ECE2024045',
    department: 'Electronics & Communication',
    semester: '5th',
    reason: 'Family emergency / urgent home visit',
    destination: 'Cuttack',
    type: 'Emergency',
    leavingDate: '2026-10-09',
    leavingTime: '01:15 PM',
    expectedReturnTime: '04:00 PM',
    expectedReturnTimestamp: new Date().setHours(16, 0, 0, 0),
    status: 'EXITED',
    approvedBy: 'user-teacher-1',
    approvedByName: 'Dr. Rajesh Sharma (Faculty Advisor)',
    approvedAt: '2026-10-09T09:00:00.000Z',
    qrToken: 'M9W2Y4K1',
    exitTime: '01:15 PM',
    securityExitId: 'user-security-1',
    createdAt: '2026-10-09T07:45:00.000Z',
    updatedAt: '2026-10-09T13:15:00.000Z',
  },
];

/**
 * 1. Create a Gate Pass Request (Student)
 */
export async function createGatePass(params: {
  studentId: string;
  studentName: string;
  rollNumber: string;
  department: string;
  semester: string;
  reason: string;
  destination: string;
  type: GatePassType;
  leavingDate: string;
  leavingTime: string;
  expectedReturnTime: string;
  optionalNote?: string;
  supportingDocument?: string;
}): Promise<GatePass> {
  const passId = generatePassId();
  const now = new Date();

  // Calculate return timestamp for overdue detection
  let returnTimestamp = now.getTime() + 4 * 60 * 60 * 1000; // default 4 hrs
  try {
    if (params.expectedReturnTime && params.leavingDate) {
      const parsed = new Date(`${params.leavingDate} ${params.expectedReturnTime}`);
      if (!isNaN(parsed.getTime())) {
        returnTimestamp = parsed.getTime();
      }
    }
  } catch {
    // fallback
  }

  const newPass: GatePass = {
    passId,
    studentId: params.studentId,
    studentName: params.studentName,
    rollNumber: params.rollNumber,
    department: params.department,
    semester: params.semester,
    reason: params.reason,
    destination: params.destination,
    type: params.type,
    leavingDate: params.leavingDate,
    leavingTime: params.leavingTime,
    expectedReturnTime: params.expectedReturnTime,
    expectedReturnTimestamp: returnTimestamp,
    optionalNote: params.optionalNote || '',
    supportingDocument: params.supportingDocument || '',
    status: 'PENDING',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  const path = `${GATEPASS_COLLECTION}/${passId}`;

  // Update local cache
  const cached = getLocalCache<GatePass[]>(CACHE_GATEPASS_KEY, INITIAL_GATE_PASSES);
  setLocalCache(CACHE_GATEPASS_KEY, [newPass, ...cached]);

  try {
    const docRef = doc(db, GATEPASS_COLLECTION, passId);
    await setDoc(docRef, newPass);
    return newPass;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * 2. Approve Gate Pass (Faculty / Warden)
 */
export async function approveGatePass(params: {
  passId: string;
  approverId: string;
  approverName: string;
}): Promise<GatePass> {
  const { passId, approverId, approverName } = params;
  const qrToken = generateRandomQrToken();
  const now = new Date().toISOString();

  const updates = {
    status: 'APPROVED' as GatePassStatus,
    approvedBy: approverId,
    approvedByName: approverName,
    approvedAt: now,
    qrToken,
    updatedAt: now,
  };

  const path = `${GATEPASS_COLLECTION}/${passId}`;

  // Cache
  const cached = getLocalCache<GatePass[]>(CACHE_GATEPASS_KEY, INITIAL_GATE_PASSES);
  let updatedPass: GatePass | null = null;
  const nextCache = cached.map((p) => {
    if (p.passId === passId) {
      updatedPass = { ...p, ...updates };
      return updatedPass;
    }
    return p;
  });
  setLocalCache(CACHE_GATEPASS_KEY, nextCache);

  try {
    const docRef = doc(db, GATEPASS_COLLECTION, passId);
    await setDoc(docRef, updatedPass || updates, { merge: true });
    return updatedPass || ({ passId, ...updates } as GatePass);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

/**
 * 3. Reject Gate Pass (Faculty / Warden)
 */
export async function rejectGatePass(params: {
  passId: string;
  approverId: string;
  approverName: string;
  reason: string;
}): Promise<GatePass> {
  const { passId, approverId, approverName, reason } = params;
  const now = new Date().toISOString();

  const updates = {
    status: 'REJECTED' as GatePassStatus,
    approvedBy: approverId,
    approvedByName: approverName,
    approvedAt: now,
    rejectionReason: reason || 'Insufficient justification provided.',
    updatedAt: now,
  };

  const path = `${GATEPASS_COLLECTION}/${passId}`;

  // Cache
  const cached = getLocalCache<GatePass[]>(CACHE_GATEPASS_KEY, INITIAL_GATE_PASSES);
  let updatedPass: GatePass | null = null;
  const nextCache = cached.map((p) => {
    if (p.passId === passId) {
      updatedPass = { ...p, ...updates };
      return updatedPass;
    }
    return p;
  });
  setLocalCache(CACHE_GATEPASS_KEY, nextCache);

  try {
    const docRef = doc(db, GATEPASS_COLLECTION, passId);
    await setDoc(docRef, updatedPass || updates, { merge: true });
    return updatedPass || ({ passId, ...updates } as GatePass);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

/**
 * 4. Record Student Exit at Gate (Security Guard)
 */
export async function recordStudentExit(params: {
  passId: string;
  securityGuardId: string;
}): Promise<GatePass> {
  const { passId, securityGuardId } = params;
  const now = new Date();
  const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const nowIso = now.toISOString();

  const updates = {
    status: 'EXITED' as GatePassStatus,
    exitTime: timeFormatted,
    securityExitId: securityGuardId,
    updatedAt: nowIso,
  };

  const path = `${GATEPASS_COLLECTION}/${passId}`;

  // Cache
  const cached = getLocalCache<GatePass[]>(CACHE_GATEPASS_KEY, INITIAL_GATE_PASSES);
  let updatedPass: GatePass | null = null;
  const nextCache = cached.map((p) => {
    if (p.passId === passId) {
      updatedPass = { ...p, ...updates };
      return updatedPass;
    }
    return p;
  });
  setLocalCache(CACHE_GATEPASS_KEY, nextCache);

  try {
    const docRef = doc(db, GATEPASS_COLLECTION, passId);
    await setDoc(docRef, updatedPass || updates, { merge: true });
    return updatedPass || ({ passId, ...updates } as GatePass);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

/**
 * 5. Record Student Return at Gate (Security Guard)
 */
export async function recordStudentReturn(params: {
  passId: string;
  securityGuardId: string;
}): Promise<GatePass> {
  const { passId, securityGuardId } = params;
  const now = new Date();
  const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const nowIso = now.toISOString();

  const updates = {
    status: 'RETURNED' as GatePassStatus,
    entryTime: timeFormatted,
    securityEntryId: securityGuardId,
    updatedAt: nowIso,
  };

  const path = `${GATEPASS_COLLECTION}/${passId}`;

  // Cache
  const cached = getLocalCache<GatePass[]>(CACHE_GATEPASS_KEY, INITIAL_GATE_PASSES);
  let updatedPass: GatePass | null = null;
  const nextCache = cached.map((p) => {
    if (p.passId === passId) {
      updatedPass = { ...p, ...updates };
      return updatedPass;
    }
    return p;
  });
  setLocalCache(CACHE_GATEPASS_KEY, nextCache);

  try {
    const docRef = doc(db, GATEPASS_COLLECTION, passId);
    await setDoc(docRef, updatedPass || updates, { merge: true });
    return updatedPass || ({ passId, ...updates } as GatePass);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

/**
 * 6. Get a single Gate Pass by ID
 */
export async function getGatePass(passId: string): Promise<GatePass | null> {
  const path = `${GATEPASS_COLLECTION}/${passId}`;
  try {
    const docRef = doc(db, GATEPASS_COLLECTION, passId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as GatePass;
    }
  } catch (err) {
    console.warn('Could not fetch pass from Firestore, checking local cache:', err);
  }

  const cached = getLocalCache<GatePass[]>(CACHE_GATEPASS_KEY, INITIAL_GATE_PASSES);
  return cached.find((p) => p.passId === passId) || null;
}

/**
 * 7. Verification function for Security Guard scanning
 */
export interface GatePassVerificationResult {
  isValid: boolean;
  statusType: 'APPROVED' | 'EXITED' | 'INVALID' | 'EXPIRED' | 'OVERDUE' | 'ALREADY_RETURNED';
  pass: GatePass | null;
  message: string;
}

export async function verifyGatePassByScan(
  passId: string,
  qrToken: string
): Promise<GatePassVerificationResult> {
  const pass = await getGatePass(passId);

  if (!pass) {
    return {
      isValid: false,
      statusType: 'INVALID',
      pass: null,
      message: 'Gate Pass does not exist in university records.',
    };
  }

  if (pass.qrToken !== qrToken) {
    return {
      isValid: false,
      statusType: 'INVALID',
      pass,
      message: 'Security token mismatch! Invalid or counterfeit QR code.',
    };
  }

  if (pass.status === 'REJECTED') {
    return {
      isValid: false,
      statusType: 'INVALID',
      pass,
      message: `Pass was rejected by authority. Reason: ${pass.rejectionReason || 'Declined'}`,
    };
  }

  if (pass.status === 'CANCELLED' || pass.status === 'EXPIRED') {
    return {
      isValid: false,
      statusType: 'EXPIRED',
      pass,
      message: 'Gate Pass is no longer valid or has been cancelled.',
    };
  }

  if (pass.status === 'RETURNED') {
    return {
      isValid: false,
      statusType: 'ALREADY_RETURNED',
      pass,
      message: `Pass has already been completed. Student returned at ${pass.entryTime}.`,
    };
  }

  // If approved and not exited yet
  if (pass.status === 'APPROVED') {
    return {
      isValid: true,
      statusType: 'APPROVED',
      pass,
      message: 'Gate Pass Verified & Ready for Exit.',
    };
  }

  // If currently outside (exited) -> ready for return
  if (pass.status === 'EXITED' || pass.status === 'OVERDUE') {
    return {
      isValid: true,
      statusType: 'EXITED',
      pass,
      message: 'Student returning from leave. Ready for campus entry check-in.',
    };
  }

  return {
    isValid: false,
    statusType: 'INVALID',
    pass,
    message: `Pass status is currently ${pass.status}.`,
  };
}

/**
 * 8. Automatic Overdue Detection
 * Evaluates passes and identifies any students who missed their return window
 */
export function checkOverdueStatus(passes: GatePass[]): GatePass[] {
  const now = Date.now();

  return passes.map((pass) => {
    if (
      pass.status === 'EXITED' &&
      !pass.entryTime &&
      pass.expectedReturnTimestamp &&
      now > pass.expectedReturnTimestamp
    ) {
      return {
        ...pass,
        status: 'OVERDUE' as GatePassStatus,
      };
    }
    return pass;
  });
}

/**
 * 9. Subscriptions
 */
export function subscribeToAllGatePasses(
  callback: (passes: GatePass[]) => void
): () => void {
  const path = GATEPASS_COLLECTION;
  try {
    const q = query(collection(db, GATEPASS_COLLECTION));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => d.data() as GatePass);
          const withOverdue = checkOverdueStatus(list);
          setLocalCache(CACHE_GATEPASS_KEY, withOverdue);
          callback(withOverdue);
        } else {
          // If Firestore collection is empty, load and seed initial passes
          callback(INITIAL_GATE_PASSES);
        }
      },
      (err) => {
        console.warn('onSnapshot gatePasses error, using cached data:', err);
        const cached = getLocalCache<GatePass[]>(CACHE_GATEPASS_KEY, INITIAL_GATE_PASSES);
        callback(checkOverdueStatus(cached));
      }
    );
    return unsubscribe;
  } catch {
    const cached = getLocalCache<GatePass[]>(CACHE_GATEPASS_KEY, INITIAL_GATE_PASSES);
    callback(checkOverdueStatus(cached));
    return () => {};
  }
}
