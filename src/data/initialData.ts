import {
  User,
  StudentProfile,
  Hostel,
  Room,
  Ticket,
  MessMenu,
  MessFeedback,
  Announcement,
  AttendanceRecord,
  MarkRecord,
  TimetableSlot,
  StudyMaterial,
  FeeRecord,
  StudentDocument,
  NotificationItem,
  HostelRequest,
  VisitorEntry,
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-student-1',
    email: 'aryanbohidar001@gmail.com',
    name: 'Aryan Bohidar',
    role: 'student',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2024-08-01',
    department: 'Computer Science & Engineering',
    status: 'active',
  },
  {
    id: 'user-teacher-1',
    email: 'rajesh.sharma@campus.edu',
    name: 'Dr. Rajesh Sharma',
    role: 'teacher',
    phone: '+91 98234 56789',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2022-06-15',
    department: 'Computer Science & Engineering',
    status: 'active',
  },
  {
    id: 'user-warden-1',
    email: 'ramesh.patil@campus.edu',
    name: 'Ramesh Patil',
    role: 'warden',
    phone: '+91 94123 98765',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2021-04-10',
    department: 'Hostel Administration',
    status: 'active',
  },
  {
    id: 'user-admin-1',
    email: 'admin@campus.edu',
    name: 'Dr. Arvind Mehra (Admin)',
    role: 'admin',
    phone: '+91 99000 11223',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2020-01-01',
    department: 'Central Administration',
    status: 'active',
  },
  {
    id: 'user-security-1',
    email: 'security@campus.edu',
    name: 'Balwant Singh (Main Gate Security)',
    role: 'security',
    phone: '+91 99887 76655',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2023-01-01',
    department: 'Campus Main Gate Security',
    status: 'active',
  },
  {
    id: 'user-student-2',
    email: 'priya.sharma@campus.edu',
    name: 'Priya Sharma',
    role: 'student',
    phone: '+91 98111 22334',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    createdAt: '2024-08-01',
    department: 'Electronics & Communication',
    status: 'active',
  },
  {
    id: 'user-teacher-2',
    email: 'ananya.sen@campus.edu',
    name: 'Prof. Ananya Sen',
    role: 'teacher',
    phone: '+91 98333 44556',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2023-01-10',
    department: 'Computer Science & Engineering',
    status: 'active',
  }
];

export const INITIAL_STUDENT_PROFILES: Record<string, StudentProfile> = {
  'user-student-1': {
    userId: 'user-student-1',
    rollNumber: 'CSE001',
    course: 'B.Tech CSE',
    branch: 'Computer Science & Engineering',
    year: '3rd Year',
    semester: '5th Semester',
    cgpa: 8.78,
    hostelId: 'hostel-1',
    hostelName: 'Aryabhatta Boys Hostel',
    roomNumber: 'B-304',
    bedNumber: 'Bed 2',
    emergencyContact: 'Sunil Bohidar (Father) - +91 94370 12345',
    address: 'Plot 42, Vani Vihar, Bhubaneswar, Odisha - 751004',
    bloodGroup: 'O+',
    admissionYear: '2024',
  },
  'user-student-2': {
    userId: 'user-student-2',
    rollNumber: 'ECE2024045',
    course: 'B.Tech ECE',
    branch: 'Electronics & Communication',
    year: '3rd Year',
    semester: '5th Semester',
    cgpa: 9.12,
    hostelId: 'hostel-2',
    hostelName: 'Gargi Girls Hostel',
    roomNumber: 'G-201',
    bedNumber: 'Bed 1',
    emergencyContact: 'Rakesh Sharma - +91 98111 99887',
    address: 'Flat 12B, Green Enclave, New Delhi - 110016',
    bloodGroup: 'B+',
    admissionYear: '2022',
  }
};

