import {
  Farmer, Crop, ProcurementCenter, DateSlots, Booking, AppNotification, BookingStatus, PaymentStatus
} from '../types';
import { MAHARASHTRA_DISTRICTS } from '../data/districts';
import {
  createDemoToken,
  demoBookingById,
  demoBookings,
  demoCenters,
  demoCreateBooking,
  demoCrops,
  demoDistricts,
  demoLogin,
  demoMarkAllRead,
  demoMarkRead,
  demoNotifications,
  demoRegister,
  demoSlots,
  isDemoToken,
} from './demoStore';

const API_URL = import.meta.env.VITE_API_URL || '';
const STORAGE_KEYS = {
  CURRENT_FARMER: 'kq_current_farmer',
  AUTH_TOKEN: 'kq_farmer_token',
};

function usingDemo(): boolean {
  return !API_URL || isDemoToken(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN));
}

function persistSession(farmer: Farmer, token: string) {
  localStorage.setItem(STORAGE_KEYS.CURRENT_FARMER, JSON.stringify(farmer));
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
}

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
    emailStatus: b.email_status || b.emailStatus || '',
    createdAt: b.createdAt || '',
    weighbridgeWeightQuintals: b.actual_weight_quintals || b.net_weight,
  };
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (!API_URL) {
    throw new Error('DEMO_MODE');
  }
  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers: getHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const isFarmerAuthRequest = endpoint.startsWith('/auth/farmer/login') || endpoint.startsWith('/auth/farmer/register');
    if (res.status === 401 && !isFarmerAuthRequest) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_FARMER);
      const returnTo = `${window.location.pathname}${window.location.search}`;
      window.location.assign(`/login?reason=expired&returnTo=${encodeURIComponent(returnTo)}`);
    }
    throw new Error(err.detail || err.error || 'API Request failed');
  }
  return res.json();
}

export async function loginFarmer(identifier: string, password?: string): Promise<{ success: boolean; farmer?: Farmer; message?: string }> {
  if (!usingDemo()) {
    try {
      const data = await apiRequest<any>('/auth/farmer/login', {
        method: 'POST',
        body: JSON.stringify({ username: identifier, password: password || '' })
      });
      persistSession(data.farmer, data.access_token);
      return { success: true, farmer: data.farmer };
    } catch (err: any) {
      if (err.message !== 'DEMO_MODE') {
        const demo = demoLogin(identifier, password);
        if (demo) {
          persistSession(demo.farmer, demo.token);
          return { success: true, farmer: demo.farmer };
        }
        return { success: false, message: err.message };
      }
    }
  }
  const demo = demoLogin(identifier, password);
  if (!demo) {
    return { success: false, message: 'Invalid Farmer ID or password. Try a demo farmer below.' };
  }
  persistSession(demo.farmer, demo.token);
  return { success: true, farmer: demo.farmer };
}

export async function registerFarmer(data: {
  fullName: string; mobileNumber: string; farmerId: string; village: string; taluka: string; district: string; email?: string; password?: string;
}): Promise<{ success: boolean; farmer?: Farmer; message?: string }> {
  if (!usingDemo()) {
    try {
      const res = await apiRequest<any>('/auth/farmer/register', {
        method: 'POST',
        body: JSON.stringify({ ...data, password: data.password || 'password123' })
      });
      persistSession(res.farmer, res.access_token);
      return { success: true, farmer: res.farmer };
    } catch (err: any) {
      if (err.message !== 'DEMO_MODE') {
        return { success: false, message: err.message };
      }
    }
  }
  const farmer = demoRegister(data);
  persistSession(farmer, createDemoToken(farmer.id));
  return { success: true, farmer };
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
  if (usingDemo()) return demoCrops();
  try { return await apiRequest<Crop[]>('/farmer/crops'); } catch { return demoCrops(); }
}

export interface ProcurementDistrict {
  name: string;
  talukas: string[];
  center_count: number;
}

export async function getProcurementDistricts(): Promise<ProcurementDistrict[]> {
  if (usingDemo()) return demoDistricts().filter((district) => district.center_count > 0);
  try { return await apiRequest<ProcurementDistrict[]>('/farmer/districts'); } catch { return demoDistricts(); }
}

