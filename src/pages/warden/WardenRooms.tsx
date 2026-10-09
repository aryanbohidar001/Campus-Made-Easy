import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Room } from '../../types';
import {
  DoorClosed,
  Bed,
  PlusCircle,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';

interface WardenRoomsProps {
  initialOpenAddModal?: boolean;
}

export const WardenRooms: React.FC<WardenRoomsProps> = ({ initialOpenAddModal = false }) => {
  const { rooms, hostels, addRoom, updateRoomStatus } = useData();

  const [isAddModalOpen, setIsAddModalOpen] = useState(initialOpenAddModal);
  const [selectedBlock, setSelectedBlock] = useState<string>('All');

  // Form state
  const [hostelId, setHostelId] = useState('hostel-1');
  const [roomNumber, setRoomNumber] = useState('');
  const [block, setBlock] = useState('Block B');
  const [roomType, setRoomType] = useState<'Single' | 'Double' | 'Triple'>('Double');
  const [totalBeds, setTotalBeds] = useState<number>(2);

  const filteredRooms = rooms.filter((r) => {
    return selectedBlock === 'All' || r.block === selectedBlock;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim()) return;

    addRoom({
      hostelId,
      roomNumber,
      block,
      roomType,
      totalBeds,
      occupiedBeds: 0,
      status: 'Active',
      occupants: [],
    });

    setIsAddModalOpen(false);
    setRoomNumber('');
  };

  const handleToggleMaintenance = (roomId: string, currentStatus: Room['status']) => {
    const newStatus = currentStatus === 'Maintenance' ? 'Active' : 'Maintenance';
    updateRoomStatus(roomId, newStatus);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Hostel Rooms & Inventory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor room capacity, occupancy states, bed allocations, and maintenance locks
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-amber-500/20 transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Room</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700">Filter Block:</span>
          <select
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value)}
            className="px-3 py-1 text-xs border border-slate-200 rounded-xl focus:border-amber-500 focus:outline-hidden bg-white"
          >
            <option value="All">All Blocks</option>
            <option value="Block B">Block B (Boys)</option>
            <option value="Block G">Block G (Girls)</option>
          </select>
        </div>
        <span className="text-xs text-slate-500">{filteredRooms.length} Rooms Listed</span>
      </div>

      {/* Rooms Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms.map((room) => {
          const available = Math.max(0, room.totalBeds - room.occupiedBeds);
          const isUnderMaintenance = room.status === 'Maintenance';

          return (
            <div
              key={room.id}
              className={`rounded-2xl border p-5 transition-all shadow-xs ${
                isUnderMaintenance
                  ? 'border-red-200 bg-red-50/30'
                  : available === 0
                  ? 'border-slate-200 bg-white'
                  : 'border-emerald-200 bg-emerald-50/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-base text-slate-900">{room.roomNumber}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    {room.block}
                  </span>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isUnderMaintenance
                      ? 'bg-rose-100 text-rose-800'
                      : available === 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isUnderMaintenance ? 'Maintenance' : available === 0 ? 'Full' : `${available} Available`}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                <div className="flex justify-between">
                  <span>Room Type:</span>
                  <span className="font-semibold text-slate-800">{room.roomType} Occupancy</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Beds:</span>
                  <span className="font-semibold text-slate-800">{room.totalBeds} Beds</span>
                </div>
                <div className="flex justify-between">
                  <span>Occupied Beds:</span>
                  <span className="font-semibold text-slate-800">{room.occupiedBeds} Beds</span>
                </div>
              </div>

              {/* Occupants list */}
              {room.occupants && room.occupants.length > 0 && (
                <div className="mb-4 pt-2 border-t border-slate-100 text-[11px]">
                  <p className="text-slate-400 font-semibold mb-1">Occupants:</p>
                  <div className="space-y-1">
                    {room.occupants.map((occ, i) => (
                      <p key={i} className="text-slate-700 font-medium">
                        &bull; {occ.studentName} ({occ.rollNumber})
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Status toggle action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleToggleMaintenance(room.id, room.status)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition ${
                    isUnderMaintenance
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  }`}
                >
                  {isUnderMaintenance ? 'Mark Active' : 'Lock for Maintenance'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Room Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Hostel Room"
        subtitle="Create a room record and specify bed capacity"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Hostel Building</label>
            <select
              value={hostelId}
              onChange={(e) => setHostelId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-amber-500 focus:outline-hidden"
            >
              {hostels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.block})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Room Number</label>
              <input
                type="text"
                required
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. B-401"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hostel Block</label>
              <input
                type="text"
                required
                value={block}
                onChange={(e) => setBlock(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Room Type</label>
              <select
                value={roomType}
                onChange={(e) => {
                  const t = e.target.value as any;
                  setRoomType(t);
                  setTotalBeds(t === 'Single' ? 1 : t === 'Double' ? 2 : 3);
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-amber-500 focus:outline-hidden"
              >
                <option value="Single">Single (1 Bed)</option>
                <option value="Double">Double (2 Beds)</option>
                <option value="Triple">Triple (3 Beds)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Total Bed Capacity</label>
              <input
                type="number"
                min={1}
                max={4}
                value={totalBeds}
                onChange={(e) => setTotalBeds(Number(e.target.value))}
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
              Add Room
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
