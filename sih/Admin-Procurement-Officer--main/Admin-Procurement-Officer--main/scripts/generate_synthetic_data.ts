import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DISTRICTS_DATA = [
  { district: 'Pune', talukas: ['Baramati', 'Haveli', 'Shirur', 'Indapur', 'Daund'] },
  { district: 'Satara', talukas: ['Karad', 'Phaltan', 'Wai', 'Koregaon', 'Khatav'] },
  { district: 'Sangli', talukas: ['Miraj', 'Walwa', 'Tasgaon', 'Khanapur', 'Jat'] },
  { district: 'Kolhapur', talukas: ['Karvir', 'Shirol', 'Hatkanangle', 'Radhanagari', 'Kagal'] },
  { district: 'Nashik', talukas: ['Niphad', 'Malegaon', 'Sinnar', 'Yeola', 'Dindori'] },
  { district: 'Ahmednagar', talukas: ['Rahata', 'Kopargaon', 'Sangamner', 'Shrirampur', 'Shevgaon'] },
  { district: 'Solapur', talukas: ['Pandharpur', 'Barshi', 'Karmala', 'Madha', 'Malshiras'] },
  { district: 'Aurangabad', talukas: ['Gangapur', 'Paithan', 'Vaijapur', 'Kannad', 'Khuldabad'] },
  { district: 'Jalgaon', talukas: ['Bhusawal', 'Chalisgaon', 'Raver', 'Jamner', 'Pachora'] },
  { district: 'Dhule', talukas: ['Shirpur', 'Sakri', 'Sindkheda', 'Dhule'] },
  { district: 'Nandurbar', talukas: ['Shahada', 'Navapur', 'Taloda', 'Nandurbar'] },
  { district: 'Beed', talukas: ['Georai', 'Majalgaon', 'Ambejogai', 'Parli', 'Ashti'] },
  { district: 'Latur', talukas: ['Ausa', 'Nilanga', 'Udgir', 'Ahmedpur', 'Chakur'] },
  { district: 'Osmanabad', talukas: ['Tuljapur', 'Omerga', 'Kalamb', 'Paranda', 'Bhoom'] },
  { district: 'Nagpur', talukas: ['Katol', 'Saoner', 'Umred', 'Ramtek', 'Hingna'] },
  { district: 'Amravati', talukas: ['Achalpur', 'Chandur Bazar', 'Morshi', 'Warud', 'Daryapur'] },
  { district: 'Akola', talukas: ['Murtizapur', 'Akot', 'Balapur', 'Patur', 'Telhara'] },
  { district: 'Yavatmal', talukas: ['Pusad', 'Umarkhed', 'Wani', 'Darwha', 'Digras'] },
  { district: 'Wardha', talukas: ['Hinganghat', 'Arvi', 'Deoli', 'Seloo', 'Samudrapur'] },
  { district: 'Buldhana', talukas: ['Khamgaon', 'Malkapur', 'Chikhli', 'Mehkar', 'Jalgaon Jamod'] }
];

const CROPS_LIST = [
  'Soybean', 'Wheat', 'Gram (Chana)', 'Cotton', 'Tur (Arhar)',
  'Jowar', 'Bajra', 'Maize', 'Groundnut', 'Sunflower', 'Urad'
];

const FIRST_NAMES = [
  'Ramesh', 'Suresh', 'Dnyaneshwar', 'Tukaram', 'Vitthal', 'Pandurang',
  'Baburao', 'Sunil', 'Santosh', 'Sachin', 'Ganesh', 'Nitin',
  'Ananda', 'Bhimrao', 'Rajendra', 'Shrikant', 'Mahadev', 'Eknath',
  'Dilip', 'Prakash', 'Arun', 'Balasaheb', 'Shivaji', 'Sudhakar',
  'Sunita', 'Savita', 'Rekha', 'Shobha', 'Laxmibai', 'Parvatibai'
];

