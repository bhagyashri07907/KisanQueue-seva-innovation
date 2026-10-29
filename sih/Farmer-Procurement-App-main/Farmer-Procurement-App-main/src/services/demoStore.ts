import {
  AppNotification,
  Booking,
  Crop,
  DateSlots,
  Farmer,
  ProcurementCenter,
} from '../types';
import {
  DEMO_CENTERS,
  DEMO_CROPS,
  DEMO_DATE_SLOTS,
  DEMO_FARMERS,
  INITIAL_DEMO_BOOKINGS,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';
import { MAHARASHTRA_DISTRICTS } from '../data/districts';

const DEMO_TOKEN_PREFIX = 'demo.';
const BOOKINGS_KEY = 'kq_demo_bookings';
const NOTIFS_KEY = 'kq_demo_notifications';

export function isDemoToken(token: string | null): boolean {
  return Boolean(token?.startsWith(DEMO_TOKEN_PREFIX));
}

export function createDemoToken(farmerId: string): string {
  return `${DEMO_TOKEN_PREFIX}${farmerId}`;
}

function loadBookings(): Booking[] {
  const raw = localStorage.getItem(BOOKINGS_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      /* keep seed data */
    }
  }
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(INITIAL_DEMO_BOOKINGS));
  return [...INITIAL_DEMO_BOOKINGS];
}

function saveBookings(bookings: Booking[]): void {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

function loadNotifications(): AppNotification[] {
  const raw = localStorage.getItem(NOTIFS_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      /* keep seed data */
    }
  }
  localStorage.setItem(NOTIFS_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
  return [...INITIAL_NOTIFICATIONS];
}

function saveNotifications(items: AppNotification[]): void {
  localStorage.setItem(NOTIFS_KEY, JSON.stringify(items));
}

export function findDemoFarmer(identifier: string, password?: string): Farmer | null {
  const needle = identifier.trim().toLowerCase();
  const farmer = DEMO_FARMERS.find(
    (f) =>
      f.farmerId.toLowerCase() === needle ||
      f.mobileNumber === identifier.trim() ||
      f.id.toLowerCase() === needle
  );
  if (!farmer) return null;
  if (password && farmer.password && password !== farmer.password) return null;
  return farmer;
}

export function demoLogin(identifier: string, password?: string): { farmer: Farmer; token: string } | null {
  const farmer = findDemoFarmer(identifier, password);
  if (!farmer) return null;
  return { farmer, token: createDemoToken(farmer.id) };
}

export function demoRegister(data: {
  fullName: string;
  mobileNumber: string;
  farmerId: string;
  village: string;
  taluka: string;
  district: string;
  email?: string;
}): Farmer {
  return {
    id: `farmer_local_${Date.now()}`,
    fullName: data.fullName,
    mobileNumber: data.mobileNumber,
    farmerId: data.farmerId,
    village: data.village,
    taluka: data.taluka,
    district: data.district,
    state: 'Maharashtra',
    email: data.email,
    password: 'password123',
  };
}

export function demoCrops(): Crop[] {
  return DEMO_CROPS;
}

export function demoDistricts() {
  return MAHARASHTRA_DISTRICTS.map((d) => ({
    name: d.name,
    talukas: d.talukas,
    center_count: DEMO_CENTERS.filter((c) => c.district === d.name).length,
  }));
}

export function demoCenters(cropId?: string, district?: string): ProcurementCenter[] {
  return DEMO_CENTERS.filter((c) => {
    const cropOk = !cropId || c.acceptedCropIds.includes(cropId);
    const districtOk = !district || c.district.toLowerCase() === district.toLowerCase();
    return cropOk && districtOk;
  });
}

function formatDisplayDate(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function demoSlots(centerId: string): DateSlots[] {
  const template = DEMO_DATE_SLOTS[centerId] || DEMO_DATE_SLOTS.center_baramati || [];
  if (template.length === 0) return [];

  const today = new Date();
  return template.slice(0, 5).map((day, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index + 1);
    const iso = date.toISOString().slice(0, 10);
    return {
      date: iso,
      displayDate: formatDisplayDate(iso),
      slots: day.slots.map((slot) => ({ ...slot, id: `${centerId}_${iso}_${slot.startTime}` })),
    };
  });
}

export function demoCreateBooking(params: {
  farmerId: string;
  farmerName: string;
  farmerMobile: string;
  cropId: string;
  centerId: string;
  date: string;
  timeSlotId: string;
  expectedQuantityQuintals: number;
}): Booking {
  const crop = DEMO_CROPS.find((c) => c.id === params.cropId);
  const center = DEMO_CENTERS.find((c) => c.id === params.centerId);
  const allSlots = demoSlots(params.centerId).flatMap((d) => d.slots.map((s) => ({ ...s, date: d.date, displayDate: d.displayDate })));
  const slot = allSlots.find((s) => s.id === params.timeSlotId);
  const seq = String(1000 + loadBookings().length + 1);
  const booking: Booking = {
    id: `BK${seq}`,
    farmerId: params.farmerId,
    farmerName: params.farmerName,
    farmerMobile: params.farmerMobile,
    cropId: params.cropId,
    cropName: crop?.name || params.cropId,
    centerId: params.centerId,
    centerName: center?.name || params.centerId,
    centerLocation: center?.location || '',
    centerDistrict: center?.district || '',
    date: slot?.displayDate || params.date,
    timeSlot: slot?.timeWindow || '',
    expectedQuantityQuintals: params.expectedQuantityQuintals,
    digitalToken: `KQ-2026-${seq}`,
    status: 'Booked',
    paymentStatus: 'Pending',
    createdAt: new Date().toISOString(),
  };
  const bookings = [booking, ...loadBookings()];
  saveBookings(bookings);

  const notifs = loadNotifications();
  notifs.unshift({
    id: `notif_${Date.now()}`,
    farmerId: params.farmerId,
    title: 'Slot Booked Successfully',
    message: `Your procurement slot has been booked for ${booking.date} at ${booking.centerName}.`,
    timestamp: 'Just now',
    read: false,
    type: 'booking',
    linkTo: `/token/${booking.id}`,
  });
  saveNotifications(notifs);
  return booking;
}

export function demoBookings(farmerId?: string): Booking[] {
  const bookings = loadBookings();
  if (!farmerId) return bookings;
  return bookings.filter((b) => b.farmerId === farmerId);
}

export function demoBookingById(bookingId: string): Booking | null {
  return loadBookings().find((b) => b.id === bookingId || b.digitalToken === bookingId) || null;
}

export function demoNotifications(farmerId?: string): AppNotification[] {
  const items = loadNotifications();
  if (!farmerId) return items;
  return items.filter((n) => n.farmerId === farmerId);
}

export function demoMarkRead(notifId: string): void {
  saveNotifications(loadNotifications().map((n) => (n.id === notifId ? { ...n, read: true } : n)));
}

export function demoMarkAllRead(farmerId?: string): void {
  saveNotifications(
    loadNotifications().map((n) => (farmerId && n.farmerId !== farmerId ? n : { ...n, read: true }))
  );
}
