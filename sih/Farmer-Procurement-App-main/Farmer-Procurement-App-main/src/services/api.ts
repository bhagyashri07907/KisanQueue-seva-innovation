import {
  Farmer, Crop, ProcurementCenter, DateSlots, Booking, AppNotification, BookingStatus, PaymentStatus
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const STORAGE_KEYS = {
  CURRENT_FARMER: 'kq_current_farmer',
  AUTH_TOKEN: 'kq_farmer_token',
};

function getHeaders() {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

/** Normalize a raw backend booking object to the frontend Booking type */
function normalizeBooking(b: any): any {
  return {
    id: b.booking_id || b.id || '',
    farmerId: b.farmer_id || '',
    farmerName: b.fullName || b.farmer_name || '',
    farmerMobile: b.mobileNumber || b.farmer_mobile || '',
    cropId: b.cropId || b.crop || '',
    cropName: b.cropId || b.crop || '',
    centerId: b.center_id || '',
    centerName: b.centerName || b.center_name || '',
    centerLocation: b.centerLocation || '',
    centerDistrict: b.centerDistrict || b.district || '',
    date: b.date || '',
    timeSlot: b.timeSlot || b.time_slot || '',
    expectedQuantityQuintals: b.expected_quantity_quintals || b.expectedQuantityQuintals || 0,
    digitalToken: b.digital_token || b.digitalToken || '',
    status: b.status || 'Booked',
    paymentStatus: b.paymentStatus || b.payment_status || 'Pending',
    createdAt: b.createdAt || '',
    weighbridgeWeightQuintals: b.actual_weight_quintals || b.net_weight,
  };
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers: getHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.error || 'API Request failed');
  }
  return res.json();
}

export async function loginFarmer(identifier: string, password?: string): Promise<{ success: boolean; farmer?: Farmer; message?: string }> {
  try {
    const data = await apiRequest<any>('/auth/farmer/login', {
      method: 'POST',
      body: JSON.stringify({ username: identifier, password: password || '' })
    });
    localStorage.setItem(STORAGE_KEYS.CURRENT_FARMER, JSON.stringify(data.farmer));
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.access_token);
    return { success: true, farmer: data.farmer };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function registerFarmer(data: {
  fullName: string; mobileNumber: string; farmerId: string; village: string; taluka: string; district: string; password?: string;
}): Promise<{ success: boolean; farmer?: Farmer; message?: string }> {
  try {
    const res = await apiRequest<any>('/auth/farmer/register', {
      method: 'POST',
      body: JSON.stringify({ ...data, password: data.password || 'password123' })
    });
    localStorage.setItem(STORAGE_KEYS.CURRENT_FARMER, JSON.stringify(res.farmer));
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, res.access_token);
    return { success: true, farmer: res.farmer };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export function getCurrentFarmer(): Farmer | null {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_FARMER);
  return data ? JSON.parse(data) : null;
}

export function logoutFarmer(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_FARMER);
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
}

export async function getCrops(): Promise<Crop[]> {
  try { return await apiRequest<Crop[]>('/farmer/crops'); } catch { return []; }
}

export async function getProcurementCenters(cropId?: string, district?: string): Promise<ProcurementCenter[]> {
  const params = new URLSearchParams();
  
  // Map frontend crop IDs to backend crop names for filtering
  const mapCropIdToName = (id: string) => {
    switch (id) {
      case 'crop_soybean': return 'Soybean';
      case 'crop_wheat': return 'Wheat';
      case 'crop_cotton': return 'Cotton';
      case 'crop_paddy': return 'Paddy';
      case 'crop_maize': return 'Maize';
      case 'crop_gram': return 'Gram';
      default: return id;
    }
  };
  
  if (cropId) params.append('cropId', mapCropIdToName(cropId));
  if (district) params.append('district', district);
  
  try { 
    const centers = await apiRequest<any[]>(`/farmer/centers?${params.toString()}`); 
    return centers.map((c: any) => {
      // Map backend crop names back to frontend crop IDs
      const mapCropNameToId = (name: string) => {
        switch (name) {
          case 'Soybean': return 'crop_soybean';
          case 'Wheat': return 'crop_wheat';
          case 'Cotton': return 'crop_cotton';
          case 'Paddy': return 'crop_paddy';
          case 'Maize': return 'crop_maize';
          case 'Gram': return 'crop_gram';
          default: return name;
        }
      };
      
      const acceptedCropIds = (c.accepted_crops || []).map(mapCropNameToId);

      // Provide basic translations for center names since backend doesn't provide them
      let nameHi = c.center_name;
      let nameMr = c.center_name;
      if (c.center_id === 'PC001') {
        nameHi = 'सरकारी खरीद केंद्र - बारामती';
        nameMr = 'शासकीय खरेदी केंद्र - बारामती';
      } else if (c.center_id === 'PC002') {
        nameHi = 'सरकारी खरीद केंद्र - कराड';
        nameMr = 'शासकीय खरेदी केंद्र - कराड';
      } else if (c.center_id === 'PC003') {
        nameHi = 'सरकारी खरीद केंद्र - निफाड';
        nameMr = 'शासकीय खरेदी केंद्र - निफाड';
      }

      return {
        id: c.center_id,
        name: c.center_name,
        nameHi,
        nameMr,
        location: c.location,
        district: c.district,
        state: 'Maharashtra',
        acceptedCropIds,
        capacityPerDayQuintals: c.daily_procurement_capacity_quintals,
        contactPhone: '+91 0000 000000',
        operatingHours: c.operating_hours,
        status: c.status === 'Active' ? 'Available' : c.status
      };
    });
  } catch { 
    return []; 
  }
}

