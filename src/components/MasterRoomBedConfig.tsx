import React, { useState, useMemo } from 'react';
import { Room, Student, BedConfig, RoomCategory, VentilationType, WashroomType } from '../types';
import { 
  Building2, Bed, Maximize2, DollarSign, Layers, Plus, Trash2, Edit3, 
  CheckCircle2, AlertTriangle, Search, Filter, RefreshCw, SlidersHorizontal,
  ChevronDown, ChevronRight, Check, X, Shield, Sparkles, Wind, Droplets,
  ArrowRight, Users, Info, Calculator, Percent, LayoutGrid, ListFilter, Download,
  FileSpreadsheet, Lock
} from 'lucide-react';

interface MasterRoomBedConfigProps {
  rooms: Room[];
  students: Student[];
  onAddRoom: (room: Omit<Room, 'id' | 'assignedStudentIds' | 'occupiedBeds'>) => void;
  onAddBatchRooms: (rooms: Array<Omit<Room, 'id' | 'assignedStudentIds' | 'occupiedBeds'>>) => void;
  onUpdateRoomDetails?: (roomId: string, updates: Partial<Room>) => void;
  onUpdateRoom?: (roomId: string, updates: Partial<Room>) => void;
  onAddBedToRoom?: (roomId: string, bedData?: Partial<BedConfig>) => void;
  onAddBed?: (roomId: string, bedData?: Partial<BedConfig>) => void;
  onRemoveBedFromRoom?: (roomId: string, bedId?: string) => void;
  onRemoveBed?: (roomId: string, bedId?: string) => void;
  onUpdateBedInRoom?: (roomId: string, bedId: string, updates: Partial<BedConfig>) => void;
  onUpdateBed?: (roomId: string, bedId: string, updates: Partial<BedConfig>) => void;
  onDeleteRoom: (roomId: string) => void;
  onResetAllData?: (mode: 'FULL_SEED' | 'EMPTY_SLATE') => void;
  onResetData?: (mode: 'FULL_SEED' | 'EMPTY_SLATE') => void;
  onInitiateSwap?: (student: Student) => void;
}

const CATEGORY_DEFAULTS: Record<RoomCategory, { label: string; minSqFt: number; maxSqFt: number; desc: string; baseRatePerSqFt: number }> = {
  COMPACT: { label: 'Compact / Studio', minSqFt: 100, maxSqFt: 140, desc: 'Optimized space for 1 occupant or cozy twin', baseRatePerSqFt: 80 },
  STANDARD: { label: 'Standard Room', minSqFt: 150, maxSqFt: 210, desc: 'Classic double/triple student residence room', baseRatePerSqFt: 60 },
  DELUXE: { label: 'Deluxe Room', minSqFt: 220, maxSqFt: 300, desc: 'Spacious airy room with balcony & attached bath', baseRatePerSqFt: 55 },
  PREMIUM_SUITE: { label: 'Executive Suite', minSqFt: 310, maxSqFt: 420, desc: 'Single/Double executive studio with AC & ensuite', baseRatePerSqFt: 75 },
  STUDIO_DORM: { label: 'Dormitory Hall', minSqFt: 400, maxSqFt: 650, desc: 'Multi-bed community floor with bunk sets & lockers', baseRatePerSqFt: 40 },
};

