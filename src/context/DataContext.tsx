import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Ticket,
  MessMenu,
  MessFeedback,
  Announcement,
  AttendanceRecord,
  MarkRecord,
  StudyMaterial,
  FeeRecord,
  StudentDocument,
  Hostel,
  Room,
  NotificationItem,
  HostelRequest,
  VisitorEntry,
  TimetableSlot,
} from '../types';
import {
  INITIAL_TICKETS,
  INITIAL_MESS_MENUS,
  INITIAL_MESS_FEEDBACKS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_ATTENDANCE,
  INITIAL_MARKS,
  INITIAL_STUDY_MATERIALS,
  INITIAL_FEES,
  INITIAL_DOCUMENTS,
  INITIAL_HOSTELS,
  INITIAL_ROOMS,
  INITIAL_NOTIFICATIONS,
  INITIAL_HOSTEL_REQUESTS,
  INITIAL_VISITORS,
  INITIAL_TIMETABLE,
} from '../data/initialData';
import { useAuth } from './AuthContext';

interface DataContextType {
  // Tickets
  tickets: Ticket[];
  createTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<Ticket>;
  updateTicketStatus: (ticketId: string, newStatus: Ticket['status'], resolutionNotes?: string) => void;
  assignTicket: (ticketId: string, assignedTo: string) => void;
  addTicketComment: (ticketId: string, text: string) => void;
  reopenTicket: (ticketId: string) => void;

  // Mess
  messMenus: MessMenu[];
  messFeedbacks: MessFeedback[];
  updateMessMenu: (menu: MessMenu) => void;
  submitMessFeedback: (feedback: Omit<MessFeedback, 'id' | 'date'>) => Promise<void>;
  replyToMessFeedback: (feedbackId: string, reply: string) => void;

  // Announcements
  announcements: Announcement[];
  createAnnouncement: (announcement: Omit<Announcement, 'id' | 'date'>) => Promise<Announcement>;
  deleteAnnouncement: (id: string) => void;

  // Attendance
  attendance: AttendanceRecord[];
  markAttendance: (studentId: string, subjectCode: string, status: 'Present' | 'Absent' | 'Late') => void;
  markBatchAttendance: (subjectCode: string, records: { studentId: string; status: 'Present' | 'Absent' | 'Late' }[]) => void;

  // Marks
  marks: MarkRecord[];
  updateStudentMarks: (recordId: string, marksData: Partial<MarkRecord>) => void;
  addStudentMarks: (mark: Omit<MarkRecord, 'id'>) => void;

  // Study Materials
  studyMaterials: StudyMaterial[];
  uploadStudyMaterial: (material: Omit<StudyMaterial, 'id' | 'uploadDate'>) => Promise<StudyMaterial>;
  deleteStudyMaterial: (id: string) => void;

  // Hostels & Rooms
  hostels: Hostel[];
  rooms: Room[];
  addRoom: (room: Omit<Room, 'id'>) => void;
  updateRoomStatus: (roomId: string, status: Room['status']) => void;
  allocateStudentToRoom: (roomId: string, student: { studentId: string; studentName: string; rollNumber: string }) => boolean;
  transferStudentRoom: (fromRoomId: string, toRoomId: string, studentId: string) => boolean;
  hostelRequests: HostelRequest[];
  submitHostelRequest: (req: Omit<HostelRequest, 'id' | 'requestDate' | 'status'>) => void;
  updateHostelRequestStatus: (requestId: string, status: 'Approved' | 'Rejected', note?: string) => void;

  // Fees
  fees: FeeRecord[];
  payFee: (studentId: string, amount: number, paymentMethod: string) => Promise<{ success: boolean; receiptNo: string }>;

  // Documents
  documents: StudentDocument[];
  requestBonafideCertificate: (purpose: string) => void;

  // Timetable
  timetable: TimetableSlot[];

