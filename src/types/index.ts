export type UserRole = 'student' | 'teacher' | 'warden' | 'security' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  createdAt: string;
  department?: string;
  status?: 'active' | 'inactive';
}

export interface StudentProfile {
  userId: string;
  rollNumber: string;
  course: string;
  branch: string;
  year: string;
  semester: string;
  cgpa: number;
  hostelId: string;
  hostelName: string;
  roomNumber: string;
  bedNumber: string;
  emergencyContact: string;
  address: string;
  bloodGroup?: string;
  admissionYear?: string;
}

export interface Hostel {
  id: string;
  name: string;
  block: string;
  type: 'Boys' | 'Girls';
  wardenName: string;
  wardenPhone: string;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
}

export interface Room {
  id: string;
  hostelId: string;
  roomNumber: string;
  block: string;
  roomType: 'Single' | 'Double' | 'Triple';
  totalBeds: number;
  occupiedBeds: number;
  status: 'Active' | 'Maintenance' | 'Reserved';
  occupants?: { studentId: string; studentName: string; rollNumber: string }[];
}

export type TicketCategory =
  | 'Electrical'
  | 'Plumbing'
  | 'Cleaning'
  | 'Internet/WiFi'
  | 'Furniture'
  | 'Hostel Room'
  | 'Water'
  | 'Other';

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type TicketStatus =
  | 'Submitted'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Closed';

export interface TicketComment {
  id: string;
  authorName: string;
  authorRole: UserRole;
  text: string;
  timestamp: string;
}

export interface Ticket {
  id: string;
  userId: string;
  userName: string;
  userRole?: UserRole;
  category: TicketCategory;
  title: string;
  description: string;
  location: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo?: string;
  resolution?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  comments?: TicketComment[];
}

export interface MessMenu {
  id: string;
  dayOfWeek: string;
  breakfast: string;
  lunch: string;
  snacks: string;
  dinner: string;
  specialNotice?: string;
}

export type MealType = 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';

export interface MessFeedback {
  id: string;
  userId: string;
  userName: string;
  meal: MealType;
  rating: number;
  comment: string;
  date: string;
  reply?: string;
  replyBy?: string;
}

export type AnnouncementCategory =
  | 'College'
  | 'Hostel'
  | 'Academic'
  | 'Exam'
  | 'Emergency'
  | 'Events';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  authorName: string;
  authorRole: string;
  date: string;
  isImportant?: boolean;
  attachmentName?: string;
  attachmentUrl?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  subjectCode: string;
  subjectName: string;
  totalClasses: number;
  attendedClasses: number;
  facultyName: string;
  recentStatus?: 'Present' | 'Absent' | 'Late';
}

export type SessionStatus = 'ACTIVE' | 'EXPIRED' | 'CLOSED';

export interface AttendanceSession {
  sessionId: string;
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
  createdAt: string;
  expiresAt: string;
  expiresAtTimestamp: number;
  durationMinutes: number; // 2, 5, or 10
  status: SessionStatus;
  qrToken: string;
}

export interface AttendanceSessionRecord {
  recordId: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  subject: string;
  subjectCode?: string;
  date: string;
  time: string;
  timestamp: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  latitude: number;
  longitude: number;
  distanceFromCollege: number; // in meters
  locationVerified: boolean;
  qrVerified: boolean;
  accuracy?: number;
  deviceInfo?: string;
}

export interface AttendanceQrPayload {
  sessionId: string;
  subject: string;
  date: string;
  expiresAt: string;
  randomToken: string;
}

export interface CampusSettings {
  collegeName: string;
  collegeLatitude: number;
  collegeLongitude: number;
  allowedRadius: number; // in meters, default 150
  defaultQrDuration: number; // in minutes, default 5
  departments: string[];
  subjects: { code: string; name: string; department: string; semester: string }[];
  sections: string[];
  classPeriods: string[];
  updatedAt?: string;
}

export type GatePassType = 'Normal' | 'Emergency';

export type GatePassStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXITED'
  | 'RETURNED'
  | 'OVERDUE'
  | 'CANCELLED'
  | 'EXPIRED';

export interface GatePass {
  passId: string; // e.g. GP-20261009-001
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
  expectedReturnTimestamp?: number;
  optionalNote?: string;
  supportingDocument?: string;
  status: GatePassStatus;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  qrToken?: string;
  exitTime?: string;
  entryTime?: string;
  securityExitId?: string;
  securityEntryId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GatePassQrPayload {
  passId: string;
  qrToken: string;
  studentId?: string;
  studentName?: string;
  rollNumber?: string;
  destination?: string;
  expectedReturnTime?: string;
  type: 'GATE_PASS';
}

export interface MarkRecord {
  id: string;
  studentId: string;
  subjectCode: string;
  subjectName: string;
  internalMarks: number; // max 30
  assignmentMarks: number; // max 20
  examMarks: number; // max 50
  grade: string;
  credits: number;
}

export interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
  subject: string;
  faculty: string;
  room: string;
  branch: string;
  semester: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  subject: string;
  description: string;
  fileType: 'PDF' | 'PPT' | 'Notes' | 'Assignment' | 'Link';
  fileUrl: string;
  uploadedBy: string;
  uploadDate: string;
  fileSize?: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  academicYear: string;
  semester: string;
  tuitionFee: number;
  hostelFee: number;
  messFee: number;
  libraryFee: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  dueDate: string;
  status: 'Paid' | 'Partial' | 'Pending' | 'Overdue';
  transactions?: {
    id: string;
    amount: number;
    date: string;
    method: string;
    receiptNo: string;
  }[];
}

export interface StudentDocument {
  id: string;
  title: string;
  category: 'ID Card' | 'Bonafide Certificate' | 'Fee Receipt' | 'Marksheet' | 'Hostel Pass';
  issuedDate: string;
  fileUrl: string;
  status: 'Verified' | 'Pending' | 'Generated';
}

export interface HostelRequest {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  type: 'Room Change' | 'Night Out / Leave Pass' | 'Furniture Request' | 'Other';
  details: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestDate: string;
  responseNote?: string;
}

export interface VisitorEntry {
  id: string;
  studentName: string;
  roomNumber: string;
  visitorName: string;
  relation: string;
  checkInTime: string;
  checkOutTime?: string;
  contact: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'announcement' | 'ticket' | 'attendance' | 'material' | 'hostel' | 'mess' | 'fees' | 'general';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}
