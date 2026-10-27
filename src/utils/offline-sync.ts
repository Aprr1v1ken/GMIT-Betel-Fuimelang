import type { Member } from '../types/index.ts';

const OFFLINE_QUEUE_KEY = 'sysjeger_offline_members_queue';
const CACHED_MEMBERS_KEY = 'sysjeger_cached_members';

// Get current pending offline items
export function getOfflineMembersQueue(): Partial<Member>[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('Error reading offline queue:', err);
    return [];
  }
}

// Add member to offline queue with optimistic local representation
export function addMemberToOfflineQueue(memberData: Partial<Member>): Member {
  const queue = getOfflineMembersQueue();
  const tempId = 'offline-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
  const now = new Date().toISOString();

  const optimisticMember: Member = {
    id: tempId,
    memberNo: 'OFFLINE-' + Math.floor(1000 + Math.random() * 9000),
    fullName: memberData.fullName || 'Jemaat Baru (Offline)',
    nickname: memberData.nickname || '',
    nik: memberData.nik || '',
    familyCardNo: memberData.familyCardNo || '',
    familyId: memberData.familyId || '',
    familyName: memberData.familyName || '',
    familyRole: memberData.familyRole || 'Anak',
    gender: memberData.gender || 'Laki-laki',
    birthPlace: memberData.birthPlace || 'Fuimelang',
    birthDate: memberData.birthDate || '1995-01-01',
    address: memberData.address || 'Desa Lembur Tengah',
    kelurahan: memberData.kelurahan || 'Lembur Tengah',
    kecamatan: memberData.kecamatan || 'Alor Tengah Utara',
    kabupaten: memberData.kabupaten || 'Alor',
    phone: memberData.phone || '',
    email: memberData.email || '',
    maritalStatus: memberData.maritalStatus || 'Belum Menikah',
    spouseName: memberData.spouseName || '',
    rayonId: memberData.rayonId || 'r1',
    rayonName: memberData.rayonName || 'Rayon Pelayanan',
    categorialGroupId: memberData.categorialGroupId || 'c1',
    categorialGroupName: memberData.categorialGroupName || 'Kategorial',
    membershipStatus: memberData.membershipStatus || 'Tetap',
    baptismStatus: memberData.baptismStatus || 'Sudah',
    baptismDate: memberData.baptismDate || '',
    confirmationStatus: memberData.confirmationStatus || 'Belum',
    confirmationDate: memberData.confirmationDate || '',
    marriageChurchStatus: memberData.marriageChurchStatus || 'Belum',
    marriageDate: memberData.marriageDate || '',
    education: memberData.education || '',
    occupation: memberData.occupation || '',
    joinDate: memberData.joinDate || now.substring(0, 10),
    status: memberData.status || 'Aktif',
    notes: memberData.notes ? `${memberData.notes} [Diinput Offline]` : 'Diinput Offline',
    photoUrl: memberData.photoUrl || '',
    createdAt: now,
    updatedAt: now,
    isOfflinePending: true,
  };

  queue.push({
    ...memberData,
    id: tempId,
    isOfflinePending: true,
  });

  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('Failed to save to offline queue:', err);
  }

  // Also update local cached members
  const cached = getCachedMembersLocally();
  cached.unshift(optimisticMember);
  cacheMembersLocally(cached);

  return optimisticMember;
}

// Remove item from queue
export function removeMemberFromOfflineQueue(tempId: string) {
  try {
    const queue = getOfflineMembersQueue();
    const updated = queue.filter((item) => item.id !== tempId);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Error removing from queue:', err);
  }
}

// Clear entire queue
export function clearOfflineQueue() {
  try {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  } catch (err) {
    console.warn('Error clearing offline queue:', err);
  }
}

// Cache all members for offline view
export function cacheMembersLocally(members: Member[]) {
  try {
    localStorage.setItem(CACHED_MEMBERS_KEY, JSON.stringify(members));
  } catch (err) {
    console.warn('Failed to cache members locally:', err);
  }
}

export function getCachedMembersLocally(): Member[] {
  try {
    const raw = localStorage.getItem(CACHED_MEMBERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('Failed to load cached members:', err);
    return [];
  }
}

// Clear locally cached members
export function clearCachedMembersLocally() {
  try {
    localStorage.removeItem(CACHED_MEMBERS_KEY);
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  } catch (err) {
    console.warn('Failed to clear cached members locally:', err);
  }
}

// Sync all queued items to server
export async function syncOfflineQueueToServer(
  createMemberApi: (data: Partial<Member>) => Promise<any>
): Promise<{ syncedCount: number; failedCount: number; errors: string[] }> {
  const queue = getOfflineMembersQueue();
  if (queue.length === 0) {
    return { syncedCount: 0, failedCount: 0, errors: [] };
  }

  let syncedCount = 0;
  let failedCount = 0;
  const errors: string[] = [];
  const remainingQueue: Partial<Member>[] = [];

  for (const item of queue) {
    try {
      // Clean up temporary offline fields before posting
      const payload: Partial<Member> = { ...item };
      const tempId = payload.id;
      delete payload.id;
      delete payload.isOfflinePending;

      const res = await createMemberApi(payload);
      if (res && res.success) {
        syncedCount++;
      } else {
        failedCount++;
        errors.push(`${item.fullName || 'Jemaat'}: ${res?.message || 'Gagal tersinkron'}`);
        remainingQueue.push(item);
      }
    } catch (err: any) {
      failedCount++;
      errors.push(`${item.fullName || 'Jemaat'}: ${err.message || 'Koneksi terputus'}`);
      remainingQueue.push(item);
    }
  }

  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remainingQueue));
  } catch {
    // ignore
  }

  return { syncedCount, failedCount, errors };
}