export const INITIAL_HOSTELS: Hostel[] = [
  {
    id: 'hostel-1',
    name: 'Aryabhatta Boys Hostel',
    block: 'Block B',
    type: 'Boys',
    wardenName: 'Ramesh Patil',
    wardenPhone: '+91 94123 98765',
    totalRooms: 120,
    totalBeds: 240,
    occupiedBeds: 216,
  },
  {
    id: 'hostel-2',
    name: 'Gargi Girls Hostel',
    block: 'Block G',
    type: 'Girls',
    wardenName: 'Dr. Sunita Deshmukh',
    wardenPhone: '+91 94123 54321',
    totalRooms: 100,
    totalBeds: 200,
    occupiedBeds: 184,
  },
  {
    id: 'hostel-3',
    name: 'Ramanujan Junior Hostel',
    block: 'Block R',
    type: 'Boys',
    wardenName: 'Suresh Verma',
    wardenPhone: '+91 94222 11334',
    totalRooms: 80,
    totalBeds: 160,
    occupiedBeds: 140,
  }
];

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-b304',
    hostelId: 'hostel-1',
    roomNumber: 'B-304',
    block: 'Block B',
    roomType: 'Double',
    totalBeds: 2,
    occupiedBeds: 2,
    status: 'Active',
    occupants: [
      { studentId: 'user-student-1', studentName: 'Aman Sahu', rollNumber: 'CSE2024089' },
      { studentId: 'user-student-3', studentName: 'Rohan Gupta', rollNumber: 'CSE2024092' }
    ]
  },
  {
    id: 'room-b305',
    hostelId: 'hostel-1',
    roomNumber: 'B-305',
    block: 'Block B',
    roomType: 'Double',
    totalBeds: 2,
    occupiedBeds: 1,
    status: 'Active',
    occupants: [
      { studentId: 'user-student-4', studentName: 'Vikram Singh', rollNumber: 'CSE2024104' }
    ]
  },
  {
    id: 'room-b306',
    hostelId: 'hostel-1',
    roomNumber: 'B-306',
    block: 'Block B',
    roomType: 'Triple',
    totalBeds: 3,
    occupiedBeds: 0,
    status: 'Maintenance',
  },
  {
    id: 'room-g201',
    hostelId: 'hostel-2',
    roomNumber: 'G-201',
    block: 'Block G',
    roomType: 'Double',
    totalBeds: 2,
    occupiedBeds: 2,
    status: 'Active',
    occupants: [
      { studentId: 'user-student-2', studentName: 'Priya Sharma', rollNumber: 'ECE2024045' }
    ]
  },
  {
    id: 'room-g202',
    hostelId: 'hostel-2',
    roomNumber: 'G-202',
    block: 'Block G',
    roomType: 'Single',
    totalBeds: 1,
    occupiedBeds: 0,
    status: 'Active',
  }
];

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'TKT-1082',
    userId: 'user-student-1',
    userName: 'Aman Sahu',
    userRole: 'student',
    category: 'Electrical',
    title: 'Ceiling fan regulator sparking and not switching off',
    description: 'The fan speed regulator on switchboard 2 in room B-304 is producing sparks whenever toggled and stuck at full speed.',
    location: 'Aryabhatta Hostel, Room B-304',
    priority: 'High',
    status: 'In Progress',
    assignedTo: 'Mahesh (Electrician Team)',
    createdAt: '2026-09-22T10:30:00Z',
    updatedAt: '2026-09-23T14:15:00Z',
    comments: [
      {
        id: 'c1',
        authorName: 'Ramesh Patil (Warden)',
        authorRole: 'warden',
        text: 'Electrician Mahesh assigned. Inspection scheduled for today.',
        timestamp: '2026-09-22T11:20:00Z'
      }
    ]
  },
  {
    id: 'TKT-1079',
    userId: 'user-student-1',
    userName: 'Aman Sahu',
    userRole: 'student',
    category: 'Internet/WiFi',
    title: 'WiFi Access Point dropping connection intermittently on 3rd floor',
    description: 'Signal from AP_B3_West drops every 10-15 minutes, ping spikes to 800ms during evening study hours.',
    location: 'Block B, 3rd Floor Corridor',
    priority: 'Medium',
    status: 'Assigned',
    assignedTo: 'IT Network Helpdesk',
    createdAt: '2026-09-20T16:00:00Z',
    updatedAt: '2026-09-21T09:00:00Z',
  },
  {
    id: 'TKT-1065',
    userId: 'user-student-1',
    userName: 'Aman Sahu',
    userRole: 'student',
    category: 'Plumbing',
    title: 'Washroom basin tap dripping continuously',
    description: 'Basin tap 2 in 3rd floor west washroom has a loose washer and leaks water throughout the night.',
    location: 'Block B, Washroom 3W',
    priority: 'Low',
    status: 'Resolved',
    assignedTo: 'Sanjay (Plumber)',
    resolution: 'Washer replaced and valve tightened on 2026-09-19.',
    createdAt: '2026-09-18T08:45:00Z',
    updatedAt: '2026-09-19T17:30:00Z',
  },
  {
    id: 'TKT-1088',
    userId: 'user-student-2',
    userName: 'Priya Sharma',
    userRole: 'student',
    category: 'Water',
    title: 'Water cooler on 2nd floor not cooling water',
    description: 'The drinking water cooler near stairwell G2 is dispensing warm water since yesterday.',
    location: 'Gargi Hostel, 2nd Floor',
    priority: 'High',
    status: 'Submitted',
    createdAt: '2026-09-23T18:10:00Z',
    updatedAt: '2026-09-23T18:10:00Z',
  }
];

