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
}
