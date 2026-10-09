import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  UserCheck,
  PlusCircle,
  Clock,
  CheckCircle2,
  User,
  Phone,
  DoorClosed,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const WardenVisitors: React.FC = () => {
  const { visitors, addVisitor, checkoutVisitor } = useData();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [studentName, setStudentName] = useState('Aman Sahu');
  const [roomNumber, setRoomNumber] = useState('B-304');
  const [visitorName, setVisitorName] = useState('');
  const [relation, setRelation] = useState('Parent');
  const [contact, setContact] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim()) return;

    addVisitor({
      studentName,
      roomNumber,
      visitorName,
      relation,
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      contact,
    });

    setIsAddModalOpen(false);
    setVisitorName('');
    setContact('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Hostel Visitor Register</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log entry of parents, guardians, and external guests with timestamp checks
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-amber-500/20 transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Log New Visitor</span>
        </button>
      </div>

      {/* Visitors Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 text-[11px] uppercase">
              <th className="py-3 px-4">Visitor Name</th>
              <th className="py-3 px-4">Relation</th>
              <th className="py-3 px-4">Resident Student</th>
              <th className="py-3 px-4">Room</th>
              <th className="py-3 px-4">Check-In</th>
              <th className="py-3 px-4">Check-Out</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visitors.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-900">{v.visitorName}</td>
                <td className="py-3 px-4 text-slate-600">{v.relation}</td>
                <td className="py-3 px-4 font-medium text-slate-800">{v.studentName}</td>
                <td className="py-3 px-4 font-semibold text-amber-700">{v.roomNumber}</td>
                <td className="py-3 px-4 text-slate-600">{v.checkInTime}</td>
                <td className="py-3 px-4 text-slate-600">
                  {v.checkOutTime || (
                    <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                      Inside Campus
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  {!v.checkOutTime && (
                    <button
                      onClick={() => checkoutVisitor(v.id)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
                    >
                      Check-Out
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Log Visitor Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Log Visitor Entry"
        subtitle="Record visiting guardian details at hostel security reception"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Visitor Full Name</label>
            <input
              type="text"
              required
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              placeholder="e.g. Sunil Sahu"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Relation to Student</label>
              <input
                type="text"
                required
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                placeholder="e.g. Father, Mother, Sibling"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Student Visited</label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Room Number</label>
              <input
                type="text"
                required
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl"
            >
              Register Visitor
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