export const INITIAL_MESS_MENUS: MessMenu[] = [
  {
    id: 'menu-mon',
    dayOfWeek: 'Monday',
    breakfast: 'Idli, Sambar, Coconut Chutney, Boiled Eggs / Banana, Tea / Coffee',
    lunch: 'Paneer Butter Masala, Dal Tadka, Jeera Rice, Chapati, Fresh Green Salad, Curd',
    snacks: 'Veg Cutlet, Mint Chutney, Masala Chai',
    dinner: 'Aloo Gobi, Rajma Masala, Steamed Rice, Tandoori Roti, Gulab Jamun (1 pc)',
  },
  {
    id: 'menu-tue',
    dayOfWeek: 'Tuesday',
    breakfast: 'Poha with Peanuts, Sprouts Salad, Bread Butter Jam, Tea / Coffee',
    lunch: 'Bhindi Do Pyaza, Chana Dal Fry, Plain Rice, Phulka, Boondi Raita, Pickle',
    snacks: 'Samosa (1 pc) with Tamarind Chutney, Tea',
    dinner: 'Egg Curry / Mushroom Masala, Dal Makhani, Steamed Rice, Butter Naan, Kheer',
  },
  {
    id: 'menu-wed',
    dayOfWeek: 'Wednesday',
    breakfast: 'Masala Dosa, Tomato Chutney, Sambar, Milk / Tea',
    lunch: 'Kadhai Paneer, Yellow Dal, Veg Pulao, Chapati, Roasted Papad, Curd',
    snacks: 'Bread Pakora, Green Chutney, Hot Coffee',
    dinner: 'Chicken Curry / Shahi Paneer, Dal Palak, Steamed Rice, Roti, Ice Cream',
    specialNotice: 'Special Feast Dinner on Wednesday evening!'
  },
  {
    id: 'menu-thu',
    dayOfWeek: 'Thursday',
    breakfast: 'Aloo Paratha (2 pcs), Curd, Mixed Pickle, Tea / Coffee',
    lunch: 'Mixed Veg Curry, Moong Dal Fry, Steamed Rice, Tawa Roti, Cucumber Salad',
    snacks: 'Bhel Puri with Sev, Nimbu Pani / Tea',
    dinner: 'Soya Chaap Gravy, Dal Tadka, Jeera Rice, Chapati, Fruit Custard',
  },
  {
    id: 'menu-fri',
    dayOfWeek: 'Friday',
    breakfast: 'Uttapam, Sambar, Coconut & Tomato Chutney, Tea / Coffee',
    lunch: 'Chole Bhature / Chole Rice, Boondi Raita, Onion Salad, Fried Chilli',
    snacks: 'Pasta (Red Sauce), Tea / Coffee',
    dinner: 'Fish Curry / Malai Kofta, Dal Fry, Rice, Chapati, Rasgulla (1 pc)',
  },
  {
    id: 'menu-sat',
    dayOfWeek: 'Saturday',
    breakfast: 'Medu Vada, Sambar, Coconut Chutney, Fruits, Tea / Coffee',
    lunch: 'Dum Aloo Kashmiri, Gujarati Kadi, Khichdi / Steamed Rice, Phulka, Papad',
    snacks: 'Sweet Corn Chaat, Masala Chai',
    dinner: 'Paneer Tikka Masala, Dal Makhani, Veg Biryani, Raita, Jalebi',
  },
  {
    id: 'menu-sun',
    dayOfWeek: 'Sunday',
    breakfast: 'Puri Sabzi, Halwa, Boiled Egg / Fruit, Tea / Coffee',
    lunch: 'Special Chicken Biryani / Veg Hyderabadi Dum Biryani, Mirchi Ka Salan, Raita, Gulab Jamun',
    snacks: 'Biscuits, Tea / Filter Coffee',
    dinner: 'Light Khichdi / Paneer Bhurji, Dal Tadka, Steamed Rice, Phulka, Seasonal Fruit',
    specialNotice: 'Sunday Biryani Feast from 12:30 PM - 2:30 PM'
  }
];

