import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Calendar,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Heart,
  ChevronRight,
  Sparkles,
  Users,
  Home,
  BarChart3,
  Lock,
  LogOut,
  Shield,
  UserCheck,
  Layers,
  Award,
  Activity,
  Smartphone,
  Download,
  Share2,
  PlusSquare,
  Sun,
  MessageSquare,
  Music,
  Baby,
  HelpCircle,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';
import type { Announcement, ChurchEvent, ServiceSchedule, Member, Family, Rayon, CategorialGroup, User } from '../types/index.ts';

interface PublicLandingProps {
  onEnterApp: () => void;
  onOpenLogin: () => void;
  announcements: Announcement[];
  events: ChurchEvent[];
  schedules?: ServiceSchedule[];
  stats?: any;
  members?: Member[];
  families?: Family[];
  rayons?: Rayon[];
  categorials?: CategorialGroup[];
  currentUser?: User | null;
  onLogout?: () => void;
}

export const PublicLanding: React.FC<PublicLandingProps> = ({
  onEnterApp,
  onOpenLogin,
  announcements,
  events,
  schedules = [],
  stats,
  members = [],
  families = [],
  rayons = [],
  categorials = [],
  currentUser = null,
  onLogout,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  const handleInstallClick = async () => {
    if (isInstalled) return;
    if (isIOS) {
      setShowInstallGuide(true);
      return;
    }
    if (isInstallable) {
      await install();
    } else {
      setShowInstallGuide(true);
    }
  };

  // Aggregate statistics calculation
  const totalSoul = stats?.totalSoul ?? members.filter((m) => m.status === 'Aktif').length;
  const totalFamily = stats?.totalFamily ?? families.length;
  const maleCount = stats?.maleCount ?? members.filter((m) => m.gender === 'Laki-laki' && m.status === 'Aktif').length;
  const femaleCount = stats?.femaleCount ?? members.filter((m) => m.gender === 'Perempuan' && m.status === 'Aktif').length;

  const malePercent = totalSoul > 0 ? Math.round((maleCount / totalSoul) * 100) : 0;
  const femalePercent = totalSoul > 0 ? 100 - malePercent : 0;

  // Rayon counts
  const rayonCounts: Record<string, number> = stats?.rayonCounts || {};
  if (Object.keys(rayonCounts).length === 0 && members.length > 0) {
    for (const m of members) {
      const r = m.rayonName || 'Rayon Lain';
      rayonCounts[r] = (rayonCounts[r] || 0) + 1;
    }
  }

  // Categorial counts
  const categorialCounts: Record<string, number> = stats?.categorialCounts || {};
  if (Object.keys(categorialCounts).length === 0 && members.length > 0) {
    for (const m of members) {
      const c = m.categorialGroupName || 'Lainnya';
      categorialCounts[c] = (categorialCounts[c] || 0) + 1;
    }
  }

  // Sacraments summary
  const baptizedCount = stats?.sacraments?.baptized ?? members.filter((m) => m.baptismStatus === 'Sudah').length;
  const confirmedCount = stats?.sacraments?.confirmed ?? members.filter((m) => m.confirmationStatus === 'Sudah').length;
  const marriedChurchCount = stats?.sacraments?.marriedInChurch ?? members.filter((m) => m.marriageChurchStatus === 'Sudah').length;

  return (
    <div className="min-h-screen bg-[#060a16] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-40 bg-[#060a16]/95 backdrop-blur-md border-b border-amber-500/20 px-4 md:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/src/assets/images/regenerated_image_1792510154483.png"
            alt="Emblem GMIT"
            className="w-10 h-10 rounded-full border border-amber-400/50 object-cover shadow-md shrink-0"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-extrabold tracking-wide text-amber-300 uppercase">
                GMIT BETEL FUIMELANG
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                Portal Warta & Publik
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Klasis Alor Tengah Utara · Desa Lembur Tengah, NTT
            </p>
          </div>
        </div>

        {/* Quick Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <a href="#jadwal" className="hover:text-amber-400 transition-colors">
            Jadwal Ibadah
          </a>
          <a href="#statistik" className="hover:text-amber-400 transition-colors flex items-center gap-1.5 text-amber-300">
            <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Data Statistik</span>
            <span className="px-1.5 py-0.2 text-[9px] bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">Publik</span>
          </a>
          <a href="#sambutan" className="hover:text-amber-400 transition-colors">
            Gembala Jemaat
          </a>
          <a href="#warta" className="hover:text-amber-400 transition-colors">
            Warta & Pengumuman
          </a>
          <a href="#ai-rohani" className="hover:text-emerald-300 transition-colors flex items-center gap-1.5 text-emerald-300 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Rohani (Gratis)</span>
          </a>
        </nav>

        {/* Auth / Action CTA */}
        <div className="flex items-center gap-3">
          <a
            href="https://wa.me/6285173095482"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WA Sekretariat</span>
          </a>

          {!isInstalled && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors cursor-pointer"
              title="Instal aplikasi GMIT Betel Fuimelang ke HP"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Instal di HP</span>
              <span className="sm:hidden">Instal</span>
            </button>
          )}

          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onEnterApp}
                className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                title="Buka sistem internal SYSJEGER"
              >
                <span>Buka Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-slate-800 transition-colors"
                  title="Keluar dari akun"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              title="Akses Portal SYSJEGER dengan Akun dan Password"
            >
              <Lock className="w-3.5 h-3.5 text-slate-950" />
              <span>Masuk SYSJEGER</span>
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-amber-500/20">
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/aistudio/Gemini_Generated_Image_fz5m5cfz5m5cfz5m_d4b1cfd2.jpeg"
            alt="Gedung Kebaktian GMIT Betel Fuimelang"
            className="w-full h-full object-cover object-center opacity-45 sm:opacity-55 scale-105 transition-transform duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060a16] via-[#060a16]/75 to-[#060a16]/40" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Soli Deo Gloria — Hanya Bagi Kemuliaan Allah</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Gereja Masehi Injili di Timor
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 mt-2">
              Jemaat Betel Fuimelang
            </span>
          </h2>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed mb-8">
            Membangun persekutuan jemaat yang berakar dalam Firman Allah, bertumbuh dalam kasih persaudaraan, dan berbuah dalam pelayanan kasih di Desa Lembur Tengah, Klasis Alor Tengah Utara.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={currentUser ? onEnterApp : onOpenLogin}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/25 flex items-center gap-2 transition-transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-slate-950" />
              <span>{currentUser ? 'Buka Dashboard SYSJEGER' : 'Masuk Portal SYSJEGER'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#statistik"
              className="px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-500/40 font-semibold text-sm transition-colors flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>Data Statistik Jemaat</span>
            </a>
            <a
              href="#jadwal"
              className="px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-sm transition-colors"
            >
              Jadwal Ibadah & Warta
            </a>
            {!isInstalled && (
              <button
                onClick={handleInstallClick}
                className="px-5 py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold text-sm transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>Instal di HP</span>
              </button>
            )}
          </div>

          {/* Privacy Security Note */}
          <div className="mt-8 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-black/40 border border-slate-800 text-[11px] text-slate-400 backdrop-blur-sm">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Akses Portal SYSJEGER terproteksi akun & kata sandi resmi untuk menjaga kerahasiaan data jemaat.</span>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 flex-1">
        {/* PUBLIC STATISTICS SECTION */}
        <section id="statistik" className="space-y-6 scroll-mt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-amber-500/20 pb-4 gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Transparansi Tata Kelola Pelayanan</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
                <span>Data Statistik & Demografi Jemaat</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Ringkasan agregat demografis gerejawi GMIT Betel Fuimelang di Desa Lembur Tengah, Klasis Alor Tengah Utara. Data pribadi individu (NIK, riwayat arsip keluarga) dilindungi dan hanya dapat dikelola melalui akun resmi SYSJEGER.
              </p>
            </div>
            <div className="text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2 self-start md:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Data Terverifikasi Majelis Jemaat</span>
            </div>
          </div>

          {/* Primary 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Card 1: Total Jiwa */}
            <div className="p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 space-y-3 relative overflow-hidden group hover:border-amber-400/40 transition-colors">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider">Total Jiwa Jemaat</span>
                <Users className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">
                {totalSoul} <span className="text-xs font-normal text-slate-400">Jiwa</span>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
                <span>L: {maleCount} ({malePercent}%)</span>
                <span>P: {femaleCount} ({femalePercent}%)</span>
              </div>
              {/* Mini visual ratio bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
                <div style={{ width: `${malePercent}%` }} className="bg-sky-400 h-full" title={`Laki-laki: ${maleCount}`} />
                <div style={{ width: `${femalePercent}%` }} className="bg-pink-400 h-full" title={`Perempuan: ${femaleCount}`} />
              </div>
            </div>

            {/* Card 2: Total KK */}
            <div className="p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 space-y-3 relative overflow-hidden group hover:border-amber-400/40 transition-colors">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider">Kepala Keluarga (KK)</span>
                <Home className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">
                {totalFamily} <span className="text-xs font-normal text-slate-400">Rumah Tangga</span>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                <span>Rata-rata: {totalFamily > 0 ? (totalSoul / totalFamily).toFixed(1) : 0} jiwa / keluarga</span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Kartu Keluarga Gerejawi</span>
              </div>
            </div>

            {/* Card 3: Rayon Pelayanan */}
            <div className="p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 space-y-3 relative overflow-hidden group hover:border-amber-400/40 transition-colors">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider">Wilayah Rayon</span>
                <Layers className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">
                4 <span className="text-xs font-normal text-slate-400">Rayon Resmi</span>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                <span>Rayon I, Rayon II, Rayon III, Rayon IV</span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>Desa Lembur Tengah</span>
              </div>
            </div>

            {/* Card 4: Kategorial */}
            <div className="p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 space-y-3 relative overflow-hidden group hover:border-amber-400/40 transition-colors">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider">Kelompok Kategorial</span>
                <Heart className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">
                5 <span className="text-xs font-normal text-slate-400">Kategorial GMIT</span>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                <span>PAR, Pemuda, PKP, PKB, Lansia</span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-400" />
                <span>Pelayanan Holistik</span>
              </div>
            </div>
          </div>

          {/* Detailed Infographics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Card A: Persebaran Jemaat per Rayon */}
            <div className="p-6 rounded-3xl bg-[#0c1329] border border-amber-500/20 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <h4 className="font-bold text-white text-sm">
                    Persebaran Jemaat Berdasarkan 4 Rayon
                  </h4>
                </div>
                <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  Wilayah Penggembalaan
                </span>
              </div>

              <div className="space-y-3.5">
                {[
                  { name: 'Rayon I', key: 'Rayon I' },
                  { name: 'Rayon II', key: 'Rayon II' },
                  { name: 'Rayon III', key: 'Rayon III' },
                  { name: 'Rayon IV', key: 'Rayon IV' },
                ].map((r, idx) => {
                  const count = rayonCounts[r.key] || rayonCounts[r.name] || 0;
                  const pct = totalSoul > 0 ? Math.round((count / totalSoul) * 100) : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">{r.name}</span>
                        <span className="text-amber-400 font-mono font-bold">
                          {count} <span className="text-slate-400 font-normal">jiwa ({pct}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Pelayanan rayon dikoordinir oleh Majelis Jemaat & Presbiter bertugas di setiap rayon.</span>
              </div>
            </div>

            {/* Card B: Distribusi Kategorial Pelayanan */}
            <div className="p-6 rounded-3xl bg-[#0c1329] border border-amber-500/20 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-amber-400" />
                  <h4 className="font-bold text-white text-sm">
                    Distribusi Kategorial & Demografi Usia
                  </h4>
                </div>
                <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  Kelompok Pelayanan
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#080d1e] border border-slate-800 space-y-1">
                  <div className="text-slate-400 text-[11px] font-semibold">PAR (Anak & Remaja)</div>
                  <div className="text-lg font-bold text-amber-300">
                    {categorialCounts['PAR'] || 0} <span className="text-[10px] font-normal text-slate-400">jiwa</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Usia 0 - 15 Tahun</div>
                </div>

                <div className="p-3 rounded-xl bg-[#080d1e] border border-slate-800 space-y-1">
                  <div className="text-slate-400 text-[11px] font-semibold">Pemuda GMIT</div>
                  <div className="text-lg font-bold text-amber-300">
                    {categorialCounts['PEMUDA'] || categorialCounts['Pemuda'] || 0} <span className="text-[10px] font-normal text-slate-400">jiwa</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Usia 16 - 30 Tahun</div>
                </div>

                <div className="p-3 rounded-xl bg-[#080d1e] border border-slate-800 space-y-1">
                  <div className="text-slate-400 text-[11px] font-semibold">Kaum Perempuan (PKP)</div>
                  <div className="text-lg font-bold text-amber-300">
                    {categorialCounts['PKP'] || categorialCounts['Perempuan'] || 0} <span className="text-[10px] font-normal text-slate-400">jiwa</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Ibu Rumah Tangga / Warga Dewasa</div>
                </div>

                <div className="p-3 rounded-xl bg-[#080d1e] border border-slate-800 space-y-1">
                  <div className="text-slate-400 text-[11px] font-semibold">Kaum Bapak (PKB)</div>
                  <div className="text-lg font-bold text-amber-300">
                    {categorialCounts['PKB'] || categorialCounts['Bapak'] || 0} <span className="text-[10px] font-normal text-slate-400">jiwa</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Kepala Keluarga / Warga Dewasa</div>
                </div>

                <div className="col-span-2 p-3 rounded-xl bg-[#080d1e] border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-slate-400 text-[11px] font-semibold">Lansia (Lanjut Usia)</div>
                    <div className="text-[10px] text-slate-400">Usia 60 Tahun ke atas</div>
                  </div>
                  <div className="text-lg font-bold text-amber-300">
                    {categorialCounts['LANSIA'] || categorialCounts['Lansia'] || 0} <span className="text-[10px] font-normal text-slate-400">jiwa</span>
                  </div>
                </div>
              </div>

              {/* Sakramen Summary Row */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-around text-center text-xs">
                <div>
                  <div className="text-[10px] text-slate-400">Warga Baptis</div>
                  <div className="text-sm font-bold text-emerald-400">{baptizedCount}</div>
                </div>
                <div className="w-px h-6 bg-slate-800" />
                <div>
                  <div className="text-[10px] text-slate-400">Warga Sidi</div>
                  <div className="text-sm font-bold text-sky-400">{confirmedCount}</div>
                </div>
                <div className="w-px h-6 bg-slate-800" />
                <div>
                  <div className="text-[10px] text-slate-400">Nikah Gereja</div>
                  <div className="text-sm font-bold text-amber-400">{marriedChurchCount}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Protected Access Callout Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0c1633] via-[#0e1b3d] to-[#0c1633] border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Kebijakan Privasi & Keamanan Data Jemaat</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                    Sistem Tertutup
                  </span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  Untuk menjaga privasi dan kerahasiaan warga gereja, seluruh modul internal SYSJEGER (Database Anggota, NIK, Kartu Keluarga, Mutasi, Sakramen, dan Perbendaharaan Keuangan) hanya dapat diakses dengan akun & kata sandi resmi oleh Majelis Jemaat dan Administrator yang berwenang.
                </p>
              </div>
            </div>

            <button
              onClick={currentUser ? onEnterApp : onOpenLogin}
              className="shrink-0 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-transform hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
            >
              <Lock className="w-3.5 h-3.5 text-slate-950" />
              <span>{currentUser ? 'Buka Dashboard SYSJEGER' : 'Masuk dengan Akun Resmi'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* Jadwal Ibadah Section */}
        <section id="jadwal" className="space-y-6 scroll-mt-20">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                <Clock className="w-6 h-6 text-amber-400" />
                <span>Jadwal Kebaktian & Ibadah Jemaat</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Waktu Pelayanan berdasarkan Zona WITA (GMT+8) / Asia/Jayapura
              </p>
            </div>
            <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/30">
              Gedung Utama Betel
            </span>
          </div>

          {schedules && schedules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {schedules.map((sch) => (
                <div
                  key={sch.id}
                  className="p-6 rounded-2xl bg-[#0c1329] border border-amber-500/20 relative overflow-hidden space-y-2 hover:border-amber-400/40 transition-colors"
                >
                  <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    {sch.serviceDate}
                  </div>
                  <h4 className="text-lg font-bold text-white">
                    {sch.serviceName}
                  </h4>
                  <div className="text-xs text-slate-300 space-y-1 pt-1">
                    <p><span className="text-slate-400">Pelayan:</span> {sch.preacher || <span className="text-slate-500 italic">Belum diisi</span>}</p>
                    <p><span className="text-slate-400">Liturgos:</span> {sch.liturgist || <span className="text-slate-500 italic">Belum diisi</span>}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : events && events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-6 rounded-2xl bg-[#0c1329] border border-amber-500/20 relative overflow-hidden space-y-2 hover:border-amber-400/40 transition-colors"
                >
                  <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    {ev.category}
                  </div>
                  <h4 className="text-lg font-bold text-white">
                    {ev.title}
                  </h4>
                  <div className="text-xl font-mono font-bold text-amber-300">
                    {ev.startTime}
                  </div>
                  <p className="text-xs text-slate-300">
                    {ev.location} · {ev.picName}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 px-6 rounded-2xl bg-[#0c1329]/50 border border-dashed border-amber-500/20 text-center space-y-3">
              <Clock className="w-8 h-8 text-amber-400/50 mx-auto" />
              <p className="text-sm text-slate-300 font-medium">
                Belum ada jadwal kebaktian & ibadah yang dijadwalkan
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Majelis Jemaat dapat menambahkan jadwal kebaktian minggu dan persekutuan doa melalui menu Jadwal Ibadah di dalam sistem SYSJEGER.
              </p>
            </div>
          )}
        </section>

        {/* Pastor & Majelis Section */}
        <section id="sambutan" className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center p-8 rounded-3xl bg-[#0c1329]/80 border border-amber-500/20 scroll-mt-20">
          <div className="md:col-span-1 flex flex-col items-center text-center">
            <div className="w-36 h-36 rounded-2xl overflow-hidden border-2 border-amber-400/50 shadow-xl mb-4">
              <img
                src="/src/assets/images/regenerated_image_1792335390161.png"
                alt="Pdt. Sonya W. Isu, S.Th"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <h4 className="font-bold text-white text-base">
              Pdt. Sonya W. Isu, S.Th
            </h4>
            <p className="text-xs text-amber-400 font-medium">
              Ketua Majelis Jemaat GMIT Betel Fuimelang
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Periode Pelayanan 2026 - 2029
            </p>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="inline-block px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              Sambutan Gembala Jemaat
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Selamat Datang di Sistem Informasi GMIT Betel Fuimelang
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              "Kasih karunia dan damai sejahtera dari Allah Bapa kita dan dari Tuhan Yesus Kristus menyertai saudara-saudari sekalian. SYSJEGER V2.0 dihadirkan untuk meningkatkan transparansi tata kelola pelayanan, keteraturan data administrasi jemaat dan keluarga, serta mempermudah komunikasi gerejawi demi kemuliaan nama Tuhan."
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Klasis Alor Tengah Utara · Desa Lembur Tengah, Kec. Alor Tengah Utara, NTT</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-amber-400" />
                <span>085173095482 (Sekretariat / WhatsApp)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Warta Jemaat Terkini */}
        <section id="warta" className="space-y-6 scroll-mt-20">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                <BookOpen className="w-6 h-6 text-amber-400" />
                <span>Warta & Pengumuman Jemaat</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Informasi resmi pelayanan dan kegiatan sepekan GMIT Betel Fuimelang
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {announcements.length === 0 ? (
              <div className="col-span-full py-12 px-6 rounded-2xl bg-[#0c1329]/50 border border-dashed border-amber-500/20 text-center space-y-3">
                <BookOpen className="w-8 h-8 text-amber-400/50 mx-auto" />
                <p className="text-sm text-slate-300 font-medium">
                  Belum ada warta dan pengumuman jemaat yang diterbitkan
                </p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Warta ibadah dan pengumuman pelayanan jemaat dapat diinput oleh Majelis Jemaat melalui menu Warta Jemaat di dalam sistem.
                </p>
              </div>
            ) : (
              announcements.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 space-y-2.5 hover:border-amber-400/40 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                      {item.category}
                    </span>
                    <span className="text-slate-400">{item.date}</span>
                  </div>
                  <h4 className="text-base font-bold text-white hover:text-amber-300 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {item.content}
                  </p>
                  <div className="text-[11px] text-slate-400 pt-1">
                    Diumumkan oleh: <span className="text-slate-200">{item.author}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* PUBLIC CHRISTIAN SPIRITUAL AI SECTION */}
        <section id="ai-rohani" className="space-y-6 scroll-mt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-amber-500/20 pb-4 gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>100% Gratis untuk Seluruh Warga Jemaat & Majelis</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
                <span>Layanan AI Rohani Kristen GMIT</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Asisten kecerdasan buatan rohani berakar pada Alkitab (TB LAI) dan tradisi Reformasi GMIT untuk mendampingi persekutuan keluarga, renungan harian, dan pelayanan gerejawi.
              </p>
            </div>
            <button
              onClick={currentUser ? onEnterApp : onOpenLogin}
              className="text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
            >
              <span>{currentUser ? 'Buka Ruang AI Rohani' : 'Masuk untuk Akses Lengkap'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Santapan Rohani WA */}
            <div className="p-5 rounded-2xl bg-[#0c1329] border border-emerald-500/20 hover:border-emerald-400/50 transition-colors space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <Sun className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-sm">Santapan Rohani Harian</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Renungan pagi dan malam yang menenangkan jiwa, dilengkapi ayat emas dan teks yang siap dibagikan ke grup WhatsApp Rayon.
                </p>
              </div>
              <button
                onClick={currentUser ? onEnterApp : onOpenLogin}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition cursor-pointer"
              >
                <span>Akses Renungan Harian</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 2: Konseling Rohani */}
            <div className="p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 hover:border-amber-400/50 transition-colors space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-sm">Konseling & Bimbingan Iman</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Tuntunan Alkitabiah atas kekhawatiran hidup, masalah keluarga, kedukaan, dan naskah doa penyerahan hati yang menguatkan.
                </p>
              </div>
              <button
                onClick={currentUser ? onEnterApp : onOpenLogin}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition cursor-pointer"
              >
                <span>Mulai Konseling Rohani</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 3: Sekolah Minggu PAR */}
            <div className="p-5 rounded-2xl bg-[#0c1329] border border-pink-500/20 hover:border-pink-400/50 transition-colors space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-300 flex items-center justify-center">
                  <Baby className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-sm">Sahabat Guru PAR GMIT</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Naskah cerita interaktif anak Sekolah Minggu, peraga alam (daun, jagung, batu), kuis seru, dan ayat hafalan mingguan.
                </p>
              </div>
              <button
                onClick={currentUser ? onEnterApp : onOpenLogin}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-pink-300 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition cursor-pointer"
              >
                <span>Buka Bahan PAR</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 4: Penuntun Liturgi Khusus */}
            <div className="p-5 rounded-2xl bg-[#0c1329] border border-sky-500/20 hover:border-sky-400/50 transition-colors space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center">
                  <Music className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-sm">Tata Ibadah Liturgi Khusus</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Penyusunan tata kebaktian rumah tangga rayon, syukur panen Alor, dan penghiburan duka lengkap rujukan nomor kidung KJ/PKJ.
                </p>
              </div>
              <button
                onClick={currentUser ? onEnterApp : onOpenLogin}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition cursor-pointer"
              >
                <span>Lihat Tata Ibadah</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-500/20 bg-[#040710] py-8 px-4 text-center text-xs text-slate-400 space-y-2">
        <p className="font-medium text-slate-300">
          SYSJEGER V2.0 — Sistem Informasi Jemaat dan Gereja GMIT BETEL FUIMELANG
        </p>
        <p className="text-slate-500">
          Gereja Masehi Injili di Timor (GMIT) · Klasis Alor Tengah Utara · Desa Lembur Tengah, Kabupaten Alor, NTT
        </p>
        <p className="text-[11px] text-amber-500/80">
          Zona Waktu: Asia/Jayapura / WITA · Format DD-MM-YYYY · Akses Data Pribadi Jemaat Terproteksi Enkripsi Akun
        </p>
      </footer>

      {/* Installation Guide Modal */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#0b1226] border border-amber-500/30 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Cara Pasang Aplikasi ke Layar Utama HP
                </h3>
              </div>
              <button
                onClick={() => setShowInstallGuide(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-md hover:bg-slate-800"
              >
                ✕ Tutup
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Android Instructions */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="font-bold text-amber-400 flex items-center gap-1.5 text-sm">
                  <span>📱 Pengguna Android (Chrome / Edge / Samsung Internet):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed pl-1">
                  <li>Buka browser Google Chrome atau browser bawaan HP Anda.</li>
                  <li>
                    Ketuk menu <strong>Titik Tiga (⋮)</strong> di sudut kanan atas.
                  </li>
                  <li>
                    Pilih <strong>"Instal Aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama" (Add to Home screen)</strong>.
                  </li>
                  <li>Ketuk <strong>Instal</strong> untuk memasang ikon GMIT Betel Fuimelang di HP.</li>
                </ol>
              </div>

              {/* iOS Safari Instructions */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="font-bold text-amber-400 flex items-center gap-1.5 text-sm">
                  <span>🍏 Pengguna iPhone / iPad (Safari):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed pl-1">
                  <li>Buka halaman ini melalui browser <strong>Safari</strong> iPhone.</li>
                  <li>
                    Ketuk tombol <strong>Bagikan / Share</strong> (ikon kotak dengan panah ke atas <Share2 className="w-3.5 h-3.5 inline text-sky-400" />).
                  </li>
                  <li>
                    Gulir ke bawah dan ketuk opsi <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong> <PlusSquare className="w-3.5 h-3.5 inline text-amber-400" />.
                  </li>
                  <li>
                    Ketuk <strong>Tambah (Add)</strong> di pojok kanan atas layar iPhone.
                  </li>
                </ol>
              </div>
            </div>

            <button
              onClick={() => setShowInstallGuide(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md cursor-pointer transition-colors"
            >
              Saya Mengerti, Tutup Panduan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
