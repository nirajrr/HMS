import React, { useState } from 'react';
import { Student, Room } from '../types';
import { ArrowLeftRight, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

interface RoomSwapModalProps {
  students: Student[];
  rooms: Room[];
  selectedStudent: Student;
  onClose: () => void;
  onConfirmSwap: (sourceStudentId: string, targetRoomNumber: string, targetStudentId?: string) => void;
}

export const RoomSwapModal: React.FC<RoomSwapModalProps> = ({
  students,
  rooms,
  selectedStudent,
  onClose,
  onConfirmSwap,
}) => {
  const [targetRoomNumber, setTargetRoomNumber] = useState<string>('');
  const [targetStudentId, setTargetStudentId] = useState<string>('');
  const [swapType, setSwapType] = useState<'SHIFT_TO_EMPTY' | 'SWAP_WITH_STUDENT'>('SHIFT_TO_EMPTY');

  const targetRoom = rooms.find((r) => r.roomNumber === targetRoomNumber);
  const targetStudent = students.find((s) => s.id === targetStudentId);

  // Chain-of-Thought Clearance Rule Checkers
  // 1. Target Room Availability
  const isRoomValid = !!targetRoom;
  const isTargetRoomAvailable = targetRoom ? (
    swapType === 'SHIFT_TO_EMPTY' 
      ? targetRoom.occupiedBeds < targetRoom.totalBeds && targetRoom.status === 'AVAILABLE'
      : true
  ) : false;

  // 2. Student Eligibility (Academic status, not suspended)
  const isStudentEligible = selectedStudent.status === 'ACTIVE';

  // 3. Mess Bill Clearance Check
  const isMessCleared = selectedStudent.messBalance <= 0;

  // 4. Target Student Clearance Check (if swapping directly)
  const isTargetStudentMessCleared = targetStudent ? targetStudent.messBalance <= 0 : true;

  const allPassed = isRoomValid && isTargetRoomAvailable && isStudentEligible && isMessCleared && (swapType === 'SHIFT_TO_EMPTY' || (targetStudent && isTargetStudentMessCleared));

  const handleExecute = () => {
    if (!allPassed || !targetRoomNumber) return;
    onConfirmSwap(selectedStudent.id, targetRoomNumber, swapType === 'SWAP_WITH_STUDENT' ? targetStudentId : undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Room Shifting &amp; Swap Protocol</h3>
              <p className="text-xs text-slate-400">
                Automated Chain-of-Thought Verification Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 flex items-center justify-center text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Active Student Info */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block">Initiating Resident:</span>
              <strong className="text-slate-100 text-sm font-bold">{selectedStudent.name}</strong>
              <span className="text-slate-400 ml-2">({selectedStudent.rollNumber})</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block">Current Room:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-200 font-mono font-bold">
                Room #{selectedStudent.roomNumber} ({selectedStudent.bedNumber})
              </span>
            </div>
          </div>

          {/* Operation Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => { setSwapType('SHIFT_TO_EMPTY'); setTargetStudentId(''); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
                swapType === 'SHIFT_TO_EMPTY'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Shift to Empty Bed / Vacant Room
            </button>
            <button
              onClick={() => setSwapType('SWAP_WITH_STUDENT')}
              className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
                swapType === 'SWAP_WITH_STUDENT'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Direct Room Swap with Another Resident
            </button>
          </div>

          {/* Target Selection Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Room Number *
              </label>
              <select
                value={targetRoomNumber}
                onChange={(e) => {
                  setTargetRoomNumber(e.target.value);
                  setTargetStudentId('');
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Select Room --</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.roomNumber}>
                    Room {r.roomNumber} ({r.type} - {r.occupiedBeds}/{r.totalBeds} Beds occupied) [{r.status}]
                  </option>
                ))}
              </select>
            </div>

            {swapType === 'SWAP_WITH_STUDENT' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Target Student in Room {targetRoomNumber || '...'} *
                </label>
                <select
                  value={targetStudentId}
                  onChange={(e) => setTargetStudentId(e.target.value)}
                  disabled={!targetRoomNumber}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                >
                  <option value="">-- Select Student to Swap With --</option>
                  {students
                    .filter((s) => s.roomNumber === targetRoomNumber && s.id !== selectedStudent.id)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.rollNumber}) - Mess: ₹{s.messBalance}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {/* CHAIN-OF-THOUGHT CLEARANCE VERIFICATION BOX */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Pre-Allotment Clearance Chain (Zero-Double-Booking Guarantee)
            </h4>

            <div className="space-y-2 text-xs">
              {/* Check 1 */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800/80">
                <span className="text-slate-300">1. Target Room Vacancy &amp; Readiness:</span>
                <span className="flex items-center gap-1.5 font-semibold">
                  {!targetRoom ? (
                    <span className="text-slate-500">Awaiting selection</span>
                  ) : isTargetRoomAvailable ? (
                    <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Room Available</span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Room Full or in Maintenance</span>
                  )}
                </span>
              </div>

              {/* Check 2 */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800/80">
                <span className="text-slate-300">2. Initiator Academic &amp; Disciplinary Eligibility:</span>
                <span className="flex items-center gap-1.5 font-semibold">
                  {isStudentEligible ? (
                    <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Active &amp; Clear</span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Disciplinary Hold</span>
                  )}
                </span>
              </div>

              {/* Check 3 */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800/80">
                <span className="text-slate-300">3. Initiator Mess Bill Clearance (Dues = ₹0):</span>
                <span className="flex items-center gap-1.5 font-semibold">
                  {isMessCleared ? (
                    <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> No Overdue Mess Dues (₹0)</span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Outstanding Mess Dues: ₹{selectedStudent.messBalance}</span>
                  )}
                </span>
              </div>

              {/* Check 4 for direct swap */}
              {swapType === 'SWAP_WITH_STUDENT' && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800/80">
                  <span className="text-slate-300">4. Target Student Clearance Check:</span>
                  <span className="flex items-center gap-1.5 font-semibold">
                    {!targetStudent ? (
                      <span className="text-slate-500">Awaiting target selection</span>
                    ) : isTargetStudentMessCleared ? (
                      <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Cleared (₹{targetStudent.messBalance})</span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Mess Dues: ₹{targetStudent.messBalance}</span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-850 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            onClick={handleExecute}
            disabled={!allPassed}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4" />
            Authorize &amp; Execute Room Transfer
          </button>
        </div>

      </div>
    </div>
  );
};