export const INITIAL_MESS_FEEDBACKS: MessFeedback[] = [
  {
    id: 'fb-1',
    userId: 'user-student-1',
    userName: 'Aman Sahu',
    meal: 'Lunch',
    rating: 4,
    comment: 'Paneer butter masala was very delicious today. Rotis were warm and soft. Great improvement!',
    date: '2026-09-23',
    reply: 'Thank you Aman! The mess committee has updated the paneer vendor this week.',
    replyBy: 'Ramesh Patil (Mess Committee Head)',
  },
  {
    id: 'fb-2',
    userId: 'user-student-1',
    userName: 'Aman Sahu',
    meal: 'Breakfast',
    rating: 3,
    comment: 'Idlis were soft but Sambar ran out before 9:15 AM. Please ensure adequate replenishment during peak breakfast rush.',
    date: '2026-09-22',
    reply: 'Noted. Instructions issued to prepare extra batch between 9:00 - 9:30 AM.',
    replyBy: 'Chief Caterer',
  },
  {
    id: 'fb-3',
    userId: 'user-student-2',
    userName: 'Priya Sharma',
    meal: 'Dinner',
    rating: 5,
    comment: 'The chicken curry and mushroom masala on Wednesday were top notch!',
    date: '2026-09-21',
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Mid-Semester Examinations Schedule - Autumn 2026',
    content: 'Mid-semester examinations for all B.Tech and M.Tech 3rd and 5th semester students will commence from October 12, 2026. Hall tickets and seating charts will be released on the portal next week.',
    category: 'Exam',
    authorName: 'Dr. Arvind Mehra',
    authorRole: 'Dean of Academic Affairs',
    date: '2026-09-23',
    isImportant: true,
    attachmentName: 'Mid_Sem_Exam_Schedule_Autumn2026.pdf',
    attachmentUrl: '#',
  },
  {
    id: 'ann-2',
    title: 'Annual Campus Hackathon "CodeStorm 2026" Registrations Open',
    content: 'Get ready for 36 hours of relentless innovation, mentorship from top tech giants, and cash prizes worth ₹3,50,000! Teams of 3-4 can register until October 5th.',
    category: 'Events',
    authorName: 'Dr. Rajesh Sharma',
    authorRole: 'Faculty Coordinator, CSE',
    date: '2026-09-22',
    isImportant: true,
    attachmentName: 'CodeStorm_Guidelines.pdf',
  },
  {
    id: 'ann-3',
    title: 'Hostel Maintenance & Electrical Safety Audit',
    content: 'Hostel Block B and G will undergo quarterly electrical safety inspections this Saturday between 10:00 AM and 2:00 PM. High wattage appliances like room heaters and immersion rods remain strictly prohibited.',
    category: 'Hostel',
    authorName: 'Ramesh Patil',
    authorRole: 'Chief Warden',
    date: '2026-09-21',
    isImportant: false,
  },
  {
    id: 'ann-4',
    title: 'Library Hours Extended for Examination Season',
    content: 'Central Library reading rooms will remain open 24/7 starting October 1st through the end of final exams. Digital repository terminals are available on 2nd floor.',
    category: 'Academic',
    authorName: 'Central Library Committee',
    authorRole: 'Administration',
    date: '2026-09-20',
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    studentId: 'user-student-1',
    subjectCode: 'CS501',
    subjectName: 'Operating Systems & System Programming',
    totalClasses: 36,
    attendedClasses: 32,
    facultyName: 'Dr. Rajesh Sharma',
    recentStatus: 'Present',
  },
  {
    id: 'att-2',
    studentId: 'user-student-1',
    subjectCode: 'CS502',
    subjectName: 'Database Management Systems',
    totalClasses: 34,
    attendedClasses: 30,
    facultyName: 'Prof. Ananya Sen',
    recentStatus: 'Present',
  },
  {
    id: 'att-3',
    studentId: 'user-student-1',
    subjectCode: 'CS503',
    subjectName: 'Computer Networks',
    totalClasses: 32,
    attendedClasses: 27,
    facultyName: 'Dr. Vikram Malhotra',
    recentStatus: 'Absent',
  },
  {
    id: 'att-4',
    studentId: 'user-student-1',
    subjectCode: 'CS504',
    subjectName: 'Design & Analysis of Algorithms',
    totalClasses: 35,
    attendedClasses: 33,
    facultyName: 'Dr. Sunita Deshmukh',
    recentStatus: 'Present',
  },
  {
    id: 'att-5',
    studentId: 'user-student-1',
    subjectCode: 'CS505',
    subjectName: 'Software Engineering & Agile Methodologies',
    totalClasses: 30,
    attendedClasses: 23,
    facultyName: 'Prof. K. R. Nambiar',
    recentStatus: 'Present',
  }
];

