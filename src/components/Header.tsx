import React from 'react';
import { Menu, Bell, Shield, User, Globe, ChevronDown, LogOut, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import type { User as UserType, UserRole } from '../types/index.ts';

interface HeaderProps {
  currentView: string;
  currentUser: UserType | null;
  onOpenMobileSidebar: () => void;
  onOpenPublicSite: () => void;
  onSwitchRole: (role: UserRole) => void;
  onLogout?: () => void;
  isOnline?: boolean;
  pendingOfflineCount?: number;
  onSyncOffline?: () => void;
  syncingOffline?: boolean;
}

const VIEW_TITLES: Record<string, string> = {
  dashboard: 'Dashboard Statistik & Pelayanan',
  members: 'Database Jemaat Betel Fuimelang',
  families: 'Daftar Kartu Keluarga (KK)',
  rayons: 'Wilayah Pelayanan 4 Rayon (Rayon I - IV)',
  categorials: 'Kelompok Kategorial GMIT',
  staff: 'Presbiter Majelis Jemaat & Pendeta',
  sacraments: 'Buku Registrasi Sakramen Kudus',
  mutations: 'Buku Mutasi & Peristiwa Gerejawi',
  events: 'Kalender Kegiatan & Ibadah',
  attendance: 'Pencatatan Absensi Kebaktian',
  finance: 'Administrasi Kas Keuangan Gereja',
  announcements: 'Penerbitan Warta Jemaat',
  documents: 'Arsip & Dokumen Digital Gereja',
  reports: 'Pusat Laporan & Format Cetak Resmi A4',
  portal: 'Portal Pelayanan Khusus Warga Jemaat',
  backup: 'Cadangan & Pemulihan Database',
  audit: 'Audit Trail Aktivitas Sistem',
  settings: 'Pengaturan Sistem & Instal Aplikasi HP',
};

export const Header: React.FC<HeaderProps> = ({
  currentView,
  currentUser,
  onOpenMobileSidebar,
  onOpenPublicSite,
  onSwitchRole,
  onLogout,
  isOnline = true,
  pendingOfflineCount = 0,
  onSyncOffline,
  syncingOffline = false,
}) => {
  const [showRoleMenu, setShowRoleMenu] = React.useState(false);

  const availableRoles: UserRole[] = [
    'Super Admin',
    'Admin Gereja',
    'Ketua Majelis/Pendeta',
    'Majelis/Rayon',
    'Jemaat',
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-[#070b18]/95 backdrop-blur-md border-b border-amber-500/20 text-slate-200">
      {/* Left zone: Mobile toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-md lg:hidden"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span className="text-amber-400 font-bold tracking-wide">SYSJEGER</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-200 font-semibold truncate max-w-[160px] sm:max-w-none">
            {VIEW_TITLES[currentView] || 'Sistem Informasi Gereja'}
          </span>
        </div>
      </div>

      {/* Right zone: Network Status, Fast Sync, Switch Role, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Offline / Online Network Indicator */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium"
              title="Terhubung ke Server GMIT Betel Fuimelang"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Online</span>
            </div>
          ) : (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 font-medium animate-pulse"
              title="Jaringan terputus. Input jemaat tetap tersimpan di perangkat lokal secara aman."
            >
              <WifiOff className="w-3 h-3 text-amber-400" />
              <span>Offline Mode</span>
            </div>
          )}

          {/* Pending Sync Button if any offline data exists */}
          {pendingOfflineCount > 0 && (
            <button
              onClick={onSyncOffline}
              disabled={syncingOffline || !isOnline}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all shadow-sm ${
                isOnline
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed opacity-75'
              }`}
              title={
                isOnline
                  ? `Klik untuk sinkronkan ${pendingOfflineCount} data jemaat offline ke server`
                  : 'Menunggu koneksi internet tersambung untuk sinkronisasi otomatis'
              }
            >
              <RefreshCw className={`w-3 h-3 ${syncingOffline ? 'animate-spin text-slate-950' : ''}`} />
              <span>
                {syncingOffline ? 'Menyinkronkan...' : `Sinkron (${pendingOfflineCount})`}
              </span>
            </button>
          )}
        </div>

        {/* Role Switcher for seamless verification & multi-role workflows */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#0e162d] border border-amber-500/30 text-amber-300 hover:bg-[#152042] transition-colors"
            title="Ganti Peran Hak Akses untuk Pengujian Sistem"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Peran:</span>
            <span className="font-bold text-white">{currentUser?.role || 'Guest'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-amber-400/80" />
          </button>

          {showRoleMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowRoleMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 rounded-lg bg-[#0b1226] border border-amber-500/30 shadow-xl py-1 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase">
                  Beralih Hak Akses (RBAC)
                </div>
                {availableRoles.map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      onSwitchRole(role);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                      currentUser?.role === role ? 'text-amber-400 font-bold bg-amber-500/10' : 'text-slate-300'
                    }`}
                  >
                    <span>{role}</span>
                    {currentUser?.role === role && <span className="text-[10px] text-amber-400">Aktif</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <button
          onClick={onOpenPublicSite}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          <span>Halaman Warta Publik</span>
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div
            className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white text-xs font-bold border border-amber-300/40 shadow-xs"
            title={`${currentUser?.name || 'Pengguna'} (${currentUser?.role || 'Guest'})`}
          >
            {currentUser?.name?.substring(0, 2).toUpperCase() || 'AD'}
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md border border-slate-800 transition-colors"
              title="Keluar / Logout dari SYSJEGER"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
