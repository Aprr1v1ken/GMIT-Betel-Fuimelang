import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  FileText,
  HeartHandshake,
  TrendingUp,
  Copy,
  Check,
  Send,
  Printer,
  Calendar,
  Users,
  AlertCircle,
  RefreshCw,
  Share2,
} from 'lucide-react';
import type { Member, Rayon } from '../../types/index.ts';
import {
  generateSermonApi,
  generateWartaApi,
  generatePastoralPrayerApi,
  generateInsightsApi,
} from '../../services/api.ts';

interface AIAssistantViewProps {
  members: Member[];
  rayons: Rayon[];
  stats: any;
  onAddAnnouncement?: (data: any) => Promise<void>;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  members,
  rayons,
  stats,
  onAddAnnouncement,
}) => {
  const [activeTab, setActiveTab] = useState<'sermon' | 'warta' | 'prayer' | 'insights'>('sermon');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedToWarta, setSavedToWarta] = useState(false);

  // Tab 1: Sermon State
  const [serviceType, setServiceType] = useState('Ibadah Minggu');
  const [scripture, setScripture] = useState('Mazmur 23:1-6');
  const [topic, setTopic] = useState('Tuhan Gembala yang Memelihara Umat-Nya');
  const [liturgicalSeason, setLiturgicalSeason] = useState('Umum / Trinitas');
  const [contextNotes, setContextNotes] = useState('Jemaat mayoritas bertani dan berkebun di Desa Lembur Tengah Alor, saling tolong-menolong dalam persekutuan.');
  const [sermonResult, setSermonResult] = useState('');

  // Tab 2: Warta State
  const [bulletinDate, setBulletinDate] = useState(new Date().toISOString().substring(0, 10));
  const [bulletinItems, setBulletinItems] = useState<string[]>([
    'Ibadah Minggu Pagi pkl 08.00 WITA dilayani oleh Pendeta Ketua Majelis Jemaat',
    'Ibadah Persekutuan Doa Rayon 1 s/d 6 dilaksanakan serentak hari Rabu pkl 17.00 WITA',
    'Pelayanan Baptisan Kudus anak-anak akan dilaksanakan pada Minggu pertama bulan depan',
    'Pembersihan lingkungan Gedung Gereja Betel Fuimelang oleh Kaum Bapak dan Pemuda pada hari Sabtu pkl 07.00 WITA',
    'Dukungan doa untuk anggota jemaat yang sedang sakit di RSUD Kalabahi dan di rumah',
  ]);
  const [newItemInput, setNewItemInput] = useState('');
  const [bulletinTone, setBulletinTone] = useState('Hangat dan Menghidupkan Persekutuan');
  const [wartaResult, setWartaResult] = useState('');

  // Tab 3: Pastoral Prayer State
  const [prayerCategory, setPrayerCategory] = useState<'ulang-tahun' | 'sakit' | 'kunjungan-rumah' | 'duka' | 'syukuran'>('ulang-tahun');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [customName, setCustomName] = useState('');
  const [customAge, setCustomAge] = useState('');
  const [customRayon, setCustomRayon] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [prayerResult, setPrayerResult] = useState('');

  // Tab 4: Insights State
  const [insightsResult, setInsightsResult] = useState('');

  // Find members with birthdays in current or upcoming month
  const currentMonth = new Date().getMonth() + 1;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;

  const birthdayMembers = members.filter((m) => {
    if (!m.birthDate) return false;
    const parts = m.birthDate.split('-');
    if (parts.length >= 2) {
      const month = parseInt(parts[1], 10);
      return month === currentMonth || month === nextMonth;
    }
    return false;
  });

  const handleSelectMember = (memberId: string) => {
    setSelectedMemberId(memberId);
    if (!memberId) {
      setCustomName('');
      setCustomAge('');
      setCustomRayon('');
      return;
    }
    const mem = members.find((m) => m.id === memberId);
    if (mem) {
      setCustomName(mem.fullName);
      const rayonName = rayons.find((r) => r.id === mem.rayonId)?.name || mem.rayonName || '';
      setCustomRayon(rayonName);

      if (mem.birthDate) {
        const birthYear = parseInt(mem.birthDate.split('-')[0], 10);
        const age = new Date().getFullYear() - birthYear;
        setCustomAge(String(age));
      }
    }
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // 1. Generate Sermon
  const handleGenerateSermon = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await generateSermonApi({
        serviceType,
        scripture,
        topic,
        liturgicalSeason,
        contextNotes,
      });
      if (res.success && res.text) {
        setSermonResult(res.text);
      } else {
        setErrorMsg(res.message || 'Gagal menyusun khotbah dengan AI.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Koneksi ke asisten AI gagal.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Generate Warta
  const handleGenerateWarta = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSavedToWarta(false);
    try {
      const res = await generateWartaApi({
        bulletinDate,
        items: bulletinItems,
        announcerName: 'Majelis Jemaat GMIT Betel Fuimelang',
        tone: bulletinTone,
      });
      if (res.success && res.text) {
        setWartaResult(res.text);
      } else {
        setErrorMsg(res.message || 'Gagal menyusun warta jemaat dengan AI.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Koneksi ke asisten AI gagal.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBulletinItem = () => {
    if (!newItemInput.trim()) return;
    setBulletinItems([...bulletinItems, newItemInput.trim()]);
    setNewItemInput('');
  };

  const handleRemoveBulletinItem = (index: number) => {
    setBulletinItems(bulletinItems.filter((_, i) => i !== index));
  };

  const handleSaveToWartaTable = async () => {
    if (!wartaResult || !onAddAnnouncement) return;
    setLoading(true);
    try {
      await onAddAnnouncement({
        title: `Warta Jemaat — ${bulletinDate}`,
        category: 'Warta Ibadah',
        content: wartaResult,
        isImportant: true,
        author: 'Asisten AI Majelis Jemaat',
      });
      setSavedToWarta(true);
      setTimeout(() => setSavedToWarta(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan warta ke sistem.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Generate Prayer
  const handleGeneratePrayer = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await generatePastoralPrayerApi({
        category: prayerCategory,
        memberName: customName || 'Saudara Seiman',
        age: customAge,
        rayon: customRayon,
        notes: customNotes,
      });
      if (res.success && res.text) {
        setPrayerResult(res.text);
      } else {
        setErrorMsg(res.message || 'Gagal menghasilkan doa pastoral dengan AI.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Koneksi ke asisten AI gagal.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Generate Insights
  const handleGenerateInsights = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const statsSummary = {
        totalMembers: members.length,
        totalFamilies: stats?.totalFamilies || 0,
        activeMembers: members.filter((m) => m.status === 'Aktif').length,
        baptized: members.filter((m) => m.baptismStatus === 'Sudah').length,
        sidi: members.filter((m) => m.confirmationStatus === 'Sudah').length,
        marriedChurch: members.filter((m) => m.marriageChurchStatus === 'Sudah').length,
        rayonsCount: rayons.length,
        location: 'Desa Lembur Tengah, Klasis Alor Tengah Utara, Kab. Alor, NTT',
      };

      const res = await generateInsightsApi({ statsSummary });
      if (res.success && res.text) {
        setInsightsResult(res.text);
      } else {
        setErrorMsg(res.message || 'Gagal menganalisis data jemaat dengan AI.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Koneksi ke asisten AI gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0c1633] via-[#091024] to-[#121c3b] border border-amber-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-radial from-amber-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Kecerdasan Buatan Pastoral & Pelayanan
              </span>
              <span className="text-xs text-slate-400">GMIT BETEL FUIMELANG</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Asisten AI Cerdas Gerejawi
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Membantu Pendeta, Majelis Jemaat, dan Koordinator Rayon dalam mempersiapkan khotbah GMIT, menyusun draf warta mingguan, doa kunjungan jemaat / ulang tahun, serta analisis pelayanan pastoral berbasis data.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Cetak Hasil AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('sermon')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition cursor-pointer shrink-0 ${
            activeTab === 'sermon'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>1. Asisten Khotbah & Renungan</span>
        </button>

        <button
          onClick={() => setActiveTab('warta')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition cursor-pointer shrink-0 ${
            activeTab === 'warta'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>2. Generator Warta Jemaat</span>
        </button>

        <button
          onClick={() => setActiveTab('prayer')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition cursor-pointer shrink-0 ${
            activeTab === 'prayer'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>3. Doa Pastoral & Kunjungan</span>
        </button>

        <button
          onClick={() => setActiveTab('insights')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition cursor-pointer shrink-0 ${
            activeTab === 'insights'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>4. Analisis Pelayanan Majelis</span>
        </button>
      </div>

      {/* Error Message if any */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-300">Terjadi Kendala Asisten AI:</p>
            <p className="mt-0.5">{errorMsg}</p>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-red-400 hover:text-white text-xs cursor-pointer font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tab 1: Asisten Khotbah & Renungan */}
      {activeTab === 'sermon' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 shadow-md space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Parameter Khotbah / Renungan</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Jenis Ibadah / Pelayanan
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
                >
                  <option value="Ibadah Minggu Jemaat">Ibadah Minggu Jemaat (Ibadah Raya)</option>
                  <option value="Ibadah Rumah Tangga / Rayon">Ibadah Rumah Tangga / Rayon</option>
                  <option value="Ibadah Pemuda & Remaja (Pemuda GMIT)">Ibadah Pemuda & Remaja (Pemuda GMIT)</option>
                  <option value="Ibadah Kaum Ibu (Perpuan GMIT)">Ibadah Kaum Ibu (Perpuan GMIT)</option>
                  <option value="Ibadah Kaum Bapak (Kaum Bapak GMIT)">Ibadah Kaum Bapak (Kaum Bapak GMIT)</option>
                  <option value="Ibadah Duka / Penghiburan">Ibadah Duka & Penghiburan Keluarga</option>
                  <option value="Ibadah Syukuran (Panen/Gedung/Ulang Tahun)">Ibadah Syukuran (Panen/Ulang Tahun/Pernikahan)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nats Bacaan Alkitab
                </label>
                <input
                  type="text"
                  value={scripture}
                  onChange={(e) => setScripture(e.target.value)}
                  placeholder="Contoh: Mazmur 23:1-6 atau Yohanes 3:16"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  <span className="text-[10px] text-slate-400">Pilihan cepat:</span>
                  {['Mazmur 23:1-6', 'Yohanes 15:1-8', 'Efesus 4:1-6', 'Matius 6:25-34', 'Roma 12:1-2'].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setScripture(n)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 hover:bg-slate-700 cursor-pointer"
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tema / Judul Gagasan
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Contoh: Tuhan Gembala yang Memelihara Umat-Nya"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tahun Gerejawi / Periode Liturgis GMIT
                </label>
                <select
                  value={liturgicalSeason}
                  onChange={(e) => setLiturgicalSeason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
                >
                  <option value="Umum / Trinitas">Minggu Biasa / Trinitas</option>
                  <option value="Advent & Penantian">Masa Advent (Penantian Kedatangan Kristus)</option>
                  <option value="Natal & Kelahiran">Masa Natal & Tahun Baru</option>
                  <option value="Epifania">Masa Epifania</option>
                  <option value="Minggu Sengsara">Minggu-Minggu Sengsara Kristus (Prapaskah)</option>
                  <option value="Paskah & Kebangkitan">Masa Paskah (Kemenangan Kebangkitan)</option>
                  <option value="Kenaikan & Pentakosta">Kenaikan Tuhan Yesus & Hari Pentakosta</option>
                  <option value="Bulan Bahasa & Budaya GMIT">Bulan Bahasa & Budaya GMIT (Kearifan Lokal Alor)</option>
                  <option value="Bulan Keluarga & Anak">Bulan Keluarga & Anak GMIT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Konteks & Catatan Kehidupan Jemaat Betel Fuimelang
                </label>
                <textarea
                  rows={3}
                  value={contextNotes}
                  onChange={(e) => setContextNotes(e.target.value)}
                  placeholder="Kondisi riil jemaat, misalnya musim tanam jagung, persekutuan pemuda, atau pergumulan ekonomi pedesaan..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateSermon}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sedang Menyusun Naskah Khotbah...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Susun Draf Khotbah dengan AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 shadow-md min-h-[520px] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Hasil Draf Khotbah & Panduan Pelayanan</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Siap dicetak atau dipelajari oleh Pengkhotbah / Majelis Jemaat</p>
                </div>

                {sermonResult && (
                  <button
                    onClick={() => copyToClipboard(sermonResult)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Tersalin!' : 'Salin Naskah'}</span>
                  </button>
                )}
              </div>

              {sermonResult ? (
                <div className="flex-1 bg-slate-950/70 p-4 rounded-xl border border-slate-800 overflow-y-auto max-h-[620px] text-slate-200 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-sans select-text">
                  {sermonResult}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                  <BookOpen className="w-12 h-12 text-slate-700 mb-3 stroke-[1.5]" />
                  <p className="text-sm font-medium text-slate-400">Draf Khotbah Belum Dibuat</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Tentukan nats Alkitab, jenis ibadah, dan tema di panel sebelah kiri, kemudian klik tombol &quot;Susun Draf Khotbah dengan AI&quot;.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Generator Warta Jemaat */}
      {activeTab === 'warta' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 shadow-md space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Penyusunan Warta Jemaat Mingguan</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tanggal Ibadah Warta
                </label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <input
                    type="date"
                    value={bulletinDate}
                    onChange={(e) => setBulletinDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Gaya Bahasa & Nuansa Warta
                </label>
                <select
                  value={bulletinTone}
                  onChange={(e) => setBulletinTone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
                >
                  <option value="Hangat dan Menghidupkan Persekutuan">Hangat dan Penuh Kekeluargaan Jemaat</option>
                  <option value="Formal, Tertib Liturgis, dan Khidmat">Formal, Tertib Liturgis, dan Khidmat</option>
                  <option value="Singkat, Padat, dan Jelas untuk Ibadah Cepat">Singkat, Padat, dan Praktis</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Poin-Poin Pokok Kegiatan / Pengumuman
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                  {bulletinItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900 text-xs text-slate-200 border border-slate-800"
                    >
                      <span className="flex-1">• {item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveBulletinItem(idx)}
                        className="text-red-400 hover:text-red-300 text-xs px-1.5 py-0.5 rounded cursor-pointer"
                        title="Hapus poin"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new item */}
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newItemInput}
                    onChange={(e) => setNewItemInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddBulletinItem()}
                    placeholder="Tambah pengumuman baru..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddBulletinItem}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 cursor-pointer"
                  >
                    Tambah
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateWarta}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sedang Menyusun Warta Jemaat...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Susun Warta Mingguan dengan AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 shadow-md min-h-[520px] flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Naskah Draf Warta Jemaat</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Siap dibacakan Majelis saat Ibadah Minggu atau dibagikan ke WhatsApp</p>
                </div>

                {wartaResult && (
                  <div className="flex items-center gap-2">
                    {onAddAnnouncement && (
                      <button
                        onClick={handleSaveToWartaTable}
                        disabled={loading || savedToWarta}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer"
                      >
                        {savedToWarta ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                        <span>{savedToWarta ? 'Tersimpan ke Warta!' : 'Terbitkan ke Sistem'}</span>
                      </button>
                    )}
                    <button
                      onClick={() => copyToClipboard(wartaResult)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Tersalin!' : 'Salin Warta'}</span>
                    </button>
                  </div>
                )}
              </div>

              {wartaResult ? (
                <div className="flex-1 bg-slate-950/70 p-4 rounded-xl border border-slate-800 overflow-y-auto max-h-[620px] text-slate-200 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-sans select-text">
                  {wartaResult}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                  <FileText className="w-12 h-12 text-slate-700 mb-3 stroke-[1.5]" />
                  <p className="text-sm font-medium text-slate-400">Warta Jemaat Belum Dibuat</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Masukkan poin-poin kegiatan pelayanan sepekan di panel sebelah kiri, kemudian klik tombol &quot;Susun Warta Mingguan dengan AI&quot;.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Doa Pastoral & Kunjungan Jemaat */}
      {activeTab === 'prayer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 shadow-md space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <HeartHandshake className="w-4 h-4 text-amber-400" />
                <span>Materi Kunjungan & Doa Pastoral</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kategori Pelayanan Pastoral
                </label>
                <select
                  value={prayerCategory}
                  onChange={(e) => setPrayerCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
                >
                  <option value="ulang-tahun">Ucapan & Doa Ulang Tahun Anggota Jemaat</option>
                  <option value="kunjungan-rumah">Kunjungan Rumah Tangga / Rayon Rutin</option>
                  <option value="sakit">Pelayanan Mendoakan Anggota Jemaat yang Sakit</option>
                  <option value="duka">Penghiburan Duka Cita / Menguatkan Keluarga Berduka</option>
                  <option value="syukuran">Syukuran Keluarga (Pernikahan, Panen, Rumah Baru, Studi)</option>
                </select>
              </div>

              {/* Quick Select from Birthday Members */}
              {birthdayMembers.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-center justify-between text-xs text-amber-300 font-bold mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Pilih dari Jemaat HUT Bulan Ini / Depan:
                    </span>
                    <span className="text-[10px] text-amber-400/80 font-normal">
                      {birthdayMembers.length} Jemaat
                    </span>
                  </div>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => handleSelectMember(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-amber-500/40 text-slate-100 focus:outline-none"
                  >
                    <option value="">-- Pilih dari daftar jemaat berulang tahun --</option>
                    {birthdayMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.fullName} ({m.rayonName || 'Rayon Pelayanan'}) — Lahir: {m.birthDate}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Or Select Any Member */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Atau Cari Anggota Jemaat Terdaftar
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => handleSelectMember(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
                >
                  <option value="">-- Ketik manual atau pilih jemaat --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} - {m.memberNo} ({m.rayonName || 'Rayon'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Jemaat / Keluarga
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Nama anggota jemaat"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Usia / Umur (Tahun)
                  </label>
                  <input
                    type="text"
                    value={customAge}
                    onChange={(e) => setCustomAge(e.target.value)}
                    placeholder="Contoh: 45"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Rayon Pelayanan
                </label>
                <input
                  type="text"
                  value={customRayon}
                  onChange={(e) => setCustomRayon(e.target.value)}
                  placeholder="Contoh: Rayon 2 Lembur Tengah"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Catatan Tambahan / Kondisi Khusus
                </label>
                <textarea
                  rows={2}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Contoh: Mengalami sakit lambung, bersyukur atas hasil kebun, anak hendak merantau kuliah..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="button"
                onClick={handleGeneratePrayer}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sedang Menyusun Doa Pastoral...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Susun Doa & Pesan Pastoral AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 shadow-md min-h-[520px] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Panduan Kunjungan, Ayat Alkitab & Doa</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Dilengkapi naskah doa dan draf ucapan pesan WhatsApp</p>
                </div>

                {prayerResult && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const encoded = encodeURIComponent(prayerResult);
                        window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer"
                      title="Buka WhatsApp untuk kirim ucapan"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Kirim via WA</span>
                    </button>
                    <button
                      onClick={() => copyToClipboard(prayerResult)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Tersalin!' : 'Salin Doa'}</span>
                    </button>
                  </div>
                )}
              </div>

              {prayerResult ? (
                <div className="flex-1 bg-slate-950/70 p-4 rounded-xl border border-slate-800 overflow-y-auto max-h-[620px] text-slate-200 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-sans select-text">
                  {prayerResult}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                  <HeartHandshake className="w-12 h-12 text-slate-700 mb-3 stroke-[1.5]" />
                  <p className="text-sm font-medium text-slate-400">Doa Pastoral Belum Dibuat</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Pilih nama jemaat atau jemaat yang berulang tahun di sebelah kiri, kemudian klik &quot;Susun Doa & Pesan Pastoral AI&quot; untuk membuat panduan kunjungan doa.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Analisis Pelayanan Majelis */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0c1329] border border-amber-500/20 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                  <span>Analisis Data Statistik & Rekomendasi Pelayanan GMIT Betel Fuimelang</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  AI mengkaji ringkasan data demografi, kategorial, serta kelengkapan sakramen warga jemaat untuk memberikan saran program pelayanan pastoral yang strategis bagi Majelis Jemaat.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerateInsights}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer shrink-0"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menganalisis Data Jemaat...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Mulai Analisis Pelayanan AI</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Stats overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Anggota</span>
                <p className="text-lg font-bold text-white mt-0.5">{members.length} Jiwa</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Kepala Keluarga</span>
                <p className="text-lg font-bold text-amber-400 mt-0.5">{stats?.totalFamilies || 0} KK</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Sudah Sidi</span>
                <p className="text-lg font-bold text-emerald-400 mt-0.5">
                  {members.filter((m) => m.confirmationStatus === 'Sudah').length} Jiwa
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Rayon Pelayanan</span>
                <p className="text-lg font-bold text-sky-400 mt-0.5">{rayons.length} Rayon</p>
              </div>
            </div>

            {/* Analysis Result */}
            {insightsResult ? (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Rekomendasi Strategis Pelayanan Majelis:
                  </span>
                  <button
                    onClick={() => copyToClipboard(insightsResult)}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Tersalin!' : 'Salin Rekomendasi'}</span>
                  </button>
                </div>
                <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800 text-slate-200 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed select-text">
                  {insightsResult}
                </div>
              </div>
            ) : (
              <div className="p-10 rounded-xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-slate-500 mt-4">
                <TrendingUp className="w-12 h-12 text-slate-700 mx-auto mb-2 stroke-[1.5]" />
                <p className="text-sm font-medium text-slate-400">Belum Ada Hasil Analisis</p>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Klik tombol &quot;Mulai Analisis Pelayanan AI&quot; di atas untuk memproses data jemaat dan merumuskan saran program pastoral.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