export const INITIAL_MARKS: MarkRecord[] = [
  {
    id: 'mk-1',
    studentId: 'user-student-1',
    subjectCode: 'CS501',
    subjectName: 'Operating Systems',
    internalMarks: 28,
    assignmentMarks: 19,
    examMarks: 44,
    grade: 'A+',
    credits: 4,
  },
  {
    id: 'mk-2',
    studentId: 'user-student-1',
    subjectCode: 'CS502',
    subjectName: 'Database Management Systems',
    internalMarks: 26,
    assignmentMarks: 18,
    examMarks: 42,
    grade: 'A',
    credits: 4,
  },
  {
    id: 'mk-3',
    studentId: 'user-student-1',
    subjectCode: 'CS503',
    subjectName: 'Computer Networks',
    internalMarks: 25,
    assignmentMarks: 17,
    examMarks: 40,
    grade: 'A',
    credits: 3,
  },
  {
    id: 'mk-4',
    studentId: 'user-student-1',
    subjectCode: 'CS504',
    subjectName: 'Design & Analysis of Algorithms',
    internalMarks: 29,
    assignmentMarks: 19,
    examMarks: 46,
    grade: 'O (Outstanding)',
    credits: 4,
  },
  {
    id: 'mk-5',
    studentId: 'user-student-1',
    subjectCode: 'CS505',
    subjectName: 'Software Engineering',
    internalMarks: 24,
    assignmentMarks: 17,
    examMarks: 38,
    grade: 'B+',
    credits: 3,
  }
];

