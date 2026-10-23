/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { PublicLanding } from './components/PublicLanding.tsx';
import { MemberFormModal } from './components/MemberFormModal.tsx';
import { MemberDetailModal } from './components/MemberDetailModal.tsx';
import { FamilyModal } from './components/FamilyModal.tsx';
import { SacramentModal } from './components/SacramentModal.tsx';
import { ImportModal } from './components/ImportModal.tsx';
import { PrintReportModal } from './components/PrintReportModal.tsx';
import { KoboExportModal } from './components/KoboExportModal.tsx';

// Views
import { DashboardView } from './components/views/DashboardView.tsx';
import { MembersView } from './components/views/MembersView.tsx';
import { FamiliesView } from './components/views/FamiliesView.tsx';
import { RayonsView } from './components/views/RayonsView.tsx';
import { StaffView } from './components/views/StaffView.tsx';
import { SacramentsView } from './components/views/SacramentsView.tsx';
import { MutationsView } from './components/views/MutationsView.tsx';
import { EventsView } from './components/views/EventsView.tsx';
import { AttendanceView } from './components/views/AttendanceView.tsx';
import { FinanceView } from './components/views/FinanceView.tsx';
import { DocumentsView } from './components/views/DocumentsView.tsx';
import { AnnouncementsView } from './components/views/AnnouncementsView.tsx';
import { JemaatPortalView } from './components/views/JemaatPortalView.tsx';
import { BackupView } from './components/views/BackupView.tsx';
import { AuditLogsView } from './components/views/AuditLogsView.tsx';
import { ReportsView } from './components/views/ReportsView.tsx';
import { SettingsView } from './components/views/SettingsView.tsx';
import { AIAssistantView } from './components/views/AIAssistantView.tsx';
import { GoogleMapsView } from './components/views/GoogleMapsView.tsx';
import { GoogleWorkspaceView } from './components/views/GoogleWorkspaceView.tsx';

import * as api from './services/api.ts';
import {
  getOfflineMembersQueue,
  addMemberToOfflineQueue,
  syncOfflineQueueToServer,
  cacheMembersLocally,
  getCachedMembersLocally,
} from './utils/offline-sync.ts';
import type {
  Member,
  Family,
  Rayon,
  CategorialGroup,
  ChurchStaff,
  BaptismRecord,
  ConfirmationRecord,
  MarriageRecord,
  MutationRecord,
  ChurchEvent,
  ServiceSchedule,
  AttendanceRecord,
  FinancialTransaction,
  DocumentRecord,
  Announcement,
  DataCorrectionRequest,
  AuditLog,
  User,
  UserRole,
} from './types/index.ts';