export const MasterRoomBedConfig: React.FC<MasterRoomBedConfigProps> = ({
  rooms = [],
  students = [],
  onAddRoom,
  onAddBatchRooms,
  onUpdateRoomDetails,
  onUpdateRoom,
  onAddBedToRoom,
  onAddBed,
  onRemoveBedFromRoom,
  onRemoveBed,
  onUpdateBedInRoom,
  onUpdateBed,
  onDeleteRoom,
  onResetAllData,
  onResetData,
  onInitiateSwap,
}) => {
  // Navigation & View Filters
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE' | 'MATRIX'>('CARDS');
  const [selectedBlock, setSelectedBlock] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedVentilation, setSelectedVentilation] = useState('ALL');
  const [selectedFloor, setSelectedFloor] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null);

  // Modals & Reset Confirmation State
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [modalMode, setModalMode] = useState<'SINGLE' | 'BATCH'>('SINGLE');
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedResetMode, setSelectedResetMode] = useState<'FULL_SEED' | 'EMPTY_SLATE'>('FULL_SEED');
  const [resetConfirmInput, setResetConfirmInput] = useState('');
  const [editRoomModal, setEditRoomModal] = useState<Room | null>(null);
  const [editBedModal, setEditBedModal] = useState<{ room: Room; bed: BedConfig } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Unified reset executor
  const executeReset = (mode: 'FULL_SEED' | 'EMPTY_SLATE') => {
    if (onResetAllData) {
      onResetAllData(mode);
    } else if (onResetData) {
      onResetData(mode);
    }
  };

  // Export Room & Bed Allocation Matrix to CSV
  const handleExportCSV = () => {
    const headers = [
      'Room Number',
      'Block / Wing',
      'Floor',
      'Category',
      'Room Size (Sq Ft)',
      'Dimensions',
      'Ventilation',
      'Washroom',
      'Total Beds',
      'Occupied Beds',
      'Vacant Beds',
      'Base Room Rent (INR)',
      'Bed Number',
      'Bed Label',
      'Bed Type',
      'Bed Position',
      'Bed Monthly Rent (INR)',
      'Bed Status',
      'Resident Name',
      'Roll Number',
      'Mobile Number',
      'Department',
      'Academic Year',
      'Police Verification',
      'Hostel Fee Due (INR)',
      'Mess Balance (INR)',
      'Room Amenities'
    ];

    const rows: string[][] = [];

    rooms.forEach((room) => {
      const beds = room.beds && room.beds.length > 0 ? room.beds : [
        {
          id: `bed_fallback_${room.id}`,
          bedNumber: 'Bed-1',
          label: 'Primary Bed',
          bedType: 'SINGLE_COT' as BedConfig['bedType'],
          position: 'WINDOW_SIDE' as BedConfig['position'],
          monthlyRent: room.monthlyRent,
          status: (room.status === 'OCCUPIED' ? 'OCCUPIED' : 'AVAILABLE') as BedConfig['status']
        }
      ];

      beds.forEach((bed) => {
        const resident = students.find(
          (s) => s.roomNumber === room.roomNumber && (s.bedNumber === bed.bedNumber || s.bedNumber === bed.label)
        ) || (room.assignedStudentIds?.length ? students.find((s) => s.roomNumber === room.roomNumber) : undefined);

        rows.push([
          room.roomNumber,
          room.block || 'A-Block',
          `Floor ${room.floor || 1}`,
          room.roomCategory || room.type || 'STANDARD',
          `${room.roomSizeSqFt || 180} Sq Ft`,
          room.dimensions || '14ft x 14ft',
          room.ventilationType || 'CROSS_VENTILATED',
          room.washroomType || 'ATTACHED_WESTERN',
          String(room.totalBeds),
          String(room.occupiedBeds),
          String(Math.max(0, room.totalBeds - room.occupiedBeds)),
          String(room.baseRoomRent || room.monthlyRent * room.totalBeds),
          bed.bedNumber,
          bed.label || bed.bedNumber,
          bed.bedType || 'SINGLE_COT',
          bed.position || 'CENTER',
          String(bed.monthlyRent || room.monthlyRent),
          bed.status || (resident ? 'OCCUPIED' : 'AVAILABLE'),
          resident ? resident.name : 'VACANT',
          resident ? resident.rollNumber : 'N/A',
          resident ? resident.mobile : 'N/A',
          resident ? resident.department : 'N/A',
          resident ? `Year ${resident.year}` : 'N/A',
          resident ? resident.policeVerificationStatus : 'N/A',
          resident ? String(resident.feeBalance) : '0',
          resident ? String(resident.messBalance) : '0',
          (room.amenities || []).join('; ')
        ]);
      });
    });

    const csvContent = [
      headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NativeNest_Room_Bed_Allocation_Matrix_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Exported allocation matrix (${rows.length} bed slots) to CSV successfully!`);
  };

  // Single Room Master Form State
  const [singleForm, setSingleForm] = useState({
    roomNumber: '',
    block: 'A-Block (North)',
    customBlock: '',
    floor: 1,
    roomSizeSqFt: 200,
    dimensions: '14ft x 14.5ft',
    roomCategory: 'STANDARD' as RoomCategory,
    ventilationType: 'CROSS_VENTILATED' as VentilationType,
    washroomType: 'ATTACHED_WESTERN' as WashroomType,
    type: 'DOUBLE' as Room['type'],
    totalBeds: 2,
    baseRoomRent: 17000,
    monthlyRent: 8500,
    pricingModel: 'VARIABLE_BED_TIER' as 'PER_BED' | 'PER_ROOM' | 'VARIABLE_BED_TIER',
    amenities: ['Attached Bathroom', 'Study Table', 'High-Speed Wi-Fi 6'],
    customAmenity: '',
    // Detailed initial beds
    beds: [
      {
        id: 'b1',
        bedNumber: 'Bed-1',
        label: 'Window Side Bed',
        bedType: 'DELUXE_COT' as BedConfig['bedType'],
        position: 'WINDOW_SIDE' as BedConfig['position'],
        monthlyRent: 9000,
        status: 'AVAILABLE' as BedConfig['status'],
        features: ['Window Airflow', 'Reading Lamp', 'Underbed Locker'],
      },
      {
        id: 'b2',
        bedNumber: 'Bed-2',
        label: 'Standard Bed',
        bedType: 'SINGLE_COT' as BedConfig['bedType'],
        position: 'CORNER' as BedConfig['position'],
        monthlyRent: 8000,
        status: 'AVAILABLE' as BedConfig['status'],
        features: ['Corner Privacy', 'Desk Power Socket'],
      },
    ],
  });

  // Batch Form State
  const [batchForm, setBatchForm] = useState({
    block: 'A-Block (North)',
    customBlock: '',
    floor: 3,
    startRoomNumber: 301,
    roomCount: 4,
    roomSizeSqFt: 220,
    dimensions: '15ft x 14.5ft',
    roomCategory: 'DELUXE' as RoomCategory,
    ventilationType: 'CROSS_VENTILATED' as VentilationType,
    washroomType: 'ATTACHED_WESTERN' as WashroomType,
    type: 'DOUBLE' as Room['type'],
    totalBeds: 2,
    monthlyRentPerBed: 9000,
    amenities: ['Attached Bathroom', 'Study Table', 'Balcony View', 'Wi-Fi 6'],
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Aggregated Stats
  const stats = useMemo(() => {
    const totalRoomCount = rooms.length;
    const totalBedsCount = rooms.reduce((acc, r) => acc + (r.totalBeds || 0), 0);
    const occupiedBedsCount = rooms.reduce((acc, r) => acc + (r.occupiedBeds || 0), 0);
    const vacantBedsCount = Math.max(0, totalBedsCount - occupiedBedsCount);
    const totalSqFt = rooms.reduce((acc, r) => acc + (r.roomSizeSqFt || 180), 0);
    const avgSqFt = totalRoomCount > 0 ? Math.round(totalSqFt / totalRoomCount) : 0;
    
    // Calculate total potential monthly revenue
    let monthlyPotentialRevenue = 0;
    rooms.forEach((r) => {
      if (r.beds && r.beds.length > 0) {
        monthlyPotentialRevenue += r.beds.reduce((sum, b) => sum + (b.monthlyRent || r.monthlyRent), 0);
      } else {
        monthlyPotentialRevenue += (r.monthlyRent || 8000) * (r.totalBeds || 1);
      }
    });

    const avgRentPerBed = totalBedsCount > 0 ? Math.round(monthlyPotentialRevenue / totalBedsCount) : 0;

    return {
      totalRoomCount,
      totalBedsCount,
      occupiedBedsCount,
      vacantBedsCount,
      totalSqFt,
      avgSqFt,
      monthlyPotentialRevenue,
      avgRentPerBed,
      occupancyRate: totalBedsCount > 0 ? Math.round((occupiedBedsCount / totalBedsCount) * 100) : 0,
    };
  }, [rooms]);

  // Unique Blocks and Floors
  const uniqueBlocks = useMemo(() => {
    const set = new Set<string>();
    rooms.forEach((r) => r.block && set.add(r.block));
    return Array.from(set);
  }, [rooms]);

  const uniqueFloors = useMemo(() => {
    const set = new Set<number>();
    rooms.forEach((r) => typeof r.floor === 'number' && set.add(r.floor));
    return Array.from(set).sort((a, b) => a - b);
  }, [rooms]);

  // Filtered Rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.roomNumber.toLowerCase().includes(q) ||
        r.block.toLowerCase().includes(q) ||
        (r.dimensions && r.dimensions.toLowerCase().includes(q)) ||
        (r.beds && r.beds.some((b) => b.label?.toLowerCase().includes(q) || b.bedNumber.toLowerCase().includes(q))) ||
        students.some((s) => s.roomNumber === r.roomNumber && s.name.toLowerCase().includes(q));

      const matchesBlock = selectedBlock === 'ALL' || r.block === selectedBlock;
      const matchesCategory = selectedCategory === 'ALL' || r.roomCategory === selectedCategory;
      const matchesVentilation = selectedVentilation === 'ALL' || r.ventilationType === selectedVentilation;
      const matchesFloor = selectedFloor === 'ALL' || r.floor.toString() === selectedFloor;

      return matchesSearch && matchesBlock && matchesCategory && matchesVentilation && matchesFloor;
    });
  }, [rooms, searchQuery, selectedBlock, selectedCategory, selectedVentilation, selectedFloor, students]);

  // Dynamic Rent Formula Estimator for the form
  const calculateSuggestedRent = (
    sqFt: number,
    bedsCount: number,
    ventilation: VentilationType,
    washroom: WashroomType,
    category: RoomCategory
  ) => {
    const baseRate = CATEGORY_DEFAULTS[category]?.baseRatePerSqFt || 60;
    let roomRent = sqFt * baseRate;

    if (ventilation === 'AC_INVERTER') roomRent += 4500;
    else if (ventilation === 'CENTRAL_COOLING') roomRent += 2000;

    if (washroom === 'DELUXE_ENSUITE') roomRent += 2500;
    else if (washroom === 'ATTACHED_WESTERN') roomRent += 1500;
    else if (washroom === 'COMMON_SHARED') roomRent -= 1000;

    const perBedRent = Math.round(roomRent / Math.max(1, bedsCount) / 100) * 100;
    return {
      totalRoomRent: Math.round(roomRent / 100) * 100,
      perBedRent,
    };
  };

  // Update Bed configuration inside Single Room Form when bed count or size changes
  const handleBedCountChange = (newCount: number) => {
    const count = Math.max(1, Math.min(12, newCount));
    let type: Room['type'] = 'DOUBLE';
    if (count === 1) type = 'SINGLE';
    else if (count === 2) type = 'DOUBLE';
    else if (count === 3) type = 'TRIPLE';
    else type = 'DORMITORY';

    const calculated = calculateSuggestedRent(
      singleForm.roomSizeSqFt,
      count,
      singleForm.ventilationType,
      singleForm.washroomType,
      singleForm.roomCategory
    );

    // Generate bed list
    const newBeds: BedConfig[] = [];
    for (let i = 1; i <= count; i++) {
      const isWindow = i === 1;
      const isCorner = i === 2 && count > 1;
      const isBunk = count >= 4;
      const isUpper = isBunk && i % 2 === 0;

      let bedRent = calculated.perBedRent;
      if (isWindow) bedRent += Math.round(calculated.perBedRent * 0.08 / 100) * 100;
      else if (isUpper) bedRent -= Math.round(calculated.perBedRent * 0.08 / 100) * 100;

      newBeds.push({
        id: `bed_new_${i}`,
        bedNumber: `Bed-${i}`,
        label: isWindow
          ? 'Window Side Cot'
          : isUpper
          ? 'Upper Bunk Slot'
          : isBunk
          ? 'Lower Bunk Slot'
          : isCorner
          ? 'Corner Quiet Cot'
          : `Bed Slot ${i}`,
        bedType: isBunk ? (isUpper ? 'BUNK_UPPER' : 'BUNK_LOWER') : isWindow ? 'DELUXE_COT' : 'SINGLE_COT',
        position: isWindow ? 'WINDOW_SIDE' : isCorner ? 'CORNER' : isUpper ? 'WINDOW_SIDE' : 'CENTER',
        monthlyRent: bedRent,
        status: 'AVAILABLE',
        features: isWindow
          ? ['Window Airflow', 'Reading Lamp']
          : isUpper
          ? ['Upper Deck Privacy', 'Ceiling Draft']
          : ['Dedicated Power Strip', 'Underbed Locker'],
      });
    }

    setSingleForm((prev) => ({
      ...prev,
      totalBeds: count,
      type,
      monthlyRent: calculated.perBedRent,
      baseRoomRent: calculated.totalRoomRent,
      beds: newBeds,
    }));
  };

  // Update Size and Recalculate
  const handleSizeChange = (newSqFt: number) => {
    let category: RoomCategory = 'STANDARD';
    if (newSqFt <= 140) category = 'COMPACT';
    else if (newSqFt <= 210) category = 'STANDARD';
    else if (newSqFt <= 300) category = 'DELUXE';
    else if (newSqFt <= 420) category = 'PREMIUM_SUITE';
    else category = 'STUDIO_DORM';

    const calculated = calculateSuggestedRent(
      newSqFt,
      singleForm.totalBeds,
      singleForm.ventilationType,
      singleForm.washroomType,
      category
    );

    // Approximate dimensions
    const width = Math.round(Math.sqrt(newSqFt * 0.85) * 10) / 10;
    const length = Math.round((newSqFt / width) * 10) / 10;
    const dimensions = `${width}ft x ${length}ft`;

    // Recalculate bed rents
    const updatedBeds = singleForm.beds.map((b, i) => {
      const isWindow = b.position === 'WINDOW_SIDE';
      const isUpper = b.bedType === 'BUNK_UPPER';
      let rent = calculated.perBedRent;
      if (isWindow) rent += Math.round(calculated.perBedRent * 0.08 / 100) * 100;
      else if (isUpper) rent -= Math.round(calculated.perBedRent * 0.08 / 100) * 100;
      return { ...b, monthlyRent: rent };
    });

    setSingleForm((prev) => ({
      ...prev,
      roomSizeSqFt: newSqFt,
      roomCategory: category,
      dimensions,
      baseRoomRent: calculated.totalRoomRent,
      monthlyRent: calculated.perBedRent,
      beds: updatedBeds,
    }));
  };

  // Update individual bed rent inside the form
  const handleFormBedRentChange = (bedIndex: number, newRent: number) => {
    const updatedBeds = [...singleForm.beds];
    if (updatedBeds[bedIndex]) {
      updatedBeds[bedIndex] = { ...updatedBeds[bedIndex], monthlyRent: Number(newRent) };
      const avg = Math.round(updatedBeds.reduce((s, b) => s + b.monthlyRent, 0) / updatedBeds.length);
      setSingleForm((prev) => ({ ...prev, beds: updatedBeds, monthlyRent: avg }));
    }
  };

  // Submit Single Room Form
  const handleSingleRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const roomNum = singleForm.roomNumber.trim();
    if (!roomNum) {
      errors.roomNumber = 'Room number is required.';
    } else if (rooms.some((r) => r.roomNumber.toLowerCase() === roomNum.toLowerCase())) {
      errors.roomNumber = `Room #${roomNum} already exists in master inventory.`;
    }

    const finalBlock = singleForm.block === 'CUSTOM' ? singleForm.customBlock.trim() : singleForm.block;
    if (!finalBlock) {
      errors.block = 'Block / Wing name is required.';
    }

    if (singleForm.roomSizeSqFt < 80) {
      errors.roomSize = 'Room size must be at least 80 sq ft.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Prepare complete room payload with beds
    const bedsPayload: BedConfig[] = singleForm.beds.map((b, idx) => ({
      ...b,
      id: `bed_${Date.now()}_${idx}`,
      bedNumber: b.bedNumber || `Bed-${idx + 1}`,
      monthlyRent: Number(b.monthlyRent) || singleForm.monthlyRent,
      status: 'AVAILABLE',
    }));

    const newRoom: Omit<Room, 'id' | 'assignedStudentIds' | 'occupiedBeds'> = {
      hostelId: 'H1',
      roomNumber: roomNum,
      floor: Number(singleForm.floor),
      block: finalBlock,
      roomSizeSqFt: Number(singleForm.roomSizeSqFt),
      dimensions: singleForm.dimensions || `${Math.round(Math.sqrt(singleForm.roomSizeSqFt))}ft x ${Math.round(Math.sqrt(singleForm.roomSizeSqFt))}ft`,
      roomCategory: singleForm.roomCategory,
      ventilationType: singleForm.ventilationType,
      washroomType: singleForm.washroomType,
      type: singleForm.type,
      totalBeds: Number(singleForm.totalBeds),
      baseRoomRent: Number(singleForm.baseRoomRent),
      monthlyRent: Number(singleForm.monthlyRent),
      pricingModel: singleForm.pricingModel,
      beds: bedsPayload,
      status: 'AVAILABLE',
      amenities: singleForm.amenities,
    };

    onAddRoom(newRoom);
    showToast(`Master Room #${roomNum} (${singleForm.roomSizeSqFt} sq ft, ${singleForm.totalBeds} Beds) successfully created!`);
    setShowAddRoomModal(false);
    setFormErrors({});
  };

  // Submit Batch Rooms
  const handleBatchRoomsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const finalBlock = batchForm.block === 'CUSTOM' ? batchForm.customBlock.trim() : batchForm.block;
    if (!finalBlock) {
      errors.batchBlock = 'Block / Wing name is required.';
    }

    const count = Number(batchForm.roomCount);
    if (count < 1 || count > 25) {
      errors.batchCount = 'Please specify between 1 and 25 rooms.';
    }

    const start = Number(batchForm.startRoomNumber);
    if (!start || start < 1) {
      errors.batchStart = 'Starting room number must be a positive integer.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const roomsToCreate: Array<Omit<Room, 'id' | 'assignedStudentIds' | 'occupiedBeds'>> = [];
    const duplicates: string[] = [];

    for (let i = 0; i < count; i++) {
      const roomNum = (start + i).toString();
      if (rooms.some((r) => r.roomNumber.toLowerCase() === roomNum.toLowerCase())) {
        duplicates.push(roomNum);
      } else {
        const bedsList: BedConfig[] = [];
        const bedTotal = Number(batchForm.totalBeds);
        for (let b = 1; b <= bedTotal; b++) {
          const isWindow = b === 1;
          const isUpper = bedTotal >= 4 && b % 2 === 0;
          let bRent = Number(batchForm.monthlyRentPerBed);
          if (isWindow) bRent += 400;
          if (isUpper) bRent -= 400;

          bedsList.push({
            id: `bed_batch_${roomNum}_${b}`,
            bedNumber: `Bed-${b}`,
            label: isWindow ? 'Window Bay Cot' : isUpper ? 'Upper Bunk' : `Bed Slot ${b}`,
            bedType: bedTotal >= 4 ? (isUpper ? 'BUNK_UPPER' : 'BUNK_LOWER') : isWindow ? 'DELUXE_COT' : 'SINGLE_COT',
            position: isWindow ? 'WINDOW_SIDE' : 'CENTER',
            monthlyRent: bRent,
            status: 'AVAILABLE',
            features: isWindow ? ['Window Breeze', 'Lamp'] : ['Locker', 'Power Socket'],
          });
        }

        roomsToCreate.push({
          hostelId: 'H1',
          roomNumber: roomNum,
          floor: Number(batchForm.floor),
          block: finalBlock,
          roomSizeSqFt: Number(batchForm.roomSizeSqFt),
          dimensions: batchForm.dimensions,
          roomCategory: batchForm.roomCategory,
          ventilationType: batchForm.ventilationType,
          washroomType: batchForm.washroomType,
          type: batchForm.type,
          totalBeds: bedTotal,
          baseRoomRent: Number(batchForm.monthlyRentPerBed) * bedTotal,
          monthlyRent: Number(batchForm.monthlyRentPerBed),
          pricingModel: 'VARIABLE_BED_TIER',
          beds: bedsList,
          status: 'AVAILABLE',
          amenities: batchForm.amenities,
        });
      }
    }

    if (duplicates.length > 0) {
      errors.batchStart = `Conflicts: Room(s) ${duplicates.join(', ')} already exist.`;
      setFormErrors(errors);
      return;
    }

    onAddBatchRooms(roomsToCreate);
    showToast(`Successfully batch provisioned ${roomsToCreate.length} rooms (${roomsToCreate.map((r) => r.roomNumber).join(', ')}) with ${batchForm.totalBeds} beds each!`);
    setShowAddRoomModal(false);
    setFormErrors({});
  };

  // Quick Add Bed to existing Room
  const handleQuickAddBed = (room: Room) => {
    const newBedNum = (room.totalBeds || 0) + 1;
    const defaultRent = room.monthlyRent || 8000;
    
    onAddBedToRoom(room.id, {
      bedNumber: `Bed-${newBedNum}`,
      label: `Bed Slot ${newBedNum} (${room.roomCategory || 'Standard'})`,
      bedType: room.totalBeds >= 3 ? 'BUNK_UPPER' : 'SINGLE_COT',
      position: 'CORNER',
      monthlyRent: defaultRent,
      status: 'AVAILABLE',
      features: ['Locker', 'Desk Lamp'],
    });

    showToast(`Added Bed-${newBedNum} (₹${defaultRent.toLocaleString()}/mo) to Room #${room.roomNumber}!`);
  };

  // Save Edit Bed Modal
  const handleSaveBedModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBedModal) return;

    onUpdateBedInRoom(editBedModal.room.id, editBedModal.bed.id, {
      label: editBedModal.bed.label,
      bedType: editBedModal.bed.bedType,
      position: editBedModal.bed.position,
      monthlyRent: Number(editBedModal.bed.monthlyRent),
      features: editBedModal.bed.features,
    });

    showToast(`Updated Bed ${editBedModal.bed.bedNumber} in Room #${editBedModal.room.roomNumber}!`);
    setEditBedModal(null);
  };

  // Save Edit Room Modal
  const handleSaveEditRoomModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRoomModal) return;

    onUpdateRoomDetails(editRoomModal.id, {
      block: editRoomModal.block,
      floor: editRoomModal.floor,
      roomSizeSqFt: Number(editRoomModal.roomSizeSqFt),
      dimensions: editRoomModal.dimensions,
      roomCategory: editRoomModal.roomCategory,
      ventilationType: editRoomModal.ventilationType,
      washroomType: editRoomModal.washroomType,
      baseRoomRent: Number(editRoomModal.baseRoomRent),
      monthlyRent: Number(editRoomModal.monthlyRent),
      amenities: editRoomModal.amenities,
    });

    showToast(`Updated Master Specs for Room #${editRoomModal.roomNumber}!`);
    setEditRoomModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-indigo-400/40 animate-bounce">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner with Executive Reset / Provisioning Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold text-slate-100">Master Room &amp; Bed Configuration</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Hostel Asset Architect
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure custom room numbers, physical room dimensions (Sq Ft), bed capacity &amp; variable rent pricing tiers.
                </p>
              </div>
            </div>
          </div>

          {/* Top Level Master Actions */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              title="Download full room and bed allocation matrix in CSV format"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export to CSV</span>
            </button>

            <button
              onClick={() => {
                setSelectedResetMode('FULL_SEED');
                setResetConfirmInput('');
                setShowResetModal(true);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
              title="Reset inventory or re-seed with variable size & rent models"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset &amp; Re-seed</span>
            </button>

            <button
              onClick={() => {
                setModalMode('BATCH');
                setShowAddRoomModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Batch Generate</span>
            </button>

            <button
              onClick={() => {
                setModalMode('SINGLE');
                setShowAddRoomModal(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Master Room &amp; Beds</span>
            </button>
          </div>
        </div>

        {/* Master Asset Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-medium block">Total Rooms</span>
            <div className="text-lg font-bold text-slate-100 mt-1">{stats.totalRoomCount} Units</div>
            <span className="text-[10px] text-slate-500">{uniqueBlocks.length} Blocks / Wings</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-medium block">Bed Capacity</span>
            <div className="text-lg font-bold text-indigo-400 mt-1">{stats.totalBedsCount} Beds</div>
            <span className="text-[10px] text-emerald-400 font-semibold">{stats.vacantBedsCount} Vacant</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-medium block">Avg Room Size</span>
            <div className="text-lg font-bold text-blue-400 mt-1">{stats.avgSqFt} sq ft</div>
            <span className="text-[10px] text-slate-500">Total: {stats.totalSqFt.toLocaleString()} sq ft</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-medium block">Avg Bed Rent</span>
            <div className="text-lg font-bold text-emerald-400 mt-1">₹{stats.avgRentPerBed.toLocaleString()}</div>
            <span className="text-[10px] text-slate-500">Per Resident / Mo</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-medium block">Monthly Potential</span>
            <div className="text-lg font-bold text-amber-400 mt-1">₹{(stats.monthlyPotentialRevenue / 100000).toFixed(2)} Lakh</div>
            <span className="text-[10px] text-slate-500">100% Full Capacity</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-medium block">Allotment Ratio</span>
            <div className="text-lg font-bold text-slate-200 mt-1">{stats.occupancyRate}%</div>
            <span className="text-[10px] text-slate-400">{stats.occupiedBedsCount} Filled Beds</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters, Search & View Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search */}
          <div className="relative min-w-[220px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Room #, size, bed type, occupant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Block filter */}
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

          {/* Floor filter */}
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

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Room Sizes &amp; Tiers</option>
            <option value="COMPACT">Compact (100-140 sqft)</option>
            <option value="STANDARD">Standard (150-210 sqft)</option>
            <option value="DELUXE">Deluxe (220-300 sqft)</option>
            <option value="PREMIUM_SUITE">Executive Suite (310-420 sqft)</option>
            <option value="STUDIO_DORM">Dormitory Hall (400+ sqft)</option>
          </select>

          {/* Ventilation filter */}
          <select
            value={selectedVentilation}
            onChange={(e) => setSelectedVentilation(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Air / AC Types</option>
            <option value="AC_INVERTER">AC (Inverter Split)</option>
            <option value="CENTRAL_COOLING">Central Air Cooling</option>
            <option value="CROSS_VENTILATED">Cross Ventilated</option>
            <option value="NON_AC">Non-AC Standard</option>
          </select>
        </div>

        {/* View Mode Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 self-end md:self-auto">
          <button
            onClick={() => setViewMode('CARDS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'CARDS' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Room Cards</span>
          </button>

          <button
            onClick={() => setViewMode('TABLE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'TABLE' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Master Matrix</span>
          </button>

          <button
            onClick={() => setViewMode('MATRIX')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'MATRIX' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Pricing Matrix</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. ROOM CARDS VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'CARDS' && (
        <div className="space-y-4">
          {filteredRooms.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
              <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-200">No rooms found for selected filter</h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">Adjust filters or create your first custom room with beds.</p>
              <button
                onClick={() => {
                  setModalMode('SINGLE');
                  setShowAddRoomModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer shadow"
              >
                + Add Room &amp; Beds Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredRooms.map((room) => {
                const roomStudents = students.filter((s) => s.roomNumber === room.roomNumber && s.status === 'ACTIVE');
                const isExpanded = expandedRoomId === room.id;
                const bedsList: BedConfig[] =
                  room.beds && room.beds.length > 0
                    ? room.beds
                    : Array.from({ length: room.totalBeds }).map((_, i) => ({
                        id: `b_${room.id}_${i}`,
                        bedNumber: `Bed-${i + 1}`,
                        label: i === 0 ? 'Window Side Cot' : `Bed Slot ${i + 1}`,
                        bedType: 'SINGLE_COT',
                        position: i === 0 ? 'WINDOW_SIDE' : 'CORNER',
                        monthlyRent: room.monthlyRent || 8500,
                        status: i < roomStudents.length ? 'OCCUPIED' : 'AVAILABLE',
                      }));

                const totalRoomYield = bedsList.reduce((sum, b) => sum + (b.monthlyRent || room.monthlyRent || 8500), 0);

                return (
                  <div
                    key={room.id}
                    className={`bg-slate-900 border rounded-3xl p-5 shadow-xl transition-all flex flex-col justify-between ${
                      room.status === 'MAINTENANCE'
                        ? 'border-amber-500/30 bg-amber-950/10'
                        : room.occupiedBeds >= room.totalBeds
                        ? 'border-slate-800 hover:border-slate-700'
                        : 'border-indigo-500/30 hover:border-indigo-500/60'
                    }`}
                  >
                    <div>
                      {/* Top Header Row */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-13 h-13 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex flex-col items-center justify-center text-indigo-300 font-bold">
                            <span className="text-base leading-none font-extrabold">{room.roomNumber}</span>
                            <span className="text-[9px] font-normal text-slate-400 mt-0.5">
                              {room.floor === 0 ? 'GF' : `F-${room.floor}`}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-100">{room.block}</h4>
                              <button
                                onClick={() => setEditRoomModal(room)}
                                title="Edit Room Physical Dimensions & Rent"
                                className="p-1 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] font-semibold text-emerald-400">
                                {room.roomSizeSqFt || 180} sq ft
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                ({room.dimensions || '14ft x 14ft'})
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                            {roomStudents.length}/{room.totalBeds} Beds
                          </span>
                          <span className="text-[10px] text-indigo-400 font-bold">
                            ₹{totalRoomYield.toLocaleString()}/mo total
                          </span>
                        </div>
                      </div>

                      {/* Physical Specs & Ventilation Strip */}
                      <div className="mt-3.5 p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                            {room.roomCategory || 'STANDARD'}
                          </span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400 flex items-center gap-1">
                            <Wind className="w-3 h-3 text-cyan-400" />
                            {room.ventilationType === 'AC_INVERTER'
                              ? 'Split AC'
                              : room.ventilationType === 'CENTRAL_COOLING'
                              ? 'Central Cool'
                              : 'Ventilated'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Droplets className="w-3 h-3 text-blue-400" />
                          <span>
                            {room.washroomType === 'DELUXE_ENSUITE'
                              ? 'Ensuite Geyser'
                              : room.washroomType === 'ATTACHED_WESTERN'
                              ? 'Attached Bath'
                              : 'Shared Bath'}
                          </span>
                        </div>
                      </div>

                      {/* Bed Configuration & Individual Pricing List */}
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          <span className="flex items-center gap-1.5">
                            <Bed className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Configured Beds &amp; Rents ({bedsList.length})</span>
                          </span>

                          <button
                            onClick={() => handleQuickAddBed(room)}
                            className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Extra Bed</span>
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          {bedsList.map((bed, bedIdx) => {
                            const occupant = roomStudents[bedIdx];
                            return (
                              <div
                                key={bed.id || bedIdx}
                                className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800/90 flex items-center justify-between text-xs group hover:border-slate-700 transition-colors"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-[10px] ${
                                      occupant
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                    }`}
                                  >
                                    B{bedIdx + 1}
                                  </div>

                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-slate-200">
                                        {bed.bedNumber}
                                      </span>
                                      <span className="text-[10px] text-slate-400">
                                        ({bed.label || bed.position || 'Standard'})
                                      </span>
                                    </div>

                                    {occupant ? (
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="text-[11px] font-medium text-emerald-400">
                                          {occupant.name}
                                        </span>
                                        <span className="text-[9px] font-mono text-slate-500">
                                          ({occupant.rollNumber})
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-slate-500 block">
                                        Vacant Bed Slot
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <div className="text-right">
                                    <span className="text-xs font-bold text-slate-100">
                                      ₹{(bed.monthlyRent || room.monthlyRent || 8500).toLocaleString()}
                                    </span>
                                    <span className="text-[9px] text-slate-500 block">/month</span>
                                  </div>

                                  <button
                                    onClick={() => setEditBedModal({ room, bed })}
                                    title="Edit Bed Label, Type & Rent"
                                    className="p-1 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-slate-800 transition-colors cursor-pointer"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>

                                  {!occupant && room.totalBeds > 1 && (
                                    <button
                                      onClick={() => onRemoveBedFromRoom(room.id, bed.id)}
                                      title="Remove this vacant bed"
                                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Amenities Pills */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {(room.amenities || []).map((a, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/60"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Room Card Bottom Action Toolbar */}
                    <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditRoomModal(room)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <SlidersHorizontal className="w-3 h-3 text-indigo-400" />
                          <span>Configure Specs</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {roomStudents.length === 0 ? (
                          <button
                            onClick={() => {
                              if (confirm(`Permanently remove Room #${room.roomNumber} from Master Inventory?`)) {
                                onDeleteRoom(room.id);
                              }
                            }}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/60 transition-colors cursor-pointer"
                            title="Delete vacant room"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-400 font-medium px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            {roomStudents.length} Residents Active
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MASTER MATRIX / TABLE VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'TABLE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Master Inventory Grid</h3>
              <p className="text-xs text-slate-400">Direct tabular view of sizes, beds &amp; variable monthly rents</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">{filteredRooms.length} Rooms Listed</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Room #</th>
                  <th className="p-3.5">Block / Floor</th>
                  <th className="p-3.5">Size &amp; Area</th>
                  <th className="p-3.5">Category &amp; AC</th>
                  <th className="p-3.5">Bed Capacity</th>
                  <th className="p-3.5">Bed Rent Breakdown</th>
                  <th className="p-3.5">Monthly Revenue Yield</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredRooms.map((room) => {
                  const roomStudents = students.filter((s) => s.roomNumber === room.roomNumber && s.status === 'ACTIVE');
                  const bedsList: BedConfig[] =
                    room.beds && room.beds.length > 0
                      ? room.beds
                      : Array.from({ length: room.totalBeds }).map((_, i) => ({
                          id: `b_${room.id}_${i}`,
                          bedNumber: `Bed-${i + 1}`,
                          monthlyRent: room.monthlyRent || 8500,
                          status: 'AVAILABLE',
                        }));
                  const totalYield = bedsList.reduce((s, b) => s + (b.monthlyRent || room.monthlyRent || 8500), 0);

                  return (
                    <tr key={room.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-bold text-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-300 font-bold flex items-center justify-center">
                            {room.roomNumber}
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="font-semibold text-slate-200 block">{room.block}</span>
                        <span className="text-[10px] text-slate-400">
                          {room.floor === 0 ? 'Ground Floor' : `Floor ${room.floor}`}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-emerald-400 block">{room.roomSizeSqFt || 180} sq ft</span>
                        <span className="text-[10px] text-slate-500 font-mono">{room.dimensions || '14x14'}</span>
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-medium block w-max">
                          {room.roomCategory || 'STANDARD'}
                        </span>
                        <span className="text-[10px] text-cyan-400 mt-0.5 block">
                          {room.ventilationType === 'AC_INVERTER' ? 'Split AC' : 'Non-AC'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-200">{room.totalBeds} Beds</span>
                          <span className="text-[10px] text-slate-500">({roomStudents.length} filled)</span>
                        </div>
                        <button
                          onClick={() => handleQuickAddBed(room)}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold mt-0.5 cursor-pointer block"
                        >
                          + Add Bed
                        </button>
                      </td>

                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {bedsList.map((b, idx) => (
                            <span
                              key={idx}
                              onClick={() => setEditBedModal({ room, bed: b })}
                              className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300 hover:border-indigo-500 cursor-pointer"
                              title="Click to edit rent"
                            >
                              B{idx + 1}: ₹{b.monthlyRent}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="p-3.5 font-bold text-slate-100">
                        ₹{totalYield.toLocaleString()}
                        <span className="text-[10px] text-slate-500 font-normal block">/month potential</span>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditRoomModal(room)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                            title="Edit Room"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {roomStudents.length === 0 && (
                            <button
                              onClick={() => {
                                if (confirm(`Delete Room #${room.roomNumber}?`)) {
                                  onDeleteRoom(room.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                              title="Delete Room"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PRICING & SIZE VARIATION MATRIX */}
      {/* ========================================================================= */}
      {viewMode === 'MATRIX' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div>
            <div className="flex items-center gap-2.5">
              <Calculator className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-slate-100">Hostel Size &amp; Rent Variation Matrix</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Demonstrates how room area (sq ft), bed count, AC surcharge, and washroom type mathematically configure per-bed and total room rents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Object.entries(CATEGORY_DEFAULTS).map(([catKey, catInfo]) => {
              const matchingRooms = rooms.filter((r) => r.roomCategory === catKey);
              const totalBedsInCat = matchingRooms.reduce((s, r) => s + r.totalBeds, 0);

              return (
                <div key={catKey} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-300">{catInfo.label}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                        {catInfo.minSqFt} - {catInfo.maxSqFt} sq ft
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-1.5">{catInfo.desc}</p>

                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Base Rate:</span>
                        <span className="font-bold text-slate-200">₹{catInfo.baseRatePerSqFt}/sq ft</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Active Units in Hostel:</span>
                        <span className="font-bold text-indigo-400">{matchingRooms.length} Rooms ({totalBedsInCat} Beds)</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Typical Rent Range:</span>
                        <span className="font-bold text-emerald-400">
                          ₹{(catInfo.minSqFt * catInfo.baseRatePerSqFt).toLocaleString()} - ₹
                          {(catInfo.maxSqFt * catInfo.baseRatePerSqFt).toLocaleString()}/mo
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MASTER ADD ROOM MODAL (SINGLE & BATCH) */}
      {/* ========================================================================= */}
      {showAddRoomModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-6 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Provision Master Rooms &amp; Beds</h3>
                  <p className="text-xs text-slate-400">Configure room number, room size (sq ft), bed slots &amp; variable rent tiers</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddRoomModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setModalMode('SINGLE')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  modalMode === 'SINGLE' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Single Room Master Setup</span>
              </button>

              <button
                type="button"
                onClick={() => setModalMode('BATCH')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  modalMode === 'BATCH' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Batch Room &amp; Bed Generator</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {modalMode === 'SINGLE' ? (
                <form onSubmit={handleSingleRoomSubmit} id="singleRoomMasterForm" className="space-y-4">
                  {/* Row 1: Room Number, Floor, Block */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Room Number *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 106, 204B"
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
                        <span className="text-[10px] text-rose-400 mt-1 block">{formErrors.roomNumber}</span>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Floor Level *
                      </label>
                      <select
                        value={singleForm.floor}
                        onChange={(e) => setSingleForm({ ...singleForm, floor: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none cursor-pointer"
                      >
                        <option value={0}>Ground Floor (GF)</option>
                        <option value={1}>1st Floor</option>
                        <option value={2}>2nd Floor</option>
                        <option value={3}>3rd Floor</option>
                        <option value={4}>4th Floor</option>
                        <option value={5}>5th Floor</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Block / Wing *
                      </label>
                      <select
                        value={singleForm.block}
                        onChange={(e) => setSingleForm({ ...singleForm, block: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none cursor-pointer"
                      >
                        <option value="A-Block (North)">A-Block (North)</option>
                        <option value="B-Block (East)">B-Block (East)</option>
                        <option value="C-Block (West)">C-Block (West)</option>
                        <option value="PG Executive Tower">PG Executive Tower</option>
                        <option value="CUSTOM">+ Custom Block Name</option>
                      </select>
                    </div>
                  </div>

                  {singleForm.block === 'CUSTOM' && (
                    <input
                      type="text"
                      placeholder="Enter custom block name (e.g. South Wing Annex)"
                      value={singleForm.customBlock}
                      onChange={(e) => setSingleForm({ ...singleForm, customBlock: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                      required
                    />
                  )}

                  {/* Section 2: Room Physical Sizing & Dimensions */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Room Size, Dimensions &amp; Category</span>
                      </span>
                      <span className="text-[11px] font-bold text-emerald-400 font-mono">
                        {singleForm.roomSizeSqFt} sq ft ({singleForm.roomCategory})
                      </span>
                    </div>

                    {/* Quick Size Presets */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {[
                        { size: 120, cat: 'COMPACT', label: '120 sq ft (Studio)' },
                        { size: 180, cat: 'STANDARD', label: '180 sq ft (Standard)' },
                        { size: 240, cat: 'DELUXE', label: '240 sq ft (Deluxe)' },
                        { size: 340, cat: 'PREMIUM_SUITE', label: '340 sq ft (Suite)' },
                        { size: 480, cat: 'STUDIO_DORM', label: '480 sq ft (Dorm)' },
                      ].map((preset) => (
                        <button
                          key={preset.size}
                          type="button"
                          onClick={() => handleSizeChange(preset.size)}
                          className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                            singleForm.roomSizeSqFt === preset.size
                              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="text-xs">{preset.size} sq ft</div>
                          <div className="text-[9px] text-slate-500">{preset.cat}</div>
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Custom Area (Sq Ft)</label>
                        <input
                          type="number"
                          min={80}
                          max={1000}
                          value={singleForm.roomSizeSqFt}
                          onChange={(e) => handleSizeChange(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Dimensions (Length x Width)</label>
                        <input
                          type="text"
                          value={singleForm.dimensions}
                          onChange={(e) => setSingleForm({ ...singleForm, dimensions: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Ventilation & Washroom Types */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Air &amp; Ventilation Type</label>
                      <select
                        value={singleForm.ventilationType}
                        onChange={(e) => {
                          const v = e.target.value as VentilationType;
                          setSingleForm({ ...singleForm, ventilationType: v });
                          const calc = calculateSuggestedRent(singleForm.roomSizeSqFt, singleForm.totalBeds, v, singleForm.washroomType, singleForm.roomCategory);
                          setSingleForm((prev) => ({ ...prev, ventilationType: v, monthlyRent: calc.perBedRent, baseRoomRent: calc.totalRoomRent }));
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none cursor-pointer"
                      >
                        <option value="AC_INVERTER">Split AC (+₹4,500/mo value)</option>
                        <option value="CENTRAL_COOLING">Central Air Cooling (+₹2,000/mo value)</option>
                        <option value="CROSS_VENTILATED">Cross Ventilated (Standard)</option>
                        <option value="NON_AC">Non-AC Basic</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Washroom Configuration</label>
                      <select
                        value={singleForm.washroomType}
                        onChange={(e) => {
                          const w = e.target.value as WashroomType;
                          setSingleForm({ ...singleForm, washroomType: w });
                          const calc = calculateSuggestedRent(singleForm.roomSizeSqFt, singleForm.totalBeds, singleForm.ventilationType, w, singleForm.roomCategory);
                          setSingleForm((prev) => ({ ...prev, washroomType: w, monthlyRent: calc.perBedRent, baseRoomRent: calc.totalRoomRent }));
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none cursor-pointer"
                      >
                        <option value="ATTACHED_WESTERN">Attached Western Bathroom</option>
                        <option value="DELUXE_ENSUITE">Deluxe Ensuite with Geyser</option>
                        <option value="ATTACHED_INDIAN">Attached Indian Style</option>
                        <option value="COMMON_SHARED">Common Floor Bathroom</option>
                      </select>
                    </div>
                  </div>

                  {/* Section 4: Bed Capacity Stepper & Individual Bed Rents */}
                  <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Bed Capacity in Room</span>
                        <span className="text-[10px] text-slate-400">Configure each bed's specific monthly rent</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 6].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handleBedCountChange(num)}
                            className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center border transition-all cursor-pointer ${
                              singleForm.totalBeds === num
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bed Items Interactive Matrix */}
                    <div className="space-y-2 pt-2">
                      {singleForm.beds.map((bed, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs gap-3">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono text-[10px] flex items-center justify-center font-bold">
                              B{idx + 1}
                            </span>
                            <div>
                              <span className="font-bold text-slate-200 block">{bed.bedNumber}</span>
                              <span className="text-[10px] text-slate-400">{bed.label}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <label className="text-[10px] text-slate-400">Bed Rent (₹/mo):</label>
                            <input
                              type="number"
                              step={100}
                              value={bed.monthlyRent}
                              onChange={(e) => handleFormBedRentChange(idx, Number(e.target.value))}
                              className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-100 font-mono font-bold focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-800">
                      <span className="text-slate-400">Total Projected Monthly Room Revenue:</span>
                      <span className="font-bold text-emerald-400 font-mono text-sm">
                        ₹{singleForm.beds.reduce((s, b) => s + Number(b.monthlyRent), 0).toLocaleString()}/month
                      </span>
                    </div>
                  </div>
                </form>
              ) : (
                /* Batch Generation Form */
                <form onSubmit={handleBatchRoomsSubmit} id="batchRoomMasterForm" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Starting Room # *</label>
                      <input
                        type="number"
                        value={batchForm.startRoomNumber}
                        onChange={(e) => setBatchForm({ ...batchForm, startRoomNumber: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Quantity of Rooms *</label>
                      <input
                        type="number"
                        min={1}
                        max={25}
                        value={batchForm.roomCount}
                        onChange={(e) => setBatchForm({ ...batchForm, roomCount: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Floor Level *</label>
                      <select
                        value={batchForm.floor}
                        onChange={(e) => setBatchForm({ ...batchForm, floor: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none cursor-pointer"
                      >
                        <option value={1}>1st Floor</option>
                        <option value={2}>2nd Floor</option>
                        <option value={3}>3rd Floor</option>
                        <option value={4}>4th Floor</option>
                        <option value={5}>5th Floor</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Room Area (Sq Ft)</label>
                      <input
                        type="number"
                        value={batchForm.roomSizeSqFt}
                        onChange={(e) => setBatchForm({ ...batchForm, roomSizeSqFt: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Beds Per Room</label>
                      <select
                        value={batchForm.totalBeds}
                        onChange={(e) => setBatchForm({ ...batchForm, totalBeds: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none cursor-pointer"
                      >
                        <option value={1}>1 Bed (Single)</option>
                        <option value={2}>2 Beds (Double)</option>
                        <option value={3}>3 Beds (Triple)</option>
                        <option value={4}>4 Beds (Quad)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Rent Per Bed (₹/mo)</label>
                      <input
                        type="number"
                        step={100}
                        value={batchForm.monthlyRentPerBed}
                        onChange={(e) => setBatchForm({ ...batchForm, monthlyRentPerBed: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                      />
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/95 flex items-center justify-end gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowAddRoomModal(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                form={modalMode === 'SINGLE' ? 'singleRoomMasterForm' : 'batchRoomMasterForm'}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                {modalMode === 'SINGLE' ? 'Create Master Room & Beds' : `Generate ${batchForm.roomCount} Rooms`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. EDIT BED MODAL */}
      {/* ========================================================================= */}
      {editBedModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  Edit Bed #{editBedModal.bed.bedNumber} (Room {editBedModal.room.roomNumber})
                </h3>
                <p className="text-xs text-slate-400">Configure bed pricing, placement &amp; attributes</p>
              </div>
              <button onClick={() => setEditBedModal(null)} className="text-slate-400 hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBedModal} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Bed Label / Title</label>
                <input
                  type="text"
                  value={editBedModal.bed.label || ''}
                  onChange={(e) =>
                    setEditBedModal({
                      ...editBedModal,
                      bed: { ...editBedModal.bed, label: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                  placeholder="e.g. Window Side Deluxe Cot"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Monthly Bed Rent (₹/mo) *</label>
                <input
                  type="number"
                  step={100}
                  value={editBedModal.bed.monthlyRent}
                  onChange={(e) =>
                    setEditBedModal({
                      ...editBedModal,
                      bed: { ...editBedModal.bed, monthlyRent: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono font-bold focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Bed Type</label>
                  <select
                    value={editBedModal.bed.bedType || 'SINGLE_COT'}
                    onChange={(e) =>
                      setEditBedModal({
                        ...editBedModal,
                        bed: { ...editBedModal.bed, bedType: e.target.value as BedConfig['bedType'] },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-100 focus:outline-none cursor-pointer"
                  >
                    <option value="SINGLE_COT">Single Cot</option>
                    <option value="DELUXE_COT">Deluxe Ortho Cot</option>
                    <option value="BUNK_LOWER">Bunk (Lower)</option>
                    <option value="BUNK_UPPER">Bunk (Upper)</option>
                    <option value="PREMIUM_POD">Executive Study Pod</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Room Placement</label>
                  <select
                    value={editBedModal.bed.position || 'WINDOW_SIDE'}
                    onChange={(e) =>
                      setEditBedModal({
                        ...editBedModal,
                        bed: { ...editBedModal.bed, position: e.target.value as BedConfig['position'] },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-100 focus:outline-none cursor-pointer"
                  >
                    <option value="WINDOW_SIDE">Window Side</option>
                    <option value="CORNER">Quiet Corner</option>
                    <option value="BALCONY_FACING">Balcony Facing</option>
                    <option value="DOOR_SIDE">Door Side</option>
                    <option value="CENTER">Center Deck</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditBedModal(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
                >
                  Save Bed Specs
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. EDIT ROOM MODAL */}
      {/* ========================================================================= */}
      {editRoomModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  Edit Room #{editRoomModal.roomNumber} Physical Specs
                </h3>
                <p className="text-xs text-slate-400">Update area (sq ft), dimensions &amp; base rent</p>
              </div>
              <button onClick={() => setEditRoomModal(null)} className="text-slate-400 hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditRoomModal} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Room Area (Sq Ft) *</label>
                  <input
                    type="number"
                    value={editRoomModal.roomSizeSqFt || 180}
                    onChange={(e) => setEditRoomModal({ ...editRoomModal, roomSizeSqFt: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Dimensions</label>
                  <input
                    type="text"
                    value={editRoomModal.dimensions || '14ft x 14ft'}
                    onChange={(e) => setEditRoomModal({ ...editRoomModal, dimensions: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Room Category</label>
                  <select
                    value={editRoomModal.roomCategory || 'STANDARD'}
                    onChange={(e) => setEditRoomModal({ ...editRoomModal, roomCategory: e.target.value as RoomCategory })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-100 focus:outline-none cursor-pointer"
                  >
                    <option value="COMPACT">Compact (100-140 sqft)</option>
                    <option value="STANDARD">Standard (150-210 sqft)</option>
                    <option value="DELUXE">Deluxe (220-300 sqft)</option>
                    <option value="PREMIUM_SUITE">Executive Suite (310-420 sqft)</option>
                    <option value="STUDIO_DORM">Dormitory Hall (400+ sqft)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Ventilation</label>
                  <select
                    value={editRoomModal.ventilationType || 'CROSS_VENTILATED'}
                    onChange={(e) => setEditRoomModal({ ...editRoomModal, ventilationType: e.target.value as VentilationType })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-100 focus:outline-none cursor-pointer"
                  >
                    <option value="AC_INVERTER">Split AC</option>
                    <option value="CENTRAL_COOLING">Central Cool</option>
                    <option value="CROSS_VENTILATED">Cross Ventilated</option>
                    <option value="NON_AC">Non-AC</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Average Per-Bed Rent (₹/mo)</label>
                <input
                  type="number"
                  step={100}
                  value={editRoomModal.monthlyRent}
                  onChange={(e) => setEditRoomModal({ ...editRoomModal, monthlyRent: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono font-bold focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditRoomModal(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. RESET & RE-SEED MODAL (WITH TYPE 'CONFIRM' VERIFICATION) */}
      {/* ========================================================================= */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
              <RefreshCw className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-100">Reset &amp; Re-seed Master Inventory</h3>
              <p className="text-xs text-slate-400 mt-1">
                Choose your reset target dataset. This operation will refresh hostel rooms, bed assignments, and resident registries.
              </p>
            </div>

            {/* Mode selection radio / cards */}
            <div className="space-y-2 pt-1">
              <label
                onClick={() => setSelectedResetMode('FULL_SEED')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  selectedResetMode === 'FULL_SEED'
                    ? 'bg-indigo-600/15 border-indigo-500/60 text-indigo-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="resetMode"
                  checked={selectedResetMode === 'FULL_SEED'}
                  onChange={() => setSelectedResetMode('FULL_SEED')}
                  className="mt-1 accent-indigo-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    1. Load Full Seeded Dataset (Recommended)
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Pre-loads realistic variable rooms (135–310 sq ft), single/double/triple beds, pricing tiers (₹5,000–₹13,500/mo), and verified students.
                  </div>
                </div>
              </label>

              <label
                onClick={() => setSelectedResetMode('EMPTY_SLATE')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  selectedResetMode === 'EMPTY_SLATE'
                    ? 'bg-rose-500/15 border-rose-500/60 text-rose-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="resetMode"
                  checked={selectedResetMode === 'EMPTY_SLATE'}
                  onChange={() => setSelectedResetMode('EMPTY_SLATE')}
                  className="mt-1 accent-rose-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    2. Clear to Clean Empty Slate
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Wipes all rooms, bed allocations, and records so you can build custom inventory from scratch.
                  </div>
                </div>
              </label>
            </div>

            {/* Security Confirmation Step: Type 'CONFIRM' */}
            <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-2">
              <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
                <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Security Verification Required</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-normal">
                To prevent accidental data loss, please type <span className="font-mono font-bold text-rose-400 bg-rose-950 px-1 py-0.5 rounded border border-rose-500/40">CONFIRM</span> below to authorize this system reset:
              </p>
              <input
                type="text"
                value={resetConfirmInput}
                onChange={(e) => setResetConfirmInput(e.target.value)}
                placeholder="Type CONFIRM to proceed"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none uppercase tracking-wider"
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowResetModal(false);
                  setResetConfirmInput('');
                }}
                className="flex-1 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={resetConfirmInput.trim().toUpperCase() !== 'CONFIRM'}
                onClick={() => {
                  if (resetConfirmInput.trim().toUpperCase() !== 'CONFIRM') return;
                  executeReset(selectedResetMode);
                  setShowResetModal(false);
                  setResetConfirmInput('');
                  showToast(
                    selectedResetMode === 'FULL_SEED'
                      ? 'System Reset Executed: Seeded variable rooms, beds & realistic residents!'
                      : 'System Reset Executed: Cleared all inventory to clean slate!'
                  );
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  resetConfirmInput.trim().toUpperCase() === 'CONFIRM'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Authorize Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