export const INITIAL_TIMETABLE: TimetableSlot[] = [
  { id: 'tt-1', day: 'Monday', startTime: '09:00 AM', endTime: '10:00 AM', subject: 'Operating Systems', faculty: 'Dr. Rajesh Sharma', room: 'LH-101', branch: 'CSE', semester: '5th' },
  { id: 'tt-2', day: 'Monday', startTime: '10:15 AM', endTime: '11:15 AM', subject: 'Database Management Systems', faculty: 'Prof. Ananya Sen', room: 'LH-101', branch: 'CSE', semester: '5th' },
  { id: 'tt-3', day: 'Monday', startTime: '11:30 AM', endTime: '01:30 PM', subject: 'OS & Systems Lab (Batch A)', faculty: 'Dr. Rajesh Sharma', room: 'Computing Lab 3', branch: 'CSE', semester: '5th' },
  { id: 'tt-4', day: 'Monday', startTime: '02:30 PM', endTime: '03:30 PM', subject: 'Computer Networks', faculty: 'Dr. Vikram Malhotra', room: 'LH-102', branch: 'CSE', semester: '5th' },

  { id: 'tt-5', day: 'Tuesday', startTime: '09:00 AM', endTime: '10:00 AM', subject: 'Algorithms Design', faculty: 'Dr. Sunita Deshmukh', room: 'LH-101', branch: 'CSE', semester: '5th' },
  { id: 'tt-6', day: 'Tuesday', startTime: '10:15 AM', endTime: '11:15 AM', subject: 'Software Engineering', faculty: 'Prof. K. R. Nambiar', room: 'LH-101', branch: 'CSE', semester: '5th' },
  { id: 'tt-7', day: 'Tuesday', startTime: '11:30 AM', endTime: '01:30 PM', subject: 'DBMS Lab (Batch A)', faculty: 'Prof. Ananya Sen', room: 'Database Lab 2', branch: 'CSE', semester: '5th' },

  { id: 'tt-8', day: 'Wednesday', startTime: '09:00 AM', endTime: '10:00 AM', subject: 'Operating Systems', faculty: 'Dr. Rajesh Sharma', room: 'LH-101', branch: 'CSE', semester: '5th' },
  { id: 'tt-9', day: 'Wednesday', startTime: '10:15 AM', endTime: '11:15 AM', subject: 'Computer Networks', faculty: 'Dr. Vikram Malhotra', room: 'LH-101', branch: 'CSE', semester: '5th' },
  { id: 'tt-10', day: 'Wednesday', startTime: '02:00 PM', endTime: '04:00 PM', subject: 'Mini Project Mentoring', faculty: 'Faculty Panel', room: 'Seminar Hall B', branch: 'CSE', semester: '5th' },

  { id: 'tt-11', day: 'Thursday', startTime: '09:00 AM', endTime: '10:00 AM', subject: 'Database Management Systems', faculty: 'Prof. Ananya Sen', room: 'LH-101', branch: 'CSE', semester: '5th' },
  { id: 'tt-12', day: 'Thursday', startTime: '10:15 AM', endTime: '11:15 AM', subject: 'Algorithms Design', faculty: 'Dr. Sunita Deshmukh', room: 'LH-101', branch: 'CSE', semester: '5th' },
  { id: 'tt-13', day: 'Thursday', startTime: '11:30 AM', endTime: '12:30 PM', subject: 'Software Engineering', faculty: 'Prof. K. R. Nambiar', room: 'LH-101', branch: 'CSE', semester: '5th' },

  { id: 'tt-14', day: 'Friday', startTime: '09:00 AM', endTime: '10:00 AM', subject: 'Computer Networks', faculty: 'Dr. Vikram Malhotra', room: 'LH-101', branch: 'CSE', semester: '5th' },
  { id: 'tt-15', day: 'Friday', startTime: '10:15 AM', endTime: '11:15 AM', subject: 'Operating Systems', faculty: 'Dr. Rajesh Sharma', room: 'LH-101', branch: 'CSE', semester: '5th' },
  { id: 'tt-16', day: 'Friday', startTime: '02:00 PM', endTime: '04:00 PM', subject: 'Networks Simulator Lab', faculty: 'Dr. Vikram Malhotra', room: 'Hardware Lab', branch: 'CSE', semester: '5th' },

  { id: 'tt-17', day: 'Saturday', startTime: '10:00 AM', endTime: '12:00 PM', subject: 'Industry Guest Lecture / Seminar', faculty: 'Guest Speakers', room: 'Main Auditorium', branch: 'CSE', semester: '5th' },
];