const LAST_NAMES = [
  'Patil', 'Pawar', 'Deshmukh', 'Jadhav', 'Shinde', 'Kadam',
  'Chavan', 'Bhosale', 'More', 'Gaikwad', 'Kulkarni', 'Kale',
  'Wagh', 'Sawant', 'Mane', 'Salunkhe', 'Thorat', 'Gawade',
  'Ghuge', 'Suryavanshi', 'Shelke', 'Tambe', 'Dhumal', 'Kharat'
];

async function generateData() {
  const dataDir = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // 1. Generate 50 Procurement Centers
  const procurementCenters = [];
  let centerCounter = 1;

  for (let i = 0; i < 50; i++) {
    const distObj = DISTRICTS_DATA[i % DISTRICTS_DATA.length];
    const taluka = distObj.talukas[i % distObj.talukas.length];
    const centerId = `PC${String(centerCounter).padStart(3, '0')}`;
    centerCounter++;

    // Pick 2-4 crops realistic for the district
    const startCrop = (i * 2) % CROPS_LIST.length;
    const acceptedCrops = [
      CROPS_LIST[startCrop],
      CROPS_LIST[(startCrop + 1) % CROPS_LIST.length],
      CROPS_LIST[(startCrop + 3) % CROPS_LIST.length]
    ].filter((v, idx, arr) => arr.indexOf(v) === idx);

    const intakeCapacity = [3000, 4000, 5000, 6000, 7500, 10000][i % 6];
    const dailyCapacity = [300, 400, 500, 600, 800][i % 5];

    procurementCenters.push({
      center_id: centerId,
      center_name: `Government Procurement Center - ${taluka}`,
      district: distObj.district,
      taluka: taluka,
      location: `${taluka} APMC Market Yard, ${distObj.district}, Maharashtra`,
      latitude: Number((18.0 + (i * 0.1) % 3.5).toFixed(4)),
      longitude: Number((73.8 + (i * 0.15) % 5.5).toFixed(4)),
      accepted_crops: acceptedCrops,
      intake_capacity: intakeCapacity,
      daily_capacity: dailyCapacity,
      operating_hours: {
        start: '09:00',
        end: '17:00'
      },
      status: i === 48 ? 'inactive' : 'active',
      dataset_label: 'Prototype Synthetic Government Dataset'
    });
  }

  // 2. Generate 25 Procurement Officers
  const passwordHash = bcrypt.hashSync('Officer@123', 10);
  const adminPasswordHash = bcrypt.hashSync('Admin@123', 10);

  const officers = [];
  for (let i = 1; i <= 25; i++) {
    const officerId = `OFF${String(i).padStart(3, '0')}`;
    const assignedCenter = procurementCenters[(i - 1) % procurementCenters.length];
    const firstName = FIRST_NAMES[(i + 4) % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i + 2) % LAST_NAMES.length];

    officers.push({
      officer_id: officerId,
      officer_name: `${firstName} ${lastName}`,
      mobile_number: `+91 98${String(10000000 + i * 3421).substring(0, 8)}`,
      email: `officer.${officerId.toLowerCase()}@kisanqueue.gov.in`,
      assigned_center_id: assignedCenter.center_id,
      assigned_center_name: assignedCenter.center_name,
      username: officerId,
      password_hash: passwordHash,
      temp_password: 'Officer@123',
      status: i === 24 ? 'inactive' : 'active',
      created_at: '2026-08-15T10:00:00Z'
    });
  }

  // 3. Generate Admins
  const admins = [
    {
      admin_id: 'ADM001',
      username: 'admin',
      password_hash: adminPasswordHash,
      full_name: 'Dr. Vikramaditya Salve (State Director)',
      email: 'admin@kisanqueue.gov.in',
      department: 'Department of Agricultural Marketing, Govt. of Maharashtra',
      role: 'admin',
      status: 'active'
    }
  ];

  // 4. Generate 120 Synthetic Farmers
  const farmers = [];
  for (let i = 1; i <= 120; i++) {
    const farmerId = `FR${String(i).padStart(3, '0')}`;
    const fName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lName = LAST_NAMES[(i * 3) % LAST_NAMES.length];
    const distObj = DISTRICTS_DATA[i % DISTRICTS_DATA.length];
    const taluka = distObj.talukas[i % distObj.talukas.length];

    farmers.push({
      farmer_id: farmerId,
      farmer_name: `${fName} ${lName}`,
      mobile: `+91 97${String(20000000 + i * 4731).substring(0, 8)}`,
      district: distObj.district,
      taluka: taluka,
      village: `${taluka} Khurd`,
      kisan_credit_card: `KCC-MH-${distObj.district.substring(0, 3).toUpperCase()}-${String(10000 + i)}`,
      aadhaar_ref: `XXXX-XXXX-${String(1000 + (i * 73) % 9000)}`
    });
  }

  // 5. Generate Slots for next 7 days across top 20 centers
  const slots = [];
  const slotTimes = [
    { start: '09:00 AM', end: '11:00 AM' },
    { start: '11:00 AM', end: '01:00 PM' },
    { start: '01:30 PM', end: '03:30 PM' },
    { start: '03:30 PM', end: '05:30 PM' }
  ];

  const dates = [
    '2026-09-07',
    '2026-09-08',
    '2026-09-09',
    '2026-09-10',
    '2026-09-11',
    '2026-09-12'
  ];

  let slotCounter = 1;
  // Generate slots for first 25 centers
  for (let c = 0; c < 25; c++) {
    const center = procurementCenters[c];
    for (const dt of dates) {
      for (const st of slotTimes) {
        const slotId = `SLOT${String(slotCounter).padStart(4, '0')}`;
        slotCounter++;
        const capacity = 20; // 20 farmers per slot
        // realistic booking count
        const bookedCount = c < 5 && dt === '2026-09-07' ? (slotCounter % 2 === 0 ? 20 : 14) : Math.floor((slotCounter * 7) % 18);
        const remainingCapacity = Math.max(0, capacity - bookedCount);
        const status = remainingCapacity === 0 ? 'FULL' : 'AVAILABLE';

        slots.push({
          slot_id: slotId,
          center_id: center.center_id,
          center_name: center.center_name,
          date: dt,
          start_time: st.start,
          end_time: st.end,
          capacity: capacity,
          booked_count: bookedCount,
          remaining_capacity: remainingCapacity,
          status: status
        });
      }
    }
  }

  // 6. Generate Bookings, Procurements, and Payments
  const bookings = [];
  const procurements = [];
  const payments = [];

  let tokenCounter = 100;
  let bookingCounter = 1001;
  let procurementCounter = 1001;
  let paymentCounter = 1001;

  // Make specific rich bookings for PC001 (assigned to OFF001 demo officer) and others
  for (let i = 0; i < 220; i++) {
    const bookingId = `BK${bookingCounter++}`;
    tokenCounter++;
    const token = `KQ-2026-${String(tokenCounter).padStart(5, '0')}`;
    const farmer = farmers[i % farmers.length];
    // Center: first 40% to PC001 so OFF001 has plenty of realistic bookings to demonstrate!
    const center = i < 70 ? procurementCenters[0] : procurementCenters[i % 15];
    const crop = center.accepted_crops[i % center.accepted_crops.length];
    const expectedQty = Number((15 + (i * 3.7) % 35).toFixed(1)); // 15 to 50 quintals
    const date = dates[i % dates.length];
    const slotTime = slotTimes[i % slotTimes.length];
    const slotId = slots[i % slots.length].slot_id;

    // Determine status
    let status: 'Booked' | 'Verified' | 'Procured' | 'Cancelled' = 'Booked';
    if (i < 30) {
      status = 'Procured';
    } else if (i < 45) {
      status = 'Verified';
    } else if (i % 25 === 0) {
      status = 'Cancelled';
    } else {
      status = 'Booked';
    }

    bookings.push({
      booking_id: bookingId,
      digital_token: token,
      farmer_id: farmer.farmer_id,
      farmer_name: farmer.farmer_name,
      farmer_mobile: farmer.mobile,
      center_id: center.center_id,
      center_name: center.center_name,
      slot_id: slotId,
      crop: crop,
      expected_quantity: expectedQty,
      date: date,
      time_slot: `${slotTime.start} - ${slotTime.end}`,
      status: status,
      created_at: '2026-09-01T09:30:00Z'
    });

    // If procured, create a procurement record and payment record
    if (status === 'Procured') {
      const procId = `PR-2026-${String(procurementCounter++).padStart(5, '0')}`;
      const receiptId = `REC-2026-${String(tokenCounter).padStart(5, '0')}`;
      const actualWeight = Number((expectedQty * (0.95 + (i % 8) * 0.01)).toFixed(1));
      const qualityStatus = i % 10 === 0 ? 'Needs Review' : 'Passed';
      const mspPrice = crop === 'Soybean' ? 4892 : crop === 'Wheat' ? 2275 : crop === 'Gram (Chana)' ? 5440 : 6620;
      const totalAmount = Math.round(actualWeight * mspPrice);

      procurements.push({
        procurement_id: procId,
        booking_id: bookingId,
        receipt_id: receiptId,
        digital_token: token,
        farmer_id: farmer.farmer_id,
        farmer_name: farmer.farmer_name,
        farmer_mobile: farmer.mobile,
        center_id: center.center_id,
        center_name: center.center_name,
        crop: crop,
        expected_quantity: expectedQty,
        actual_weight: actualWeight,
        quality_status: qualityStatus,
        procurement_status: 'Completed',
        officer_id: center.center_id === 'PC001' ? 'OFF001' : 'OFF002',
        procurement_date: date,
        verified_at: `${date}T10:15:00Z`,
        procured_at: `${date}T11:20:00Z`,
        notes: 'Standard moisture check compliant (<12%). Bags counted and tagged.'
      });

      const payStatus = i < 15 ? 'Completed' : i < 25 ? 'Processing' : 'Pending';
      payments.push({
        payment_id: `PAY-2026-${String(paymentCounter++).padStart(5, '0')}`,
        procurement_id: procId,
        receipt_id: receiptId,
        booking_id: bookingId,
        farmer_id: farmer.farmer_id,
        farmer_name: farmer.farmer_name,
        center_id: center.center_id,
        crop: crop,
        actual_weight: actualWeight,
        msp_rate_per_quintal: mspPrice,
        total_amount: totalAmount,
        status: payStatus,
        payment_mode: 'DBT / PFMS Direct Credit (Simulated)',
        utr_reference: payStatus === 'Completed' ? `PFMS${String(892019283 + i * 291)}` : null,
        created_at: `${date}T11:30:00Z`,
        updated_at: `${date}T16:00:00Z`
      });
    }
  }

  // Write all json files into /data
  fs.writeFileSync(path.join(dataDir, 'procurement_centers.json'), JSON.stringify(procurementCenters, null, 2));
  fs.writeFileSync(path.join(dataDir, 'officers.json'), JSON.stringify(officers, null, 2));
  fs.writeFileSync(path.join(dataDir, 'admins.json'), JSON.stringify(admins, null, 2));
  fs.writeFileSync(path.join(dataDir, 'farmers.json'), JSON.stringify(farmers, null, 2));
  fs.writeFileSync(path.join(dataDir, 'slots.json'), JSON.stringify(slots, null, 2));
  fs.writeFileSync(path.join(dataDir, 'bookings.json'), JSON.stringify(bookings, null, 2));
  fs.writeFileSync(path.join(dataDir, 'procurements.json'), JSON.stringify(procurements, null, 2));
  fs.writeFileSync(path.join(dataDir, 'payments.json'), JSON.stringify(payments, null, 2));

  console.log('✅ Generated 50 centers, 25 officers, 120 farmers, slots, bookings, procurements, and payments.');
}

generateData().catch(console.error);
