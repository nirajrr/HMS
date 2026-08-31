import React, { useState, useEffect } from 'react';
import { ResidentComplaint, Student, Room, ComplaintCategory, ComplaintSeverity, ComplaintStatus } from '../types';
import { 
  AlertTriangle, CheckCircle2, Clock, Wrench, ShieldAlert, 
  Camera, Upload, Phone, User, Home, Bed, Filter, Search, 
  Plus, MessageSquare, ArrowRight, CheckCheck, X, FileText
} from 'lucide-react';

interface ResidentComplaintModalProps {
  student?: Student | null;
  rooms?: Room[];
  students?: Student[];
  complaints?: ResidentComplaint[];
  onClose: () => void;
  onSubmitComplaint: (complaintData: Omit<ResidentComplaint, 'id' | 'ticketId' | 'createdAt' | 'status'>) => void;
  onUpdateComplaintStatus?: (complaintId: string, status: ResidentComplaint['status'], resolutionNotes?: string) => void;
  onConvertToWorkOrder?: (complaint: ResidentComplaint) => void;
}

const CATEGORY_ICONS: Record<ComplaintCategory, string> = {
  PLUMBING: '🚰',
  ELECTRICAL: '⚡',
  HOUSEKEEPING: '🧹',
  WIFI_NETWORK: '📶',
  MESS_FOOD: '🍲',
  NOISE_DISCIPLINE: '🔊',
  CARPENTRY_FURNITURE: '🪑',
  WATER_SUPPLY: '💧',
  SECURITY_SAFETY: '🛡️',
  OTHER: '📌',
};

