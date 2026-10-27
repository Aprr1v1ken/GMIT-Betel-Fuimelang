import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase.ts';
import type { ChurchStaff, ServiceSchedule, Announcement, Member, ChurchEvent } from '../types/index.ts';

// Helper to sanitize undefined values before saving to Firestore
function cleanData<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result;
}

// 1. Church Staff Sync
export async function syncStaffToFirestore(staff: ChurchStaff): Promise<void> {
  try {
    const docRef = doc(db, 'church_staff', staff.id);
    await setDoc(docRef, {
      ...cleanData(staff),
      syncedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('[CloudSync] Warning saving staff to Firestore:', err);
  }
}

export async function deleteStaffFromFirestore(staffId: string): Promise<void> {
  try {
    const docRef = doc(db, 'church_staff', staffId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('[CloudSync] Warning deleting staff from Firestore:', err);
  }
}

export async function fetchStaffFromFirestore(): Promise<ChurchStaff[]> {
  try {
    const colRef = collection(db, 'church_staff');
    const snapshot = await getDocs(colRef);
    const list: ChurchStaff[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as ChurchStaff);
    });
    return list;
  } catch (err) {
    console.warn('[CloudSync] Could not fetch staff from Firestore:', err);
    return [];
  }
}

// 2. Service Schedules & Liturgos Sync
export async function syncScheduleToFirestore(schedule: ServiceSchedule): Promise<void> {
  try {
    const docRef = doc(db, 'schedules', schedule.id);
    await setDoc(docRef, {
      ...cleanData(schedule),
      syncedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('[CloudSync] Warning saving schedule to Firestore:', err);
  }
}

export async function deleteScheduleFromFirestore(scheduleId: string): Promise<void> {
  try {
    const docRef = doc(db, 'schedules', scheduleId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('[CloudSync] Warning deleting schedule from Firestore:', err);
  }
}

export async function fetchSchedulesFromFirestore(): Promise<ServiceSchedule[]> {
  try {
    const colRef = collection(db, 'schedules');
    const snapshot = await getDocs(colRef);
    const list: ServiceSchedule[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as ServiceSchedule);
    });
    return list;
  } catch (err) {
    console.warn('[CloudSync] Could not fetch schedules from Firestore:', err);
    return [];
  }
}

// 3. Announcements & Warta Jemaat Sync
export async function syncAnnouncementToFirestore(announcement: Announcement): Promise<void> {
  try {
    const docRef = doc(db, 'announcements', announcement.id);
    await setDoc(docRef, {
      ...cleanData(announcement),
      syncedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('[CloudSync] Warning saving announcement to Firestore:', err);
  }
}

export async function deleteAnnouncementFromFirestore(announcementId: string): Promise<void> {
  try {
    const docRef = doc(db, 'announcements', announcementId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('[CloudSync] Warning deleting announcement from Firestore:', err);
  }
}

export async function fetchAnnouncementsFromFirestore(): Promise<Announcement[]> {
  try {
    const colRef = collection(db, 'announcements');
    const snapshot = await getDocs(colRef);
    const list: Announcement[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as Announcement);
    });
    return list;
  } catch (err) {
    console.warn('[CloudSync] Could not fetch announcements from Firestore:', err);
    return [];
  }
}

// 4. Member Sync
export async function syncMemberToFirestore(member: Partial<Member> & { id: string }): Promise<void> {
  try {
    const docRef = doc(db, 'members', member.id);
    await setDoc(docRef, {
      ...cleanData(member),
      syncedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('[CloudSync] Warning saving member to Firestore:', err);
  }
}

export async function deleteMemberFromFirestore(memberId: string): Promise<void> {
  try {
    const docRef = doc(db, 'members', memberId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('[CloudSync] Warning deleting member from Firestore:', err);
  }
}

export async function fetchMembersFromFirestore(): Promise<Member[]> {
  try {
    const colRef = collection(db, 'members');
    const snapshot = await getDocs(colRef);
    const list: Member[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as Member);
    });
    return list;
  } catch (err) {
    console.warn('[CloudSync] Could not fetch members from Firestore:', err);
    return [];
  }
}

// 5. Church Events & Agenda Pelayanan Sync
export async function syncEventToFirestore(event: ChurchEvent): Promise<void> {
  try {
    const docRef = doc(db, 'events', event.id);
    await setDoc(docRef, {
      ...cleanData(event),
      syncedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('[CloudSync] Warning saving event to Firestore:', err);
  }
}

export async function deleteEventFromFirestore(eventId: string): Promise<void> {
  try {
    const docRef = doc(db, 'events', eventId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('[CloudSync] Warning deleting event from Firestore:', err);
  }
}

export async function fetchEventsFromFirestore(): Promise<ChurchEvent[]> {
  try {
    const colRef = collection(db, 'events');
    const snapshot = await getDocs(colRef);
    const list: ChurchEvent[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as ChurchEvent);
    });
    return list;
  } catch (err) {
    console.warn('[CloudSync] Could not fetch events from Firestore:', err);
    return [];
  }
}

// 6. Direct Cloud Image Storage for Church Activities (Firestore activity_images)
export interface CloudActivityImage {
  id: string;
  url: string;
  title: string;
  category: string;
  description?: string;
  createdAt: string;
  syncedAt: string;
}

export async function uploadActivityImageToCloud(
  dataUrl: string,
  meta: { title: string; category: string; description?: string }
): Promise<CloudActivityImage> {
  const imageId = 'img_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const docRef = doc(db, 'activity_images', imageId);
  const record: CloudActivityImage = {
    id: imageId,
    url: dataUrl,
    title: meta.title || 'Foto Kegiatan Jemaat Betel',
    category: meta.category || 'Bakti Jumat & Gotong Royong',
    description: meta.description || '',
    createdAt: new Date().toISOString(),
    syncedAt: new Date().toISOString(),
  };

  await setDoc(docRef, cleanData(record), { merge: true });
  return record;
}

export async function fetchActivityImagesFromCloud(): Promise<CloudActivityImage[]> {
  try {
    const colRef = collection(db, 'activity_images');
    const snapshot = await getDocs(colRef);
    const list: CloudActivityImage[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as CloudActivityImage);
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.warn('[CloudSync] Could not fetch activity images from Firestore:', err);
    return [];
  }
}
