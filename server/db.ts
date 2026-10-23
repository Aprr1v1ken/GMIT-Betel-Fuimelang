import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

function getDatabasePath(): string {
  const localPath = path.resolve(process.cwd(), 'sysjeger.sqlite');
  // On Vercel serverless environments, root is read-only so use /tmp
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpPath = path.resolve('/tmp', 'sysjeger.sqlite');
    if (!fs.existsSync(tmpPath) && fs.existsSync(localPath)) {
      try {
        fs.copyFileSync(localPath, tmpPath);
      } catch (err) {
        console.warn('Could not copy sqlite to /tmp:', err);
      }
    }
    return tmpPath;
  }
  return localPath;
}

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    const dbPath = getDatabasePath();
    dbInstance = new DatabaseSync(dbPath);
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: DatabaseSync) {
  // Execute database schema creation
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      rayon_id TEXT,
      member_id TEXT,
      phone TEXT,
      email TEXT,
      status TEXT DEFAULT 'Aktif',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rayons (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      leader_name TEXT NOT NULL,
      leader_phone TEXT,
      coverage_area TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS categorial_groups (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      target_age_desc TEXT,
      coordinator TEXT
    );

    CREATE TABLE IF NOT EXISTS families (
      id TEXT PRIMARY KEY,
      family_no TEXT UNIQUE NOT NULL,
      head_of_family_name TEXT NOT NULL,
      head_of_family_id TEXT,
      address TEXT NOT NULL,
      rayon_id TEXT NOT NULL,
      phone TEXT,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      member_no TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      nickname TEXT,
      nik TEXT,
      family_card_no TEXT,
      family_id TEXT,
      family_role TEXT NOT NULL,
      gender TEXT NOT NULL,
      birth_place TEXT,
      birth_date TEXT NOT NULL,
      address TEXT NOT NULL,
      kelurahan TEXT,
      kecamatan TEXT,
      kabupaten TEXT,
      phone TEXT,
      email TEXT,
      marital_status TEXT NOT NULL,
      spouse_name TEXT,
      rayon_id TEXT NOT NULL,
      categorial_group_id TEXT NOT NULL,
      membership_status TEXT NOT NULL,
      baptism_status TEXT NOT NULL,
      baptism_date TEXT,
      confirmation_status TEXT NOT NULL,
      confirmation_date TEXT,
      marriage_church_status TEXT NOT NULL,
      marriage_date TEXT,
      education TEXT,
      occupation TEXT,
      join_date TEXT NOT NULL,
      status TEXT NOT NULL,
      notes TEXT,
      photo_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS church_staff (
      id TEXT PRIMARY KEY,
      member_id TEXT,
      name TEXT NOT NULL,
      position TEXT NOT NULL,
      period TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS baptisms (
      id TEXT PRIMARY KEY,
      register_no TEXT UNIQUE NOT NULL,
      member_id TEXT NOT NULL,
      member_name TEXT NOT NULL,
      birth_date TEXT,
      parent_names TEXT,
      baptism_date TEXT NOT NULL,
      church_place TEXT NOT NULL,
      minister_name TEXT NOT NULL,
      certificate_no TEXT NOT NULL,
      witnesses TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS confirmations (
      id TEXT PRIMARY KEY,
      register_no TEXT UNIQUE NOT NULL,
      member_id TEXT NOT NULL,
      member_name TEXT NOT NULL,
      confirmation_date TEXT NOT NULL,
      church_place TEXT NOT NULL,
      minister_name TEXT NOT NULL,
      certificate_no TEXT NOT NULL,
      bible_verse TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS marriages (
      id TEXT PRIMARY KEY,
      register_no TEXT UNIQUE NOT NULL,
      groom_id TEXT,
      groom_name TEXT NOT NULL,
      bride_id TEXT,
      bride_name TEXT NOT NULL,
      blessing_date TEXT NOT NULL,
      church_place TEXT NOT NULL,
      minister_name TEXT NOT NULL,
      certificate_no TEXT NOT NULL,
      witness_names TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS member_mutations (
      id TEXT PRIMARY KEY,
      mutation_no TEXT UNIQUE NOT NULL,
      member_id TEXT NOT NULL,
      member_name TEXT NOT NULL,
      mutation_type TEXT NOT NULL,
      from_rayon_id TEXT,
      to_rayon_id TEXT,
      from_church TEXT,
      to_church TEXT,
      request_date TEXT NOT NULL,
      effective_date TEXT NOT NULL,
      reason TEXT,
      status TEXT NOT NULL,
      approved_by TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      location TEXT NOT NULL,
      pic_name TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS service_schedules (
      id TEXT PRIMARY KEY,
      service_date TEXT NOT NULL,
      service_name TEXT NOT NULL,
      preacher TEXT NOT NULL,
      liturgist TEXT NOT NULL,
      elder_duty TEXT NOT NULL,
      deacon_duty TEXT NOT NULL,
      song_leader TEXT NOT NULL,
      musicians TEXT NOT NULL,
      multimedia_operator TEXT NOT NULL,
      usher TEXT NOT NULL,
      bible_reader TEXT NOT NULL,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS attendance_records (
      id TEXT PRIMARY KEY,
      event_id TEXT,
      event_title TEXT NOT NULL,
      date TEXT NOT NULL,
      male_count INTEGER NOT NULL,
      female_count INTEGER NOT NULL,
      children_count INTEGER NOT NULL,
      total_count INTEGER NOT NULL,
      notes TEXT,
      recorded_by TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS financial_transactions (
      id TEXT PRIMARY KEY,
      tx_no TEXT UNIQUE NOT NULL,
      tx_date TEXT NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      recorded_by TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      doc_no TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      member_id TEXT,
      file_name TEXT NOT NULL,
      file_size TEXT NOT NULL,
      upload_date TEXT NOT NULL,
      access_level TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      author TEXT NOT NULL,
      is_important INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS data_correction_requests (
      id TEXT PRIMARY KEY,
      member_id TEXT NOT NULL,
      member_name TEXT NOT NULL,
      request_date TEXT NOT NULL,
      details TEXT NOT NULL,
      status TEXT NOT NULL,
      admin_notes TEXT
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      action TEXT NOT NULL,
      module TEXT NOT NULL,
      details TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );
  `);

  seedInitialData(db);
}

function seedInitialData(db: DatabaseSync) {
  // Check if users already seeded
  const userCheck = db.prepare('SELECT count(*) as count FROM users').get() as { count: number };
  if (userCheck && userCheck.count > 0) {
    return;
  }

  // 1. Rayons (Tepat 4 Rayon: Rayon I, II, III, IV)
  const rayons = [
    { id: 'r1', code: 'RY-01', name: 'Rayon I', leader_name: 'Pnt. Yulius Banamtuan', leader_phone: '0812-3901-4411', coverage_area: 'Fuimelang Pusat & Pasar Lama', notes: 'Wilayah pelayanan sektor I' },
    { id: 'r2', code: 'RY-02', name: 'Rayon II', leader_name: 'Pnt. Sarah Lopo-Mone', leader_phone: '0813-5322-8877', coverage_area: 'Kompleks SD Betel & Liku', notes: 'Wilayah pelayanan sektor II' },
    { id: 'r3', code: 'RY-03', name: 'Rayon III', leader_name: 'Pnt. Soleman Malaikosa', leader_phone: '0852-3911-0022', coverage_area: 'Fuimelang Atas & Kebun Sirih', notes: 'Wilayah pelayanan sektor III' },
    { id: 'r4', code: 'RY-04', name: 'Rayon IV', leader_name: 'Pnt. Martha Doko-Lobo', leader_phone: '0821-4455-6677', coverage_area: 'Pesisir Pantai, Dermaga & Moru', notes: 'Wilayah pelayanan sektor IV' },
  ];
  const insertRayon = db.prepare('INSERT INTO rayons (id, code, name, leader_name, leader_phone, coverage_area, notes) VALUES (?, ?, ?, ?, ?, ?, ?)');
  for (const r of rayons) {
    insertRayon.run(r.id, r.code, r.name, r.leader_name, r.leader_phone, r.coverage_area, r.notes);
  }

  // 2. Kategorial
  const categorials = [
    { id: 'c1', code: 'PAR', name: 'Pelayanan Anak dan Remaja (PAR)', target_age_desc: '0 - 15 Tahun', coordinator: 'Pnt. Maria Salukh' },
    { id: 'c2', code: 'PEMUDA', name: 'Gerakan Pemuda GMIT (GP GMIT)', target_age_desc: '16 - 30 Tahun', coordinator: 'Sdr. Johanis Lopo' },
    { id: 'c3', code: 'PKP', name: 'Persekutuan Kaum Perempuan GMIT (PKP)', target_age_desc: 'Ibu-ibu Jemaat', coordinator: 'Pnt. Debora Kase-Blegur' },
    { id: 'c4', code: 'PKB', name: 'Persekutuan Kaum Bapak GMIT (PKB)', target_age_desc: 'Bapak-bapak Jemaat', coordinator: 'Pnt. Simon Malaipada' },
    { id: 'c5', code: 'LANSIA', name: 'Persekutuan Usia Indah (Lansia)', target_age_desc: 'Usia 60 Tahun ke atas', coordinator: 'Pnt. Kornelius Tefa' },
  ];
  const insertCat = db.prepare('INSERT INTO categorial_groups (id, code, name, target_age_desc, coordinator) VALUES (?, ?, ?, ?, ?)');
  for (const c of categorials) {
    insertCat.run(c.id, c.code, c.name, c.target_age_desc, c.coordinator);
  }

  // 3. Church Staff / Majelis (Periode 2026 - 2029)
  const staff = [
    { id: 'st1', name: 'Pdt. Sonya W. Isu, S.Th', position: 'Ketua Majelis Jemaat / Pendeta', period: '2026 - 2029', phone: '085173095482', email: 'pdt.sonya@gmitbetel.id', status: 'Aktif' },
    { id: 'st2', name: 'Pdt. Yohana E. Kolly, S.Th', position: 'Pendeta Pelayan', period: '2026 - 2029', phone: '0813-5311-2233', email: 'pdt.yohana@gmitbetel.id', status: 'Aktif' },
    { id: 'st3', name: 'Pnt. Daniel Malaipada', position: 'Wakil Ketua Majelis', period: '2026 - 2029', phone: '0852-3988-7766', email: 'daniel.malaipada@gmitbetel.id', status: 'Aktif' },
    { id: 'st4', name: 'Dkn. Elisabeth Lopo', position: 'Sekretaris', period: '2026 - 2029', phone: '0812-3877-4455', email: 'elisabeth.lopo@gmitbetel.id', status: 'Aktif' },
    { id: 'st5', name: 'Dkn. Samuel Blegur', position: 'Bendahara', period: '2026 - 2029', phone: '0821-4466-9988', email: 'samuel.blegur@gmitbetel.id', status: 'Aktif' },
    { id: 'st6', name: 'Pnt. Yulius Banamtuan', position: 'Penatua Rayon I', period: '2026 - 2029', phone: '0812-3901-4411', email: 'yulius.b@gmitbetel.id', status: 'Aktif' },
    { id: 'st7', name: 'Pnt. Sarah Lopo-Mone', position: 'Penatua Rayon II', period: '2026 - 2029', phone: '0813-5322-8877', email: 'sarah.l@gmitbetel.id', status: 'Aktif' },
  ];
  const insertStaff = db.prepare('INSERT INTO church_staff (id, member_id, name, position, period, phone, email, status) VALUES (?, NULL, ?, ?, ?, ?, ?, ?)');
  for (const s of staff) {
    insertStaff.run(s.id, s.name, s.position, s.period, s.phone, s.email, s.status);
  }

  // 4. Users (Official Accounts)
  const users = [
    { id: 'u1', username: 'superadmin', password_hash: 'admin123', name: 'Super Admin SYSJEGER', role: 'Super Admin', rayon_id: null, phone: '0811-0001-0001', email: 'admin@gmitbetel.id' },
    { id: 'u2', username: 'admingereja', password_hash: 'admin123', name: 'Dkn. Elisabeth Lopo (Tata Usaha)', role: 'Admin Gereja', rayon_id: null, phone: '0812-3877-4455', email: 'elisabeth.lopo@gmitbetel.id' },
    { id: 'u3', username: 'pendeta', password_hash: 'pendeta123', name: 'Pdt. Sonya W. Isu, S.Th (Ketua Majelis)', role: 'Ketua Majelis/Pendeta', rayon_id: null, phone: '085173095482', email: 'pdt.sonya@gmitbetel.id' },
    { id: 'u4', username: 'majelisrayon1', password_hash: 'rayon123', name: 'Pnt. Yulius Banamtuan (Penatua Rayon I)', role: 'Majelis/Rayon', rayon_id: 'r1', phone: '0812-3901-4411', email: 'yulius.b@gmitbetel.id' },
  ];
  const insertUser = db.prepare('INSERT INTO users (id, username, password_hash, name, role, rayon_id, member_id, phone, email, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?, \'Aktif\', \'2026-01-01 08:00:00\')');
  for (const u of users) {
    insertUser.run(u.id, u.username, u.password_hash, u.name, u.role, u.rayon_id, u.phone, u.email);
  }

  // 5. Audit Log (Database initialized clean for live church usage)
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (id, user_id, user_name, action, module, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertAudit.run('aud1', 'u1', 'Super Admin', 'Inisialisasi Sistem', 'Sistem', 'Database SYSJEGER V2.0 GMIT Betel Fuimelang Periode Pelayanan 2026-2029 siap digunakan', '2026-10-18 08:00:00');

  seedCongregationData(db);
}

function seedCongregationData(db: DatabaseSync) {
  const familyCount = (db.prepare('SELECT count(*) as count FROM families').get() as { count: number })?.count || 0;
  if (familyCount > 0) return;

  // 1. Families (KK) across Rayon I - IV
  const families = [
    { id: 'f1', family_no: 'KK-BF-001', head_of_family_name: 'Pnt. Yulius Banamtuan', address: 'Jl. Timor Raya RT 01, Fuimelang Pusat', rayon_id: 'r1', phone: '0812-3901-4411', notes: 'Keluarga Penatua Rayon I' },
    { id: 'f2', family_no: 'KK-BF-002', head_of_family_name: 'Johanis Lopo', address: 'Kompleks SD Betel RT 03, Liku', rayon_id: 'r2', phone: '0813-5322-8877', notes: 'Koordinator GP GMIT' },
    { id: 'f3', family_no: 'KK-BF-003', head_of_family_name: 'Pnt. Soleman Malaikosa', address: 'Fuimelang Atas RT 05, Kebun Sirih', rayon_id: 'r3', phone: '0852-3911-0022', notes: 'Keluarga Penatua Rayon III' },
    { id: 'f4', family_no: 'KK-BF-004', head_of_family_name: 'Pnt. Simon Malaipada', address: 'Pesisir Pantai RT 07, Moru', rayon_id: 'r4', phone: '0821-4455-6677', notes: 'Koordinator PKB Rayon IV' },
  ];

  const insertFamily = db.prepare(`
    INSERT INTO families (id, family_no, head_of_family_name, head_of_family_id, address, rayon_id, phone, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, '2026-01-01')
  `);
  for (const f of families) {
    insertFamily.run(f.id, f.family_no, f.head_of_family_name, null, f.address, f.rayon_id, f.phone, f.notes);
  }

  // 2. Members (Jemaat) across Rayon I - IV with full details
  const members = [
    // Rayon I
    {
      id: 'm1', member_no: 'GMIT-BF-2026-001', full_name: 'Yulius Banamtuan', nickname: 'Yulius',
      nik: '5305011204780001', family_card_no: '5305010101080001', family_id: 'f1', family_role: 'Kepala Keluarga',
      gender: 'Laki-laki', birth_place: 'Fuimelang', birth_date: '1978-04-12', address: 'Jl. Timor Raya RT 01',
      phone: '0812-3901-4411', email: 'yulius.b@gmitbetel.id', marital_status: 'Menikah', spouse_name: 'Maria Banamtuan-Kase',
      rayon_id: 'r1', categorial_group_id: 'c4', membership_status: 'Tetap',
      baptism_status: 'Sudah', baptism_date: '1978-06-15', confirmation_status: 'Sudah', confirmation_date: '1995-10-29',
      marriage_church_status: 'Sudah', marriage_date: '2003-07-18', education: 'Sarjana (S1 / Terapan)', occupation: 'Pegawai Negeri Sipil (PNS / ASN)'
    },
    {
      id: 'm2', member_no: 'GMIT-BF-2026-002', full_name: 'Maria Banamtuan-Kase', nickname: 'Maria',
      nik: '5305016008820002', family_card_no: '5305010101080001', family_id: 'f1', family_role: 'Istri',
      gender: 'Perempuan', birth_place: 'Kalabahi', birth_date: '1982-08-20', address: 'Jl. Timor Raya RT 01',
      phone: '0812-3901-4412', email: 'maria.k@gmitbetel.id', marital_status: 'Menikah', spouse_name: 'Yulius Banamtuan',
      rayon_id: 'r1', categorial_group_id: 'c3', membership_status: 'Tetap',
      baptism_status: 'Sudah', baptism_date: '1982-10-10', confirmation_status: 'Sudah', confirmation_date: '1999-10-31',
      marriage_church_status: 'Sudah', marriage_date: '2003-07-18', education: 'Sarjana (S1 / Terapan)', occupation: 'Guru / Dosen / Tenaga Pendidik'
    },
    {
      id: 'm3', member_no: 'GMIT-BF-2026-003', full_name: 'Daniel Banamtuan', nickname: 'Daniel',
      nik: '5305011511040003', family_card_no: '5305010101080001', family_id: 'f1', family_role: 'Anak',
      gender: 'Laki-laki', birth_place: 'Fuimelang', birth_date: '2004-11-15', address: 'Jl. Timor Raya RT 01',
      phone: '0812-3901-4413', email: 'daniel.b@gmail.com', marital_status: 'Belum Menikah', spouse_name: '',
      rayon_id: 'r1', categorial_group_id: 'c2', membership_status: 'Tetap',
      baptism_status: 'Sudah', baptism_date: '2005-01-20', confirmation_status: 'Sudah', confirmation_date: '2021-10-31',
      marriage_church_status: 'Belum', marriage_date: '', education: 'SLTA / SMA / SMK / MA / Sederajat', occupation: 'Pelajar / Mahasiswa'
    },
    // Rayon II
    {
      id: 'm4', member_no: 'GMIT-BF-2026-004', full_name: 'Johanis Lopo', nickname: 'Johan',
      nik: '5305011802800004', family_card_no: '5305010101080002', family_id: 'f2', family_role: 'Kepala Keluarga',
      gender: 'Laki-laki', birth_place: 'Liku', birth_date: '1980-02-18', address: 'Kompleks SD Betel RT 03',
      phone: '0813-5322-8877', email: 'johan.lopo@gmitbetel.id', marital_status: 'Menikah', spouse_name: 'Sarah Lopo-Mone',
      rayon_id: 'r2', categorial_group_id: 'c4', membership_status: 'Tetap',
      baptism_status: 'Sudah', baptism_date: '1980-04-10', confirmation_status: 'Sudah', confirmation_date: '1997-10-26',
      marriage_church_status: 'Sudah', marriage_date: '2010-09-12', education: 'SLTA / SMA / SMK / MA / Sederajat', occupation: 'Wiraswasta / Pedagang'
    },
    {
      id: 'm5', member_no: 'GMIT-BF-2026-005', full_name: 'Sarah Lopo-Mone', nickname: 'Sarah',
      nik: '5305016506830005', family_card_no: '5305010101080002', family_id: 'f2', family_role: 'Istri',
      gender: 'Perempuan', birth_place: 'Fuimelang', birth_date: '1983-06-25', address: 'Kompleks SD Betel RT 03',
      phone: '0813-5322-8878', email: 'sarah.l@gmitbetel.id', marital_status: 'Menikah', spouse_name: 'Johanis Lopo',
      rayon_id: 'r2', categorial_group_id: 'c3', membership_status: 'Tetap',
      baptism_status: 'Sudah', baptism_date: '1983-08-14', confirmation_status: 'Sudah', confirmation_date: '2000-10-29',
      marriage_church_status: 'Sudah', marriage_date: '2010-09-12', education: 'Sarjana (S1 / Terapan)', occupation: 'Guru / Dosen / Tenaga Pendidik'
    },
    {
      id: 'm6', member_no: 'GMIT-BF-2026-006', full_name: 'Debora Lopo', nickname: 'Debora',
      nik: '5305014809120006', family_card_no: '5305010101080002', family_id: 'f2', family_role: 'Anak',
      gender: 'Perempuan', birth_place: 'Fuimelang', birth_date: '2012-09-08', address: 'Kompleks SD Betel RT 03',
      phone: '', email: '', marital_status: 'Belum Menikah', spouse_name: '',
      rayon_id: 'r2', categorial_group_id: 'c1', membership_status: 'Tetap',
      baptism_status: 'Sudah', baptism_date: '2012-11-25', confirmation_status: 'Belum', confirmation_date: '',
      marriage_church_status: 'Belum', marriage_date: '', education: 'SD / Sederajat', occupation: 'Pelajar / Mahasiswa'
    },
    // Rayon III
    {
      id: 'm7', member_no: 'GMIT-BF-2026-007', full_name: 'Soleman Malaikosa', nickname: 'Soleman',
      nik: '5305013001750007', family_card_no: '5305010101080003', family_id: 'f3', family_role: 'Kepala Keluarga',
      gender: 'Laki-laki', birth_place: 'Fuimelang Atas', birth_date: '1975-01-30', address: 'Fuimelang Atas RT 05',
      phone: '0852-3911-0022', email: 'soleman.m@gmitbetel.id', marital_status: 'Menikah', spouse_name: 'Naomi Malaikosa-Blegur',
      rayon_id: 'r3', categorial_group_id: 'c4', membership_status: 'Tetap',
      baptism_status: 'Sudah', baptism_date: '1975-03-23', confirmation_status: 'Sudah', confirmation_date: '1992-10-25',
      marriage_church_status: 'Sudah', marriage_date: '2001-05-18', education: 'SLTA / SMA / SMK / MA / Sederajat', occupation: 'Petani / Pekebun'
    },
    {
      id: 'm8', member_no: 'GMIT-BF-2026-008', full_name: 'Naomi Malaikosa-Blegur', nickname: 'Naomi',
      nik: '5305015405790008', family_card_no: '5305010101080003', family_id: 'f3', family_role: 'Istri',
      gender: 'Perempuan', birth_place: 'Alor', birth_date: '1979-05-14', address: 'Fuimelang Atas RT 05',
      phone: '0852-3911-0023', email: '', marital_status: 'Menikah', spouse_name: 'Soleman Malaikosa',
      rayon_id: 'r3', categorial_group_id: 'c3', membership_status: 'Tetap',
      baptism_status: 'Sudah', baptism_date: '1979-07-20', confirmation_status: 'Sudah', confirmation_date: '1996-10-27',
      marriage_church_status: 'Sudah', marriage_date: '2001-05-18', education: 'SLTP / SMP / MTs / Sederajat', occupation: 'Petani / Pekebun'
    },
    {
      id: 'm9', member_no: 'GMIT-BF-2026-009', full_name: 'Markus Malaikosa', nickname: 'Markus',
      nik: '5305012207020009', family_card_no: '5305010101080003', family_id: 'f3', family_role: 'Anak',
      gender: 'Laki-laki', birth_place: 'Fuimelang', birth_date: '2002-07-22', address: 'Fuimelang Atas RT 05',
      phone: '0852-3911-0024', email: 'markus.m@gmail.com', marital_status: 'Belum Menikah', spouse_name: '',
      rayon_id: 'r3', categorial_group_id: 'c2', membership_status: 'Tetap',
      baptism_status: 'Sudah', baptism_date: '2002-09-15', confirmation_status: 'Sudah', confirmation_date: '2019-10-27',
      marriage_church_status: 'Belum', marriage_date: '', education: 'Diploma (D1 / D2 / D3)', occupation: 'Wiraswasta / Pedagang'
    },
    // Rayon IV
    {
      id: 'm10', member_no: 'GMIT-BF-2026-010', full_name: 'Simon Malaipada', nickname: 'Simon',
      nik: '5305011003600010', family_card_no: '5305010101080004', family_id: 'f4', family_role: 'Kepala Keluarga',
      gender: 'Laki-laki', birth_place: 'Moru', birth_date: '1960-03-10', address: 'Pesisir Pantai RT 07',
      phone: '0821-4455-6677', email: '', marital_status: 'Menikah', spouse_name: 'Martha Doko-Lobo',
      rayon_id: 'r4', categorial_group_id: 'c5', membership_status: 'Tetap',
      baptism_status: 'Sudah', baptism_date: '1960-05-12', confirmation_status: 'Sudah', confirmation_date: '1977-10-30',
      marriage_church_status: 'Sudah', marriage_date: '1985-11-20', education: 'SD / Sederajat', occupation: 'Nelayan / Perikanan'
    },
    {
      id: 'm11', member_no: 'GMIT-BF-2026-011', full_name: 'Martha Doko-Lobo', nickname: 'Martha',
      nik: '5305015710630011', family_card_no: '5305010101080004', family_id: 'f4', family_role: 'Istri',
      gender: 'Perempuan', birth_place: 'Fuimelang', birth_date: '1963-10-17', address: 'Pesisir Pantai RT 07',
      phone: '0821-4455-6678', email: '', marital_status: 'Menikah', spouse_name: 'Simon Malaipada',
      rayon_id: 'r4', categorial_group_id: 'c5', membership_status: 'Tetap',
      baptism_status: 'Sudah', baptism_date: '1963-12-22', confirmation_status: 'Sudah', confirmation_date: '1980-10-26',
      marriage_church_status: 'Sudah', marriage_date: '1985-11-20', education: 'SD / Sederajat', occupation: 'Petani / Pekebun'
    },
    {
      id: 'm12', member_no: 'GMIT-BF-2026-012', full_name: 'Kornelius Malaipada', nickname: 'Kornel',
      nik: '5305010412960012', family_card_no: '5305010101080004', family_id: 'f4', family_role: 'Anak',
      gender: 'Laki-laki', birth_place: 'Moru', birth_date: '1996-12-04', address: 'Pesisir Pantai RT 07',
      phone: '0821-4455-6679', email: 'kornel.m@gmail.com', marital_status: 'Belum Menikah', spouse_name: '',
      rayon_id: 'r4', categorial_group_id: 'c2', membership_status: 'Tetap',
      baptism_status: 'Sudah', baptism_date: '1997-02-16', confirmation_status: 'Sudah', confirmation_date: '2014-10-26',
      marriage_church_status: 'Belum', marriage_date: '', education: 'SLTA / SMA / SMK / MA / Sederajat', occupation: 'Nelayan / Perikanan'
    },
  ];

  const insertMember = db.prepare(`
    INSERT OR REPLACE INTO members (
      id, member_no, full_name, nickname, nik, family_card_no, family_id, family_role, gender,
      birth_place, birth_date, address, kelurahan, kecamatan, kabupaten, phone, email,
      marital_status, spouse_name, rayon_id, categorial_group_id, membership_status,
      baptism_status, baptism_date, confirmation_status, confirmation_date,
      marriage_church_status, marriage_date, education, occupation, join_date, status,
      notes, photo_url, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, 'Lembur Tengah', 'Alor Tengah Utara', 'Alor', ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, '2026-01-01', 'Aktif',
      '', '', '2026-01-01', '2026-01-01'
    )
  `);

  for (const m of members) {
    insertMember.run(
      m.id, m.member_no, m.full_name, m.nickname, m.nik, m.family_card_no, m.family_id, m.family_role, m.gender,
      m.birth_place, m.birth_date, m.address, m.phone, m.email,
      m.marital_status, m.spouse_name, m.rayon_id, m.categorial_group_id, m.membership_status,
      m.baptism_status, m.baptism_date, m.confirmation_status, m.confirmation_date,
      m.marriage_church_status, m.marriage_date, m.education, m.occupation
    );
  }

  // Update head of family IDs
  db.prepare('UPDATE families SET head_of_family_id = ? WHERE id = ?').run('m1', 'f1');
  db.prepare('UPDATE families SET head_of_family_id = ? WHERE id = ?').run('m4', 'f2');
  db.prepare('UPDATE families SET head_of_family_id = ? WHERE id = ?').run('m7', 'f3');
  db.prepare('UPDATE families SET head_of_family_id = ? WHERE id = ?').run('m10', 'f4');

  // 3. Service Schedule
  const insertSchedule = db.prepare(`
    INSERT INTO service_schedules (id, service_date, service_name, preacher, liturgist, elder_duty, deacon_duty, song_leader, musicians, multimedia_operator, usher, bible_reader, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertSchedule.run(
    'sch-1', '2026-10-25 09:00', 'Kebaktian Minggu Pagi - Minggu XXI Setelah Pentakosta',
    'Pdt. Sonya W. Isu, S.Th', 'Pnt. Daniel Malaipada', 'Pnt. Yulius Banamtuan, Pnt. Sarah Lopo',
    'Dkn. Elisabeth Lopo, Dkn. Samuel Blegur', 'Sdri. Martha Kolly', 'Sdr. Daniel Banamtuan (Keyboard)',
    'Sdr. Johanis Lopo', 'Pemuda GP GMIT Rayon I', 'Ibu Naomi Malaikosa', 'Kebaktian Umum dengan Perjamuan Kudus'
  );

  // 4. Financial Transactions
  const insertFinance = db.prepare(`
    INSERT INTO financial_transactions (id, tx_no, tx_date, type, category, amount, description, recorded_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertFinance.run('tx-1', 'TX-BF-2026-001', '2026-10-18', 'Pemasukan', 'Kolekte Kebaktian Minggu', 3850000, 'Kolekte I, II, dan III Kebaktian Minggu Pagi', 'Dkn. Samuel Blegur');
  insertFinance.run('tx-2', 'TX-BF-2026-002', '2026-10-19', 'Pemasukan', 'Persembahan Persepuluhan', 2400000, 'Persepuluhan Jemaat Rayon I dan II', 'Dkn. Samuel Blegur');
  insertFinance.run('tx-3', 'TX-BF-2026-003', '2026-10-20', 'Pengeluaran', 'Operasional Gereja & Listrik', 850000, 'Pembayaran Listrik PLN Gereja dan Pastori Betel', 'Dkn. Samuel Blegur');
}