export default function App() {
  // User authentication session: if none stored in localStorage, start as null (guest/public)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('sysjeger_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentView, setCurrentView] = useState('dashboard');
  // If not logged in, showPublicSite is forced to true
  const [showPublicSite, setShowPublicSite] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('sysjeger_user');
    } catch {
      return true;
    }
  });
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState(false);

  // Modals state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMemberFormModal, setShowMemberFormModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showMemberDetailModal, setShowMemberDetailModal] = useState(false);
  const [detailMember, setDetailMember] = useState<Member | null>(null);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showSacramentModal, setShowSacramentModal] = useState(false);
  const [sacramentType, setSacramentType] = useState<'baptis' | 'sidi' | 'nikah'>('baptis');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPrintReportModal, setShowPrintReportModal] = useState(false);
  const [showKoboExportModal, setShowKoboExportModal] = useState(false);
  const [reportType, setReportType] = useState<'members' | 'rayons' | 'finance' | 'sacraments' | 'attendance'>('members');

  // Server Data States - initialize members with locally cached data for instant display
  const [members, setMembers] = useState<Member[]>(() => getCachedMembersLocally());
  const [families, setFamilies] = useState<Family[]>([]);
  const [rayons, setRayons] = useState<Rayon[]>([]);
  const [categorials, setCategorials] = useState<CategorialGroup[]>([]);
  const [staff, setStaff] = useState<ChurchStaff[]>([]);
  const [baptisms, setBaptisms] = useState<BaptismRecord[]>([]);
  const [confirmations, setConfirmations] = useState<ConfirmationRecord[]>([]);
  const [marriages, setMarriages] = useState<MarriageRecord[]>([]);
  const [mutations, setMutations] = useState<MutationRecord[]>([]);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [schedules, setSchedules] = useState<ServiceSchedule[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [corrections, setCorrections] = useState<DataCorrectionRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Offline Synchronization & Network Awareness
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [pendingOfflineCount, setPendingOfflineCount] = useState<number>(() =>
    getOfflineMembersQueue().length
  );
  const [syncingOffline, setSyncingOffline] = useState(false);
  const [syncToast, setSyncToast] = useState<{
    message: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  // Load all data from API with Auto-Sync & Promise.allSettled Resilience
  const loadAllData = async () => {
    // 1. Auto-sync any pending offline queue items if server is reachable
    const pendingQueue = getOfflineMembersQueue();
    if (pendingQueue.length > 0) {
      try {
        await syncOfflineQueueToServer(api.createMemberApi);
      } catch (syncErr) {
        console.warn('Auto-sync offline queue failed on loadAllData:', syncErr);
      }
    }

    try {
      const results = await Promise.allSettled([
        api.fetchStatsApi(),
        api.fetchMembersApi(),
        api.fetchFamiliesApi(),
        api.fetchRayonsApi(),
        api.fetchCategorialsApi(),
        api.fetchStaffApi(),
        api.fetchSacramentsApi(),
        api.fetchMutationsApi(),
        api.fetchEventsApi(),
        api.fetchSchedulesApi(),
        api.fetchAttendanceApi(),
        api.fetchFinanceApi(),
        api.fetchDocumentsApi(),
        api.fetchAnnouncementsApi(),
        api.fetchCorrectionsApi(),
        api.fetchAuditLogsApi(),
      ]);

      const val = (idx: number) => results[idx].status === 'fulfilled' ? (results[idx] as PromiseFulfilledResult<any>).value : null;

      const statsRes = val(0);
      const membersRes = val(1);
      const familiesRes = val(2);
      const rayonsRes = val(3);
      const catRes = val(4);
      const staffRes = val(5);
      const sacramentsRes = val(6);
      const mutationsRes = val(7);
      const eventsRes = val(8);
      const schedulesRes = val(9);
      const attendanceRes = val(10);
      const financeRes = val(11);
      const docsRes = val(12);
      const announcementsRes = val(13);
      const correctionsRes = val(14);
      const auditRes = val(15);

      if (statsRes?.stats) setStats(statsRes.stats);

      // Handle Members: Combine server members with remaining pending offline items
      const serverMembers: Member[] = membersRes?.members || [];
      const remainingOffline = getOfflineMembersQueue();
      const offlineItems: Member[] = remainingOffline.map((item) => ({
        id: item.id || `offline-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        memberNo: item.memberNo || 'OFFLINE-TEMP',
        fullName: item.fullName || 'Jemaat Baru (Offline)',
        nickname: item.nickname || '',
        nik: item.nik || '',
        familyCardNo: item.familyCardNo || '',
        familyId: item.familyId || '',
        familyName: item.familyName || '',
        familyRole: item.familyRole || 'Anak',
        gender: item.gender || 'Laki-laki',
        birthPlace: item.birthPlace || 'Fuimelang',
        birthDate: item.birthDate || '1995-01-01',
        address: item.address || 'Desa Lembur Tengah',
        kelurahan: item.kelurahan || 'Lembur Tengah',
        kecamatan: item.kecamatan || 'Alor Tengah Utara',
        kabupaten: item.kabupaten || 'Alor',
        phone: item.phone || '',
        email: item.email || '',
        maritalStatus: item.maritalStatus || 'Belum Menikah',
        spouseName: item.spouseName || '',
        rayonId: item.rayonId || 'r1',
        rayonName: item.rayonName || 'Rayon Pelayanan',
        categorialGroupId: item.categorialGroupId || 'c1',
        categorialGroupName: item.categorialGroupName || 'Kategorial',
        membershipStatus: item.membershipStatus || 'Tetap',
        baptismStatus: item.baptismStatus || 'Sudah',
        baptismDate: item.baptismDate || '',
        confirmationStatus: item.confirmationStatus || 'Belum',
        confirmationDate: item.confirmationDate || '',
        marriageChurchStatus: item.marriageChurchStatus || 'Belum',
        marriageDate: item.marriageDate || '',
        education: item.education || '',
        occupation: item.occupation || '',
        joinDate: item.joinDate || new Date().toISOString().substring(0, 10),
        status: item.status || 'Aktif',
        notes: item.notes || 'Diinput Offline',
        photoUrl: item.photoUrl || '',
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
        isOfflinePending: true,
      }));

      // If server returned members, prioritize server data + remaining offline items
      if (serverMembers.length > 0 || remainingOffline.length > 0) {
        const combinedMembers = [
          ...offlineItems,
          ...serverMembers.filter((sm) => !offlineItems.some((om) => om.id === sm.id)),
        ];
        setMembers(combinedMembers);
        cacheMembersLocally(combinedMembers);
      } else {
        // Fall back to local cached members if server returned empty (offline)
        const cached = getCachedMembersLocally();
        if (cached.length > 0) {
          setMembers(cached);
        }
      }
      setPendingOfflineCount(remainingOffline.length);

      if (familiesRes?.families) setFamilies(familiesRes.families);
      if (rayonsRes?.rayons) setRayons(rayonsRes.rayons);
      if (catRes?.categorials) setCategorials(catRes.categorials);
      if (staffRes?.staff) setStaff(staffRes.staff);
      if (sacramentsRes) {
        setBaptisms(sacramentsRes.baptisms || []);
        setConfirmations(sacramentsRes.confirmations || []);
        setMarriages(sacramentsRes.marriages || []);
      }
      if (mutationsRes?.mutations) setMutations(mutationsRes.mutations);
      if (eventsRes?.events) setEvents(eventsRes.events);
      if (schedulesRes?.schedules) setSchedules(schedulesRes.schedules);
      if (attendanceRes?.attendance) setAttendance(attendanceRes.attendance);
      if (financeRes?.transactions) setTransactions(financeRes.transactions);
      if (docsRes?.documents) setDocuments(docsRes.documents);
      if (announcementsRes?.announcements) setAnnouncements(announcementsRes.announcements);
      if (correctionsRes?.corrections) setCorrections(correctionsRes.corrections);
      if (auditRes?.logs) setAuditLogs(auditRes.logs);
    } catch (err) {
      console.warn('Jaringan offline atau server tidak merespons, memuat dari penyimpanan lokal browser:', err);
      const cached = getCachedMembersLocally();
      if (cached.length > 0) {
        setMembers(cached);
      }
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Offline Sync execution handler
  const handleSyncOffline = async () => {
    if (syncingOffline) return;
    const queue = getOfflineMembersQueue();
    if (queue.length === 0) {
      setSyncToast({ message: 'Semua data jemaat sudah tersinkronkan dengan server.', type: 'info' });
      return;
    }

    setSyncingOffline(true);
    setSyncToast({
      message: `Sedang menyinkronkan ${queue.length} jemaat offline ke database GMIT Betel...`,
      type: 'info',
    });

    try {
      const result = await syncOfflineQueueToServer(api.createMemberApi);
      setPendingOfflineCount(getOfflineMembersQueue().length);
      await loadAllData();

      if (result.syncedCount > 0) {
        setSyncToast({
          message: `Berhasil menyinkronkan ${result.syncedCount} data jemaat ke database server!${
            result.failedCount > 0 ? ` (${result.failedCount} data masih tertunda)` : ''
          }`,
          type: 'success',
        });
      } else if (result.failedCount > 0) {
        setSyncToast({
          message: `Gagal menyinkronkan: ${result.errors[0] || 'Koneksi internet bermasalah'}`,
          type: 'error',
        });
      }
    } catch (err: any) {
      setSyncToast({
        message: `Kendala sinkronisasi: ${err?.message || 'Server belum dapat dijangkau'}`,
        type: 'error',
      });
    } finally {
      setSyncingOffline(false);
    }
  };

  // Listen for online / offline window events & auto-sync
  useEffect(() => {
    const handleOnlineEvent = () => {
      setIsOnline(true);
      setSyncToast({
        message: 'Koneksi internet terhubung kembali! Memulai sinkronisasi data offline...',
        type: 'success',
      });
      const pending = getOfflineMembersQueue();
      if (pending.length > 0) {
        handleSyncOffline();
      }
    };

    const handleOfflineEvent = () => {
      setIsOnline(false);
      setSyncToast({
        message: 'Koneksi internet terputus. Mode offline aktif — pendaftaran jemaat tetap dapat dilakukan dan tersimpan aman di perangkat.',
        type: 'info',
      });
    };

    window.addEventListener('online', handleOnlineEvent);
    window.addEventListener('offline', handleOfflineEvent);

    return () => {
      window.removeEventListener('online', handleOnlineEvent);
      window.removeEventListener('offline', handleOfflineEvent);
    };
  }, []);

  // Auto-dismiss toast notification after 6 seconds
  useEffect(() => {
    if (syncToast) {
      const timer = setTimeout(() => setSyncToast(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [syncToast]);

  // Google Maps Quota Listener
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);
  useEffect(() => {
    const handleQuota = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Quick switch role handler
  const handleSwitchRole = (role: UserRole) => {
    if (role === 'Super Admin') {
      setCurrentUser({
        id: 'u1',
        username: 'superadmin',
        name: 'Super Admin SYSJEGER',
        role: 'Super Admin',
        status: 'Aktif',
      });
      if (currentView === 'portal') setCurrentView('dashboard');
    } else if (role === 'Admin Gereja') {
      setCurrentUser({
        id: 'u2',
        username: 'admingereja',
        name: 'Dkn. Elisabeth Lopo (Tata Usaha)',
        role: 'Admin Gereja',
        status: 'Aktif',
      });
      if (currentView === 'portal') setCurrentView('dashboard');
    } else if (role === 'Ketua Majelis/Pendeta') {
      setCurrentUser({
        id: 'u3',
        username: 'pendeta',
        name: 'Pdt. Sonya W. Isu, S.Th (Ketua Majelis)',
        role: 'Ketua Majelis/Pendeta',
        status: 'Aktif',
      });
      if (currentView === 'portal') setCurrentView('dashboard');
    } else if (role === 'Majelis/Rayon') {
      setCurrentUser({
        id: 'u4',
        username: 'majelisrayon1',
        name: 'Pnt. Yulius Banamtuan (Penatua R1)',
        role: 'Majelis/Rayon',
        rayonId: 'r1',
        status: 'Aktif',
      });
      if (currentView === 'portal') setCurrentView('dashboard');
    } else if (role === 'Jemaat') {
      setCurrentUser({
        id: 'u5',
        username: 'jemaat1',
        name: 'Yohanis Tefa (Kepala Keluarga)',
        role: 'Jemaat',
        memberId: 'm1',
        rayonId: 'r1',
        status: 'Aktif',
      });
      setCurrentView('portal');
    }
  };

  // Member CRUD handlers with Automatic Direct-Save & Persistence
  const handleSaveMember = async (data: Partial<Member>) => {
    try {
      if (editingMember) {
        const res = await api.updateMemberApi(editingMember.id, data);
        if (res && res.success === false) {
          throw new Error(res.message || 'Gagal memperbarui jemaat di server');
        }
        setSyncToast({
          message: `Data jemaat "${data.fullName}" berhasil diperbarui di database.`,
          type: 'success',
        });
      } else {
        const res = await api.createMemberApi(data);
        if (res && res.success) {
          setSyncToast({
            message: `Jemaat "${data.fullName}" (${res.memberNo || 'Baru'}) berhasil disimpan ke database.`,
            type: 'success',
          });
          // Immediately update state and persistent local cache
          if (res.member) {
            setMembers((prev) => {
              const updated = [res.member, ...prev.filter((m) => m.id !== res.member.id)];
              cacheMembersLocally(updated);
              return updated;
            });
          }
        } else {
          throw new Error(res?.message || 'Gagal menyimpan ke server');
        }
      }
      await loadAllData();
      setShowMemberFormModal(false);
      setEditingMember(null);
    } catch (err: any) {
      console.warn('Gagal menyimpan langsung ke server, mencadangkan ke antrean offline:', err);
      if (!editingMember) {
        const optimistic = addMemberToOfflineQueue(data);
        setMembers((prev) => {
          const updated = [optimistic, ...prev.filter((m) => m.id !== optimistic.id)];
          cacheMembersLocally(updated);
          return updated;
        });
        setPendingOfflineCount(getOfflineMembersQueue().length);
        setSyncToast({
          message: `Data jemaat "${data.fullName || 'Baru'}" aman tersimpan di penyimpanan lokal dan akan disinkronkan saat terhubung ke server.`,
          type: 'info',
        });
        setShowMemberFormModal(false);
        setEditingMember(null);
      } else {
        setSyncToast({
          message: `Gagal memperbarui jemaat: ${err?.message || 'Periksa koneksi jaringan server.'}`,
          type: 'error',
        });
      }
    }
  };

  const handleDeleteMember = async (id: string) => {
    await api.deleteMemberApi(id);
    await loadAllData();
  };

  // Family CRUD handlers
  const handleSaveFamily = async (data: Partial<Family>) => {
    await api.createFamilyApi(data);
    await loadAllData();
  };

  const handleDeleteFamily = async (id: string) => {
    await api.deleteFamilyApi(id);
    await loadAllData();
  };

  // Staff handler
  const handleAddStaff = async (data: Partial<ChurchStaff>) => {
    await api.createStaffApi(data);
    await loadAllData();
  };

  // Sacrament handlers
  const handleSaveBaptism = async (data: any) => {
    await api.createBaptismApi(data);
    await loadAllData();
  };
  const handleSaveConfirmation = async (data: any) => {
    await api.createConfirmationApi(data);
    await loadAllData();
  };
  const handleSaveMarriage = async (data: any) => {
    await api.createMarriageApi(data);
    await loadAllData();
  };

  // Mutation handler
  const handleAddMutation = async (data: Partial<MutationRecord>) => {
    await api.createMutationApi(data);
    await loadAllData();
  };

  // Event & Schedule handlers
  const handleAddEvent = async (data: Partial<ChurchEvent>) => {
    await api.createEventApi(data);
    await loadAllData();
  };
  const handleAddSchedule = async (data: Partial<ServiceSchedule>) => {
    await api.createScheduleApi(data);
    await loadAllData();
  };

  // Attendance handler
  const handleAddAttendance = async (data: Partial<AttendanceRecord>) => {
    await api.createAttendanceApi(data);
    await loadAllData();
  };

  // Finance handler
  const handleAddFinance = async (data: Partial<FinancialTransaction>) => {
    await api.createFinanceApi(data);
    await loadAllData();
  };

  // Document handler
  const handleAddDocument = async (data: Partial<DocumentRecord>) => {
    await api.createDocumentApi(data);
    await loadAllData();
  };

  // Announcement handler
  const handleAddAnnouncement = async (data: Partial<Announcement>) => {
    await api.createAnnouncementApi(data);
    await loadAllData();
  };

  // Correction request handler
  const handleSubmitCorrection = async (details: string) => {
    const mem = members.find((m) => m.id === currentUser?.memberId) || members[0];
    if (mem) {
      await api.createCorrectionApi({
        memberId: mem.id,
        memberName: mem.fullName,
        details,
      });
      await loadAllData();
    }
  };

  // Login & Logout authentication handlers
  const handleLoginSuccess = (user: User) => {
    try {
      localStorage.setItem('sysjeger_user', JSON.stringify(user));
    } catch {
      // ignore
    }
    setCurrentUser(user);
    setShowPublicSite(false);
    setShowLoginModal(false);
    if (user.role === 'Jemaat') {
      setCurrentView('portal');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('sysjeger_user');
    } catch {
      // ignore
    }
    setCurrentUser(null);
    setShowPublicSite(true);
    setCurrentView('dashboard');
  };

  // Import handler
  const handleImportMembers = async (items: Partial<Member>[]) => {
    const res = await api.importMembersApi(items);
    await loadAllData();
    return res;
  };

  // Active member for Portal
  const activePortalMember = members.find((m) => m.id === currentUser?.memberId) || members[0] || null;
  const activePortalFamily = activePortalMember ? families.find((f) => f.id === activePortalMember.familyId) || null : null;
  const activePortalFamilyMembers = activePortalFamily ? members.filter((m) => m.familyId === activePortalFamily.id) : [];

  // Public website view & Privacy Barrier:
  // If showPublicSite is true or if user is unauthenticated, ONLY render public site + login modal
  if (showPublicSite || !currentUser) {
    return (
      <>
        <PublicLanding
          onEnterApp={() => {
            if (currentUser) {
              setShowPublicSite(false);
            } else {
              setShowLoginModal(true);
            }
          }}
          onOpenLogin={() => setShowLoginModal(true)}
          announcements={announcements}
          events={events}
          schedules={schedules}
          stats={stats}
          members={members}
          families={families}
          rayons={rayons}
          categorials={categorials}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b18] text-slate-100 flex flex-col font-sans">
      {mapsQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onSelectView={(v) => setCurrentView(v)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenPublicSite={() => setShowPublicSite(true)}
        isOpenMobile={isOpenMobileSidebar}
        onCloseMobile={() => setIsOpenMobileSidebar(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        <Header
          currentView={currentView}
          currentUser={currentUser}
          onOpenMobileSidebar={() => setIsOpenMobileSidebar(true)}
          onOpenPublicSite={() => setShowPublicSite(true)}
          onSwitchRole={handleSwitchRole}
          onLogout={handleLogout}
          isOnline={isOnline}
          pendingOfflineCount={pendingOfflineCount}
          onSyncOffline={handleSyncOffline}
          syncingOffline={syncingOffline}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentView === 'dashboard' && (
            <DashboardView
              stats={stats}
              members={members}
              onNavigate={(v) => setCurrentView(v)}
              onOpenAddMember={() => {
                setEditingMember(null);
                setShowMemberFormModal(true);
              }}
              onOpenAddFamily={() => setShowFamilyModal(true)}
              onOpenAddFinance={() => setCurrentView('finance')}
              onOpenAddAttendance={() => setCurrentView('attendance')}
              onOpenMemberDetail={(m) => {
                setDetailMember(m);
                setShowMemberDetailModal(true);
              }}
            />
          )}

          {currentView === 'ai-assistant' && (
            <AIAssistantView
              members={members}
              rayons={rayons}
              stats={stats}
              onAddAnnouncement={handleAddAnnouncement}
            />
          )}

          {currentView === 'members' && (
            <MembersView
              members={members}
              rayons={rayons}
              categorials={categorials}
              onOpenAddModal={() => {
                setEditingMember(null);
                setShowMemberFormModal(true);
              }}
              onOpenEditModal={(m) => {
                setEditingMember(m);
                setShowMemberFormModal(true);
              }}
              onOpenDetailModal={(m) => {
                setDetailMember(m);
                setShowMemberDetailModal(true);
              }}
              onDeleteMember={handleDeleteMember}
              onOpenImportModal={() => setShowImportModal(true)}
              onOpenKoboExport={() => setShowKoboExportModal(true)}
              onOpenPrintReport={() => {
                setReportType('members');
                setShowPrintReportModal(true);
              }}
              isOnline={isOnline}
              onSyncOffline={handleSyncOffline}
              syncingOffline={syncingOffline}
            />
          )}

          {currentView === 'families' && (
            <FamiliesView
              families={families}
              members={members}
              rayons={rayons}
              onOpenAddModal={() => setShowFamilyModal(true)}
              onDeleteFamily={handleDeleteFamily}
              onOpenPrintReport={() => {
                setReportType('rayons');
                setShowPrintReportModal(true);
              }}
            />
          )}

          {currentView === 'rayons' && (
            <RayonsView
              rayons={rayons}
              categorials={categorials}
              members={members}
              onSelectMember={(m) => {
                setDetailMember(m);
                setShowMemberDetailModal(true);
              }}
            />
          )}

          {currentView === 'maps' && (
            <GoogleMapsView
              members={members}
              rayons={rayons}
            />
          )}

          {currentView === 'categorials' && (
            <RayonsView
              rayons={rayons}
              categorials={categorials}
              members={members}
              onSelectMember={(m) => {
                setDetailMember(m);
                setShowMemberDetailModal(true);
              }}
            />
          )}

          {currentView === 'staff' && (
            <StaffView
              staff={staff}
              onAddStaff={handleAddStaff}
            />
          )}

          {currentView === 'sacraments' && (
            <SacramentsView
              baptisms={baptisms}
              confirmations={confirmations}
              marriages={marriages}
              members={members}
              onOpenAddBaptism={() => {
                setSacramentType('baptis');
                setShowSacramentModal(true);
              }}
              onOpenAddConfirmation={() => {
                setSacramentType('sidi');
                setShowSacramentModal(true);
              }}
              onOpenAddMarriage={() => {
                setSacramentType('nikah');
                setShowSacramentModal(true);
              }}
              onPrintCertificate={(type, record) => {
                setReportType('sacraments');
                setShowPrintReportModal(true);
              }}
            />
          )}

          {currentView === 'mutations' && (
            <MutationsView
              mutations={mutations}
              members={members}
              rayons={rayons}
              onAddMutation={handleAddMutation}
            />
          )}

          {currentView === 'events' && (
            <EventsView
              events={events}
              schedules={schedules}
              onAddEvent={handleAddEvent}
              onAddSchedule={handleAddSchedule}
            />
          )}

          {currentView === 'attendance' && (
            <AttendanceView
              attendance={attendance}
              onAddAttendance={handleAddAttendance}
              onOpenPrintReport={() => {
                setReportType('attendance');
                setShowPrintReportModal(true);
              }}
            />
          )}

          {currentView === 'finance' && (
            <FinanceView
              transactions={transactions}
              onAddTransaction={handleAddFinance}
              onOpenPrintReport={() => {
                setReportType('finance');
                setShowPrintReportModal(true);
              }}
            />
          )}

          {currentView === 'documents' && (
            <DocumentsView
              documents={documents}
              onAddDocument={handleAddDocument}
            />
          )}

          {currentView === 'announcements' && (
            <AnnouncementsView
              announcements={announcements}
              onAddAnnouncement={handleAddAnnouncement}
            />
          )}

          {currentView === 'workspace' && (
            <GoogleWorkspaceView
              members={members}
              transactions={transactions}
              rayons={rayons}
            />
          )}

          {currentView === 'reports' && (
            <ReportsView
              onOpenPrintReport={(t) => {
                setReportType(t);
                setShowPrintReportModal(true);
              }}
              members={members}
              families={families}
              rayons={rayons}
              transactions={transactions}
            />
          )}

          {currentView === 'portal' && activePortalMember && (
            <JemaatPortalView
              currentMember={activePortalMember}
              family={activePortalFamily}
              familyMembers={activePortalFamilyMembers}
              schedules={schedules}
              corrections={corrections}
              onSubmitCorrection={handleSubmitCorrection}
              onPrintCard={() => {
                setDetailMember(activePortalMember);
                setShowMemberDetailModal(true);
              }}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              onNavigateToBackup={() => setCurrentView('backup')}
            />
          )}

          {currentView === 'backup' && (
            <BackupView
              onOpenImport={() => setShowImportModal(true)}
            />
          )}

          {currentView === 'audit' && (
            <AuditLogsView
              logs={auditLogs}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <MemberFormModal
        isOpen={showMemberFormModal}
        onClose={() => {
          setShowMemberFormModal(false);
          setEditingMember(null);
        }}
        onSave={handleSaveMember}
        member={editingMember}
        rayons={rayons}
        categorials={categorials}
        families={families}
      />

      <MemberDetailModal
        isOpen={showMemberDetailModal}
        onClose={() => {
          setShowMemberDetailModal(false);
          setDetailMember(null);
        }}
        member={detailMember}
      />

      <FamilyModal
        isOpen={showFamilyModal}
        onClose={() => setShowFamilyModal(false)}
        onSave={handleSaveFamily}
        rayons={rayons}
      />

      <SacramentModal
        isOpen={showSacramentModal}
        type={sacramentType}
        onClose={() => setShowSacramentModal(false)}
        members={members}
        onSaveBaptism={handleSaveBaptism}
        onSaveConfirmation={handleSaveConfirmation}
        onSaveMarriage={handleSaveMarriage}
      />

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportMembers}
        rayons={rayons}
        categorials={categorials}
      />

      <PrintReportModal
        isOpen={showPrintReportModal}
        onClose={() => setShowPrintReportModal(false)}
        reportType={reportType}
        members={members}
        families={families}
        rayons={rayons}
        transactions={transactions}
      />

      <KoboExportModal
        isOpen={showKoboExportModal}
        onClose={() => setShowKoboExportModal(false)}
        members={members}
        rayons={rayons}
      />

      {/* Floating Offline & Sync Notification Toast */}
      {syncToast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-start sm:items-center gap-3 max-w-md px-4 py-3 rounded-xl shadow-2xl text-xs sm:text-sm font-medium border transition-all ${
            syncToast.type === 'success'
              ? 'bg-[#062419] text-emerald-300 border-emerald-500/50 shadow-emerald-950/70'
              : syncToast.type === 'error'
              ? 'bg-[#2b0c0c] text-rose-300 border-rose-500/50 shadow-rose-950/70'
              : 'bg-[#261d06] text-amber-300 border-amber-500/50 shadow-amber-950/70'
          }`}
          role="alert"
        >
          <span className="flex-1">{syncToast.message}</span>
          <button
            onClick={() => setSyncToast(null)}
            className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors"
            aria-label="Tutup notifikasi"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
