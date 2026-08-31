import React, { useState, useMemo } from 'react';
import { Room, Student } from '../types';
import { 
  Building2, Users, BedDouble, AlertTriangle, CheckCircle2, ArrowLeftRight, 
  Plus, LogOut, Wrench, Search, Layers, Trash2, Edit3, X, Sparkles, 
  Check, Minus, Bed, DoorOpen, Home, SlidersHorizontal, Info, Download
} from 'lucide-react';

interface RoomManagerProps {
  rooms?: Room[];
  students?: Student[];
  onOpenSwapModal?: (student: Student) => void;
  onInitiateSwap?: (student: Student) => void;
  onVacateRoom?: (roomNumber: string) => void;
  onToggleMaintenance?: (roomId: string) => void;
  onUpdateRoomStatus?: (roomId: string, status: 'AVAILABLE' | 'MAINTENANCE') => void;
  onAllotStudentToRoom?: (roomNumber: string) => void;
  onAddRoom?: (room: Omit<Room, 'id' | 'assignedStudentIds' | 'occupiedBeds'>) => void;
  onAddBatchRooms?: (rooms: Array<Omit<Room, 'id' | 'assignedStudentIds' | 'occupiedBeds'>>) => void;
  onAddBedToRoom?: (roomId: string, extraBeds?: number) => void;
  onRemoveBedFromRoom?: (roomId: string) => void;
  onUpdateRoomDetails?: (roomId: string, updates: Partial<Room>) => void;
  onDeleteRoom?: (roomId: string) => void;
}

const COMMON_AMENITIES = [
  'Attached Bathroom',
  'Air Conditioner (AC)',
  'Balcony View',
  'Study Table & Lamp',
  'High-Speed Wi-Fi 6',
  'Air Cooler',
  'Personal Wardrobe & Locker',
  'Water Geyser',
  'Ergonomic Study Pod',
  'Ceiling Fan',
];

