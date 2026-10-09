import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Bed,
  UserPlus,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  Users,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const WardenAllocations: React.FC = () => {
  const { allUsers } = useAuth();
  const { rooms, allocateStudentToRoom, transferStudentRoom } = useData();

  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Allocation form state
  const [targetRoomId, setTargetRoomId] = useState(rooms[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState(allUsers.find((u) => u.role === 'student')?.id || '');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Transfer form state
  const [transferFromRoomId, setTransferFromRoomId] = useState(rooms[0]?.id || '');
  const [transferToRoomId, setTransferToRoomId] = useState(rooms[1]?.id || '');
  const [transferStudentId, setTransferStudentId] = useState('');

  const students = allUsers.filter((u) => u.role === 'student');

  const handleAllocateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === selectedStudentId);
    if (!student) return;

    const ok = allocateStudentToRoom(targetRoomId, {
      studentId: student.id,
      studentName: student.name,
      rollNumber: student.id === 'user-student-1' ? 'CSE2024089' : 'ECE2024045',
    });

    if (ok) {
      setStatusMessage(`Allocated ${student.name} successfully!`);
      setTimeout(() => {
        setStatusMessage(null);
        setIsAllocateModalOpen(false);
      }, 1200);
    } else {
      setStatusMessage('Failed: Selected room is full or student already allocated.');
    }
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = transferStudentRoom(transferFromRoomId, transferToRoomId, transferStudentId);
    if (ok) {
      setStatusMessage('Student transferred successfully!');
      setTimeout(() => {
        setStatusMessage(null);
        setIsTransferModalOpen(false);
      }, 1200);
    } else {
      setStatusMessage('Failed: Destination room has no available beds.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Student Room Allocations & Transfers</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Assign incoming students to hostel beds and manage inter-room transfers
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <ArrowRightLeft className="w-4 h-4 text-amber-600" />
            <span>Transfer Room</span>
          </button>
          <button
            onClick={() => setIsAllocateModalOpen(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs shadow-amber-500/20 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Allocate Student</span>
          </button>
        </div>
      </div>

      {/* Allocation Overview Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Current Room Occupancy & Resident Roster
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 text-[11px] uppercase">
                <th className="py-3 px-4">Room & Block</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-center">Beds Occupied</th>
                <th className="py-3 px-4">Allocated Students</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rooms.map((room) => {
                const isFull = room.occupiedBeds >= room.totalBeds;

                return (
                  <tr key={room.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {room.roomNumber} ({room.block})
                    </td>
                    <td className="py-3 px-4 text-slate-600">{room.roomType}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">
                      {room.occupiedBeds} / {room.totalBeds}
                    </td>
                    <td className="py-3 px-4">
                      {room.occupants && room.occupants.length > 0 ? (
                        <div className="space-y-0.5">
                          {room.occupants.map((occ, idx) => (
                            <span
                              key={idx}
                              className="inline-block bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium mr-1.5"
                            >
                              {occ.studentName} ({occ.rollNumber})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No students allocated</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          room.status === 'Maintenance'
                            ? 'bg-rose-100 text-rose-800'
                            : isFull
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {room.status === 'Maintenance'
                          ? 'Maintenance'
                          : isFull
                          ? 'Full'
                          : 'Available'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Allocate Modal */}
      <Modal
        isOpen={isAllocateModalOpen}
        onClose={() => setIsAllocateModalOpen(false)}
        title="Allocate Student to Bed"
        subtitle="Select an enrolled student and assign to an available room"
      >
        <form onSubmit={handleAllocateSubmit} className="space-y-4 text-xs">
          {statusMessage && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
              {statusMessage}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Student</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-amber-500 focus:outline-hidden"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Room</label>
            <select
              value={targetRoomId}
              onChange={(e) => setTargetRoomId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-amber-500 focus:outline-hidden"
            >
              {rooms
                .filter((r) => r.status === 'Active')
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.roomNumber} ({r.block}) - {Math.max(0, r.totalBeds - r.occupiedBeds)} beds available
                  </option>
                ))}
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAllocateModalOpen(false)}
              className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl"
            >
              Confirm Allotment
            </button>
          </div>
        </form>
      </Modal>

      {/* Transfer Modal */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Transfer Student Room"
        subtitle="Relocate resident to another room or block"
      >
        <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
          {statusMessage && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
              {statusMessage}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Current Room (From)</label>
            <select
              value={transferFromRoomId}
              onChange={(e) => {
                setTransferFromRoomId(e.target.value);
                const r = rooms.find((rm) => rm.id === e.target.value);
                if (r && r.occupants && r.occupants[0]) {
                  setTransferStudentId(r.occupants[0].studentId);
                }
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-amber-500 focus:outline-hidden"
            >
              {rooms
                .filter((r) => r.occupants && r.occupants.length > 0)
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.roomNumber} ({r.occupants?.length} occupants)
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Student to Move</label>
            <select
              value={transferStudentId}
              onChange={(e) => setTransferStudentId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-amber-500 focus:outline-hidden"
            >
              {rooms
                .find((r) => r.id === transferFromRoomId)
                ?.occupants?.map((occ) => (
                  <option key={occ.studentId} value={occ.studentId}>
                    {occ.studentName} ({occ.rollNumber})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">New Room (To)</label>
            <select
              value={transferToRoomId}
              onChange={(e) => setTransferToRoomId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-amber-500 focus:outline-hidden"
            >
              {rooms
                .filter((r) => r.id !== transferFromRoomId && r.occupiedBeds < r.totalBeds)
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.roomNumber} ({Math.max(0, r.totalBeds - r.occupiedBeds)} vacant beds)
                  </option>
                ))}
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsTransferModalOpen(false)}
              className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl"
            >
              Execute Transfer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
