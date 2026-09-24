export interface Farmer {
  id: string;
  fullName: string;
  mobileNumber: string;
  farmerId: string; // e.g. 7/12 Land Record ID / Kisan Card ID
  village: string;
  taluka: string;
  district: string;
  state: string;
  password?: string;
  landholdingAcre?: number;
  bankAccountLast4?: string;
}

export interface Crop {
  id: string;
  name: string;
  nameHi: string;
  nameMr: string;
  category: string;
  mspPerQuintal: number;
  unit: string;
  icon: string;
}

export interface ProcurementCenter {
  id: string;
  name: string;
  nameHi: string;
  nameMr: string;
  location: string;
  district: string;
  state: string;
  acceptedCropIds: string[];
  capacityPerDayQuintals: number;
  contactPhone: string;
  operatingHours: string;
  status: 'Available' | 'Full' | 'Maintenance';
}

export interface TimeSlot {
  id: string;
  timeWindow: string; // e.g. "09:00 AM – 11:00 AM"
  startTime: string;
  endTime: string;
  capacity: number;
  available: number;
  isFull: boolean;
}

export interface DateSlots {
  date: string; // ISO format "2026-09-10"
  displayDate: string; // e.g. "10 September 2026"
  slots: TimeSlot[];
}

export type BookingStatus = 'Booked' | 'Verified' | 'In Procurement' | 'Completed' | 'Cancelled';

export type PaymentStatus = 'Pending' | 'Processing' | 'Completed';

export interface Booking {
  id: string; // e.g. "BK1025"
  farmerId: string;
  farmerName: string;
  farmerMobile: string;
  cropId: string;
  cropName: string;
  centerId: string;
  centerName: string;
  centerLocation: string;
  centerDistrict: string;
  date: string;
  timeSlot: string;
  expectedQuantityQuintals: number;
  digitalToken: string; // e.g. "KQ-2026-00125"
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  verifiedAt?: string;
  procurementAt?: string;
  completedAt?: string;
  paymentAmount?: number;
  paymentDate?: string;
  paymentRefNumber?: string;
  weighbridgeWeightQuintals?: number;
}

export interface AppNotification {
  id: string;
  farmerId: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'booking' | 'token' | 'procurement' | 'payment';
  linkTo?: string;
}

export interface BookingFlowState {
  district?: string;
  taluka?: string;
  cropId?: string;
  centerId?: string;
  date?: string;
  timeSlotId?: string;
  timeSlotWindow?: string;
  expectedQuantityQuintals?: number;
}