export const RoomManager: React.FC<RoomManagerProps> = ({
  rooms = [],
  students = [],
  onOpenSwapModal,
  onInitiateSwap,
  onVacateRoom,
  onToggleMaintenance,
  onUpdateRoomStatus,
  onAllotStudentToRoom,
  onAddRoom,
  onAddBatchRooms,
  onAddBedToRoom,
  onRemoveBedFromRoom,
  onUpdateRoomDetails,
  onDeleteRoom,
}) => {
  // Filters & State
  const [selectedBlock, setSelectedBlock] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedFloor, setSelectedFloor] = useState('ALL');
  const [roomSearch, setRoomSearch] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<'SINGLE' | 'BATCH'>('SINGLE');
  const [editRoomModal, setEditRoomModal] = useState<Room | null>(null);
  const [quickBedModal, setQuickBedModal] = useState<Room | null>(null);

  // Single Room Form State
  const [singleForm, setSingleForm] = useState({
    roomNumber: '',
    block: 'A-Block (North)',
    customBlock: '',
    floor: 1,
    type: 'DOUBLE' as Room['type'],
    totalBeds: 2,
    monthlyRent: 8500,
    status: 'AVAILABLE' as Room['status'],
    amenities: ['Attached Bathroom', 'Study Table & Lamp', 'High-Speed Wi-Fi 6'],
    customAmenity: '',
  });

  // Batch Room Form State
  const [batchForm, setBatchForm] = useState({
    block: 'A-Block (North)',
    customBlock: '',
    floor: 3,
    startRoomNumber: 301,
    roomCount: 4,
    type: 'DOUBLE' as Room['type'],
    totalBeds: 2,
    monthlyRent: 8500,
    amenities: ['Attached Bathroom', 'Study Table & Lamp', 'High-Speed Wi-Fi 6'],
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Dynamic unique blocks & floors list
  const uniqueBlocks = useMemo(() => {
    const blocks = new Set<string>();
    rooms.forEach((r) => {
      if (r.block) blocks.add(r.block);
    });
    return Array.from(blocks);
  }, [rooms]);

  const uniqueFloors = useMemo(() => {
    const floors = new Set<number>();
    rooms.forEach((r) => {
      if (typeof r.floor === 'number') floors.add(r.floor);
    });
    return Array.from(floors).sort((a, b) => a - b);
  }, [rooms]);

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const q = roomSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.roomNumber.toLowerCase().includes(q) ||
        r.block.toLowerCase().includes(q) ||
        students.some((s) => s.roomNumber === r.roomNumber && s.name.toLowerCase().includes(q));

      const matchesBlock = selectedBlock === 'ALL' || r.block === selectedBlock;
      const matchesStatus = selectedStatus === 'ALL' || r.status === selectedStatus;
      const matchesType = selectedType === 'ALL' || r.type === selectedType;
      const matchesFloor = selectedFloor === 'ALL' || r.floor.toString() === selectedFloor;

      return matchesSearch && matchesBlock && matchesStatus && matchesType && matchesFloor;
    });
  }, [rooms, roomSearch, selectedBlock, selectedStatus, selectedType, selectedFloor, students]);

  // Overall Stats
  const totalBeds = useMemo(() => rooms.reduce((acc, r) => acc + (r.totalBeds || 0), 0), [rooms]);
  const occupiedBeds = useMemo(() => rooms.reduce((acc, r) => acc + (r.occupiedBeds || 0), 0), [rooms]);
  const availableBeds = Math.max(0, totalBeds - occupiedBeds);
  const occupancyRate = Math.round((occupiedBeds / (totalBeds || 1)) * 100);

  // Trigger Toast Notification
  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  // Toggle single amenity
  const toggleSingleAmenity = (amenity: string) => {
    setSingleForm((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists ? prev.amenities.filter((a) => a !== amenity) : [...prev.amenities, amenity],
      };
    });
  };

  const addCustomSingleAmenity = () => {
    if (!singleForm.customAmenity.trim()) return;
    if (!singleForm.amenities.includes(singleForm.customAmenity.trim())) {
      setSingleForm((prev) => ({
        ...prev,
        amenities: [...prev.amenities, prev.customAmenity.trim()],
        customAmenity: '',
      }));
    }
  };

  // Handle Type Change & adjust default beds
  const handleSingleTypeChange = (type: Room['type']) => {
    let defaultBeds = 2;
    let defaultRent = 8500;
    if (type === 'SINGLE') {
      defaultBeds = 1;
      defaultRent = 12000;
    } else if (type === 'DOUBLE') {
      defaultBeds = 2;
      defaultRent = 8500;
    } else if (type === 'TRIPLE') {
      defaultBeds = 3;
      defaultRent = 6500;
    } else if (type === 'DORMITORY') {
      defaultBeds = 4;
      defaultRent = 5000;
    }
    setSingleForm((prev) => ({
      ...prev,
      type,
      totalBeds: defaultBeds,
      monthlyRent: defaultRent,
    }));
  };

  // Handle Single Room Submit
  const handleSingleRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const roomNum = singleForm.roomNumber.trim();
    if (!roomNum) {
      errors.roomNumber = 'Room number is required.';
    } else if (rooms.some((r) => r.roomNumber.toLowerCase() === roomNum.toLowerCase())) {
      errors.roomNumber = `Room #${roomNum} already exists in inventory.`;
    }

    const finalBlock = singleForm.block === 'CUSTOM' ? singleForm.customBlock.trim() : singleForm.block;
    if (!finalBlock) {
      errors.block = 'Block / Wing name is required.';
    }

    if (singleForm.totalBeds < 1) {
      errors.totalBeds = 'Minimum 1 bed required.';
    }

    if (singleForm.monthlyRent <= 0) {
      errors.monthlyRent = 'Please enter a valid monthly rent.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const newRoomPayload = {
      hostelId: 'H1',
      roomNumber: roomNum,
      floor: Number(singleForm.floor),
      block: finalBlock,
      type: singleForm.type,
      totalBeds: Number(singleForm.totalBeds),
      monthlyRent: Number(singleForm.monthlyRent),
      status: singleForm.status,
      amenities: singleForm.amenities,
    };

    onAddRoom?.(newRoomPayload);
    triggerToast(`Room #${roomNum} successfully added with ${singleForm.totalBeds} beds!`);
    setShowAddModal(false);
    setFormErrors({});
    setSingleForm({
      roomNumber: '',
      block: 'A-Block (North)',
      customBlock: '',
      floor: 1,
      type: 'DOUBLE',
      totalBeds: 2,
      monthlyRent: 8500,
      status: 'AVAILABLE',
      amenities: ['Attached Bathroom', 'Study Table & Lamp', 'High-Speed Wi-Fi 6'],
      customAmenity: '',
    });
  };

  // Handle Batch Rooms Submit
  const handleBatchRoomsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const finalBlock = batchForm.block === 'CUSTOM' ? batchForm.customBlock.trim() : batchForm.block;
    if (!finalBlock) {
      errors.batchBlock = 'Block / Wing name is required.';
    }

    const count = Number(batchForm.roomCount);
    if (count < 1 || count > 20) {
      errors.batchCount = 'Please specify between 1 and 20 rooms to generate.';
    }

    const start = Number(batchForm.startRoomNumber);
    if (!start || start < 1) {
      errors.batchStart = 'Starting room number must be a positive integer.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Generate room numbers and check duplicates
    const roomsToCreate: Array<Omit<Room, 'id' | 'assignedStudentIds' | 'occupiedBeds'>> = [];
    const duplicates: string[] = [];

    for (let i = 0; i < count; i++) {
      const roomNum = (start + i).toString();
      if (rooms.some((r) => r.roomNumber.toLowerCase() === roomNum.toLowerCase())) {
        duplicates.push(roomNum);
      } else {
        roomsToCreate.push({
          hostelId: 'H1',
          roomNumber: roomNum,
          floor: Number(batchForm.floor),
          block: finalBlock,
          type: batchForm.type,
          totalBeds: Number(batchForm.totalBeds),
          monthlyRent: Number(batchForm.monthlyRent),
          status: 'AVAILABLE',
          amenities: batchForm.amenities,
        });
      }
    }

    if (duplicates.length > 0) {
      errors.batchStart = `Conflicts detected: Room(s) ${duplicates.join(', ')} already exist.`;
      setFormErrors(errors);
      return;
    }

    if (onAddBatchRooms) {
      onAddBatchRooms(roomsToCreate);
    } else if (onAddRoom) {
      roomsToCreate.forEach((r) => onAddRoom(r));
    }

    triggerToast(`Batch created ${roomsToCreate.length} rooms (${roomsToCreate.map((r) => r.roomNumber).join(', ')}) with ${batchForm.totalBeds} beds each!`);
    setShowAddModal(false);
    setFormErrors({});
  };

  // Export Room & Bed Allocation Matrix to CSV
  const handleExportCSV = () => {
    const headers = [
      'Room Number',
      'Block / Wing',
      'Floor',
      'Category / Type',
      'Total Beds',
      'Occupied Beds',
      'Vacant Beds',
      'Monthly Rent (INR)',
      'Status',
      'Allocated Residents Count',
      'Allocated Student Names',
      'Amenities'
    ];

    const rows = rooms.map((room) => {
      const roomResidents = students.filter(
        (s) => s.roomNumber === room.roomNumber || room.assignedStudentIds?.includes(s.id)
      );

      const residentNames = roomResidents.map((s) => `${s.name} (${s.rollNumber || 'No Roll'}, Bed: ${s.bedNumber || 'Assigned'})`).join('; ');

      return [
        room.roomNumber,
        room.block || 'A-Block',
        `Floor ${room.floor || 1}`,
        room.type || 'STANDARD',
        String(room.totalBeds),
        String(room.occupiedBeds),
        String(Math.max(0, room.totalBeds - room.occupiedBeds)),
        String(room.monthlyRent),
        room.status,
        String(roomResidents.length),
        residentNames || 'VACANT',
        (room.amenities || []).join('; ')
      ];
    });

    const csvContent = [
      headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NativeNest_Room_Allocation_Matrix_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    triggerToast(`Exported ${rooms.length} rooms allocation matrix to CSV successfully!`);
  };

  // Handle Quick Add Bed to Room
  const handleQuickAddBed = (room: Room) => {
    onAddBedToRoom?.(room.id, 1);
    triggerToast(`Added 1 Bed to Room #${room.roomNumber}. New capacity: ${room.totalBeds + 1} beds.`);
  };

  // Handle Quick Remove Bed from Room
  const handleQuickRemoveBed = (room: Room) => {
    if (room.totalBeds <= room.occupiedBeds) {
      alert(`Cannot remove bed: Room #${room.roomNumber} has ${room.occupiedBeds} occupied beds out of ${room.totalBeds}. Vacate a resident first.`);
      return;
    }
    if (room.totalBeds <= 1) {
      alert(`Room #${room.roomNumber} is already at minimum 1 bed capacity.`);
      return;
    }
    onRemoveBedFromRoom?.(room.id);
    triggerToast(`Decreased 1 Bed from Room #${room.roomNumber}. New capacity: ${room.totalBeds - 1} beds.`);
  };

  // Handle Edit Room Submit
  const handleSaveEditRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRoomModal) return;

    if (editRoomModal.totalBeds < editRoomModal.occupiedBeds) {
      alert(`Total beds (${editRoomModal.totalBeds}) cannot be lower than current occupants (${editRoomModal.occupiedBeds}).`);
      return;
    }

    onUpdateRoomDetails?.(editRoomModal.id, {
      block: editRoomModal.block,
      floor: editRoomModal.floor,
      type: editRoomModal.type,
      totalBeds: editRoomModal.totalBeds,
      monthlyRent: editRoomModal.monthlyRent,
      amenities: editRoomModal.amenities,
      status: editRoomModal.occupiedBeds >= editRoomModal.totalBeds ? 'OCCUPIED' : editRoomModal.status,
    });

    triggerToast(`Updated configuration for Room #${editRoomModal.roomNumber}!`);
    setEditRoomModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400/40 animate-bounce">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-semibold">{successToast}</span>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Total Bed Inventory</span>
            <div className="text-xl font-bold text-slate-100 mt-0.5">{totalBeds} Beds</div>
            <span className="text-[11px] text-slate-500">{rooms.length} Active Rooms Configured</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Occupied Beds</span>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">{occupiedBeds} Beds</div>
            <span className="text-[11px] text-emerald-500 font-medium">{occupancyRate}% Total Allotment</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
            <BedDouble className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Available Vacancies</span>
            <div className="text-xl font-bold text-blue-400 mt-0.5">{availableBeds} Free Beds</div>
            <span className="text-[11px] text-slate-500">Ready for instant allotment</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Under Maintenance</span>
            <div className="text-xl font-bold text-amber-400 mt-0.5">
              {rooms.filter((r) => r.status === 'MAINTENANCE').length} Rooms
            </div>
            <span className="text-[11px] text-amber-500/90 font-medium">Locked from allotment</span>
          </div>
        </div>
      </div>

      {/* Control Bar with Add Room Primary Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        {/* Left Side: Search & Filter Inputs */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative min-w-[220px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search room #, block, occupant..."
              value={roomSearch}
              onChange={(e) => setRoomSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Blocks / Wings</option>
            {uniqueBlocks.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Floors</option>
            {uniqueFloors.map((f) => (
              <option key={f} value={f.toString()}>
                {f === 0 ? 'Ground Floor' : `Floor ${f}`}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Room Types</option>
            <option value="SINGLE">Single Occupancy (1 Bed)</option>
            <option value="DOUBLE">Double Occupancy (2 Beds)</option>
            <option value="TRIPLE">Triple Occupancy (3 Beds)</option>
            <option value="DORMITORY">Dormitory (4+ Beds)</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available (Has Vacant Beds)</option>
            <option value="OCCUPIED">Fully Occupied</option>
            <option value="MAINTENANCE">Under Maintenance</option>
            <option value="RESERVED">Reserved</option>
          </select>
        </div>

        {/* Right Side: Primary "Add New Room & Beds" Action Buttons */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Download room and occupancy matrix in CSV format"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export to CSV</span>
          </button>

          <button
            onClick={() => {
              setAddMode('BATCH');
              setShowAddModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Batch Create</span>
          </button>

          <button
            onClick={() => {
              setAddMode('SINGLE');
              setShowAddModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Room</span>
          </button>
        </div>
      </div>

      {/* Filter Stats & Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div>
          Showing <span className="text-slate-200 font-semibold">{filteredRooms.length}</span> of{' '}
          <span className="text-slate-200 font-semibold">{rooms.length}</span> rooms
          {selectedBlock !== 'ALL' && ` in ${selectedBlock}`}
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Occupied
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Maintenance
          </span>
        </div>
      </div>

      {/* Rooms Interactive Grid */}
      {filteredRooms.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto mb-4">
            <DoorOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-200">No rooms match your filter</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-6">
            Try adjusting your search query, block, or status filter, or click below to create a new room.
          </p>
          <button
            onClick={() => {
              setAddMode('SINGLE');
              setShowAddModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Room Here</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRooms.map((room) => {
            const roomStudents = students.filter((s) => s.roomNumber === room.roomNumber && s.status === 'ACTIVE');
            const isFullyOccupied = roomStudents.length >= room.totalBeds;
            const isMaintenance = room.status === 'MAINTENANCE';
            const vacantBedsInRoom = Math.max(0, room.totalBeds - roomStudents.length);

            return (
              <div
                key={room.id}
                className={`bg-slate-900 border rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all duration-200 hover:border-slate-600 ${
                  isMaintenance
                    ? 'border-amber-500/40 bg-amber-950/10'
                    : isFullyOccupied
                    ? 'border-slate-800'
                    : 'border-emerald-500/30'
                }`}
              >
                <div>
                  {/* Room Card Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                          isMaintenance
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : isFullyOccupied
                            ? 'bg-slate-800 text-slate-200 border border-slate-700'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {room.roomNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-slate-100">{room.block}</h4>
                          <button
                            onClick={() => setEditRoomModal(room)}
                            title="Edit room configuration & amenities"
                            className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {room.floor === 0 ? 'Ground Floor' : `Floor ${room.floor}`} • {room.type} Room (₹
                          {room.monthlyRent?.toLocaleString() || 8500}/mo)
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isMaintenance
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : isFullyOccupied
                            ? 'bg-slate-800 text-slate-300 border border-slate-700'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {isMaintenance ? 'Under Repair' : `${roomStudents.length}/${room.totalBeds} Beds`}
                      </span>
                    </div>
                  </div>

                  {/* Bed Capacity Controls Bar */}
                  <div className="mt-3.5 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bed className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-semibold text-slate-300">
                        {room.totalBeds} Bed Slots
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ({vacantBedsInRoom} vacant)
                      </span>
                    </div>

                    {/* Add Bed / Remove Bed Quick Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleQuickRemoveBed(room)}
                        disabled={room.totalBeds <= roomStudents.length || room.totalBeds <= 1}
                        title={
                          room.totalBeds <= roomStudents.length
                            ? 'Cannot reduce below occupied count'
                            : 'Decrease 1 Bed'
                        }
                        className={`p-1 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                          room.totalBeds <= roomStudents.length || room.totalBeds <= 1
                            ? 'opacity-30 cursor-not-allowed border-slate-800 text-slate-600'
                            : 'bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border-slate-700'
                        }`}
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => handleQuickAddBed(room)}
                        title="Add 1 Extra Bed to this room"
                        className="px-2 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Bed</span>
                      </button>
                    </div>
                  </div>

                  {/* Amenities Badges */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(room.amenities || []).map((a, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/60"
                      >
                        {a}
                      </span>
                    ))}
                  </div>

                  {/* Bed Slots & Resident Occupants List */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                      <span>Bed Slots ({roomStudents.length}/{room.totalBeds})</span>
                      <span className="text-[10px] lowercase text-slate-500 font-normal">
                        {vacantBedsInRoom} available
                      </span>
                    </div>

                    {/* Render each Bed Slot from 1 to totalBeds */}
                    <div className="space-y-1.5">
                      {Array.from({ length: room.totalBeds }).map((_, bedIndex) => {
                        const bedNumberLabel = `Bed-${bedIndex + 1}`;
                        const occupant = roomStudents[bedIndex];

                        if (occupant) {
                          return (
                            <div
                              key={occupant.id}
                              className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/90 flex items-center justify-between text-xs group"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400 font-mono text-[10px] flex items-center justify-center font-bold">
                                  B{bedIndex + 1}
                                </span>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-200">{occupant.name}</span>
                                  </div>
                                  <span className="text-[10px] text-indigo-400 font-mono block">
                                    {occupant.rollNumber}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {occupant.messBalance > 0 && (
                                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                    Mess: ₹{occupant.messBalance}
                                  </span>
                                )}

                                <button
                                  onClick={() =>
                                    onOpenSwapModal ? onOpenSwapModal(occupant) : onInitiateSwap?.(occupant)
                                  }
                                  title="Shift or Swap this resident"
                                  className="p-1 rounded-md bg-slate-800 hover:bg-indigo-600/30 text-indigo-400 border border-slate-700 transition-colors cursor-pointer"
                                >
                                  <ArrowLeftRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <div
                              key={bedIndex}
                              className="p-2 rounded-xl bg-slate-950/40 border border-dashed border-slate-800/80 flex items-center justify-between text-xs text-slate-500"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-400 font-mono text-[10px] flex items-center justify-center font-bold">
                                  B{bedIndex + 1}
                                </span>
                                <span className="text-[11px] font-medium text-slate-400">
                                  Vacant Bed Slot
                                </span>
                              </div>

                              <button
                                onClick={() => onAllotStudentToRoom?.(room.roomNumber)}
                                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                              >
                                Ready to Allot
                              </button>
                            </div>
                          );
                        }
                      })}
                    </div>
                  </div>
                </div>

                {/* Room Card Bottom Actions */}
                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (onToggleMaintenance) {
                          onToggleMaintenance(room.id);
                        } else if (onUpdateRoomStatus) {
                          onUpdateRoomStatus(room.id, isMaintenance ? 'AVAILABLE' : 'MAINTENANCE');
                        }
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isMaintenance
                          ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-700'
                      }`}
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>{isMaintenance ? 'Clear Repair Lock' : 'Mark Repair'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {roomStudents.length > 0 ? (
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Are you sure you want to empty and vacate all residents from Room ${room.roomNumber}?`
                            )
                          ) {
                            onVacateRoom?.(room.roomNumber);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Empty Room</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Permanently remove vacant Room #${room.roomNumber} from inventory?`
                            )
                          ) {
                            onDeleteRoom?.(room.id);
                          }
                        }}
                        title="Delete empty room"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 border border-slate-700/60 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. ADD ROOM MODAL (SINGLE OR BATCH) */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Add New Rooms & Beds</h3>
                  <p className="text-xs text-slate-400">Expand hostel capacity with single or batch provisioning</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-2">
              <button
                type="button"
                onClick={() => setAddMode('SINGLE')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  addMode === 'SINGLE'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <DoorOpen className="w-4 h-4" />
                <span>Single Room Setup</span>
              </button>

              <button
                type="button"
                onClick={() => setAddMode('BATCH')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  addMode === 'BATCH'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Batch Room Generation</span>
              </button>
            </div>

            {/* Single Room Form */}
            {addMode === 'SINGLE' && (
              <form onSubmit={handleSingleRoomSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Room Number */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Room Number *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 106, 305, B-201"
                      value={singleForm.roomNumber}
                      onChange={(e) => {
                        setSingleForm({ ...singleForm, roomNumber: e.target.value });
                        if (formErrors.roomNumber) setFormErrors({ ...formErrors, roomNumber: '' });
                      }}
                      className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none ${
                        formErrors.roomNumber ? 'border-rose-500' : 'border-slate-700 focus:border-indigo-500'
                      }`}
                      required
                    />
                    {formErrors.roomNumber && (
                      <span className="text-[11px] text-rose-400 mt-1 block">{formErrors.roomNumber}</span>
                    )}
                  </div>

                  {/* Floor */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Floor Number *
                    </label>
                    <select
                      value={singleForm.floor}
                      onChange={(e) => setSingleForm({ ...singleForm, floor: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value={0}>Ground Floor (Floor 0)</option>
                      <option value={1}>1st Floor</option>
                      <option value={2}>2nd Floor</option>
                      <option value={3}>3rd Floor</option>
                      <option value={4}>4th Floor</option>
                      <option value={5}>5th Floor</option>
                    </select>
                  </div>

                  {/* Block / Wing */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Hostel Block / Wing *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSingleForm({ ...singleForm, block: 'A-Block (North)' })}
                        className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer ${
                          singleForm.block === 'A-Block (North)'
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        A-Block (North)
                      </button>

                      <button
                        type="button"
                        onClick={() => setSingleForm({ ...singleForm, block: 'B-Block (East)' })}
                        className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer ${
                          singleForm.block === 'B-Block (East)'
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        B-Block (East)
                      </button>

                      <button
                        type="button"
                        onClick={() => setSingleForm({ ...singleForm, block: 'CUSTOM' })}
                        className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer ${
                          singleForm.block === 'CUSTOM'
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        + Custom Block
                      </button>
                    </div>

                    {singleForm.block === 'CUSTOM' && (
                      <input
                        type="text"
                        placeholder="Enter block name (e.g. C-Block (South), PG Tower)"
                        value={singleForm.customBlock}
                        onChange={(e) => setSingleForm({ ...singleForm, customBlock: e.target.value })}
                        className="w-full mt-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        required
                      />
                    )}
                  </div>

                  {/* Room Category & Beds */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Room Occupancy Category & Bed Capacity *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => handleSingleTypeChange('SINGLE')}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          singleForm.type === 'SINGLE'
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="text-xs font-bold">Single</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">1 Bed Slot</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSingleTypeChange('DOUBLE')}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          singleForm.type === 'DOUBLE'
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="text-xs font-bold">Double</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">2 Bed Slots</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSingleTypeChange('TRIPLE')}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          singleForm.type === 'TRIPLE'
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="text-xs font-bold">Triple</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">3 Bed Slots</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSingleTypeChange('DORMITORY')}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          singleForm.type === 'DORMITORY'
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="text-xs font-bold">Dormitory</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">4+ Bed Slots</div>
                      </button>
                    </div>
                  </div>

                  {/* Bed Stepper Counter */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">Total Beds in Room</span>
                      <span className="text-[11px] text-slate-500">Each bed receives an identifier (Bed-1, Bed-2...)</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSingleForm({ ...singleForm, totalBeds: Math.max(1, singleForm.totalBeds - 1) })}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center border border-slate-700 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-bold text-slate-100 w-8 text-center">{singleForm.totalBeds}</span>
                      <button
                        type="button"
                        onClick={() => setSingleForm({ ...singleForm, totalBeds: Math.min(10, singleForm.totalBeds + 1) })}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center border border-slate-700 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Monthly Rent */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                    <label className="text-xs font-semibold text-slate-200 block">
                      Monthly Rent (₹) *
                    </label>
                    <input
                      type="number"
                      value={singleForm.monthlyRent}
                      onChange={(e) => setSingleForm({ ...singleForm, monthlyRent: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                      required
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {[6500, 8500, 12000, 15000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setSingleForm({ ...singleForm, monthlyRent: preset })}
                          className={`text-[10px] px-2 py-0.5 rounded cursor-pointer ${
                            singleForm.monthlyRent === preset
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          ₹{preset.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Initial Status */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Initial Status
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSingleForm({ ...singleForm, status: 'AVAILABLE' })}
                        className={`p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          singleForm.status === 'AVAILABLE'
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        Available (Vacant)
                      </button>

                      <button
                        type="button"
                        onClick={() => setSingleForm({ ...singleForm, status: 'MAINTENANCE' })}
                        className={`p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          singleForm.status === 'MAINTENANCE'
                            ? 'bg-amber-600/20 border-amber-500 text-amber-400'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        Under Prep / Maintenance
                      </button>

                      <button
                        type="button"
                        onClick={() => setSingleForm({ ...singleForm, status: 'RESERVED' })}
                        className={`p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          singleForm.status === 'RESERVED'
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        Reserved
                      </button>
                    </div>
                  </div>

                  {/* Amenities Multi-Selector */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Room Amenities
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {COMMON_AMENITIES.map((amenity) => {
                        const isSelected = singleForm.amenities.includes(amenity);
                        return (
                          <button
                            key={amenity}
                            type="button"
                            onClick={() => toggleSingleAmenity(amenity)}
                            className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50 font-semibold'
                                : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-indigo-400" />}
                            <span>{amenity}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Add custom amenity tag..."
                        value={singleForm.customAmenity}
                        onChange={(e) => setSingleForm({ ...singleForm, customAmenity: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomSingleAmenity();
                          }
                        }}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={addCustomSingleAmenity}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700"
                      >
                        Add Tag
                      </button>
                    </div>
                  </div>
                </div>

                {/* Form Footer */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Room & Beds</span>
                  </button>
                </div>
              </form>
            )}

            {/* Batch Room Generation Form */}
            {addMode === 'BATCH' && (
              <form onSubmit={handleBatchRoomsSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-300">
                    <span className="font-bold text-indigo-300 block mb-0.5">Automated Floor & Wing Provisioning</span>
                    Generate a sequence of sequential rooms (e.g. 301 to 306) with matching bed capacities, amenities, and rent schedules in a single operation.
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Starting Room Number */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Starting Room Number *
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 301"
                      value={batchForm.startRoomNumber}
                      onChange={(e) => setBatchForm({ ...batchForm, startRoomNumber: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                      required
                    />
                    {formErrors.batchStart && (
                      <span className="text-[11px] text-rose-400 mt-1 block">{formErrors.batchStart}</span>
                    )}
                  </div>

                  {/* Number of Rooms to generate */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Number of Rooms to Generate *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={batchForm.roomCount}
                      onChange={(e) => setBatchForm({ ...batchForm, roomCount: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                      required
                    />
                    {formErrors.batchCount && (
                      <span className="text-[11px] text-rose-400 mt-1 block">{formErrors.batchCount}</span>
                    )}
                  </div>

                  {/* Floor */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Target Floor *
                    </label>
                    <select
                      value={batchForm.floor}
                      onChange={(e) => setBatchForm({ ...batchForm, floor: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value={0}>Ground Floor (0)</option>
                      <option value={1}>1st Floor</option>
                      <option value={2}>2nd Floor</option>
                      <option value={3}>3rd Floor</option>
                      <option value={4}>4th Floor</option>
                      <option value={5}>5th Floor</option>
                    </select>
                  </div>

                  {/* Block Selection */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Hostel Block / Wing *
                    </label>
                    <select
                      value={batchForm.block}
                      onChange={(e) => setBatchForm({ ...batchForm, block: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="A-Block (North)">A-Block (North)</option>
                      <option value="B-Block (East)">B-Block (East)</option>
                      <option value="C-Block (South)">C-Block (South)</option>
                      <option value="PG Tower Wing">PG Tower Wing</option>
                    </select>
                  </div>

                  {/* Beds per room */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Beds per Room *
                    </label>
                    <select
                      value={batchForm.totalBeds}
                      onChange={(e) => {
                        const beds = Number(e.target.value);
                        let type: Room['type'] = 'DOUBLE';
                        let rent = 8500;
                        if (beds === 1) {
                          type = 'SINGLE';
                          rent = 12000;
                        } else if (beds === 2) {
                          type = 'DOUBLE';
                          rent = 8500;
                        } else if (beds === 3) {
                          type = 'TRIPLE';
                          rent = 6500;
                        } else {
                          type = 'DORMITORY';
                          rent = 5000;
                        }
                        setBatchForm({ ...batchForm, totalBeds: beds, type, monthlyRent: rent });
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value={1}>1 Bed (Single Occupancy)</option>
                      <option value={2}>2 Beds (Double Occupancy)</option>
                      <option value={3}>3 Beds (Triple Occupancy)</option>
                      <option value={4}>4 Beds (Dormitory)</option>
                      <option value={6}>6 Beds (Large Dormitory)</option>
                    </select>
                  </div>

                  {/* Monthly Rent */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Monthly Rent per Bed/Room (₹) *
                    </label>
                    <input
                      type="number"
                      value={batchForm.monthlyRent}
                      onChange={(e) => setBatchForm({ ...batchForm, monthlyRent: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                {/* Batch Preview Pill List */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Preview of Generated Sequence ({batchForm.roomCount} Rooms, {batchForm.roomCount * batchForm.totalBeds} Total Beds):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: Math.min(20, Math.max(1, batchForm.roomCount)) }).map((_, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 text-indigo-300 text-xs font-mono font-bold border border-slate-700"
                      >
                        Room {batchForm.startRoomNumber + i} ({batchForm.totalBeds}B)
                      </span>
                    ))}
                  </div>
                </div>

                {/* Form Footer */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate {batchForm.roomCount} Rooms</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. EDIT ROOM CONFIGURATION & BED SETUP MODAL */}
      {/* ========================================================================= */}
      {editRoomModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl my-8">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    Configure Room #{editRoomModal.roomNumber}
                  </h3>
                  <p className="text-xs text-slate-400">Adjust bed capacity, rent, or amenities</p>
                </div>
              </div>
              <button
                onClick={() => setEditRoomModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditRoom} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Block / Wing
                  </label>
                  <input
                    type="text"
                    value={editRoomModal.block}
                    onChange={(e) => setEditRoomModal({ ...editRoomModal, block: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Floor Number
                  </label>
                  <input
                    type="number"
                    value={editRoomModal.floor}
                    onChange={(e) => setEditRoomModal({ ...editRoomModal, floor: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Total Beds Stepper */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Total Bed Capacity</span>
                  <span className="text-[11px] text-slate-500">
                    Currently occupied: {editRoomModal.occupiedBeds} beds
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (editRoomModal.totalBeds > editRoomModal.occupiedBeds && editRoomModal.totalBeds > 1) {
                        const newBeds = editRoomModal.totalBeds - 1;
                        let newType = editRoomModal.type;
                        if (newBeds === 1) newType = 'SINGLE';
                        else if (newBeds === 2) newType = 'DOUBLE';
                        else if (newBeds === 3) newType = 'TRIPLE';
                        else if (newBeds > 3) newType = 'DORMITORY';
                        setEditRoomModal({ ...editRoomModal, totalBeds: newBeds, type: newType });
                      }
                    }}
                    disabled={editRoomModal.totalBeds <= editRoomModal.occupiedBeds || editRoomModal.totalBeds <= 1}
                    className="w-8 h-8 rounded-lg bg-slate-800 text-slate-200 font-bold flex items-center justify-center border border-slate-700 disabled:opacity-30 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-bold text-slate-100 w-8 text-center">{editRoomModal.totalBeds}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newBeds = editRoomModal.totalBeds + 1;
                      let newType = editRoomModal.type;
                      if (newBeds === 1) newType = 'SINGLE';
                      else if (newBeds === 2) newType = 'DOUBLE';
                      else if (newBeds === 3) newType = 'TRIPLE';
                      else if (newBeds > 3) newType = 'DORMITORY';
                      setEditRoomModal({ ...editRoomModal, totalBeds: newBeds, type: newType });
                    }}
                    className="w-8 h-8 rounded-lg bg-slate-800 text-slate-200 font-bold flex items-center justify-center border border-slate-700 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Monthly Rent */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Monthly Rent (₹)
                </label>
                <input
                  type="number"
                  value={editRoomModal.monthlyRent}
                  onChange={(e) => setEditRoomModal({ ...editRoomModal, monthlyRent: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Operational Status
                </label>
                <select
                  value={editRoomModal.status}
                  onChange={(e) => setEditRoomModal({ ...editRoomModal, status: e.target.value as Room['status'] })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="OCCUPIED">Occupied</option>
                  <option value="MAINTENANCE">Maintenance Lock</option>
                  <option value="RESERVED">Reserved</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditRoomModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