export const INITIAL_STUDY_MATERIALS: StudyMaterial[] = [
  {
    id: 'mat-1',
    title: 'Unit 3: Process Synchronization, Semaphores & Deadlocks',
    subject: 'Operating Systems',
    description: 'Detailed lecture notes, classic synchronization problems (Dining Philosophers, Readers-Writers) and Banker algorithm problems.',
    fileType: 'PDF',
    fileUrl: '#',
    uploadedBy: 'Dr. Rajesh Sharma',
    uploadDate: '2026-09-21',
    fileSize: '4.8 MB',
  },
  {
    id: 'mat-2',
    title: 'DBMS Lecture 14: Relational Algebra & Query Optimization Slides',
    subject: 'Database Management Systems',
    description: 'Presentation slides covering query tree evaluation, heuristics, and indexing B+ trees.',
    fileType: 'PPT',
    fileUrl: '#',
    uploadedBy: 'Prof. Ananya Sen',
    uploadDate: '2026-09-19',
    fileSize: '12.2 MB',
  },
  {
    id: 'mat-3',
    title: 'Assignment 3: TCP Flow Control & Sliding Window Implementation',
    subject: 'Computer Networks',
    description: 'Socket programming assignment specifications. Due submission date is October 8, 2026.',
    fileType: 'Assignment',
    fileUrl: '#',
    uploadedBy: 'Dr. Vikram Malhotra',
    uploadDate: '2026-09-20',
    fileSize: '1.2 MB',
  },
  {
    id: 'mat-4',
    title: 'Dynamic Programming Cheat Sheet & LeetCode Reference Problems',
    subject: 'Design & Analysis of Algorithms',
    description: 'Handwritten annotated notes for 0/1 Knapsack, Longest Common Subsequence, and Matrix Chain Multiplication.',
    fileType: 'Notes',
    fileUrl: '#',
    uploadedBy: 'Dr. Sunita Deshmukh',
    uploadDate: '2026-09-17',
    fileSize: '3.4 MB',
  },
  {
    id: 'mat-5',
    title: 'IEEE Software Engineering Standards & Git Flow Guidelines',
    subject: 'Software Engineering',
    description: 'Official link and documentation for agile sprint planning, scrum ceremonies, and standard PR review conventions.',
    fileType: 'Link',
    fileUrl: 'https://ieee.org',
    uploadedBy: 'Prof. K. R. Nambiar',
    uploadDate: '2026-09-15',
  }
];

export const INITIAL_FEES: FeeRecord[] = [
  {
    id: 'fee-rec-1',
    studentId: 'user-student-1',
    academicYear: '2026-2027',
    semester: '5th Semester',
    tuitionFee: 65000,
    hostelFee: 22000,
    messFee: 18000,
    libraryFee: 3000,
    totalAmount: 108000,
    paidAmount: 88000,
    pendingAmount: 20000,
    dueDate: '2026-10-15',
    status: 'Partial',
    transactions: [
      { id: 'tx-1', amount: 50000, date: '2026-08-05', method: 'UPI / NetBanking', receiptNo: 'REC-2026-0982' },
      { id: 'tx-2', amount: 38000, date: '2026-09-02', method: 'Debit Card', receiptNo: 'REC-2026-1450' }
    ]
  }
];