/** District reference for registration, including districts without an active procurement center. */
export async function getRegistrationDistricts(): Promise<ProcurementDistrict[]> {
  const procurementDistricts = await getProcurementDistricts();
  const centerCounts = new Map(procurementDistricts.map((district) => [district.name.trim().toLocaleLowerCase(), district.center_count]));
  const knownDistricts: ProcurementDistrict[] = MAHARASHTRA_DISTRICTS.map((district) => ({
    name: district.name,
    talukas: district.talukas,
    center_count: centerCounts.get(district.name.trim().toLocaleLowerCase()) || 0,
  }));
  const districtsByName = new Map<string, ProcurementDistrict>();

  for (const district of knownDistricts) {
    districtsByName.set(district.name.trim().toLocaleLowerCase(), district);
  }

  for (const district of procurementDistricts) {
    const key = district.name.trim().toLocaleLowerCase();
    const known = districtsByName.get(key);
    districtsByName.set(key, known
      ? {
          ...known,
          talukas: [...new Set([...known.talukas, ...district.talukas])].sort((a, b) => a.localeCompare(b)),
          center_count: district.center_count,
        }
      : district);
  }

  return [...districtsByName.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getProcurementCenters(cropId?: string, district?: string): Promise<ProcurementCenter[]> {
  const params = new URLSearchParams();
  
  if (cropId) params.append('cropId', cropId);
  if (district) params.append('district', district);
  
  if (usingDemo()) return demoCenters(cropId, district);
  try { 
    const centers = await apiRequest<any[]>(`/farmer/centers?${params.toString()}`); 
    return centers.map((c: any) => {
      const slug = (name: string) => `crop_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')}`;
      const acceptedCropIds = (c.accepted_crops || []).map(slug);

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
        capacityPerDayQuintals: c.daily_procurement_capacity_quintals ?? undefined,
        contactPhone: '',
        operatingHours: c.operating_hours || 'Not provided in source data',
        status: c.operational_status === 'seasonal_reference' ? 'Seasonal Reference' : (c.status === 'Active' ? 'Available' : c.status),
        liveStatus: c.live_status,
        seasons: c.seasons || [],
      };
    });
  } catch { 
    return demoCenters(cropId, district); 
  }
}

export async function getAvailableSlots(centerId: string, dateStr?: string): Promise<DateSlots[]> {
  const params = new URLSearchParams({ centerId });
  if (dateStr) params.append('dateStr', dateStr);
  if (usingDemo()) return demoSlots(centerId);
  try {
    const slots = await apiRequest<any[]>(`/farmer/slots?${params.toString()}`);
    // Group slots by date to match frontend DateSlots format
    const grouped: Record<string, any[]> = {};
    for (const s of slots) {
      if (!grouped[s.date]) grouped[s.date] = [];
      grouped[s.date].push({
        id: s.slot_id,
        timeWindow: `${formatSlotTime(s.start_time)} - ${formatSlotTime(s.end_time)}`,
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
  } catch { return demoSlots(centerId); }
}

function formatSlotTime(value: string): string {
  const [hours, minutes] = value.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${String(hour12).padStart(2, '0')}:${String(minutes || 0).padStart(2, '0')} ${period}`;
}

export async function createBooking(params: {
  farmerId: string; farmerName: string; farmerMobile: string; cropId: string; centerId: string; date: string; timeSlotId: string; expectedQuantityQuintals: number;
}): Promise<{ success: boolean; booking?: Booking; error?: string }> {
  if (usingDemo()) {
    return { success: true, booking: demoCreateBooking(params) };
  }
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
      emailStatus: raw.email_status || raw.emailStatus || '',
      createdAt: raw.createdAt || new Date().toISOString(),
    };
    return { success: true, booking };
  } catch (err: any) {
    return { success: true, booking: demoCreateBooking(params) };
  }
}

export async function getMyBookings(farmerId?: string): Promise<Booking[]> {
  if (usingDemo()) return demoBookings(farmerId || getCurrentFarmer()?.id);
  try {
    const raw = await apiRequest<any[]>('/farmer/bookings');
    return raw.map(normalizeBooking);
  } catch { return demoBookings(farmerId || getCurrentFarmer()?.id); }
}

export async function getBookingById(bookingId: string): Promise<Booking | null> {
  if (usingDemo()) return demoBookingById(bookingId);
  try {
    const raw = await apiRequest<any>(`/farmer/bookings/${bookingId}`);
    return normalizeBooking(raw);
  } catch { return demoBookingById(bookingId); }
}

export async function getDigitalToken(bookingId: string): Promise<{ token: string; booking: Booking | null; }> {
  if (usingDemo()) {
    const booking = demoBookingById(bookingId);
    return { token: booking?.digitalToken || '', booking };
  }
  try {
    const raw = await apiRequest<any>(`/farmer/bookings/${bookingId}/token`);
    return { token: raw.token || '', booking: raw.booking ? normalizeBooking(raw.booking) : null };
  } catch {
    const booking = demoBookingById(bookingId);
    return { token: booking?.digitalToken || '', booking };
  }
}

export async function getProcurementStatus(bookingId: string): Promise<{ status: BookingStatus; booking: Booking | null; }> {
  if (usingDemo()) {
    const booking = demoBookingById(bookingId);
    return { status: booking?.status || 'Booked', booking };
  }
  try { return await apiRequest<any>(`/farmer/bookings/${bookingId}/procurement-status`); } catch {
    const booking = demoBookingById(bookingId);
    return { status: booking?.status || 'Booked', booking };
  }
}

export async function getPaymentStatus(bookingId: string): Promise<{ status: PaymentStatus; booking: Booking | null; }> {
  if (usingDemo()) {
    const booking = demoBookingById(bookingId);
    return { status: booking?.paymentStatus || 'Pending', booking };
  }
  try { return await apiRequest<any>(`/farmer/bookings/${bookingId}/payment-status`); } catch {
    const booking = demoBookingById(bookingId);
    return { status: booking?.paymentStatus || 'Pending', booking };
  }
}

export async function getFarmerProfile(farmerId: string): Promise<Farmer | null> {
  if (usingDemo()) return getCurrentFarmer();
  try { return await apiRequest<Farmer>('/farmer/profile'); } catch { return getCurrentFarmer(); }
}

export async function updateFarmerProfile(farmerId: string, updates: Partial<Farmer>): Promise<Farmer> {
  if (usingDemo()) {
    const current = { ...(getCurrentFarmer() as Farmer), ...updates };
    localStorage.setItem(STORAGE_KEYS.CURRENT_FARMER, JSON.stringify(current));
    return current;
  }
  try {
    const f = await apiRequest<Farmer>('/farmer/profile', {
      method: 'PUT', body: JSON.stringify(updates)
    });
    localStorage.setItem(STORAGE_KEYS.CURRENT_FARMER, JSON.stringify(f));
    return f;
  } catch {
    const current = { ...(getCurrentFarmer() as Farmer), ...updates };
    localStorage.setItem(STORAGE_KEYS.CURRENT_FARMER, JSON.stringify(current));
    return current;
  }
}

export async function getNotifications(farmerId?: string): Promise<AppNotification[]> {
  if (usingDemo()) return demoNotifications(farmerId || getCurrentFarmer()?.id);
  try {
    const raw = await apiRequest<any[]>('/farmer/notifications');
    return raw.map((item) => {
      const rawType = String(item.type || '').toUpperCase();
      const type: AppNotification['type'] = rawType.includes('PAYMENT') || rawType.includes('DBT')
        ? 'payment'
        : rawType.includes('RECEIPT') || rawType.includes('PROCURE')
          ? 'procurement'
          : rawType.includes('TOKEN') || rawType.includes('ARRIVAL')
            ? 'token'
            : 'booking';
      const bookingRef = item.booking_id || item.digital_token;
      const createdAt = item.created_at || item.timestamp || '';
      return {
        id: item.id,
        farmerId: item.farmer_id || item.farmerId || farmerId || '',
        title: item.title || 'KisanQueue update',
        message: item.message || '',
        timestamp: createdAt && !Number.isNaN(Date.parse(createdAt)) ? new Date(createdAt).toLocaleString() : createdAt,
        read: Boolean(item.read),
        type,
        linkTo: type === 'payment' ? '/payment-status' : bookingRef ? `/token/${encodeURIComponent(bookingRef)}` : '/notifications',
      };
    });
  } catch { return demoNotifications(farmerId || getCurrentFarmer()?.id); }
}

export async function markNotificationAsRead(notifId: string): Promise<void> {
  if (usingDemo()) {
    demoMarkRead(notifId);
    return;
  }
  try {
    await apiRequest(`/farmer/notifications/${encodeURIComponent(notifId)}/read`, { method: 'POST' });
  } catch {
    demoMarkRead(notifId);
  }
}

export async function markNotificationsAsRead(farmerId?: string): Promise<void> {
  if (usingDemo()) {
    demoMarkAllRead(farmerId || getCurrentFarmer()?.id);
    return;
  }
  try {
    await apiRequest('/farmer/notifications/read-all', { method: 'POST' });
  } catch {
    demoMarkAllRead(farmerId || getCurrentFarmer()?.id);
  }
}
