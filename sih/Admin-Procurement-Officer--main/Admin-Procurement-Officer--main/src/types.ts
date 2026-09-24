export interface User {
  id: string;
  username: string;
  role: 'admin' | 'officer';
  name: string;
  department?: string;
  email?: string;
  assigned_center_id?: string;
  assigned_center_name?: string;
}

export interface ProcurementCenter {
  center_id: string;
  center_name: string;
  district: string;
  taluka: string;
  location: string;
  latitude: number;
  longitude: number;
  accepted_crops: string[];
  intake_capacity: number;
  daily_capacity: number;
  operating_hours: {
    start: string;
    end: string;
  };
  status: 'active' | 'inactive';
  dataset_label?: string;
}

export interface Slot {
  slot_id: string;
  center_id: string;
  center_name: string;
  date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked_count: number;
  remaining_capacity: number;
  status: 'AVAILABLE' | 'FULL' | 'INACTIVE';
}

export interface Officer {
  officer_id: string;
  officer_name: string;
  mobile_number: string;
  email: string;
  assigned_center_id: string;
  assigned_center_name: string;
  username: string;
  temp_password?: string;
  status: 'active' | 'inactive';
  created_at?: string;
}

export interface Farmer {
  farmer_id: string;
  farmer_name: string;
  mobile: string;
  district: string;
  taluka: string;
  village: string;
  kisan_credit_card: string;
  aadhaar_ref: string;
}

export interface Booking {
  booking_id: string;
  digital_token: string;
  farmer_id: string;
  farmer_name: string;
  farmer_mobile?: string;
  center_id: string;
  center_name: string;
  slot_id: string;
  crop: string;
  expected_quantity?: number;
  quantity_quintals?: number;
  date: string;
  slot_date?: string;
  time_slot: string;
  slot_time?: string;
  status: 'Booked' | 'Verified' | 'Procured' | 'Cancelled' | 'ARRIVED' | 'WEIGHED' | 'QUALITY_CHECKED' | 'BOOKED';
  procurement_center?: string;
  aadhaar_last4?: string;
  created_at?: string;
}

export interface ProcurementRecord {
  procurement_id: string;
  booking_id: string;
  receipt_id: string;
  digital_token: string;
  token_id?: string;
  farmer_id: string;
  farmer_name: string;
  farmer_mobile?: string;
  center_id: string;
  center_name: string;
  procurement_center?: string;
  crop: string;
  expected_quantity?: number;
  actual_weight: number;
  weight_quintals?: number;
  quality_status: 'Passed' | 'Failed' | 'Needs Review' | 'Rejected';
  procurement_status: 'Completed' | 'Rejected';
  status?: string;
  officer_id: string;
  procurement_date: string;
  verified_at?: string;
  procured_at?: string;
  notes?: string;
  district?: string;
  payment_status?: 'Pending' | 'Processing' | 'Completed' | 'Disbursed';
  payment_id?: string;
  total_amount?: number;
  msp_rate?: number;
}

export interface PaymentRecord {
  payment_id: string;
  procurement_id?: string;
  receipt_id?: string;
  booking_id?: string;
  farmer_id?: string;
  farmer_name: string;
  center_id?: string;
  crop: string;
  actual_weight?: number;
  msp_rate_per_quintal?: number;
  amount: number;
  total_amount?: number;
  bank_name?: string;
  account_number_masked?: string;
  ifsc?: string;
  transaction_id?: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Disbursed';
  payment_mode?: string;
  utr_reference?: string | null;
  created_at?: string;
  updated_at?: string;
  remarks?: string;
}

export interface Receipt {
  receipt_id: string;
  procurement_id?: string;
  farmer_name: string;
  farmer_id: string;
  crop: string;
  quantity_quintals: number;
  procurement_center: string;
  digital_token: string;
  date: string;
  status: string;
  quality_status?: string;
  rate_per_quintal?: number;
  total_amount?: number;
  payment_status?: string;
}

export interface AdminDashboardData {
  dataset_label: string;
  disclaimer: string;
  stats: {
    total_procurement_centers: number;
    total_daily_slots: number;
    total_intake_capacity_quintals: number;
    total_registered_farmers: number;
    todays_bookings: number;
    completed_procurements: number;
    pending_payments: number;
    active_officers: number;
  };
}

export interface OfficerDashboardData {
  officer: {
    officer_id: string;
    officer_name: string;
    assigned_center_id: string;
    assigned_center_name: string;
  };
  center: ProcurementCenter;
  current_date: string;
  stats: {
    todays_expected_farmers: number;
    tokens_verified: number;
    weighing_completed: number;
    quality_checks_completed: number;
    procurement_completed: number;
    pending_farmers: number;
    todays_bookings_count?: number;
    pending_verification_count?: number;
    verified_farmers_count?: number;
    todays_procurement_quintals?: number;
    pending_payments_count?: number;
  };
  todays_bookings: Booking[];
}

export interface NotificationRecord {
  id: string;
  type: 'BOOKING_CONFIRMED' | 'ARRIVAL_ACK' | 'QUALITY_WEIGHED' | 'RECEIPT_GENERATED' | 'DBT_INITIATED' | 'DBT_CREDITED';
  channel: 'SMS' | 'FCM_PUSH' | 'BOTH';
  recipient_name: string;
  recipient_mobile: string;
  farmer_id: string;
  digital_token: string;
  title: string;
  message: string;
  status: 'DELIVERED' | 'SENT' | 'PENDING';
  carrier_ref: string;
  created_at: string;
}

export interface RedisLockInfo {
  key: string;
  slot_id: string;
  center_id: string;
  center_name?: string;
  farmer_id: string;
  farmer_name?: string;
  locked_at: string;
  ttl_seconds: number;
  purpose: string;
}

export interface TechStackStatus {
  gateway: string;
  database: string;
  slot_cache: string;
  auth_system: string;
  notification_engine: string;
  chart_engine: string;
  client_protocol: string;
  metrics: {
    centers_in_db: number;
    farmers_in_db: number;
    active_redis_locks: number;
    notifications_dispatched: number;
    jwt_sessions_active: number;
  };
}

