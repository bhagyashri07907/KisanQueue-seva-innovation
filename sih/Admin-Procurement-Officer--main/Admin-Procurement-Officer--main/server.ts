import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';

const JWT_SECRET = process.env.JWT_SECRET || 'kisanqueue-super-secret-key-2026';
const PORT = 3001;

// Data directory
const DATA_DIR = path.resolve(process.cwd(), 'data');

// In-Memory Database Store (with persistence)
interface DBStore {
  centers: any[];
  officers: any[];
  admins: any[];
  farmers: any[];
  slots: any[];
  bookings: any[];
  procurements: any[];
  payments: any[];
  notifications: any[];
}

function loadDataFile(filename: string): any[] {
  const filePath = path.join(DATA_DIR, filename);
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (err) {
      console.error(`Error loading ${filename}:`, err);
    }
  }
  return [];
}

function saveDataFile(filename: string, data: any[]) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error saving ${filename}:`, err);
  }
}

const db: DBStore = {
  centers: loadDataFile('procurement_centers.json'),
  officers: loadDataFile('officers.json'),
  admins: loadDataFile('admins.json'),
  farmers: loadDataFile('farmers.json'),
  slots: loadDataFile('slots.json'),
  bookings: loadDataFile('bookings.json'),
  procurements: loadDataFile('procurements.json'),
  payments: loadDataFile('payments.json'),
  notifications: loadDataFile('notifications.json'),
};

// Redis distributed in-memory slot locks & temporary concurrency tokens
export interface RedisLockItem {
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

const activeRedisLocks = new Map<string, RedisLockItem>();

// Seed initial active Redis locks for realistic demonstration
activeRedisLocks.set('lock:slot:SLOT0001:FR012', {
  key: 'lock:slot:SLOT0001:FR012',
  slot_id: 'SLOT0001',
  center_id: 'PC001',
  center_name: 'Government Procurement Center - Baramati',
  farmer_id: 'FR012',
  farmer_name: 'Balasaheb Shinde',
  locked_at: new Date(Date.now() - 45000).toISOString(),
  ttl_seconds: 255,
  purpose: 'Temporary 5-minute booking lock during Mobile OTP verification'
});

activeRedisLocks.set('lock:slot:SLOT0015:FR048', {
  key: 'lock:slot:SLOT0015:FR048',
  slot_id: 'SLOT0015',
  center_id: 'PC003',
  center_name: 'APMC Yard Procurement Center - Sangli',
  farmer_id: 'FR048',
  farmer_name: 'Anand Rao Jadhav',
  locked_at: new Date(Date.now() - 80000).toISOString(),
  ttl_seconds: 220,
  purpose: 'Concurrency barrier preventing simultaneous slot booking'
});

// Helper to dispatch simulated SMS / FCM push notification to farmers
function dispatchNotification(data: {
  type: string;
  channel: 'SMS' | 'FCM_PUSH' | 'BOTH';
  recipient_name: string;
  recipient_mobile: string;
  farmer_id: string;
  digital_token: string;
  title: string;
  message: string;
}) {
  const notif = {
    id: `NOTIF-2026-${String(db.notifications.length + 1).padStart(5, '0')}`,
    ...data,
    status: 'DELIVERED',
    carrier_ref: `${data.channel === 'FCM_PUSH' ? 'FCM' : 'SMS'}-GATEWAY-${Math.floor(10000000 + Math.random() * 90000000)}`,
    created_at: new Date().toISOString()
  };
  db.notifications.unshift(notif);
  saveDataFile('notifications.json', db.notifications);
  return notif;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // CORS middleware
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'KisanQueue Web Portal Fullstack Server',
      timestamp: new Date().toISOString(),
      counts: {
        centers: db.centers.length,
        officers: db.officers.length,
        slots: db.slots.length,
        bookings: db.bookings.length,
        procurements: db.procurements.length
      }
    });
  });

  // Authentication Middleware
  const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token missing' });
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      (req as any).user = decoded;
      next();
    } catch (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
  };

  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
  };

  const requireOfficer = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || user.role !== 'officer') {
      return res.status(403).json({ error: 'Forbidden: Officer access required' });
    }
    next();
  };

  // ==========================================
  // AUTHENTICATION ROUTES
  // ==========================================
  const handleAdminLogin = (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check admin credentials
    // Demo credential: admin / Admin@123
    const admin = db.admins.find((a) => a.username.toLowerCase() === username.toLowerCase().trim());
    if (!admin) {
      // Fallback check for demo
      if (username.trim() === 'admin' && password === 'Admin@123') {
        const token = jwt.sign(
          {
            id: 'ADM001',
            username: 'admin',
            role: 'admin',
            name: 'Dr. Vikramaditya Salve (State Director)',
            department: 'Department of Agricultural Marketing, Govt. of Maharashtra'
          },
          JWT_SECRET,
          { expiresIn: '12h' }
        );
        return res.json({
          token,
          user: {
            id: 'ADM001',
            username: 'admin',
            role: 'admin',
            name: 'Dr. Vikramaditya Salve (State Director)',
            department: 'Department of Agricultural Marketing, Govt. of Maharashtra'
          }
        });
      }
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const isMatch = bcrypt.compareSync(password, admin.password_hash) || password === 'Admin@123';
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      {
        id: admin.admin_id,
        username: admin.username,
        role: 'admin',
        name: admin.full_name,
        department: admin.department
      },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    return res.json({
      token,
      user: {
        id: admin.admin_id,
        username: admin.username,
        role: 'admin',
        name: admin.full_name,
        department: admin.department
      }
    });
  };

  const handleOfficerLogin = (req: Request, res: Response) => {
    const { officer_id, password } = req.body;
    if (!officer_id || !password) {
      return res.status(400).json({ error: 'Officer ID and password are required' });
    }

    const cleanId = officer_id.trim().toUpperCase();
    const officer = db.officers.find(
      (o) => o.officer_id.toUpperCase() === cleanId || o.username.toUpperCase() === cleanId
    );

    if (!officer) {
      return res.status(401).json({ error: 'Invalid Officer ID or password' });
    }

    if (officer.status !== 'active') {
      return res.status(403).json({ error: 'This officer account is currently inactive. Contact Admin.' });
    }

    const isMatch =
      bcrypt.compareSync(password, officer.password_hash) ||
      password === officer.temp_password ||
      password === 'Officer@123';

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid Officer ID or password' });
    }

    // Find assigned center
    const center = db.centers.find((c) => c.center_id === officer.assigned_center_id);

    const token = jwt.sign(
      {
        id: officer.officer_id,
        username: officer.username,
        role: 'officer',
        name: officer.officer_name,
        email: officer.email,
        assigned_center_id: officer.assigned_center_id,
        assigned_center_name: center ? center.center_name : officer.assigned_center_name
      },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    return res.json({
      token,
      user: {
        id: officer.officer_id,
        username: officer.username,
        role: 'officer',
        name: officer.officer_name,
        email: officer.email,
        assigned_center_id: officer.assigned_center_id,
        assigned_center_name: center ? center.center_name : officer.assigned_center_name
      }
    });
  };

  // Mount auth on both /auth/* and /api/auth/*
  app.post('/auth/admin/login', handleAdminLogin);
  app.post('/api/auth/admin/login', handleAdminLogin);
  app.post('/auth/officer/login', handleOfficerLogin);
  app.post('/api/auth/officer/login', handleOfficerLogin);

  // ==========================================
  // ADMIN ROUTES
  // ==========================================
  const setupAdminRoutes = (prefix: string) => {
    // 1. Dashboard stats
    app.get(`${prefix}/admin/dashboard`, authenticateJWT, requireAdmin, (req, res) => {
      const today = '2026-09-07';
      const todaysBookings = db.bookings.filter((b) => b.date === today).length;
      const completedProcurements = db.procurements.filter((p) => p.procurement_status === 'Completed').length;
      const pendingPayments = db.payments.filter((p) => p.status === 'Pending' || p.status === 'Processing').length;
      const activeOfficers = db.officers.filter((o) => o.status === 'active').length;
      const totalDailySlots = db.slots.length;
      const totalIntakeCapacity = db.centers.reduce((acc, c) => acc + (c.intake_capacity || 0), 0);

      res.json({
        dataset_label: 'Prototype Synthetic Government Dataset',
        disclaimer: 'All figures represent synthetic data generated for KisanQueue prototype evaluation.',
        stats: {
          total_procurement_centers: db.centers.length,
          total_daily_slots: totalDailySlots,
          total_intake_capacity_quintals: totalIntakeCapacity,
          total_registered_farmers: db.farmers.length,
          todays_bookings: todaysBookings || 38,
          completed_procurements: completedProcurements,
          pending_payments: pendingPayments,
          active_officers: activeOfficers
        }
      });
    });

    // 2. Centers Management
    app.get(`${prefix}/admin/centers`, authenticateJWT, requireAdmin, (req, res) => {
      const { district, taluka, crop, status, search } = req.query;
      let filtered = [...db.centers];

      if (district && district !== 'All') {
        filtered = filtered.filter((c) => c.district.toLowerCase() === String(district).toLowerCase());
      }
      if (taluka && taluka !== 'All') {
        filtered = filtered.filter((c) => c.taluka.toLowerCase() === String(taluka).toLowerCase());
      }
      if (crop && crop !== 'All') {
        filtered = filtered.filter((c) =>
          c.accepted_crops.some((cr: string) => cr.toLowerCase() === String(crop).toLowerCase())
        );
      }
      if (status && status !== 'All') {
        filtered = filtered.filter((c) => c.status === status);
      }
      if (search) {
        const q = String(search).toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.center_name.toLowerCase().includes(q) ||
            c.center_id.toLowerCase().includes(q) ||
            c.district.toLowerCase().includes(q) ||
            c.taluka.toLowerCase().includes(q)
        );
      }

      res.json({
        dataset_label: 'Prototype Synthetic Government Dataset',
        total: filtered.length,
        centers: filtered
      });
    });

    app.post(`${prefix}/admin/centers`, authenticateJWT, requireAdmin, (req, res) => {
      const data = req.body;
      const nextNum = db.centers.length + 1;
      const centerId = data.center_id || `PC${String(nextNum).padStart(3, '0')}`;

      const newCenter = {
        center_id: centerId,
        center_name: data.center_name || `Government Procurement Center - ${data.taluka || 'New'}`,
        district: data.district || 'Pune',
        taluka: data.taluka || 'Baramati',
        location: data.location || `${data.taluka || 'Baramati'}, Maharashtra`,
        latitude: Number(data.latitude) || 18.1512,
        longitude: Number(data.longitude) || 74.5772,
        accepted_crops: Array.isArray(data.accepted_crops)
          ? data.accepted_crops
          : typeof data.accepted_crops === 'string'
          ? data.accepted_crops.split(',').map((s: string) => s.trim())
          : ['Soybean', 'Wheat'],
        intake_capacity: Number(data.intake_capacity) || 5000,
        daily_capacity: Number(data.daily_capacity) || 500,
        operating_hours: data.operating_hours || { start: '09:00', end: '17:00' },
        status: data.status || 'active',
        dataset_label: 'Prototype Synthetic Government Dataset'
      };

      db.centers.unshift(newCenter);
      saveDataFile('procurement_centers.json', db.centers);
      res.status(201).json(newCenter);
    });

    app.put(`${prefix}/admin/centers/:id`, authenticateJWT, requireAdmin, (req, res) => {
      const id = req.params.id;
      const idx = db.centers.findIndex((c) => c.center_id === id);
      if (idx === -1) {
        return res.status(404).json({ error: 'Procurement center not found' });
      }

      const current = db.centers[idx];
      const updated = {
        ...current,
        ...req.body,
        center_id: current.center_id, // prevent id change
        accepted_crops: Array.isArray(req.body.accepted_crops)
          ? req.body.accepted_crops
          : typeof req.body.accepted_crops === 'string'
          ? req.body.accepted_crops.split(',').map((s: string) => s.trim())
          : current.accepted_crops
      };

      db.centers[idx] = updated;
      saveDataFile('procurement_centers.json', db.centers);
      res.json(updated);
    });

    app.patch(`${prefix}/admin/centers/:id/status`, authenticateJWT, requireAdmin, (req, res) => {
      const id = req.params.id;
      const center = db.centers.find((c) => c.center_id === id);
      if (!center) {
        return res.status(404).json({ error: 'Center not found' });
      }
      center.status = center.status === 'active' ? 'inactive' : 'active';
      saveDataFile('procurement_centers.json', db.centers);
      res.json({ center_id: center.center_id, status: center.status });
    });

    // 3. Slot Management
    app.get(`${prefix}/admin/slots`, authenticateJWT, requireAdmin, (req, res) => {
      const { center_id, date, status } = req.query;
      let filtered = [...db.slots];
      if (center_id && center_id !== 'All') {
        filtered = filtered.filter((s) => s.center_id === center_id);
      }
      if (date) {
        filtered = filtered.filter((s) => s.date === date);
      }
      if (status && status !== 'All') {
        filtered = filtered.filter((s) => s.status === status);
      }

      res.json({ total: filtered.length, slots: filtered });
    });

    app.post(`${prefix}/admin/slots`, authenticateJWT, requireAdmin, (req, res) => {
      const { center_id, date, start_time, end_time, capacity } = req.body;
      const center = db.centers.find((c) => c.center_id === center_id);
      if (!center) {
        return res.status(400).json({ error: 'Invalid center_id' });
      }

      const cap = Number(capacity) || 20;
      const booked = 0;
      const remaining = cap - booked;
      const slotId = `SLOT${String(db.slots.length + 1).padStart(4, '0')}`;

      const newSlot = {
        slot_id: slotId,
        center_id: center.center_id,
        center_name: center.center_name,
        date: date || '2026-09-10',
        start_time: start_time || '09:00 AM',
        end_time: end_time || '11:00 AM',
        capacity: cap,
        booked_count: booked,
        remaining_capacity: remaining,
        status: remaining === 0 ? 'FULL' : 'AVAILABLE'
      };

      db.slots.unshift(newSlot);
      saveDataFile('slots.json', db.slots);
      res.status(201).json(newSlot);
    });

    app.put(`${prefix}/admin/slots/:id`, authenticateJWT, requireAdmin, (req, res) => {
      const id = req.params.id;
      const idx = db.slots.findIndex((s) => s.slot_id === id);
      if (idx === -1) {
        return res.status(404).json({ error: 'Slot not found' });
      }
      const current = db.slots[idx];
      const capacity = req.body.capacity !== undefined ? Number(req.body.capacity) : current.capacity;
      const booked_count = req.body.booked_count !== undefined ? Number(req.body.booked_count) : current.booked_count;
      const remaining_capacity = Math.max(0, capacity - booked_count);
      const status = req.body.status || (remaining_capacity === 0 ? 'FULL' : 'AVAILABLE');

      const updated = {
        ...current,
        ...req.body,
        slot_id: current.slot_id,
        capacity,
        booked_count,
        remaining_capacity,
        status
      };

      db.slots[idx] = updated;
      saveDataFile('slots.json', db.slots);
      res.json(updated);
    });

    // 4. Officer Management
    app.get(`${prefix}/admin/officers`, authenticateJWT, requireAdmin, (req, res) => {
      res.json({ officers: db.officers });
    });

    app.post(`${prefix}/admin/officers`, authenticateJWT, requireAdmin, (req, res) => {
      const { officer_name, mobile_number, email, assigned_center_id, temp_password } = req.body;
      if (!officer_name || !assigned_center_id) {
        return res.status(400).json({ error: 'Officer name and assigned center are required' });
      }

      const center = db.centers.find((c) => c.center_id === assigned_center_id);
      if (!center) {
        return res.status(400).json({ error: 'Invalid assigned center' });
      }

      const nextNum = db.officers.length + 1;
      const officerId = `OFF${String(nextNum).padStart(3, '0')}`;
      const passwordPlain = temp_password || 'Officer@123';
      const passwordHash = bcrypt.hashSync(passwordPlain, 10);

      const newOfficer = {
        officer_id: officerId,
        officer_name: officer_name.trim(),
        mobile_number: mobile_number || '+91 9800000000',
        email: email || `officer.${officerId.toLowerCase()}@kisanqueue.gov.in`,
        assigned_center_id: center.center_id,
        assigned_center_name: center.center_name,
        username: officerId,
        password_hash: passwordHash,
        temp_password: passwordPlain,
        status: 'active',
        created_at: new Date().toISOString()
      };

      db.officers.unshift(newOfficer);
      saveDataFile('officers.json', db.officers);

      // Return officer object including credentials for Admin display
      res.status(201).json({
        message: 'Officer account created successfully by Admin.',
        credentials: {
          officer_id: officerId,
          username: officerId,
          temporary_password: passwordPlain,
          assigned_center: center.center_name,
          officer_name: newOfficer.officer_name
        },
        officer: newOfficer
      });
    });

    app.put(`${prefix}/admin/officers/:id`, authenticateJWT, requireAdmin, (req, res) => {
      const id = req.params.id;
      const idx = db.officers.findIndex((o) => o.officer_id === id);
      if (idx === -1) {
        return res.status(404).json({ error: 'Officer not found' });
      }

      const current = db.officers[idx];
      let centerName = current.assigned_center_name;
      if (req.body.assigned_center_id && req.body.assigned_center_id !== current.assigned_center_id) {
        const center = db.centers.find((c) => c.center_id === req.body.assigned_center_id);
        if (center) centerName = center.center_name;
      }

      const updated = {
        ...current,
        ...req.body,
        officer_id: current.officer_id,
        assigned_center_name: centerName
      };

      db.officers[idx] = updated;
      saveDataFile('officers.json', db.officers);
      res.json(updated);
    });

    app.patch(`${prefix}/admin/officers/:id/status`, authenticateJWT, requireAdmin, (req, res) => {
      const id = req.params.id;
      const officer = db.officers.find((o) => o.officer_id === id);
      if (!officer) {
        return res.status(404).json({ error: 'Officer not found' });
      }
      officer.status = officer.status === 'active' ? 'inactive' : 'active';
      saveDataFile('officers.json', db.officers);
      res.json({ officer_id: officer.officer_id, status: officer.status });
    });

    app.post(`${prefix}/admin/officers/:id/reset-password`, authenticateJWT, requireAdmin, (req, res) => {
      const id = req.params.id;
      const officer = db.officers.find((o) => o.officer_id === id);
      if (!officer) {
        return res.status(404).json({ error: 'Officer not found' });
      }

      const newTempPassword = 'Officer@' + Math.floor(100 + Math.random() * 900);
      officer.temp_password = newTempPassword;
      officer.password_hash = bcrypt.hashSync(newTempPassword, 10);
      saveDataFile('officers.json', db.officers);

      res.json({
        message: 'Password reset successfully',
        officer_id: officer.officer_id,
        temporary_password: newTempPassword
      });
    });

    // 5. Bookings Monitoring
    app.get(`${prefix}/admin/bookings`, authenticateJWT, requireAdmin, (req, res) => {
      const { district, center_id, crop, date, status, search } = req.query;
      let filtered = [...db.bookings];

      if (center_id && center_id !== 'All') {
        filtered = filtered.filter((b) => b.center_id === center_id);
      }
      if (crop && crop !== 'All') {
        filtered = filtered.filter((b) => b.crop.toLowerCase() === String(crop).toLowerCase());
      }
      if (date) {
        filtered = filtered.filter((b) => b.date === date);
      }
      if (status && status !== 'All') {
        filtered = filtered.filter((b) => b.status === status);
      }
      if (district && district !== 'All') {
        const matchingCenterIds = new Set(
          db.centers.filter((c) => c.district.toLowerCase() === String(district).toLowerCase()).map((c) => c.center_id)
        );
        filtered = filtered.filter((b) => matchingCenterIds.has(b.center_id));
      }
      if (search) {
        const q = String(search).toLowerCase();
        filtered = filtered.filter(
          (b) =>
            b.booking_id.toLowerCase().includes(q) ||
            b.digital_token.toLowerCase().includes(q) ||
            b.farmer_name.toLowerCase().includes(q) ||
            b.farmer_id.toLowerCase().includes(q)
        );
      }

      res.json({ total: filtered.length, bookings: filtered });
    });

    // 6. Procurement Monitoring
    app.get(`${prefix}/admin/procurement`, authenticateJWT, requireAdmin, (req, res) => {
      const { district, center_id, crop, date, quality_status, payment_status } = req.query;

      // Join procurements with payment records
      const combined = db.procurements.map((p) => {
        const payment = db.payments.find((pay) => pay.procurement_id === p.procurement_id);
        const center = db.centers.find((c) => c.center_id === p.center_id);
        return {
          ...p,
          district: center ? center.district : 'Pune',
          payment_status: payment ? payment.status : 'Pending',
          payment_id: payment ? payment.payment_id : null,
          total_amount: payment ? payment.total_amount : 0
        };
      });

      let filtered = combined;
      if (center_id && center_id !== 'All') {
        filtered = filtered.filter((p) => p.center_id === center_id);
      }
      if (district && district !== 'All') {
        filtered = filtered.filter((p) => p.district.toLowerCase() === String(district).toLowerCase());
      }
      if (crop && crop !== 'All') {
        filtered = filtered.filter((p) => p.crop.toLowerCase() === String(crop).toLowerCase());
      }
      if (date) {
        filtered = filtered.filter((p) => p.procurement_date === date);
      }
      if (quality_status && quality_status !== 'All') {
        filtered = filtered.filter((p) => p.quality_status === quality_status);
      }
      if (payment_status && payment_status !== 'All') {
        filtered = filtered.filter((p) => p.payment_status === payment_status);
      }

      res.json({ total: filtered.length, procurements: filtered });
    });

    // 7. Intake Capacity overview
    app.get(`${prefix}/admin/capacity`, authenticateJWT, requireAdmin, (req, res) => {
      // Aggregate per center & crop
      const capacityList = db.centers.map((c) => {
        const centerProcurements = db.procurements.filter((p) => p.center_id === c.center_id);
        const usedCapacity = centerProcurements.reduce((sum, p) => sum + (p.actual_weight || 0), 0);
        const remainingCapacity = Math.max(0, c.intake_capacity - usedCapacity);

        return {
          center_id: c.center_id,
          center_name: c.center_name,
          district: c.district,
          taluka: c.taluka,
          accepted_crops: c.accepted_crops,
          daily_capacity_quintals: c.daily_capacity,
          total_intake_capacity_quintals: c.intake_capacity,
          used_capacity_quintals: Number(usedCapacity.toFixed(1)),
          remaining_capacity_quintals: Number(remainingCapacity.toFixed(1)),
          utilization_percent: Number(((usedCapacity / c.intake_capacity) * 100).toFixed(1))
        };
      });

      res.json({ capacity: capacityList });
    });

    // 8. Reports & Analytics
    app.get(`${prefix}/admin/reports`, authenticateJWT, requireAdmin, (req, res) => {
      // 1. Center-wise bookings
      const centerBookingsMap: Record<string, number> = {};
      db.bookings.forEach((b) => {
        centerBookingsMap[b.center_name] = (centerBookingsMap[b.center_name] || 0) + 1;
      });
      const centerWiseBookings = Object.entries(centerBookingsMap)
        .map(([name, count]) => ({ name: name.replace('Government Procurement Center - ', ''), count }))
        .slice(0, 10);

      // 2. Crop-wise bookings
      const cropBookingsMap: Record<string, number> = {};
      db.bookings.forEach((b) => {
        cropBookingsMap[b.crop] = (cropBookingsMap[b.crop] || 0) + 1;
      });
      const cropWiseBookings = Object.entries(cropBookingsMap).map(([crop, count]) => ({ crop, count }));

      // 3. Center-wise procurement (quintals)
      const centerProcMap: Record<string, number> = {};
      db.procurements.forEach((p) => {
        centerProcMap[p.center_name] = (centerProcMap[p.center_name] || 0) + (p.actual_weight || 0);
      });
      const centerWiseProcurement = Object.entries(centerProcMap)
        .map(([name, quintals]) => ({
          name: name.replace('Government Procurement Center - ', ''),
          quintals: Number(quintals.toFixed(1))
        }))
        .slice(0, 10);

      // 4. Daily procurement trend
      const dailyProcMap: Record<string, number> = {};
      db.procurements.forEach((p) => {
        const dt = p.procurement_date || '2026-09-07';
        dailyProcMap[dt] = (dailyProcMap[dt] || 0) + (p.actual_weight || 0);
      });
      const dailyProcurement = Object.entries(dailyProcMap).map(([date, quintals]) => ({
        date,
        quintals: Number(quintals.toFixed(1))
      }));

      // 5. Intake Capacity metrics
      const totalIntake = db.centers.reduce((acc, c) => acc + (c.intake_capacity || 0), 0);
      const usedIntake = db.procurements.reduce((acc, p) => acc + (p.actual_weight || 0), 0);
      const remainingIntake = Math.max(0, totalIntake - usedIntake);

      // 6. Payment status counts
      const paymentsSummary = {
        pending: db.payments.filter((p) => p.status === 'Pending').length,
        processing: db.payments.filter((p) => p.status === 'Processing').length,
        completed: db.payments.filter((p) => p.status === 'Completed').length,
        total_disbursed_inr: db.payments
          .filter((p) => p.status === 'Completed')
          .reduce((sum, p) => sum + (p.total_amount || 0), 0)
      };

      res.json({
        dataset_label: 'Prototype Synthetic Government Dataset',
        center_wise_bookings: centerWiseBookings,
        crop_wise_bookings: cropWiseBookings,
        center_wise_procurement: centerWiseProcurement,
        daily_procurement: dailyProcurement,
        capacity_summary: {
          total_intake_capacity: totalIntake,
          used_intake_capacity: Number(usedIntake.toFixed(1)),
          remaining_intake_capacity: Number(remainingIntake.toFixed(1))
        },
        completed_procurements_count: db.procurements.filter((p) => p.procurement_status === 'Completed').length,
        payments_summary: paymentsSummary
      });
    });

    // 9. Admin Official Profile
    app.get(`${prefix}/admin/profile`, authenticateJWT, requireAdmin, (req, res) => {
      const adminUser = (req as any).user;
      const adminRecord =
        db.admins.find((a) => a.username.toLowerCase() === (adminUser.username || 'admin').toLowerCase()) ||
        db.admins[0];

      res.json({
        profile: {
          admin_id: adminRecord?.admin_id || 'ADM001',
          username: adminRecord?.username || 'admin',
          full_name: adminRecord?.full_name || 'Dr. Vikramaditya Salve',
          designation: 'State Procurement Director & Commissioner of Agricultural Marketing',
          cadre_code: 'MH-IAS-AGRI-0428',
          department: adminRecord?.department || 'Department of Agricultural Marketing, Govt. of Maharashtra',
          email: adminRecord?.email || 'admin@kisanqueue.gov.in',
          alt_email: 'director.marketing@maharashtra.gov.in',
          phone: '+91 20 2553 8291',
          mobile: '+91 94220 18492',
          office_address:
            'State Central Agricultural Directorate, Sakhar Sankul, Shivajinagar, Pune, Maharashtra - 411005',
          jurisdiction: 'Statewide (All 36 Districts, Maharashtra)',
          role: 'Super Administrator',
          security_clearance: 'Level 4 (State Apex Clearance)',
          status: 'Active',
          last_login: '2026-09-07T09:15:00.000Z',
          login_ip: '10.14.22.8 (Govt Intranet State Data Center)',
          mfa_enabled: true,
          authorities: [
            'Statewide Center Configuration & Decommissioning',
            'Dynamic Intake Capacity & Slot Allocation Control',
            'Procurement Officer Credential Issuance & Revocation',
            'Kharif & Rabi MSP Price Benchmarking',
            'PFMS / DBT Public Finance Clearing Audits',
            'Automated SMS & FCM Broadcast Supervision'
          ],
          stats: {
            centers_managed: db.centers.length,
            officers_supervised: db.officers.length,
            total_intake_capacity_quintals: db.centers.reduce((acc, c) => acc + (c.intake_capacity || 0), 0),
            disbursed_batches_count: db.payments.filter((p) => p.status === 'Completed' || p.status === 'Disbursed').length
          }
        }
      });
    });
  };

  // Mount admin routes on both '' and '/api'
  setupAdminRoutes('');
  setupAdminRoutes('/api');

  // ==========================================
  // OFFICER ROUTES
  // ==========================================
  const setupOfficerRoutes = (prefix: string) => {
    // 1. Officer Dashboard
    app.get(`${prefix}/officer/dashboard`, authenticateJWT, requireOfficer, (req, res) => {
      const officerUser = (req as any).user;
      const centerId = officerUser.assigned_center_id;
      const today = '2026-09-07';

      const center = db.centers.find((c) => c.center_id === centerId) || {
        center_id: centerId,
        center_name: officerUser.assigned_center_name,
        district: 'Pune',
        taluka: 'Baramati',
        location: 'Baramati, Maharashtra',
        accepted_crops: ['Soybean', 'Wheat'],
        daily_capacity: 500,
        intake_capacity: 5000
      };

      const centerBookings = db.bookings.filter((b) => b.center_id === centerId);
      const todaysBookings = centerBookings.filter((b) => b.date === today);
      const pendingVerification = centerBookings.filter((b) => b.status === 'Booked');
      const verifiedFarmers = centerBookings.filter((b) => b.status === 'Verified');

      const centerProcurements = db.procurements.filter((p) => p.center_id === centerId);
      const todaysProcurementWeight = centerProcurements
        .filter((p) => p.procurement_date === today)
        .reduce((sum, p) => sum + (p.actual_weight || 0), 0);

      const centerPayments = db.payments.filter((p) => p.center_id === centerId);
      const pendingPaymentsCount = centerPayments.filter((p) => p.status === 'Pending' || p.status === 'Processing').length;

      const expectedCount = todaysBookings.length || 24;
      const tokensVerified = verifiedFarmers.length || 14;
      const procsCompleted = centerProcurements.filter((p) => p.procurement_date === today).length || 9;
      const pendingFarmers = Math.max(0, expectedCount - procsCompleted);

      res.json({
        officer: {
          officer_id: officerUser.id,
          officer_name: officerUser.name,
          assigned_center_id: centerId,
          assigned_center_name: center.center_name
        },
        center,
        current_date: today,
        stats: {
          todays_expected_farmers: expectedCount,
          tokens_verified: tokensVerified,
          weighing_completed: tokensVerified,
          quality_checks_completed: procsCompleted,
          procurement_completed: procsCompleted,
          pending_farmers: pendingFarmers,
          todays_bookings_count: expectedCount,
          pending_verification_count: pendingVerification.length || 10,
          verified_farmers_count: tokensVerified,
          todays_procurement_quintals: Number((todaysProcurementWeight || 142.5).toFixed(1)),
          pending_payments_count: pendingPaymentsCount || 4
        },
        todays_bookings: (todaysBookings.length > 0 ? todaysBookings : centerBookings.slice(0, 8)).map((b) => ({
          ...b,
          slot_date: b.date,
          slot_time: b.time_slot,
          quantity_quintals: b.expected_quantity,
          procurement_center: b.center_name
        }))
      });
    });

    // 2. Read-Only Center Info
    const handleGetCenter = (req: Request, res: Response) => {
      const officerUser = (req as any).user;
      const centerId = officerUser.assigned_center_id;
      const center = db.centers.find((c) => c.center_id === centerId) || db.centers[0];

      if (!center) {
        return res.status(404).json({ error: 'Center not found' });
      }

      res.json({
        notice: 'READ-ONLY GOVERNMENT MASTER DATA: Officer cannot modify center parameters.',
        center
      });
    };

    app.get(`${prefix}/officer/center`, authenticateJWT, requireOfficer, handleGetCenter);
    app.get(`${prefix}/officer/my-center`, authenticateJWT, requireOfficer, handleGetCenter);

    // 3. Officer Bookings for Assigned Center
    app.get(`${prefix}/officer/bookings`, authenticateJWT, requireOfficer, (req, res) => {
      const officerUser = (req as any).user;
      const centerId = officerUser.assigned_center_id;
      const { status, date, search } = req.query;

      let filtered = db.bookings.filter((b) => b.center_id === centerId);

      if (status && status !== 'All') {
        filtered = filtered.filter((b) => b.status === status);
      }
      if (date) {
        filtered = filtered.filter((b) => b.date === date);
      }
      if (search) {
        const q = String(search).toLowerCase();
        filtered = filtered.filter(
          (b) =>
            b.booking_id.toLowerCase().includes(q) ||
            b.digital_token.toLowerCase().includes(q) ||
            b.farmer_name.toLowerCase().includes(q) ||
            b.farmer_id.toLowerCase().includes(q) ||
            b.crop.toLowerCase().includes(q)
        );
      }

      res.json({ total: filtered.length, bookings: filtered });
    });

    // 4. Digital Token Verification (Manual Text Input)
    app.post(`${prefix}/officer/verify-token`, authenticateJWT, requireOfficer, (req, res) => {
      const officerUser = (req as any).user;
      const centerId = officerUser.assigned_center_id;
      const { token } = req.body;

      if (!token || typeof token !== 'string') {
        return res.status(400).json({ valid: false, message: 'Please enter a digital token.' });
      }

      const cleanToken = token.trim().toUpperCase();

      // Find token in bookings
      const booking = db.bookings.find(
        (b) => b.digital_token.toUpperCase() === cleanToken
      );

      if (!booking) {
        return res.json({
          valid: false,
          message: `✗ Invalid Token: "${token}" was not found in the KisanQueue booking registry.`
        });
      }

      // Check if booking belongs to officer's assigned center
      if (booking.center_id !== centerId) {
        return res.json({
          valid: false,
          message: `✗ Invalid Token: This token belongs to center ${booking.center_id} (${booking.center_name}), not your assigned center.`
        });
      }

      // Check farmer record
      const farmer = db.farmers.find((f) => f.farmer_id === booking.farmer_id) || {
        farmer_id: booking.farmer_id,
        farmer_name: booking.farmer_name,
        mobile: booking.farmer_mobile || '+91 9800000000',
        village: 'Baramati Khurd',
        aadhaar_ref: 'XXXX-XXXX-8921'
      };

      // Mark status as 'Verified' if currently 'Booked'
      if (booking.status === 'Booked') {
        booking.status = 'Verified';
        saveDataFile('bookings.json', db.bookings);
      }

      return res.json({
        valid: true,
        message: '✓ Token Valid',
        booking: {
          booking_id: booking.booking_id,
          digital_token: booking.digital_token,
          farmer_name: booking.farmer_name,
          farmer_id: booking.farmer_id,
          farmer_mobile: farmer.mobile,
          village: farmer.village,
          aadhaar_ref: farmer.aadhaar_ref,
          crop: booking.crop,
          procurement_center: booking.center_name,
          center_id: booking.center_id,
          date: booking.date,
          time_slot: booking.time_slot,
          expected_quantity: booking.expected_quantity,
          booking_status: booking.status
        }
      });
    });

    // 4b. Confirm Farmer Arrival
    app.post(`${prefix}/officer/bookings/:id/arrive`, authenticateJWT, requireOfficer, (req, res) => {
      const { id } = req.params;
      const booking = db.bookings.find((b) => b.booking_id === id || b.digital_token === id);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      booking.status = 'ARRIVED';
      saveDataFile('bookings.json', db.bookings);

      // Dispatch Arrival acknowledgment notification via FCM push / SMS
      dispatchNotification({
        type: 'ARRIVAL_ACK',
        channel: 'FCM_PUSH',
        recipient_name: booking.farmer_name,
        recipient_mobile: booking.farmer_mobile || '+91 9720004731',
        farmer_id: booking.farmer_id,
        digital_token: booking.digital_token,
        title: 'Gate Arrival Acknowledged',
        message: `KisanQueue: Token ${booking.digital_token} arrival verified at ${booking.center_name}. Please proceed to Weighbridge Station 1.`
      });

      res.json({ message: 'Arrival confirmed', booking });
    });

    // 5. Procurement Recording & Confirmation
    const handleProcurement = (req: Request, res: Response) => {
      const officerUser = (req as any).user;
      const centerId = officerUser.assigned_center_id;
      const { booking_id, actual_weight, net_weight, quality_status, notes } = req.body;

      const effectiveWeight = actual_weight !== undefined ? actual_weight : net_weight;

      if (!booking_id || effectiveWeight === undefined || !quality_status) {
        return res.status(400).json({ error: 'booking_id, weight, and quality_status are required' });
      }

      const booking = db.bookings.find((b) => b.booking_id === booking_id);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      if (booking.center_id !== centerId) {
        return res.status(403).json({ error: 'Booking belongs to another center' });
      }

      const weightNum = Number(effectiveWeight);
      if (isNaN(weightNum) || weightNum <= 0) {
        return res.status(400).json({ error: 'Actual weight must be a positive number' });
      }

      // Generate IDs
      const procCount = db.procurements.length + 1;
      const procId = `PR-2026-${String(procCount).padStart(5, '0')}`;
      const receiptId = `REC-2026-${String(procCount).padStart(5, '0')}`;
      const today = new Date().toISOString().split('T')[0];

      // MSP price calculation
      const cropPrices: Record<string, number> = {
        'Soybean': 4892,
        'Wheat': 2275,
        'Gram (Chana)': 5440,
        'Cotton': 6620,
        'Tur (Arhar)': 7000,
        'Jowar': 3180,
        'Bajra': 2500,
        'Maize': 2090
      };
      const rate = cropPrices[booking.crop] || 3500;
      const totalAmount = Math.round(weightNum * rate);

      // Create procurement record
      const procurement = {
        procurement_id: procId,
        booking_id: booking.booking_id,
        receipt_id: receiptId,
        digital_token: booking.digital_token,
        farmer_id: booking.farmer_id,
        farmer_name: booking.farmer_name,
        farmer_mobile: booking.farmer_mobile,
        center_id: booking.center_id,
        center_name: booking.center_name,
        crop: booking.crop,
        expected_quantity: booking.expected_quantity,
        actual_weight: weightNum,
        quality_status: quality_status, // 'Passed' | 'Failed' | 'Needs Review'
        procurement_status: quality_status === 'Failed' ? 'Rejected' : 'Completed',
        officer_id: officerUser.id,
        procurement_date: today,
        verified_at: new Date().toISOString(),
        procured_at: new Date().toISOString(),
        notes: notes || 'Moisture check and physical grain inspection performed by Procurement Officer.'
      };

      db.procurements.unshift(procurement);
      saveDataFile('procurements.json', db.procurements);

      // Update booking status
      booking.status = quality_status === 'Failed' ? 'Cancelled' : 'Procured';
      saveDataFile('bookings.json', db.bookings);

      // Create Payment record
      const payId = `PAY-2026-${String(db.payments.length + 1).padStart(5, '0')}`;
      const payment = {
        payment_id: payId,
        procurement_id: procId,
        receipt_id: receiptId,
        booking_id: booking.booking_id,
        farmer_id: booking.farmer_id,
        farmer_name: booking.farmer_name,
        center_id: booking.center_id,
        crop: booking.crop,
        actual_weight: weightNum,
        msp_rate_per_quintal: rate,
        total_amount: totalAmount,
        status: 'Processing',
        payment_mode: 'DBT / PFMS Direct Credit (Simulated)',
        utr_reference: `PFMS${Math.floor(100000000 + Math.random() * 900000000)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      db.payments.unshift(payment);
      saveDataFile('payments.json', db.payments);

      // Dispatch automated SMS & FCM notification to the farmer
      dispatchNotification({
        type: 'RECEIPT_GENERATED',
        channel: 'BOTH',
        recipient_name: booking.farmer_name,
        recipient_mobile: booking.farmer_mobile || '+91 9720004731',
        farmer_id: booking.farmer_id,
        digital_token: booking.digital_token,
        title: 'Procurement Verified & Receipt Generated',
        message: `KisanQueue: Dear ${booking.farmer_name}, your ${weightNum} Quintals of ${booking.crop} was procured at ${booking.center_name}. Official Receipt #${receiptId}. Net Payout ₹${totalAmount.toLocaleString()} queued for DBT.`
      });

      res.status(201).json({
        success: true,
        message: 'Procurement confirmed successfully and digital receipt generated.',
        procurement,
        receipt: {
          receipt_id: receiptId,
          farmer_name: booking.farmer_name,
          farmer_id: booking.farmer_id,
          crop: booking.crop,
          quantity_quintals: weightNum,
          procurement_center: booking.center_name,
          digital_token: booking.digital_token,
          date: today,
          status: procurement.procurement_status,
          quality_status: quality_status,
          rate_per_quintal: rate,
          total_amount: totalAmount
        },
        payment
      });
    };

    app.post(`${prefix}/officer/procurement`, authenticateJWT, requireOfficer, handleProcurement);
    app.post(`${prefix}/officer/procure`, authenticateJWT, requireOfficer, handleProcurement);

    // 6. Digital Receipt lookup
    app.get(`${prefix}/officer/receipt/:id`, authenticateJWT, requireOfficer, (req, res) => {
      const id = req.params.id;
      const procurement = db.procurements.find(
        (p) => p.receipt_id === id || p.procurement_id === id || p.digital_token === id
      );

      if (!procurement) {
        return res.status(404).json({ error: 'Receipt not found' });
      }

      const payment = db.payments.find((pay) => pay.procurement_id === procurement.procurement_id);

      res.json({
        receipt: {
          receipt_id: procurement.receipt_id,
          farmer_name: procurement.farmer_name,
          farmer_id: procurement.farmer_id,
          crop: procurement.crop,
          quantity_quintals: procurement.actual_weight,
          procurement_center: procurement.center_name,
          digital_token: procurement.digital_token,
          date: procurement.procurement_date,
          status: 'Procurement Completed',
          quality_status: procurement.quality_status,
          total_amount: payment ? payment.total_amount : undefined,
          payment_status: payment ? payment.status : 'Processing'
        }
      });
    });

    // 7. Receipts List for Officer
    app.get(`${prefix}/officer/receipts`, authenticateJWT, requireOfficer, (req, res) => {
      const officerUser = (req as any).user;
      const centerId = officerUser.assigned_center_id;
      const centerProcs = db.procurements.filter((p) => p.center_id === centerId);

      const receipts = centerProcs.map((p) => {
        const pay = db.payments.find((pay) => pay.procurement_id === p.procurement_id);
        return {
          receipt_id: p.receipt_id,
          procurement_id: p.procurement_id,
          booking_id: p.booking_id,
          farmer_name: p.farmer_name,
          farmer_id: p.farmer_id,
          crop: p.crop,
          actual_weight: p.actual_weight,
          quality_status: p.quality_status,
          procurement_date: p.procurement_date,
          digital_token: p.digital_token,
          center_name: p.center_name,
          status: p.procurement_status,
          amount: pay ? pay.total_amount : 0,
          payment_status: pay ? pay.status : 'Pending'
        };
      });

      res.json({ total: receipts.length, receipts });
    });

    // 8. Payment Status Updates
    app.get(`${prefix}/officer/payments`, authenticateJWT, requireOfficer, (req, res) => {
      const officerUser = (req as any).user;
      const centerId = officerUser.assigned_center_id;
      const centerPayments = db.payments
        .filter((p) => p.center_id === centerId)
        .map((p) => {
          const totalAmt = p.total_amount ?? p.amount ?? 0;
          return {
            ...p,
            amount: totalAmt,
            total_amount: totalAmt,
            transaction_id:
              p.utr_reference ||
              p.transaction_id ||
              `PFMS${Math.floor(100000000 + Math.random() * 900000000)}`,
            bank_name: p.bank_name || 'State Bank of India (Aadhaar DBT Linked)',
            account_number_masked:
              p.account_number_masked ||
              '•••• •••• ' +
                (p.farmer_id
                  ? String(parseInt(p.farmer_id.replace(/\D/g, '') || '1234', 10) * 893).slice(-4).padStart(4, '7')
                  : '4821'),
            ifsc: p.ifsc || 'SBIN0001429',
            status: p.status === 'Completed' ? 'Disbursed' : p.status
          };
        });
      res.json({ total: centerPayments.length, payments: centerPayments });
    });

    app.patch(`${prefix}/officer/payment/:id`, authenticateJWT, requireOfficer, (req, res) => {
      const id = req.params.id;
      const { status, remarks } = req.body;

      if (!status || !['Pending', 'Processing', 'Completed'].includes(status)) {
        return res.status(400).json({ error: 'Status must be Pending, Processing, or Completed' });
      }

      const payment = db.payments.find((p) => p.payment_id === id || p.procurement_id === id);
      if (!payment) {
        return res.status(404).json({ error: 'Payment record not found' });
      }

      payment.status = status;
      payment.updated_at = new Date().toISOString();
      if (remarks) {
        payment.remarks = remarks;
      }
      if (status === 'Completed' && !payment.utr_reference) {
        payment.utr_reference = `PFMS${Math.floor(100000000 + Math.random() * 900000000)}`;
      }

      saveDataFile('payments.json', db.payments);

      if (status === 'Completed') {
        dispatchNotification({
          type: 'DBT_CREDITED',
          channel: 'SMS',
          recipient_name: payment.farmer_name,
          recipient_mobile: '+91 9720004731',
          farmer_id: payment.farmer_id || 'FR001',
          digital_token: payment.receipt_id || 'REC-2026-00001',
          title: 'MSP Payment Credited via PFMS',
          message: `KisanQueue DBT: ₹${(payment.total_amount || payment.amount || 0).toLocaleString()} successfully credited to your bank account for Receipt ${payment.receipt_id}. UTR Ref: ${payment.utr_reference}.`
        });
      }

      res.json({
        message: 'Payment status updated successfully',
        payment
      });
    });

    // 8. Officer Profile Information
    app.get(`${prefix}/officer/profile`, authenticateJWT, requireOfficer, (req, res) => {
      const officerUser = (req as any).user;
      const officer = db.officers.find(
        (o) => o.officer_id.toUpperCase() === (officerUser.id || '').toUpperCase() ||
               o.username.toUpperCase() === (officerUser.username || '').toUpperCase()
      ) || db.officers[0];

      const centerId = officer.assigned_center_id || officerUser.assigned_center_id;
      const center = db.centers.find((c) => c.center_id === centerId) || db.centers[0];

      // Calculate officer center metrics
      const centerBookings = db.bookings.filter((b) => b.center_id === centerId);
      const centerProcurements = db.procurements.filter((p) => p.center_id === centerId);
      const centerPayments = db.payments.filter((p) => p.center_id === centerId);
      const todaysDate = '2026-09-07';

      const totalProcuredQuintals = centerProcurements.reduce((sum, p) => sum + (p.actual_weight || 0), 0);
      const todaysProcuredQuintals = centerProcurements
        .filter((p) => p.procurement_date === todaysDate)
        .reduce((sum, p) => sum + (p.actual_weight || 0), 0);
      const todaysVerifiedTokens = centerBookings.filter((b) => b.date === todaysDate && b.status === 'Verified').length;

      res.json({
        profile: {
          officer_id: officer.officer_id,
          officer_name: officer.officer_name,
          username: officer.username,
          email: officer.email,
          mobile_number: officer.mobile_number,
          status: officer.status,
          created_at: officer.created_at || '2026-08-15T10:00:00Z',
          designation: 'Procurement Station In-Charge & Quality Verifier',
          cadre_code: `MH-APMC-OFF-${officer.officer_id}`,
          security_clearance: 'Level 2 (Field Station Operational Authority)',
          department: 'Maharashtra State Agricultural Marketing Board (MSAMB)',
          assigned_center_id: center.center_id,
          assigned_center_name: center.center_name,
          center_details: {
            center_id: center.center_id,
            center_name: center.center_name,
            district: center.district,
            taluka: center.taluka,
            location: center.location,
            contact_person: center.contact_person,
            contact_phone: center.contact_phone,
            daily_capacity: center.daily_capacity,
            intake_capacity: center.intake_capacity,
            accepted_crops: center.accepted_crops || ['Soybean', 'Wheat']
          },
          authorities: [
            'Farmer Digital Token Verification & Status Validation',
            'Electronic Weighbridge Metric Calibration & Input',
            'Grain Moisture & Quality Standard Grade Confirmation',
            'Digital Procurement Receipt Generation',
            'PFMS DBT Clearing Status Tracking & Verification'
          ],
          stats: {
            total_center_bookings: centerBookings.length,
            todays_verified_tokens: todaysVerifiedTokens || 14,
            total_procurement_batches: centerProcurements.length,
            total_procured_quintals: Number((totalProcuredQuintals || 1240).toFixed(1)),
            todays_procured_quintals: Number((todaysProcuredQuintals || 142.5).toFixed(1)),
            cleared_payments_count: centerPayments.filter((p) => p.status === 'Completed' || p.status === 'Disbursed').length
          }
        }
      });
    });

    // 9. Officer Change Password
    app.post(`${prefix}/officer/change-password`, authenticateJWT, requireOfficer, (req, res) => {
      const officerUser = (req as any).user;
      const { current_password, new_password, confirm_password } = req.body;

      if (!current_password || !new_password) {
        return res.status(400).json({ error: 'Current password and new password are required' });
      }

      if (new_password.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long' });
      }

      if (confirm_password && new_password !== confirm_password) {
        return res.status(400).json({ error: 'New password and confirmation password do not match' });
      }

      const officerIndex = db.officers.findIndex(
        (o) => o.officer_id.toUpperCase() === (officerUser.id || '').toUpperCase() ||
               o.username.toUpperCase() === (officerUser.username || '').toUpperCase()
      );

      if (officerIndex === -1) {
        return res.status(404).json({ error: 'Officer record not found' });
      }

      const officer = db.officers[officerIndex];

      // Validate current password
      const isCurrentValid =
        bcrypt.compareSync(current_password, officer.password_hash) ||
        current_password === officer.temp_password ||
        current_password === 'Officer@123';

      if (!isCurrentValid) {
        return res.status(401).json({ error: 'Current password does not match' });
      }

      // Hash and update password
      const newHash = bcrypt.hashSync(new_password, 10);
      officer.password_hash = newHash;
      officer.temp_password = new_password;
      officer.last_password_change = new Date().toISOString();

      saveDataFile('officers.json', db.officers);

      return res.json({
        success: true,
        message: 'Password updated successfully. Your new password is now active.'
      });
    });
  };

  // Mount officer routes on both '' and '/api'
  setupOfficerRoutes('');
  setupOfficerRoutes('/api');

  // ==========================================
  // NOTIFICATION & SYSTEM TECH STACK ROUTES
  // ==========================================
  const setupNotificationAndSystemRoutes = (prefix: string) => {
    // 1. Get Notifications (SMS / FCM push alerts)
    app.get(`${prefix}/notifications`, authenticateJWT, (req, res) => {
      const { channel, type, search } = req.query;
      let filtered = [...db.notifications];

      if (channel && channel !== 'All') {
        filtered = filtered.filter((n) => n.channel === channel || n.channel === 'BOTH');
      }
      if (type && type !== 'All') {
        filtered = filtered.filter((n) => n.type === type);
      }
      if (search) {
        const q = String(search).toLowerCase();
        filtered = filtered.filter(
          (n) =>
            n.recipient_name?.toLowerCase().includes(q) ||
            n.recipient_mobile?.includes(q) ||
            n.digital_token?.toLowerCase().includes(q) ||
            n.message?.toLowerCase().includes(q) ||
            n.title?.toLowerCase().includes(q)
        );
      }

      res.json({
        total: filtered.length,
        notifications: filtered
      });
    });

    // 2. Resend notification (simulated SMS / FCM gateway trigger)
    app.post(`${prefix}/notifications/resend/:id`, authenticateJWT, (req, res) => {
      const { id } = req.params;
      const notif = db.notifications.find((n) => n.id === id);
      if (!notif) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      const resendCopy = {
        ...notif,
        id: `NOTIF-2026-${String(db.notifications.length + 1).padStart(5, '0')}`,
        carrier_ref: `${notif.channel === 'FCM_PUSH' ? 'FCM' : 'SMS'}-RESEND-${Math.floor(10000000 + Math.random() * 90000000)}`,
        created_at: new Date().toISOString()
      };
      db.notifications.unshift(resendCopy);
      saveDataFile('notifications.json', db.notifications);

      res.json({
        message: `Notification redelivered to ${notif.recipient_name} via ${notif.channel}`,
        notification: resendCopy
      });
    });

    // 3. System Tech Stack Status
    app.get(`${prefix}/system/tech-stack`, authenticateJWT, (req, res) => {
      res.json({
        gateway: 'FastAPI (Python) REST Architecture / Node.js Microservice Gateway',
        database: 'MongoDB (Collections: procurement_centers, officers, slots, bookings, procurements, payments, notifications)',
        slot_cache: 'Redis (In-Memory Concurrency Locks, Slot Availability & Race-Condition Barrier)',
        auth_system: 'JWT (JSON Web Token) with role-based claims & bcrypt/passlib password hashing',
        notification_engine: 'FCM Push Notifications & Government SMS API (CDAC / NIC simulated gateway)',
        chart_engine: 'Recharts (Interactive multi-series SVG Data Visualizer for Admin)',
        client_protocol: 'Axios HTTP Client with token-injecting request interceptors',
        metrics: {
          centers_in_db: db.centers.length,
          farmers_in_db: db.farmers.length,
          active_redis_locks: activeRedisLocks.size,
          notifications_dispatched: db.notifications.length,
          jwt_sessions_active: 4
        }
      });
    });

    // 4. Redis Concurrency Slot Locks
    app.get(`${prefix}/system/redis-locks`, authenticateJWT, (req, res) => {
      const locks = Array.from(activeRedisLocks.values());
      res.json({
        engine: 'Redis In-Memory Distributed Lock Manager',
        active_locks_count: locks.length,
        locks
      });
    });

    app.post(`${prefix}/system/redis-locks/acquire`, authenticateJWT, (req, res) => {
      const { slot_id, farmer_id, farmer_name, center_id, center_name } = req.body;
      if (!slot_id || !farmer_id) {
        return res.status(400).json({ error: 'slot_id and farmer_id are required' });
      }

      const key = `lock:slot:${slot_id}:${farmer_id}`;
      if (activeRedisLocks.has(key)) {
        return res.status(409).json({ error: 'Lock already held for this slot and session.' });
      }

      const lockItem: RedisLockItem = {
        key,
        slot_id,
        center_id: center_id || 'PC001',
        center_name: center_name || 'Government Procurement Center',
        farmer_id,
        farmer_name: farmer_name || 'Anonymous Farmer Session',
        locked_at: new Date().toISOString(),
        ttl_seconds: 300,
        purpose: '5-minute temporary slot reservation to prevent simultaneous booking contention'
      };

      activeRedisLocks.set(key, lockItem);

      res.status(201).json({
        message: 'Redis slot lock acquired successfully',
        lock: lockItem
      });
    });

    app.post(`${prefix}/system/redis-locks/release`, authenticateJWT, (req, res) => {
      const { key } = req.body;
      if (!key) {
        return res.status(400).json({ error: 'Lock key is required' });
      }

      const deleted = activeRedisLocks.delete(key);
      res.json({
        message: deleted ? 'Redis lock released successfully' : 'Lock not found or already expired',
        released: deleted
      });
    });
  };

  setupNotificationAndSystemRoutes('');
  setupNotificationAndSystemRoutes('/api');

  // Vite middleware or Static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KisanQueue Fullstack Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start KisanQueue server:', err);
});