  // Visitors
  visitors: VisitorEntry[];
  addVisitor: (entry: Omit<VisitorEntry, 'id'>) => void;
  checkoutVisitor: (visitorId: string) => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) => void;
  unreadNotificationCount: number;

  // Global reset
  resetToDemoData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  // Helper for localStorage initialized state
  const usePersistentState = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [state, setState] = useState<T>(() => {
      try {
        const item = localStorage.getItem(`cme_${key}`);
        return item ? JSON.parse(item) : initialValue;
      } catch {
        return initialValue;
      }
    });

    useEffect(() => {
      localStorage.setItem(`cme_${key}`, JSON.stringify(state));
    }, [key, state]);

    return [state, setState];
  };

  const [tickets, setTickets] = usePersistentState<Ticket[]>('tickets', INITIAL_TICKETS);
  const [messMenus, setMessMenus] = usePersistentState<MessMenu[]>('messMenus', INITIAL_MESS_MENUS);
  const [messFeedbacks, setMessFeedbacks] = usePersistentState<MessFeedback[]>('messFeedbacks', INITIAL_MESS_FEEDBACKS);
  const [announcements, setAnnouncements] = usePersistentState<Announcement[]>('announcements', INITIAL_ANNOUNCEMENTS);
  const [attendance, setAttendance] = usePersistentState<AttendanceRecord[]>('attendance', INITIAL_ATTENDANCE);
  const [marks, setMarks] = usePersistentState<MarkRecord[]>('marks', INITIAL_MARKS);
  const [studyMaterials, setStudyMaterials] = usePersistentState<StudyMaterial[]>('materials', INITIAL_STUDY_MATERIALS);
  const [fees, setFees] = usePersistentState<FeeRecord[]>('fees', INITIAL_FEES);
  const [documents, setDocuments] = usePersistentState<StudentDocument[]>('documents', INITIAL_DOCUMENTS);
  const [hostels, setHostels] = usePersistentState<Hostel[]>('hostels', INITIAL_HOSTELS);
  const [rooms, setRooms] = usePersistentState<Room[]>('rooms', INITIAL_ROOMS);
  const [notifications, setNotifications] = usePersistentState<NotificationItem[]>('notifications', INITIAL_NOTIFICATIONS);
  const [hostelRequests, setHostelRequests] = usePersistentState<HostelRequest[]>('hostelRequests', INITIAL_HOSTEL_REQUESTS);
  const [visitors, setVisitors] = usePersistentState<VisitorEntry[]>('visitors', INITIAL_VISITORS);
  const [timetable, setTimetable] = usePersistentState<TimetableSlot[]>('timetable', INITIAL_TIMETABLE);

  // Unread notifications for current user
  const unreadNotificationCount = notifications.filter(
    (n) => !n.isRead && (n.userId === currentUser?.id || n.userId === 'all')
  ).length;

  const addNotification = (notif: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Ticket actions
  const createTicket = async (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Ticket> => {
    const newId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    const newTicket: Ticket = {
      ...ticketData,
      id: newId,
      status: 'Submitted',
      createdAt: now,
      updatedAt: now,
      comments: [
        {
          id: `c-${Date.now()}`,
          authorName: ticketData.userName,
          authorRole: ticketData.userRole || 'student',
          text: `Ticket raised: ${ticketData.title}`,
          timestamp: now,
        },
      ],
    };

    setTickets((prev) => [newTicket, ...prev]);

    // Send notification
    addNotification({
      userId: ticketData.userId,
      title: 'Ticket Submitted',
      message: `Your complaint #${newId} (${ticketData.category}) has been lodged successfully.`,
      type: 'ticket',
      actionUrl: 'maintenance',
    });

    return newTicket;
  };

  const updateTicketStatus = (ticketId: string, newStatus: Ticket['status'], resolutionNotes?: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const now = new Date().toISOString();
          const newComments = [...(t.comments || [])];
          newComments.push({
            id: `c-${Date.now()}`,
            authorName: currentUser?.name || 'Administrator',
            authorRole: currentUser?.role || 'admin',
            text: `Status updated to ${newStatus}${resolutionNotes ? `: ${resolutionNotes}` : ''}`,
            timestamp: now,
          });

          // Trigger notification to ticket owner
          addNotification({
            userId: t.userId,
            title: `Ticket #${t.id} Update`,
            message: `Status changed to "${newStatus}".`,
            type: 'ticket',
            actionUrl: 'maintenance',
          });

          return {
            ...t,
            status: newStatus,
            resolution: resolutionNotes || t.resolution,
            updatedAt: now,
            comments: newComments,
          };
        }
        return t;
      })
    );
  };

  const assignTicket = (ticketId: string, assignedTo: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const now = new Date().toISOString();
          const newComments = [...(t.comments || [])];
          newComments.push({
            id: `c-${Date.now()}`,
            authorName: currentUser?.name || 'Warden',
            authorRole: currentUser?.role || 'warden',
            text: `Assigned ticket to technician/staff: ${assignedTo}`,
            timestamp: now,
          });

          addNotification({
            userId: t.userId,
            title: `Staff Assigned: Ticket #${t.id}`,
            message: `Assigned to ${assignedTo}. Work will commence shortly.`,
            type: 'ticket',
            actionUrl: 'maintenance',
          });

          return {
            ...t,
            assignedTo,
            status: t.status === 'Submitted' ? 'Assigned' : t.status,
            updatedAt: now,
            comments: newComments,
          };
        }
        return t;
      })
    );
  };

  const addTicketComment = (ticketId: string, text: string) => {
    if (!text.trim()) return;
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const newComment = {
            id: `c-${Date.now()}`,
            authorName: currentUser?.name || 'Campus Member',
            authorRole: currentUser?.role || 'student',
            text: text.trim(),
            timestamp: new Date().toISOString(),
          };
          return {
            ...t,
            comments: [...(t.comments || []), newComment],
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );
  };

  const reopenTicket = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const now = new Date().toISOString();
          const newComments = [...(t.comments || [])];
          newComments.push({
            id: `c-${Date.now()}`,
            authorName: currentUser?.name || 'Student',
            authorRole: 'student',
            text: 'Ticket reopened by student because the issue persists.',
            timestamp: now,
          });

          return {
            ...t,
            status: 'In Progress',
            updatedAt: now,
            comments: newComments,
          };
        }
        return t;
      })
    );
  };

  // Mess methods
  const updateMessMenu = (menu: MessMenu) => {
    setMessMenus((prev) => prev.map((m) => (m.id === menu.id ? menu : m)));
    addNotification({
      userId: 'all',
      title: 'Mess Menu Updated',
      message: `Weekly menu updated for ${menu.dayOfWeek}.`,
      type: 'mess',
      actionUrl: 'mess',
    });
  };

  const submitMessFeedback = async (feedbackData: Omit<MessFeedback, 'id' | 'date'>) => {
    const newFeedback: MessFeedback = {
      ...feedbackData,
      id: `fb-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setMessFeedbacks((prev) => [newFeedback, ...prev]);

    addNotification({
      userId: feedbackData.userId,
      title: 'Mess Feedback Recorded',
      message: `Thank you for rating today's ${feedbackData.meal}!`,
      type: 'mess',
      actionUrl: 'mess',
    });
  };

  const replyToMessFeedback = (feedbackId: string, reply: string) => {
    setMessFeedbacks((prev) =>
      prev.map((fb) => {
        if (fb.id === feedbackId) {
          addNotification({
            userId: fb.userId,
            title: 'Warden replied to your Mess Feedback',
            message: `Response: "${reply}"`,
            type: 'mess',
            actionUrl: 'mess',
          });
          return {
            ...fb,
            reply,
            replyBy: currentUser?.name || 'Warden',
          };
        }
        return fb;
      })
    );
  };

  // Announcements
  const createAnnouncement = async (announcementData: Omit<Announcement, 'id' | 'date'>): Promise<Announcement> => {
    const newAnnouncement: Announcement = {
      ...announcementData,
      id: `ann-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setAnnouncements((prev) => [newAnnouncement, ...prev]);

    // Send broadcast notification
    addNotification({
      userId: 'all',
      title: `Notice: ${newAnnouncement.title}`,
      message: `${newAnnouncement.category} announcement posted by ${newAnnouncement.authorName}`,
      type: 'announcement',
      actionUrl: 'announcements',
    });

    return newAnnouncement;
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  // Attendance
  const markAttendance = (studentId: string, subjectCode: string, status: 'Present' | 'Absent' | 'Late') => {
    setAttendance((prev) =>
      prev.map((att) => {
        if (att.studentId === studentId && att.subjectCode === subjectCode) {
          const isPresent = status === 'Present' || status === 'Late';
          return {
            ...att,
            totalClasses: att.totalClasses + 1,
            attendedClasses: isPresent ? att.attendedClasses + 1 : att.attendedClasses,
            recentStatus: status,
          };
        }
        return att;
      })
    );
  };

  const markBatchAttendance = (
    subjectCode: string,
    records: { studentId: string; status: 'Present' | 'Absent' | 'Late' }[]
  ) => {
    records.forEach((r) => markAttendance(r.studentId, subjectCode, r.status));
  };

  // Marks
  const updateStudentMarks = (recordId: string, marksData: Partial<MarkRecord>) => {
    setMarks((prev) =>
      prev.map((m) => {
        if (m.id === recordId) {
          const updated = { ...m, ...marksData };
          const total = (updated.internalMarks || 0) + (updated.assignmentMarks || 0) + (updated.examMarks || 0);
          let grade = 'B';
          if (total >= 90) grade = 'O (Outstanding)';
          else if (total >= 80) grade = 'A+';
          else if (total >= 70) grade = 'A';
          else if (total >= 60) grade = 'B+';
          else if (total >= 50) grade = 'B';
          else grade = 'C';
          updated.grade = grade;
          return updated;
        }
        return m;
      })
    );
  };

  const addStudentMarks = (markData: Omit<MarkRecord, 'id'>) => {
    const newMark: MarkRecord = {
      ...markData,
      id: `mk-${Date.now()}`,
    };
    setMarks((prev) => [...prev, newMark]);
  };

  // Study Materials
  const uploadStudyMaterial = async (
    materialData: Omit<StudyMaterial, 'id' | 'uploadDate'>
  ): Promise<StudyMaterial> => {
    const newMaterial: StudyMaterial = {
      ...materialData,
      id: `mat-${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0],
      fileSize: materialData.fileSize || '2.5 MB',
    };
    setStudyMaterials((prev) => [newMaterial, ...prev]);

    addNotification({
      userId: 'all',
      title: 'New Study Material Available',
      message: `${newMaterial.title} (${newMaterial.subject}) has been uploaded.`,
      type: 'material',
      actionUrl: 'materials',
    });

    return newMaterial;
  };

  const deleteStudyMaterial = (id: string) => {
    setStudyMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  // Hostels & Rooms
  const addRoom = (roomData: Omit<Room, 'id'>) => {
    const newRoom: Room = {
      ...roomData,
      id: `room-${Date.now()}`,
    };
    setRooms((prev) => [...prev, newRoom]);
  };

  const updateRoomStatus = (roomId: string, status: Room['status']) => {
    setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, status } : r)));
  };

  const allocateStudentToRoom = (
    roomId: string,
    student: { studentId: string; studentName: string; rollNumber: string }
  ): boolean => {
    let success = false;
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          if (r.occupiedBeds >= r.totalBeds) return r;
          const occupants = r.occupants || [];
          if (occupants.some((o) => o.studentId === student.studentId)) return r;
          success = true;
          return {
            ...r,
            occupiedBeds: r.occupiedBeds + 1,
            occupants: [...occupants, student],
          };
        }
        return r;
      })
    );
    return success;
  };

  const transferStudentRoom = (fromRoomId: string, toRoomId: string, studentId: string): boolean => {
    const targetRoom = rooms.find((r) => r.id === toRoomId);
    if (!targetRoom || targetRoom.occupiedBeds >= targetRoom.totalBeds) return false;

    let movedStudent: { studentId: string; studentName: string; rollNumber: string } | undefined;

    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === fromRoomId) {
          const found = r.occupants?.find((o) => o.studentId === studentId);
          if (found) movedStudent = found;
          return {
            ...r,
            occupiedBeds: Math.max(0, r.occupiedBeds - 1),
            occupants: r.occupants?.filter((o) => o.studentId !== studentId) || [],
          };
        }
        return r;
      })
    );

    if (movedStudent) {
      allocateStudentToRoom(toRoomId, movedStudent);
      return true;
    }
    return false;
  };

  const submitHostelRequest = (req: Omit<HostelRequest, 'id' | 'requestDate' | 'status'>) => {
    const newReq: HostelRequest = {
      ...req,
      id: `hr-${Date.now()}`,
      requestDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
    };
    setHostelRequests((prev) => [newReq, ...prev]);

    addNotification({
      userId: req.studentId,
      title: 'Hostel Request Submitted',
      message: `Your request for ${req.type} has been sent to the warden.`,
      type: 'hostel',
      actionUrl: 'hostel',
    });
  };

  const updateHostelRequestStatus = (requestId: string, status: 'Approved' | 'Rejected', note?: string) => {
    setHostelRequests((prev) =>
      prev.map((hr) => {
        if (hr.id === requestId) {
          addNotification({
            userId: hr.studentId,
            title: `Hostel Request ${status}`,
            message: `Your request for ${hr.type} was ${status.toLowerCase()}.${note ? ` Note: ${note}` : ''}`,
            type: 'hostel',
            actionUrl: 'hostel',
          });
          return {
            ...hr,
            status,
            responseNote: note,
          };
        }
        return hr;
      })
    );
  };

  // Fees
  const payFee = async (
    studentId: string,
    amount: number,
    paymentMethod: string
  ): Promise<{ success: boolean; receiptNo: string }> => {
    const receiptNo = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    setFees((prev) =>
      prev.map((f) => {
        if (f.studentId === studentId) {
          const newPaid = f.paidAmount + amount;
          const newPending = Math.max(0, f.totalAmount - newPaid);
          const newStatus = newPending === 0 ? 'Paid' : 'Partial';
          const newTx = {
            id: `tx-${Date.now()}`,
            amount,
            date: new Date().toISOString().split('T')[0],
            method: paymentMethod,
            receiptNo,
          };
          return {
            ...f,
            paidAmount: newPaid,
            pendingAmount: newPending,
            status: newStatus,
            transactions: [newTx, ...(f.transactions || [])],
          };
        }
        return f;
      })
    );

    // Add generated fee receipt to documents
    const newDoc: StudentDocument = {
      id: `doc-${Date.now()}`,
      title: `Fee Receipt #${receiptNo} - ₹${amount.toLocaleString()}`,
      category: 'Fee Receipt',
      issuedDate: new Date().toISOString().split('T')[0],
      fileUrl: '#',
      status: 'Verified',
    };
    setDocuments((prev) => [newDoc, ...prev]);

    addNotification({
      userId: studentId,
      title: 'Fee Payment Successful',
      message: `Payment of ₹${amount.toLocaleString()} confirmed. Receipt #${receiptNo} generated.`,
      type: 'fees',
      actionUrl: 'fees',
    });

    return { success: true, receiptNo };
  };

  // Documents
  const requestBonafideCertificate = (purpose: string) => {
    const newDoc: StudentDocument = {
      id: `doc-${Date.now()}`,
      title: `Bonafide Certificate (${purpose})`,
      category: 'Bonafide Certificate',
      issuedDate: new Date().toISOString().split('T')[0],
      fileUrl: '#',
      status: 'Generated',
    };
    setDocuments((prev) => [newDoc, ...prev]);

    if (currentUser) {
      addNotification({
        userId: currentUser.id,
        title: 'Bonafide Certificate Ready',
        message: `Your requested Bonafide Certificate (${purpose}) has been generated and is ready for download.`,
        type: 'general',
        actionUrl: 'documents',
      });
    }
  };

  // Visitors
  const addVisitor = (entry: Omit<VisitorEntry, 'id'>) => {
    const newEntry: VisitorEntry = {
      ...entry,
      id: `vis-${Date.now()}`,
    };
    setVisitors((prev) => [newEntry, ...prev]);
  };

  const checkoutVisitor = (visitorId: string) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setVisitors((prev) =>
      prev.map((v) => (v.id === visitorId ? { ...v, checkOutTime: `${timeNow}` } : v))
    );
  };

  const resetToDemoData = () => {
    setTickets(INITIAL_TICKETS);
    setMessMenus(INITIAL_MESS_MENUS);
    setMessFeedbacks(INITIAL_MESS_FEEDBACKS);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setAttendance(INITIAL_ATTENDANCE);
    setMarks(INITIAL_MARKS);
    setStudyMaterials(INITIAL_STUDY_MATERIALS);
    setFees(INITIAL_FEES);
    setDocuments(INITIAL_DOCUMENTS);
    setHostels(INITIAL_HOSTELS);
    setRooms(INITIAL_ROOMS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setHostelRequests(INITIAL_HOSTEL_REQUESTS);
    setVisitors(INITIAL_VISITORS);
    setTimetable(INITIAL_TIMETABLE);
  };

  return (
    <DataContext.Provider
      value={{
        tickets,
        createTicket,
        updateTicketStatus,
        assignTicket,
        addTicketComment,
        reopenTicket,
        messMenus,
        messFeedbacks,
        updateMessMenu,
        submitMessFeedback,
        replyToMessFeedback,
        announcements,
        createAnnouncement,
        deleteAnnouncement,
        attendance,
        markAttendance,
        markBatchAttendance,
        marks,
        updateStudentMarks,
        addStudentMarks,
        studyMaterials,
        uploadStudyMaterial,
        deleteStudyMaterial,
        hostels,
        rooms,
        addRoom,
        updateRoomStatus,
        allocateStudentToRoom,
        transferStudentRoom,
        hostelRequests,
        submitHostelRequest,
        updateHostelRequestStatus,
        fees,
        payFee,
        documents,
        requestBonafideCertificate,
        timetable,
        visitors,
        addVisitor,
        checkoutVisitor,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        addNotification,
        unreadNotificationCount,
        resetToDemoData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