export const ResidentComplaintModal: React.FC<ResidentComplaintModalProps> = ({
  student,
  rooms = [],
  students = [],
  complaints = [],
  onClose,
  onSubmitComplaint,
  onUpdateComplaintStatus,
  onConvertToWorkOrder,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'NEW_COMPLAINT' | 'COMPLAINTS_LOG'>('NEW_COMPLAINT');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(student?.id || students[0]?.id || '');
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string>(
    student?.roomNumber || students[0]?.roomNumber || rooms[0]?.roomNumber || '101'
  );
  const [selectedBedNumber, setSelectedBedNumber] = useState<string>(
    student?.bedNumber || 'Bed-1'
  );
  const [category, setCategory] = useState<ComplaintCategory>('PLUMBING');
  const [severity, setSeverity] = useState<ComplaintSeverity>('MEDIUM');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState(student?.mobile || '');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('Morning (09:00 - 12:00)');
  const [photoFileName, setPhotoFileName] = useState<string | undefined>();
  const [photoPreview, setPhotoPreview] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Filter state for complaints log
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchLog, setSearchLog] = useState('');

  // Synchronize when student prop changes
  useEffect(() => {
    if (student) {
      setSelectedStudentId(student.id);
      setSelectedRoomNumber(student.roomNumber);
      setSelectedBedNumber(student.bedNumber);
      setContactPhone(student.mobile);
    }
  }, [student]);

  // When student dropdown changes, auto-populate room and bed
  const handleStudentSelect = (stdId: string) => {
    setSelectedStudentId(stdId);
    const std = students.find((s) => s.id === stdId);
    if (std) {
      setSelectedRoomNumber(std.roomNumber);
      setSelectedBedNumber(std.bedNumber);
      setContactPhone(std.mobile);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const std = students.find((s) => s.id === selectedStudentId);
    const studentName = std ? std.name : 'Resident Student';
    const studentRoll = std ? std.rollNumber : 'N/A';
    const currentRoom = rooms.find((r) => r.roomNumber === selectedRoomNumber);

    setIsSubmitting(true);

    onSubmitComplaint({
      studentId: selectedStudentId,
      studentName,
      studentRoll,
      roomNumber: selectedRoomNumber,
      bedNumber: selectedBedNumber,
      hostelBlock: currentRoom?.block || 'A-Block (North Wing)',
      category,
      severity,
      title: title.trim(),
      description: description.trim(),
      contactPhone: contactPhone.trim(),
      preferredTimeSlot,
      photoAttachmentUrl: photoPreview,
      photoFileName: photoFileName,
      escalatedToAdmin: severity === 'EMERGENCY' || severity === 'HIGH',
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage(`Grievance registered successfully for Room ${selectedRoomNumber} (${selectedBedNumber})!`);
      setTitle('');
      setDescription('');
      setPhotoFileName(undefined);
      setPhotoPreview(undefined);
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1200);
    }, 400);
  };

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch = 
      !searchLog || 
      c.ticketId.toLowerCase().includes(searchLog.toLowerCase()) ||
      c.studentName.toLowerCase().includes(searchLog.toLowerCase()) ||
      c.roomNumber.toLowerCase().includes(searchLog.toLowerCase()) ||
      c.title.toLowerCase().includes(searchLog.toLowerCase());
    
    const matchesCategory = filterCategory === 'ALL' || c.category === filterCategory;
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Resident Grievance &amp; Complaint Portal
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold">
                  Mapped to Room &amp; Bed
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Log maintenance, electrical, hygiene, Wi-Fi, or discipline issues with priority routing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-tab Navigation */}
        <div className="px-6 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center gap-3 text-xs">
          <button
            onClick={() => setActiveSubTab('NEW_COMPLAINT')}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'NEW_COMPLAINT'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Lodge New Complaint
          </button>

          {complaints.length > 0 && (
            <button
              onClick={() => setActiveSubTab('COMPLAINTS_LOG')}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeSubTab === 'COMPLAINTS_LOG'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              All Registered Grievances ({complaints.length})
            </button>
          )}
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeSubTab === 'NEW_COMPLAINT' ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {successMessage && (
                <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 flex items-center gap-3 text-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Resident, Room & Bed Mapping Card */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    1. Resident &amp; Accommodation Mapping
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Room #{selectedRoomNumber} ({selectedBedNumber})
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Select Student / Resident *</label>
                    <select
                      value={selectedStudentId}
                      onChange={(e) => handleStudentSelect(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.rollNumber}) - Rm {s.roomNumber} ({s.bedNumber})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Room Number *</label>
                    <select
                      value={selectedRoomNumber}
                      onChange={(e) => setSelectedRoomNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      {rooms.map((r) => (
                        <option key={r.id} value={r.roomNumber}>
                          Room #{r.roomNumber} ({r.block}, Floor {r.floor})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Bed Number / Cot Slot *</label>
                    <select
                      value={selectedBedNumber}
                      onChange={(e) => setSelectedBedNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Bed-1">Bed-1 (Cot Slot 1)</option>
                      <option value="Bed-2">Bed-2 (Cot Slot 2)</option>
                      <option value="Bed-3">Bed-3 (Cot Slot 3)</option>
                      <option value="Bed-4">Bed-4 (Cot Slot 4)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Grievance Category & Priority */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  2. Issue Classification &amp; Severity
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="PLUMBING">🚰 Plumbing &amp; Sanitary (Leakage, Taps, Flush)</option>
                      <option value="ELECTRICAL">⚡ Electrical &amp; Appliances (Fans, Switches, AC)</option>
                      <option value="HOUSEKEEPING">🧹 Housekeeping &amp; Hygiene (Cleaning, Dustbins)</option>
                      <option value="WIFI_NETWORK">📶 Wi-Fi &amp; Internet Connectivity</option>
                      <option value="MESS_FOOD">🍲 Mess &amp; Food Quality Grievance</option>
                      <option value="CARPENTRY_FURNITURE">🪑 Carpentry &amp; Furniture (Wardrobe, Bed, Lock)</option>
                      <option value="WATER_SUPPLY">💧 Drinking Water / RO Purifier</option>
                      <option value="NOISE_DISCIPLINE">🔊 Noise, Curfew &amp; Discipline</option>
                      <option value="SECURITY_SAFETY">🛡️ Security, Access &amp; Safety</option>
                      <option value="OTHER">📌 Other Resident Concern</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Severity Level *</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'LOW', label: 'Low', color: 'border-slate-700 text-slate-300' },
                        { id: 'MEDIUM', label: 'Normal', color: 'border-blue-500/50 text-blue-300' },
                        { id: 'HIGH', label: 'High', color: 'border-amber-500/50 text-amber-300' },
                        { id: 'EMERGENCY', label: 'Emergency', color: 'border-rose-500/50 text-rose-300' },
                      ].map((lvl) => (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() => setSeverity(lvl.id as ComplaintSeverity)}
                          className={`px-2 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                            severity === lvl.id
                              ? 'bg-slate-800 border-indigo-500 ring-2 ring-indigo-500/30 text-white'
                              : `${lvl.color} bg-slate-900/50 hover:bg-slate-900`
                          }`}
                        >
                          {lvl.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Issue Summary / Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Washroom geyser tripping electricity in Room 101"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Detailed Description of Problem *</label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe exactly what happened, when the issue began, and how it impacts your room..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Contact Mobile Number</label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Preferred Staff Inspection Time</label>
                    <select
                      value={preferredTimeSlot}
                      onChange={(e) => setPreferredTimeSlot(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="Morning (09:00 - 12:00)">Morning (09:00 - 12:00)</option>
                      <option value="Afternoon (14:00 - 17:00)">Afternoon (14:00 - 17:00)</option>
                      <option value="Evening (17:00 - 20:00)">Evening (17:00 - 20:00)</option>
                      <option value="Immediate / Emergency">Immediate / Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Photo / Proof Attachment Upload */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Photo Attachment / Proof (Optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 flex items-center gap-2 cursor-pointer transition-colors">
                      <Camera className="w-4 h-4 text-indigo-400" />
                      <span>{photoFileName ? 'Change Photo' : 'Upload Proof Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    {photoFileName && (
                      <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {photoFileName}
                      </span>
                    )}
                  </div>
                  {photoPreview && (
                    <div className="mt-2 w-32 h-20 rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
                      <img src={photoPreview} alt="Issue preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <AlertTriangle className="w-4 h-4" />
                  {isSubmitting ? 'Logging Ticket...' : 'Submit Grievance Ticket'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Filter controls for complaints */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by ticket, student, room, title..."
                    value={searchLog}
                    onChange={(e) => setSearchLog(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="PLUMBING">Plumbing</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="HOUSEKEEPING">Housekeeping</option>
                    <option value="WIFI_NETWORK">Wi-Fi &amp; Internet</option>
                    <option value="MESS_FOOD">Mess Food</option>
                    <option value="CARPENTRY_FURNITURE">Carpentry</option>
                  </select>
                </div>

                <div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="SUBMITTED">Submitted</option>
                    <option value="ACKNOWLEDGED">Acknowledged</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </div>
              </div>

              {/* Complaints List Cards */}
              <div className="space-y-3">
                {filteredComplaints.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    No complaints matching current filters.
                  </div>
                ) : (
                  filteredComplaints.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{CATEGORY_ICONS[c.category] || '📌'}</span>
                          <div>
                            <span className="font-mono text-[11px] font-bold text-indigo-400 block">{c.ticketId}</span>
                            <h5 className="font-bold text-slate-100 text-sm">{c.title}</h5>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {c.severity === 'EMERGENCY' ? (
                            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                              EMERGENCY
                            </span>
                          ) : c.severity === 'HIGH' ? (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                              HIGH
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-medium">
                              {c.severity}
                            </span>
                          )}

                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            c.status === 'RESOLVED'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : c.status === 'IN_PROGRESS'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {c.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300">{c.description}</p>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-200 font-medium">
                            {c.studentName} ({c.studentRoll})
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono">
                            Room {c.roomNumber} ({c.bedNumber})
                          </span>
                          <span>Slot: {c.preferredTimeSlot}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {c.status !== 'RESOLVED' && onUpdateComplaintStatus && (
                            <button
                              onClick={() => {
                                const note = prompt('Enter resolution notes for this ticket:', 'Fixed and inspected.');
                                if (note !== null) {
                                  onUpdateComplaintStatus(c.id, 'RESOLVED', note);
                                }
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <CheckCheck className="w-3 h-3" />
                              Mark Resolved
                            </button>
                          )}

                          {onConvertToWorkOrder && !c.linkedWorkOrderId && (
                            <button
                              onClick={() => onConvertToWorkOrder(c)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Wrench className="w-3 h-3" />
                              Convert to Work Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