export async function getAvailableSlots(centerId: string, dateStr?: string): Promise<DateSlots[]> {
  const params = new URLSearchParams({ centerId });
  if (dateStr) params.append('dateStr', dateStr);
  try {
    const slots = await apiRequest<any[]>(`/farmer/slots?${params.toString()}`);
    // Group slots by date to match frontend DateSlots format
    const grouped: Record<string, any[]> = {};
    for (const s of slots) {
      if (!grouped[s.date]) grouped[s.date] = [];
      grouped[s.date].push({
        id: s.slot_id,
        timeWindow: `${s.start_time} - ${s.end_time}`,
        startTime: s.start_time,
        endTime: s.end_time,
        capacity: s.capacity,
        available: Math.max(0, s.capacity - (s.booked_count || 0)),
        isFull: (s.booked_count || 0) >= s.capacity
      });
    }
    return Object.entries(grouped).map(([date, slotsArr]) => ({
      date, displayDate: date, slots: slotsArr
    }));
  } catch { return []; }
}

export async function createBooking(params: {
  farmerId: string; farmerName: string; farmerMobile: string; cropId: string; centerId: string; date: string; timeSlotId: string; expectedQuantityQuintals: number;
}): Promise<{ success: boolean; booking?: Booking; error?: string }> {
  try {
    const raw = await apiRequest<any>('/farmer/bookings', {
      method: 'POST',
      body: JSON.stringify({
        farmer_id: params.farmerId, center_id: params.centerId, slot_id: params.timeSlotId, crop: params.cropId, expected_quantity_quintals: params.expectedQuantityQuintals
      })
    });
    // Normalize backend response to match frontend Booking type
    const booking: Booking = {
      id: raw.booking_id || raw.id || '',
      farmerId: raw.farmer_id || params.farmerId,
      farmerName: params.farmerName,
      farmerMobile: params.farmerMobile,
      cropId: raw.cropId || params.cropId,
      cropName: raw.cropId || params.cropId,
      centerId: raw.center_id || params.centerId,
      centerName: raw.centerName || '',
      centerLocation: raw.centerLocation || '',
      centerDistrict: raw.centerDistrict || '',
      date: raw.date || params.date,
      timeSlot: raw.timeSlot || '',
      expectedQuantityQuintals: raw.expected_quantity_quintals || params.expectedQuantityQuintals,
      digitalToken: raw.digital_token || '',
      status: (raw.status || 'Booked') as any,
      paymentStatus: (raw.paymentStatus || 'Pending') as any,
      createdAt: raw.createdAt || new Date().toISOString(),
    };
    return { success: true, booking };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getMyBookings(farmerId?: string): Promise<Booking[]> {
  try {
    const raw = await apiRequest<any[]>('/farmer/bookings');
    return raw.map(normalizeBooking);
  } catch { return []; }
}

export async function getBookingById(bookingId: string): Promise<Booking | null> {
  try {
    const raw = await apiRequest<any>(`/farmer/bookings/${bookingId}`);
    return normalizeBooking(raw);
  } catch { return null; }
}

export async function getDigitalToken(bookingId: string): Promise<{ token: string; booking: Booking | null; }> {
  try {
    const raw = await apiRequest<any>(`/farmer/bookings/${bookingId}/token`);
    return { token: raw.token || '', booking: raw.booking ? normalizeBooking(raw.booking) : null };
  } catch { return { token: '', booking: null }; }
}

export async function getProcurementStatus(bookingId: string): Promise<{ status: BookingStatus; booking: Booking | null; }> {
  try { return await apiRequest<any>(`/farmer/bookings/${bookingId}/procurement-status`); } catch { return { status: 'Booked', booking: null }; }
}

export async function getPaymentStatus(bookingId: string): Promise<{ status: PaymentStatus; booking: Booking | null; }> {
  try { return await apiRequest<any>(`/farmer/bookings/${bookingId}/payment-status`); } catch { return { status: 'Pending', booking: null }; }
}

export async function getFarmerProfile(farmerId: string): Promise<Farmer | null> {
  try { return await apiRequest<Farmer>('/farmer/profile'); } catch { return null; }
}

export async function updateFarmerProfile(farmerId: string, updates: Partial<Farmer>): Promise<Farmer> {
  try {
    const f = await apiRequest<Farmer>('/farmer/profile', {
      method: 'PUT', body: JSON.stringify(updates)
    });
    localStorage.setItem(STORAGE_KEYS.CURRENT_FARMER, JSON.stringify(f));
    return f;
  } catch { return getCurrentFarmer()!; }
}

export async function getNotifications(farmerId?: string): Promise<AppNotification[]> {
  try { return await apiRequest<AppNotification[]>('/farmer/notifications'); } catch { return []; }
}

export async function markNotificationAsRead(notifId: string): Promise<void> {}
export async function markNotificationsAsRead(farmerId?: string): Promise<void> {}
