// data/mockData.js — mock data for the Medira prescription app (all fictional)

// The doctor's handwritten prescription that gets "scanned"
export const RX_SOURCE = {
  doctor: 'Dr. A. Mehta',
  clinic: 'Sunrise Family Clinic',
  date: 'Jun 6, 2026',
  patient: 'Maya Ferreira',
  lines: [
    'Amoxicillin 500mg',
    'Cap i — TDS x 7 days, p.c.',
    'Ibuprofen 400mg',
    'Tab i — BD, p.r.n. pain',
    'Pantoprazole 40mg',
    'Tab i — OD, a.c. breakfast',
  ],
};

// Structured detection output — what the OCR turned the scrawl into
export const DETECTED = [
  {
    id: 'amox', name: 'Amoxicillin', strength: '500 mg', form: 'Capsule',
    dose: '1 capsule', frequency: '3× daily', freqShort: 'TDS', duration: '7 days',
    instruction: 'After food', instrIcon: 'food', purpose: 'Antibiotic — bacterial infection',
    confidence: 0.97, times: ['8:00 AM', '2:00 PM', '8:00 PM'],
    raw: 'Amoxicillin 500mg · Cap i TDS ×7d p.c.', color: '#DC7A57',
  },
  {
    id: 'ibu', name: 'Ibuprofen', strength: '400 mg', form: 'Tablet',
    dose: '1 tablet', frequency: '2× daily', freqShort: 'BD', duration: 'As needed',
    instruction: 'For pain · with food', instrIcon: 'food', purpose: 'Pain & inflammation relief',
    confidence: 0.91, times: ['9:00 AM', '9:00 PM'],
    raw: 'Ibuprofen 400mg · Tab i BD p.r.n. pain', color: '#D99A3E',
  },
  {
    id: 'panto', name: 'Pantoprazole', strength: '40 mg', form: 'Tablet',
    dose: '1 tablet', frequency: 'Once daily', freqShort: 'OD', duration: 'Ongoing',
    instruction: 'Before breakfast', instrIcon: 'sun', purpose: 'Protects stomach lining',
    confidence: 0.78, times: ['7:30 AM'],
    raw: 'Pantoprazole 40mg · Tab i OD a.c.', color: '#6E9B6B',
  },
];

// Today's dose timeline (built to feel mid-day, ~2pm)
export const TODAY = [
  { id: 't1', med: 'Pantoprazole', strength: '40 mg', time: '7:30 AM', note: 'Before breakfast', status: 'taken', icon: 'sun', color: '#6E9B6B' },
  { id: 't2', med: 'Amoxicillin', strength: '500 mg', time: '8:00 AM', note: 'After breakfast', status: 'taken', icon: 'food', color: '#DC7A57' },
  { id: 't3', med: 'Ibuprofen', strength: '400 mg', time: '9:00 AM', note: 'If in pain', status: 'skipped', icon: 'drop', color: '#D99A3E' },
  { id: 't4', med: 'Amoxicillin', strength: '500 mg', time: '2:00 PM', note: 'After lunch', status: 'due', icon: 'food', color: '#DC7A57' },
  { id: 't5', med: 'Amoxicillin', strength: '500 mg', time: '8:00 PM', note: 'After dinner', status: 'upcoming', icon: 'food', color: '#DC7A57' },
  { id: 't6', med: 'Ibuprofen', strength: '400 mg', time: '9:00 PM', note: 'If in pain', status: 'upcoming', icon: 'drop', color: '#D99A3E' },
];

// Current medications list (the "shelf")
export const MEDS = [
  { id: 'amox', name: 'Amoxicillin', strength: '500 mg', form: 'Capsule', schedule: '3× daily · after food', purpose: 'Antibiotic', courseDay: 2, courseTotal: 7, left: 15, color: '#DC7A57', icon: 'pill', from: 'Dr. A. Mehta', scanned: 'Jun 6', adherence: 0.94 },
  { id: 'ibu', name: 'Ibuprofen', strength: '400 mg', form: 'Tablet', schedule: '2× daily · as needed', purpose: 'Pain relief', courseDay: null, courseTotal: null, left: 22, color: '#D99A3E', icon: 'pill', from: 'Dr. A. Mehta', scanned: 'Jun 6', adherence: 1.0 },
  { id: 'panto', name: 'Pantoprazole', strength: '40 mg', form: 'Tablet', schedule: 'Once daily · before breakfast', purpose: 'Stomach protection', courseDay: null, courseTotal: null, left: 5, color: '#6E9B6B', icon: 'pill', from: 'Dr. A. Mehta', scanned: 'Jun 6', adherence: 0.88 },
];

// Scan history
export const HISTORY = [
  { id: 'h1', title: 'Sunrise Family Clinic', doctor: 'Dr. A. Mehta', date: 'Jun 6, 2026', meds: 3, color: '#DC7A57' },
  { id: 'h2', title: 'City Dental', doctor: 'Dr. R. Osei', date: 'Apr 2, 2026', meds: 2, color: '#6E9B6B' },
  { id: 'h3', title: 'Northgate Pharmacy', doctor: 'Repeat script', date: 'Feb 18, 2026', meds: 1, color: '#D99A3E' },
];

// 14-day adherence dots (1=full, 0.5=partial, 0=missed)
export const ADHERENCE_14 = [1, 1, 0.5, 1, 1, 1, 1, 0.5, 1, 1, 1, 0.5, 1, 1];
