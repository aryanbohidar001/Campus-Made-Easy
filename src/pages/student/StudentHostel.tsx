import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Building2,
  Bed,
  Phone,
  UserCheck,
  Calendar,
  AlertCircle,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Send,
  Users,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const StudentHostel: React.FC = () => {
  const { studentProfile } = useAuth();
  const { hostels, rooms, hostelRequests, submitHostelRequest } = useData();

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestType, setRequestType] = useState<'Room Change' | 'Night Out / Leave Pass' | 'Furniture Request' | 'Other'>('Room Change');
  const [requestDetails, setRequestDetails] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const myHostel = hostels.find((h) => h.id === studentProfile?.hostelId) || hostels[0];
  const myRoom = rooms.find((r) => r.roomNumber === studentProfile?.roomNumber) || rooms[0];

  const myRequests = hostelRequests.filter(
    (hr) => hr.studentId === studentProfile?.userId || hr.rollNumber === studentProfile?.rollNumber
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestDetails.trim()) return;

    submitHostelRequest({
      studentId: studentProfile?.userId || 'user-student-1',
      studentName: studentProfile ? 'Aman Sahu' : 'Student',
      rollNumber: studentProfile?.rollNumber || 'CSE2024089',
      type: requestType,
      details: requestDetails,
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsRequestModalOpen(false);
      setRequestDetails('');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Hostel & Accommodation</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Details of your allocated hostel building, room capacity, guidelines and requests
          </p>
        </div>
        <button
          onClick={() => setIsRequestModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-blue-500/20 transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Submit Hostel Request</span>
        </button>
      </div>

      {/* Primary Hostel Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Allocated Room Card */}
        <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-xs bg-gradient-to-b from-blue-50/40 to-white">
          <div className="flex items-center justify-between mb-4">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
              Current Allocation
            </span>
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>

          <h3 className="text-lg font-bold text-slate-900">{myHostel?.name || 'Aryabhatta Boys Hostel'}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{myHostel?.block || 'Block B'} &bull; {myHostel?.type || 'Boys'} Hostel</p>

          <div className="mt-5 space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Room Number:</span>
              <span className="font-bold text-slate-800">{studentProfile?.roomNumber || 'B-304'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Bed Number:</span>
              <span className="font-bold text-slate-800">{studentProfile?.bedNumber || 'Bed 2'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Room Type:</span>
              <span className="font-bold text-slate-800">{myRoom?.roomType || 'Double Occupancy'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Check-in Date:</span>
              <span className="font-bold text-slate-800">August 01, 2024</span>
            </div>
          </div>
        </div>

        {/* Room Capacity & Occupants Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
              Room Occupancy
            </span>
            <Bed className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center py-2 mb-3 bg-slate-50 rounded-xl">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Beds</p>
              <p className="text-base font-bold text-slate-900 mt-0.5">{myRoom?.totalBeds || 2}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Occupied</p>
              <p className="text-base font-bold text-emerald-600 mt-0.5">{myRoom?.occupiedBeds || 2}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Available</p>
              <p className="text-base font-bold text-slate-500 mt-0.5">
                {Math.max(0, (myRoom?.totalBeds || 2) - (myRoom?.occupiedBeds || 2))}
              </p>
            </div>
          </div>

          <p className="text-xs font-semibold text-slate-700 mb-2">Roommates:</p>
          <div className="space-y-2">
            {(myRoom?.occupants || [
              { studentName: 'Aman Sahu (You)', rollNumber: 'CSE2024089' },
              { studentName: 'Rohan Gupta', rollNumber: 'CSE2024092' }
            ]).map((occ, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </div>
                  <span className="font-semibold text-slate-800">{occ.studentName}</span>
                </div>
                <span className="text-[11px] text-slate-500">{occ.rollNumber}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Warden Contact Card */}
        <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-xs bg-gradient-to-b from-amber-50/40 to-white">
          <div className="flex items-center justify-between mb-4">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
              Warden In-Charge
            </span>
            <UserCheck className="w-5 h-5 text-amber-600" />
          </div>

          <h3 className="text-base font-bold text-slate-900">{myHostel?.wardenName || 'Ramesh Patil'}</h3>
          <p className="text-xs text-slate-500 mt-0.5">Chief Warden - Boys Hostels</p>

          <div className="mt-4 space-y-2 text-xs">
            <div className="flex items-center space-x-2 text-slate-600">
              <Phone className="w-3.5 h-3.5 text-amber-600" />
              <span>{myHostel?.wardenPhone || '+91 94123 98765'}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600">
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Office: Ground Floor, Block B Administration</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Visiting Hours: 04:00 PM - 07:00 PM</span>
            </div>
          </div>

          <div className="mt-5 p-2.5 rounded-xl bg-amber-50 border border-amber-200/70 text-[11px] text-amber-800">
            For emergencies after 10:00 PM, contact the hostel security guard at main gate.
          </div>
        </div>
      </div>

      {/* Hostel Rules & Guidelines */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-blue-600" />
          <span>Hostel Rules & Regulations</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <p className="font-semibold text-slate-800 mb-1">1. Gate Closing Time</p>
            <p>Main hostel gates are locked promptly at 10:00 PM. Entry after curfew requires prior digital leave pass approval.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <p className="font-semibold text-slate-800 mb-1">2. Electrical Appliances</p>
            <p>High voltage immersion heaters, induction stoves, and blowers are strictly prohibited inside rooms.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <p className="font-semibold text-slate-800 mb-1">3. Quiet Hours</p>
            <p>Maintain complete silence from 11:00 PM to 06:00 AM for academic study and rest.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <p className="font-semibold text-slate-800 mb-1">4. Visitors Policy</p>
            <p>Guests and day-scholars must register at the reception. Visitors are not allowed inside rooms past 07:00 PM.</p>
          </div>
        </div>
      </div>

      {/* My Hostel Requests History */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">My Requests & Applications</h3>
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            + New Request
          </button>
        </div>

        {myRequests.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No hostel requests submitted yet.</p>
        ) : (
          <div className="space-y-3">
            {myRequests.map((req) => (
              <div
                key={req.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{req.type}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        req.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'Rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {req.status}
                    </span>
                    <span className="text-slate-400 text-[11px]">{req.requestDate}</span>
                  </div>
                  <p className="text-slate-600 mt-1">{req.details}</p>
                  {req.responseNote && (
                    <p className="text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg mt-2 text-[11px]">
                      <span className="font-semibold">Warden Remark:</span> {req.responseNote}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Request Modal */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Submit Hostel Application"
        subtitle="Apply for a room change, leave pass, or hostel amenity request"
      >
        {isSubmitted ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-900">Request Sent to Warden</p>
            <p className="text-xs text-slate-500 mt-1">You will be notified once reviewed.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Application Type</label>
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
              >
                <option value="Room Change">Room Change Request</option>
                <option value="Night Out / Leave Pass">Night Out / Leave Pass</option>
                <option value="Furniture Request">Furniture / Bedding Request</option>
                <option value="Other">Other Hostel Assistance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason & Details</label>
              <textarea
                required
                rows={4}
                value={requestDetails}
                onChange={(e) => setRequestDetails(e.target.value)}
                placeholder="Explain reason, dates if leave pass, or target room preference..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden resize-none"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit to Warden</span>
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