export const INITIAL_DOCUMENTS: StudentDocument[] = [
  {
    id: 'doc-1',
    title: 'Student Identity Card (Digital ID)',
    category: 'ID Card',
    issuedDate: '2024-08-10',
    fileUrl: '#',
    status: 'Verified',
  },
  {
    id: 'doc-2',
    title: 'Bonafide Certificate - Passport / Education Loan Purpose',
    category: 'Bonafide Certificate',
    issuedDate: '2026-09-10',
    fileUrl: '#',
    status: 'Generated',
  },
  {
    id: 'doc-3',
    title: 'Fee Payment Receipt - Installment 2 (Autumn 2026)',
    category: 'Fee Receipt',
    issuedDate: '2026-09-02',
    fileUrl: '#',
    status: 'Verified',
  },
  {
    id: 'doc-4',
    title: '4th Semester Grade Marksheet (Spring 2026)',
    category: 'Marksheet',
    issuedDate: '2026-06-25',
    fileUrl: '#',
    status: 'Verified',
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'user-student-1',
    title: 'New Announcement Posted',
    message: 'Mid-Semester Examinations Schedule - Autumn 2026 has been published.',
    type: 'announcement',
    isRead: false,
    createdAt: '2026-09-23T14:30:00Z',
    actionUrl: 'announcements'
  },
  {
    id: 'notif-2',
    userId: 'user-student-1',
    title: 'Ticket Status Updated',
    message: 'Your ticket #TKT-1082 (Ceiling fan regulator) is now In Progress by Electrician Mahesh.',
    type: 'ticket',
    isRead: false,
    createdAt: '2026-09-23T11:20:00Z',
    actionUrl: 'maintenance'
  },
  {
    id: 'notif-3',
    userId: 'user-student-1',
    title: 'Warden replied to Mess Feedback',
    message: 'Warden Ramesh Patil replied to your lunch menu feedback.',
    type: 'mess',
    isRead: false,
    createdAt: '2026-09-23T09:00:00Z',
    actionUrl: 'mess'
  },
  {
    id: 'notif-4',
    userId: 'user-student-1',
    title: 'New Study Material Uploaded',
    message: 'Dr. Rajesh Sharma uploaded "Unit 3: Process Synchronization notes" for Operating Systems.',
    type: 'material',
    isRead: true,
    createdAt: '2026-09-21T18:00:00Z',
    actionUrl: 'materials'
  },
  {
    id: 'notif-5',
    userId: 'user-student-1',
    title: 'Attendance Alert',
    message: 'Your attendance in Software Engineering is 76.6%. Please maintain above 75% to avoid exam debarment.',
    type: 'attendance',
    isRead: true,
    createdAt: '2026-09-20T12:00:00Z',
    actionUrl: 'attendance'
  }
];

export const INITIAL_HOSTEL_REQUESTS: HostelRequest[] = [
  {
    id: 'hr-1',
    studentId: 'user-student-1',
    studentName: 'Aman Sahu',
    rollNumber: 'CSE2024089',
    type: 'Night Out / Leave Pass',
    details: 'Traveling to hometown for family festival from Friday evening to Sunday night.',
    status: 'Approved',
    requestDate: '2026-09-18',
    responseNote: 'Approved. Ensure reporting back before Sunday 9:00 PM.'
  }
];

export const INITIAL_VISITORS: VisitorEntry[] = [
  {
    id: 'vis-1',
    studentName: 'Aman Sahu',
    roomNumber: 'B-304',
    visitorName: 'Sunil Sahu',
    relation: 'Father',
    checkInTime: '2026-09-15 11:30 AM',
    checkOutTime: '2026-09-15 03:00 PM',
    contact: '+91 94370 12345'
  },
  {
    id: 'vis-2',
    studentName: 'Rohan Gupta',
    roomNumber: 'B-304',
    visitorName: 'Sanjay Gupta',
    relation: 'Brother',
    checkInTime: '2026-09-22 04:15 PM',
    contact: '+91 98765 11223'
  }
];
