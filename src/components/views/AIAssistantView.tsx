import React, { useState, useEffect } from 'react';
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
  Lightbulb,
  ShieldCheck,
  Compass,
  CheckCircle2,
  ChevronRight,
  Zap,
  Sun,
  Smile,
  Baby,
  HelpCircle,
  Heart,
  MessageSquare,
  Music,
  Flame,
} from 'lucide-react';
import type { Member, Rayon } from '../../types/index.ts';
import {
  generateSermonApi,
  generateWartaApi,
  generatePastoralPrayerApi,
  generateInsightsApi,
  generateSpiritualCounselingApi,
  generateDailyDevotionalApi,
  generateLiturgyOrderApi,
  generateSundaySchoolApi,
  generateBibleStudyApi,
} from '../../services/api.ts';

interface AIAssistantViewProps {
  members: Member[];
  rayons: Rayon[];
  stats: any;
  onAddAnnouncement?: (data: any) => Promise<void>;
  initialTab?: AITabType;
}

export type AITabType =
  | 'counseling'
  | 'devotional'
  | 'liturgy'
  | 'sunday-school'
  | 'bible-study'
  | 'sermon'
  | 'prayer'
  | 'warta'
  | 'insights'
  | 'recommendations';

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  members,
  rayons,
  stats,
  onAddAnnouncement,
  initialTab,
}) => {
  const [activeTab, setActiveTab] = useState<AITabType>(initialTab || 'counseling');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedToWarta, setSavedToWarta] = useState(false);

  // Tab 1: AI Konseling & Bimbingan Iman Rohani
  const [counselingCategory, setCounselingCategory] = useState('pergumulan-hidup');
  const [counselingTopic, setCounselingTopic] = useState('Mengatasi Kekhawatiran Hidup & Rezeki Keluarga');
  const [counselingQuestion, setCounselingQuestion] = useState(
    'Bagaimana seorang Kristen menghadapi saat-saat di mana hasil panen berkurang dan kebutuhan biaya sekolah anak sangat mendesak tanpa putus asa?'
  );
  const [counselingContext, setCounselingContext] = useState('Warga jemaat GMIT Betel Fuimelang di Desa Lembur Tengah Alor');
  const [counselingResult, setCounselingResult] = useState('');

  // Tab 2: AI Santapan Rohani Harian
  const [devotionalTiming, setDevotionalTiming] = useState('Renungan Pagi Hari');
  const [devotionalTheme, setDevotionalTheme] = useState('Rahmat Baru di Setiap Fajar');
  const [devotionalScripture, setDevotionalScripture] = useState('Ratapan 3:22-23');
  const [devotionalAudience, setDevotionalAudience] = useState('Keluarga Kristen GMIT');
  const [devotionalResult, setDevotionalResult] = useState('');

  // Tab 3: AI Penuntun Liturgi Khusus
  const [liturgyServiceType, setLiturgyServiceType] = useState('Ibadah Rumah Tangga / Persekutuan Rayon');
  const [liturgyTheme, setLiturgyTheme] = useState('Keluarga yang Berakar dan Berbuah di Dalam Kristus');
  const [liturgyScripture, setLiturgyScripture] = useState('Yosua 24:15');
  const [liturgyRayon, setLiturgyRayon] = useState('Rayon I GMIT Betel Fuimelang');
  const [liturgyResult, setLiturgyResult] = useState('');

  // Tab 4: AI Sekolah Minggu & Pembina PAR GMIT
  const [ssAgeGroup, setSsAgeGroup] = useState('Anak Tanggung (Usia 7-10 Tahun / SD)');
  const [ssStoryTheme, setSsStoryTheme] = useState('Yesus Meredakan Angin Ribut di Danau');
  const [ssScripture, setSsScripture] = useState('Markus 4:35-41');
  const [sundaySchoolResult, setSundaySchoolResult] = useState('');

  // Tab 5: AI Penelaahan Alkitab (PA Rayon)
  const [paScripture, setPaScripture] = useState('Yakobus 2:14-26');
  const [paTopic, setPaTopic] = useState('Iman Tanpa Perbuatan Adalah Mati');
  const [paAudience, setPaAudience] = useState('Persekutuan Doa Rayon I s/d IV GMIT Betel Fuimelang');
  const [paResult, setPaResult] = useState('');

  // Tab 6: Sermon State
  const [serviceType, setServiceType] = useState('Ibadah Minggu');
  const [scripture, setScripture] = useState('Mazmur 23:1-6');
  const [topic, setTopic] = useState('Tuhan Gembala yang Memelihara Umat-Nya');
  const [liturgicalSeason, setLiturgicalSeason] = useState('Umum / Trinitas');
  const [contextNotes, setContextNotes] = useState('Jemaat mayoritas bertani dan berkebun di Desa Lembur Tengah Alor, saling tolong-menolong dalam persekutuan.');
  const [sermonResult, setSermonResult] = useState('');

  // Tab 7: Pastoral Prayer State
  const [prayerCategory, setPrayerCategory] = useState<'ulang-tahun' | 'sakit' | 'kunjungan-rumah' | 'duka' | 'syukuran'>('ulang-tahun');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [customName, setCustomName] = useState('');
  const [customAge, setCustomAge] = useState('');
  const [customRayon, setCustomRayon] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [prayerResult, setPrayerResult] = useState('');

  // Tab 8: Warta State
  const [bulletinDate, setBulletinDate] = useState(new Date().toISOString().substring(0, 10));
  const [bulletinItems, setBulletinItems] = useState<string[]>([
    'Ibadah Minggu Pagi pkl 08.00 WITA dilayani oleh Pendeta Ketua Majelis Jemaat',
    'Ibadah Persekutuan Doa Rayon 1 s/d 4 dilaksanakan serentak hari Rabu pkl 17.00 WITA',
    'Pelayanan Baptisan Kudus anak-anak akan dilaksanakan pada Minggu pertama bulan depan',
    'Pembersihan lingkungan Gedung Gereja Betel Fuimelang oleh Kaum Bapak dan Pemuda pada hari Sabtu pkl 07.00 WITA',
    'Dukungan doa untuk anggota jemaat yang sedang sakit di RSUD Kalabahi dan di rumah',
  ]);
  const [newItemInput, setNewItemInput] = useState('');
  const [bulletinTone, setBulletinTone] = useState('Hangat dan Menghidupkan Persekutuan');
  const [wartaResult, setWartaResult] = useState('');

  // Tab 9: Insights State
  const [insightsResult, setInsightsResult] = useState('');

  // Birthday members
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
    const m = members.find((item) => item.id === memberId);
    if (m) {
      setCustomName(m.fullName);
      if (m.birthDate) {
        const birthYear = parseInt(m.birthDate.substring(0, 4), 10);
        if (!isNaN(birthYear)) {
          setCustomAge(String(new Date().getFullYear() - birthYear));
        }
      }
      const r = rayons.find((item) => item.id === m.rayonId);
      setCustomRayon(r ? r.name : '');
    }
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareToWhatsApp = (text: string) => {
    if (!text) return;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // 1. Generate Spiritual Counseling
  const handleGenerateCounseling = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await generateSpiritualCounselingApi({
        topic: counselingTopic,
        question: counselingQuestion,
        category: counselingCategory,
        userContext: counselingContext,
      });
      if (res.success && res.text) {
        setCounselingResult(res.text);
      } else {
        setErrorMsg(res.message || 'Gagal menghasilkan bimbingan rohani.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Koneksi ke asisten AI gagal.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Generate Daily Devotional
  const handleGenerateDevotional = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await generateDailyDevotionalApi({
        timing: devotionalTiming,
        theme: devotionalTheme,
        scripture: devotionalScripture,
        audience: devotionalAudience,
      });
      if (res.success && res.text) {
        setDevotionalResult(res.text);
      } else {
        setErrorMsg(res.message || 'Gagal menyusun santapan rohani harian.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Koneksi ke asisten AI gagal.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Generate Liturgy Order
  const handleGenerateLiturgy = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await generateLiturgyOrderApi({
        serviceType: liturgyServiceType,
        theme: liturgyTheme,
        scripture: liturgyScripture,
        rayon: liturgyRayon,
      });
      if (res.success && res.text) {
        setLiturgyResult(res.text);
      } else {
        setErrorMsg(res.message || 'Gagal menyusun tata ibadah khusus.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Koneksi ke asisten AI gagal.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Generate Sunday School Material
  const handleGenerateSundaySchool = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await generateSundaySchoolApi({
        ageGroup: ssAgeGroup,
        storyTheme: ssStoryTheme,
        scripture: ssScripture,
      });
      if (res.success && res.text) {
        setSundaySchoolResult(res.text);
      } else {
        setErrorMsg(res.message || 'Gagal menyusun bahan ajar Sekolah Minggu.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Koneksi ke asisten AI gagal.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Generate Bible Study (PA)
  const handleGenerateBibleStudy = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await generateBibleStudyApi({
        scripture: paScripture,
        topic: paTopic,
        audience: paAudience,
      });
      if (res.success && res.text) {
        setPaResult(res.text);
      } else {
        setErrorMsg(res.message || 'Gagal menyusun panduan PA Alkitab.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Koneksi ke asisten AI gagal.');
    } finally {
      setLoading(false);
    }
  };

  // 6. Generate Sermon
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
        setErrorMsg(res.message || 'Gagal menyusun draf khotbah dengan AI.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Koneksi ke asisten AI gagal.');
    } finally {
      setLoading(false);
    }
  };

  // 7. Generate Prayer
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

  // 8. Generate Warta
  const handleGenerateWarta = async () => {
    setLoading(true);
    setErrorMsg(null);
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

  const handleSaveToAnnouncements = async () => {
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

  // 9. Generate Insights
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
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0d1630] via-[#101b3b] to-[#1e1338] border border-amber-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pusat Kecerdasan Rohani & Pastoral GMIT Betel Fuimelang</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              AI Rohani Kristen & Asisten Pelayanan Jemaat
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Koleksi asisten AI terintegrasi untuk bimbingan iman kristiani, santapan rohani harian, tata liturgi ibadah, bahan mengajar Sekolah Minggu (PAR), penelaahan Alkitab (PA), khotbah, dan lawatan pastoral.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Cetak Hasil AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5" />
            Pilih Modul AI Rohani & Pastoral
          </span>
          <span className="text-[10px] text-slate-400">Total 10 Modul Siap Pakai</span>
        </div>

        {/* Tab Buttons Grid / Scrollable Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pb-1">
          {/* 1. Konseling Rohani */}
          <button
            onClick={() => setActiveTab('counseling')}
            className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition cursor-pointer ${
              activeTab === 'counseling'
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-[#0b1226] text-slate-300 hover:text-white hover:bg-slate-800/80 border-slate-800'
            }`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 ${activeTab === 'counseling' ? 'bg-slate-950/20 text-slate-950' : 'bg-amber-500/10 text-amber-400'}`}>
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold block truncate">1. Konseling Iman</span>
              <span className={`text-[10px] block truncate ${activeTab === 'counseling' ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>Bimbingan & Tanya Jawab</span>
            </div>
          </button>

          {/* 2. Santapan Rohani Harian */}
          <button
            onClick={() => setActiveTab('devotional')}
            className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition cursor-pointer ${
              activeTab === 'devotional'
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-[#0b1226] text-slate-300 hover:text-white hover:bg-slate-800/80 border-slate-800'
            }`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 ${activeTab === 'devotional' ? 'bg-slate-950/20 text-slate-950' : 'bg-emerald-500/10 text-emerald-400'}`}>
              <Sun className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold block truncate">2. Santapan Rohani</span>
              <span className={`text-[10px] block truncate ${activeTab === 'devotional' ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>Renungan Pagi/Malam</span>
            </div>
          </button>

          {/* 3. Penuntun Liturgi Khusus */}
          <button
            onClick={() => setActiveTab('liturgy')}
            className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition cursor-pointer ${
              activeTab === 'liturgy'
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-[#0b1226] text-slate-300 hover:text-white hover:bg-slate-800/80 border-slate-800'
            }`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 ${activeTab === 'liturgy' ? 'bg-slate-950/20 text-slate-950' : 'bg-sky-500/10 text-sky-400'}`}>
              <Music className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold block truncate">3. Liturgi Ibadah</span>
              <span className={`text-[10px] block truncate ${activeTab === 'liturgy' ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>Ibadah Rayon & Syukur</span>
            </div>
          </button>

          {/* 4. Guru Sekolah Minggu (PAR) */}
          <button
            onClick={() => setActiveTab('sunday-school')}
            className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition cursor-pointer ${
              activeTab === 'sunday-school'
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-[#0b1226] text-slate-300 hover:text-white hover:bg-slate-800/80 border-slate-800'
            }`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 ${activeTab === 'sunday-school' ? 'bg-slate-950/20 text-slate-950' : 'bg-pink-500/10 text-pink-400'}`}>
              <Baby className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold block truncate">4. Sekolah Minggu</span>
              <span className={`text-[10px] block truncate ${activeTab === 'sunday-school' ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>Bahan PAR & Cerita</span>
            </div>
          </button>

          {/* 5. Panduan PA Rayon */}
          <button
            onClick={() => setActiveTab('bible-study')}
            className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition cursor-pointer ${
              activeTab === 'bible-study'
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-[#0b1226] text-slate-300 hover:text-white hover:bg-slate-800/80 border-slate-800'
            }`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 ${activeTab === 'bible-study' ? 'bg-slate-950/20 text-slate-950' : 'bg-indigo-500/10 text-indigo-400'}`}>
              <HelpCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold block truncate">5. PA Alkitab Rayon</span>
              <span className={`text-[10px] block truncate ${activeTab === 'bible-study' ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>Diskusi & Pemahaman</span>
            </div>
          </button>

          {/* 6. Asisten Khotbah */}
          <button
            onClick={() => setActiveTab('sermon')}
            className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition cursor-pointer ${
              activeTab === 'sermon'
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-[#0b1226] text-slate-300 hover:text-white hover:bg-slate-800/80 border-slate-800'
            }`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 ${activeTab === 'sermon' ? 'bg-slate-950/20 text-slate-950' : 'bg-amber-500/10 text-amber-400'}`}>
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold block truncate">6. Draf Khotbah</span>
              <span className={`text-[10px] block truncate ${activeTab === 'sermon' ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>Eksegesis Nats Alor</span>
            </div>
          </button>

          {/* 7. Doa Pastoral & Kunjungan */}
          <button
            onClick={() => setActiveTab('prayer')}
            className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition cursor-pointer ${
              activeTab === 'prayer'
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-[#0b1226] text-slate-300 hover:text-white hover:bg-slate-800/80 border-slate-800'
            }`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 ${activeTab === 'prayer' ? 'bg-slate-950/20 text-slate-950' : 'bg-rose-500/10 text-rose-400'}`}>
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold block truncate">7. Doa Pastoral</span>
              <span className={`text-[10px] block truncate ${activeTab === 'prayer' ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>Kunjungan & Doa Sakit</span>
            </div>
          </button>

          {/* 8. Warta Jemaat */}
          <button
            onClick={() => setActiveTab('warta')}
            className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition cursor-pointer ${
              activeTab === 'warta'
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-[#0b1226] text-slate-300 hover:text-white hover:bg-slate-800/80 border-slate-800'
            }`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 ${activeTab === 'warta' ? 'bg-slate-950/20 text-slate-950' : 'bg-cyan-500/10 text-cyan-400'}`}>
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold block truncate">8. Draf Warta</span>
              <span className={`text-[10px] block truncate ${activeTab === 'warta' ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>Teks Liturgis Mingguan</span>
            </div>
          </button>

          {/* 9. Analisis Pelayanan */}
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition cursor-pointer ${
              activeTab === 'insights'
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-[#0b1226] text-slate-300 hover:text-white hover:bg-slate-800/80 border-slate-800'
            }`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 ${activeTab === 'insights' ? 'bg-slate-950/20 text-slate-950' : 'bg-emerald-500/10 text-emerald-400'}`}>
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold block truncate">9. Analisis Majelis</span>
              <span className={`text-[10px] block truncate ${activeTab === 'insights' ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>Strategi Pelayanan</span>
            </div>
          </button>

          {/* 10. Etika & Panduan */}
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition cursor-pointer ${
              activeTab === 'recommendations'
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-[#0b1226] text-slate-300 hover:text-white hover:bg-slate-800/80 border-slate-800'
            }`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 ${activeTab === 'recommendations' ? 'bg-slate-950/20 text-slate-950' : 'bg-violet-500/10 text-violet-400'}`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold block truncate">10. Etika Rohani</span>
              <span className={`text-[10px] block truncate ${activeTab === 'recommendations' ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>Pedoman AI Gereja</span>
            </div>
          </button>
        </div>
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

      {/* ==================================================== */}
      {/* TAB 1: AI KONSELING & BIMBINGAN IMAN ROHANI */}
      {/* ==================================================== */}
      {activeTab === 'counseling' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-[#0b1226] border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-amber-300">
                <MessageSquare className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-sm">Konseling & Bimbingan Iman Kristen</h3>
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Pertanyaan / Pergumulan Populer Jemaat:
                </label>
                <div className="space-y-1.5">
                  {[
                    {
                      topic: 'Mengatasi Kekhawatiran Hidup & Rezeki Keluarga',
                      q: 'Bagaimana menghadapi saat hasil panen berkurang dan biaya sekolah anak mendesak tanpa kehilangan damai sejahtera?',
                      cat: 'pergumulan-hidup',
                    },
                    {
                      topic: 'Makna Peneguhan Sidi & Tanggung Jawab Orang Muda',
                      q: 'Apa arti rohani dari peneguhan Sidi bagi orang muda GMIT dan bagaimana menjaga komitmen hidup kudus?',
                      cat: 'sakramen-sidi',
                    },
                    {
                      topic: 'Mengampuni Orang yang Melukai Hati',
                      q: 'Bagaimana cara tulus mengampuni sesama atau keluarga yang menyakiti hati kita menurut ajaran Kristus?',
                      cat: 'pengampunan',
                    },
                    {
                      topic: 'Menghadapi Kedukaan & Kehilangan Orang Terkasih',
                      q: 'Ayat firman Tuhan dan penghiburan rohani saat kehilangan anggota keluarga yang sangat dicintai.',
                      cat: 'kedukaan',
                    },
                    {
                      topic: 'Membina Mezbah Doa di Rumah Tangga Kristen',
                      q: 'Langkah praktis membiasakan anak-anak dan suami-istri bersekutu membaca Alkitab tiap malam di rumah.',
                      cat: 'keluarga',
                    },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCounselingTopic(p.topic);
                        setCounselingQuestion(p.q);
                        setCounselingCategory(p.cat);
                      }}
                      className="w-full text-left p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 text-[11px] text-slate-300 hover:text-amber-300 transition cursor-pointer flex items-center justify-between"
                    >
                      <span className="truncate">{p.topic}</span>
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kategori Pergumulan:
                </label>
                <select
                  value={counselingCategory}
                  onChange={(e) => setCounselingCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="pergumulan-hidup">Pergumulan Hidup & Kekhawatiran</option>
                  <option value="keluarga">Keluarga & Rumah Tangga Kristen</option>
                  <option value="sakramen-sidi">Sakramen, Sidi & Ajaran Iman</option>
                  <option value="pengampunan">Pengampunan & Kerukunan Sesama</option>
                  <option value="kedukaan">Kedukaan & Penghiburan Iman</option>
                  <option value="anak-muda">Pergaulan & Masa Depan Anak Muda</option>
                  <option value="pekerjaan-kebun">Etika Kerja, Hasil Bumi & Integritas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Topik / Pokok Bahasan:
                </label>
                <input
                  type="text"
                  value={counselingTopic}
                  onChange={(e) => setCounselingTopic(e.target.value)}
                  placeholder="Misal: Kekhawatiran masa depan, mendidik anak..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Uraian Pertanyaan / Keluhan Pribadi:
                </label>
                <textarea
                  rows={3}
                  value={counselingQuestion}
                  onChange={(e) => setCounselingQuestion(e.target.value)}
                  placeholder="Tuliskan pertanyaan rohani yang sedang Anda atau warga jemaat gumuli..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Konteks Pelayanan / Warga:
                </label>
                <input
                  type="text"
                  value={counselingContext}
                  onChange={(e) => setCounselingContext(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                onClick={handleGenerateCounseling}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{loading ? 'Menyusun Jawaban Rohani...' : 'Dapatkan Bimbingan Rohani AI'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="p-5 rounded-2xl bg-[#0b1226] border border-slate-800 min-h-[500px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <h4 className="font-bold text-white text-sm">Naskah Bimbingan & Doa Rohani</h4>
                  </div>
                  {counselingResult && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => copyToClipboard(counselingResult)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{copied ? 'Tersalin' : 'Salin'}</span>
                      </button>
                      <button
                        onClick={() => shareToWhatsApp(counselingResult)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Kirim WA</span>
                      </button>
                    </div>
                  )}
                </div>

                {counselingResult ? (
                  <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line select-text">
                    {counselingResult}
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-center text-slate-500">
                    <MessageSquare className="w-12 h-12 text-slate-700 mb-3" />
                    <p className="text-sm font-semibold text-slate-400">Pusat Konseling Iman Kristen</p>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      Pilih salah satu pergumulan iman atau masukkan pertanyaan pribadi Anda, lalu klik "Dapatkan Bimbingan Rohani AI" untuk menerima penghiburan Alkitabiah dan doa penyerahan.
                    </p>
                  </div>
                )}
              </div>

              {counselingResult && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Berakar pada doktrin Alkitabiah & kasih pastoral GMIT.</span>
                  <span className="text-amber-400 font-semibold">Gemini 3.8 Flash Rohani</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: AI SANTAPAN ROHANI HARIAN */}
      {/* ==================================================== */}
      {activeTab === 'devotional' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-[#0b1226] border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-emerald-400">
                <Sun className="w-5 h-5" />
                <h3 className="font-bold text-white text-sm">Santapan Rohani Harian GMIT</h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Waktu & Suasana Renungan:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Renungan Pagi Hari', 'Renungan Malam Hari', 'Renungan Mezbah Keluarga', 'Renungan Tengah Hari'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setDevotionalTiming(t)}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer text-center ${
                        devotionalTiming === t
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tema Renungan Hari Ini:
                </label>
                <input
                  type="text"
                  value={devotionalTheme}
                  onChange={(e) => setDevotionalTheme(e.target.value)}
                  placeholder="Misal: Rahmat Baru di Setiap Fajar, Damai di Tengah Badai..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ayat / Nats Alkitab (Rujukan):
                </label>
                <input
                  type="text"
                  value={devotionalScripture}
                  onChange={(e) => setDevotionalScripture(e.target.value)}
                  placeholder="Misal: Ratapan 3:22-23, Filipi 4:6-7, Mazmur 91:1-2"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sasaran Pembaca:
                </label>
                <select
                  value={devotionalAudience}
                  onChange={(e) => setDevotionalAudience(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Keluarga Kristen GMIT">Keluarga Kristen GMIT (Umum)</option>
                  <option value="Pemuda & Remaja GMIT">Pemuda & Remaja (Generasi Penerus)</option>
                  <option value="Warga Lanjut Usia (Lansia)">Warga Lanjut Usia (Lansia)</option>
                  <option value="Kaum Ibu & Perempuan">Kaum Ibu & Perempuan GMIT</option>
                  <option value="Kaum Bapak & Petani/Nelayan">Kaum Bapak & Pekerja Ladang/Laut</option>
                  <option value="Persekutuan Rayon I s/d IV">Anggota Rayon I–IV Betel Fuimelang</option>
                </select>
              </div>

              <button
                onClick={handleGenerateDevotional}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sun className="w-4 h-4" />}
                <span>{loading ? 'Menulis Santapan Rohani...' : 'Buat Santapan Rohani Hari Ini'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="p-5 rounded-2xl bg-[#0b1226] border border-slate-800 min-h-[500px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-bold text-white text-sm">Santapan Rohani & Format WhatsApp</h4>
                  </div>
                  {devotionalResult && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => copyToClipboard(devotionalResult)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{copied ? 'Tersalin' : 'Salin'}</span>
                      </button>
                      <button
                        onClick={() => shareToWhatsApp(devotionalResult)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Kirim WA Rayon</span>
                      </button>
                    </div>
                  )}
                </div>

                {devotionalResult ? (
                  <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line select-text">
                    {devotionalResult}
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-center text-slate-500">
                    <Sun className="w-12 h-12 text-slate-700 mb-3" />
                    <p className="text-sm font-semibold text-slate-400">Santapan Rohani Pagi & Malam</p>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      Susun renungan harian yang menyegarkan jiwa untuk keluarga jemaat, lengkap dengan ayat emas, refleksi praktis, dan format siap kirim ke WhatsApp Rayon.
                    </p>
                  </div>
                )}
              </div>

              {devotionalResult && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Siap dibagikan ke jemaat Rayon I–IV Fuimelang</span>
                  <span className="text-emerald-400 font-semibold">1-Klik WhatsApp Ready</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: AI PENUNTUN LITURGI & TATA IBADAH KHUSUS */}
      {/* ==================================================== */}
      {activeTab === 'liturgy' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-[#0b1226] border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sky-400">
                <Music className="w-5 h-5" />
                <h3 className="font-bold text-white text-sm">Penuntun Tata Ibadah & Liturgi Khusus</h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Jenis Ibadah Khusus:
                </label>
                <select
                  value={liturgyServiceType}
                  onChange={(e) => setLiturgyServiceType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Ibadah Rumah Tangga / Persekutuan Rayon">Ibadah Rumah Tangga / Persekutuan Rayon</option>
                  <option value="Ibadah Syukur Rumah Baru / Penyerahan Rumah">Ibadah Syukur Rumah Baru / Tempat Tinggal</option>
                  <option value="Ibadah Syukur Panen / Hasil Bumi (Jagung & Kemiri)">Ibadah Syukur Panen & Hasil Bumi Alor</option>
                  <option value="Ibadah Penghiburan / Malam Kedukaan">Ibadah Penghiburan / Kedukaan</option>
                  <option value="Ibadah Syukur Ulang Tahun / Ulang Tahun Pernikahan">Ibadah Syukur Hari Ulang Tahun / Nikah</option>
                  <option value="Ibadah Persekutuan Pemuda GMIT (GP)">Ibadah Persekutuan Pemuda GMIT</option>
                  <option value="Ibadah Kaum Perempuan GMIT">Ibadah Persekutuan Kaum Perempuan</option>
                  <option value="Ibadah Kaum Bapak GMIT">Ibadah Persekutuan Kaum Bapak</option>
                  <option value="Ibadah Peletakan Batu Pertama / Pembangunan">Ibadah Peletakan Batu Pertama Bangunan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tema Ibadah:
                </label>
                <input
                  type="text"
                  value={liturgyTheme}
                  onChange={(e) => setLiturgyTheme(e.target.value)}
                  placeholder="Misal: Keluarga yang Berakar dan Berbuah..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nats Alkitab:
                </label>
                <input
                  type="text"
                  value={liturgyScripture}
                  onChange={(e) => setLiturgyScripture(e.target.value)}
                  placeholder="Misal: Yosua 24:15, Mazmur 128:1-6..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Rayon / Tempat Ibadah:
                </label>
                <input
                  type="text"
                  value={liturgyRayon}
                  onChange={(e) => setLiturgyRayon(e.target.value)}
                  placeholder="Misal: Rumah Kel. Banamtuan - Rayon I Betel Fuimelang"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <button
                onClick={handleGenerateLiturgy}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Music className="w-4 h-4" />}
                <span>{loading ? 'Menyusun Liturgi...' : 'Susun Tata Ibadah Khusus'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="p-5 rounded-2xl bg-[#0b1226] border border-slate-800 min-h-[500px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-sky-400" />
                    <h4 className="font-bold text-white text-sm">Tata Ibadah Resmi GMIT</h4>
                  </div>
                  {liturgyResult && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => copyToClipboard(liturgyResult)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{copied ? 'Tersalin' : 'Salin'}</span>
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-400" />
                        <span>Cetak</span>
                      </button>
                    </div>
                  )}
                </div>

                {liturgyResult ? (
                  <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line select-text">
                    {liturgyResult}
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-center text-slate-500">
                    <Music className="w-12 h-12 text-slate-700 mb-3" />
                    <p className="text-sm font-semibold text-slate-400">Tata Ibadah Liturgis Lengkap</p>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      Hasilkan tata kebaktian rumah tangga rayon, syukur panen, atau malam kedukaan lengkap dengan rujukan kidung (KJ/PKJ), votum, salam, berita anugerah, dan berkat rasuli.
                    </p>
                  </div>
                )}
              </div>

              {liturgyResult && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Pedoman Liturgis Tata Gereja Sinode GMIT</span>
                  <span className="text-sky-400 font-semibold">Siap Digunakan Majelis / Liturgos</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 4: AI SEKOLAH MINGGU & PEMBINA PAR GMIT */}
      {/* ==================================================== */}
      {activeTab === 'sunday-school' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-[#0b1226] border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-pink-400">
                <Baby className="w-5 h-5" />
                <h3 className="font-bold text-white text-sm">Sekolah Minggu & Pembina PAR GMIT</h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kelompok Usia Anak:
                </label>
                <select
                  value={ssAgeGroup}
                  onChange={(e) => setSsAgeGroup(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-pink-500"
                >
                  <option value="Anak Kecil (Usia 3 - 6 Tahun / Balita & TK)">Anak Kecil (Usia 3 - 6 Tahun / Balita & TK)</option>
                  <option value="Anak Tanggung (Usia 7 - 10 Tahun / SD Kelas 1-4)">Anak Tanggung (Usia 7 - 10 Tahun / SD 1-4)</option>
                  <option value="Anak Remaja (Usia 11 - 14 Tahun / SD 5-6 & SMP)">Anak Remaja (Usia 11 - 14 Tahun / SMP)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Judul / Cerita Alkitab:
                </label>
                <input
                  type="text"
                  value={ssStoryTheme}
                  onChange={(e) => setSsStoryTheme(e.target.value)}
                  placeholder="Misal: Yesus Meredakan Angin Ribut, Daud dan Goliat..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nats Alkitab:
                </label>
                <input
                  type="text"
                  value={ssScripture}
                  onChange={(e) => setSsScripture(e.target.value)}
                  placeholder="Misal: Markus 4:35-41, 1 Samuel 17..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Story presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Preset Cerita Sekolah Minggu Favorit:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { t: 'Yesus Meredakan Badai', s: 'Markus 4:35-41' },
                    { t: 'Daud Melawan Goliat', s: '1 Samuel 17:40-50' },
                    { t: '5 Roti dan 2 Ikan', s: 'Yohanes 6:1-14' },
                    { t: 'Orang Samaria Murah Hati', s: 'Lukas 10:25-37' },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSsStoryTheme(preset.t);
                        setSsScripture(preset.s);
                      }}
                      className="text-left p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-pink-300 transition truncate cursor-pointer"
                    >
                      {preset.t}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerateSundaySchool}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 transition cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Baby className="w-4 h-4" />}
                <span>{loading ? 'Menyusun Cerita PAR...' : 'Buat Bahan Ajar Sekolah Minggu'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="p-5 rounded-2xl bg-[#0b1226] border border-slate-800 min-h-[500px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Baby className="w-4 h-4 text-pink-400" />
                    <h4 className="font-bold text-white text-sm">Bahan Ajar & Alat Peraga PAR GMIT</h4>
                  </div>
                  {sundaySchoolResult && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => copyToClipboard(sundaySchoolResult)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{copied ? 'Tersalin' : 'Salin'}</span>
                      </button>
                      <button
                        onClick={() => shareToWhatsApp(sundaySchoolResult)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Kirim ke Pengasuh</span>
                      </button>
                    </div>
                  )}
                </div>

                {sundaySchoolResult ? (
                  <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line select-text">
                    {sundaySchoolResult}
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-center text-slate-500">
                    <Baby className="w-12 h-12 text-slate-700 mb-3" />
                    <p className="text-sm font-semibold text-slate-400">Sahabat Pengasuh PAR & Guru Sekolah Minggu</p>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      Menghasilkan naskah cerita Alkitab yang interaktif, peraga ramah lingkungan (daun, batu, biji jagung), lagu anak, ayat hafalan bergaya gerak tubuh, dan kuis ceria.
                    </p>
                  </div>
                )}
              </div>

              {sundaySchoolResult && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Dirancang khusus bagi Pengasuh PAR di pedesaan Alor</span>
                  <span className="text-pink-400 font-semibold">Ramah Anak & Kontekstual</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 5: AI PENELAAHAN ALKITAB (PA RAYON) */}
      {/* ==================================================== */}
      {activeTab === 'bible-study' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-[#0b1226] border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-indigo-400">
                <HelpCircle className="w-5 h-5" />
                <h3 className="font-bold text-white text-sm">Panduan Penelaahan Alkitab (PA Rayon)</h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nats Alkitab:
                </label>
                <input
                  type="text"
                  value={paScripture}
                  onChange={(e) => setPaScripture(e.target.value)}
                  placeholder="Misal: Yakobus 2:14-26, Matius 6:25-34..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Topik Bahasan:
                </label>
                <input
                  type="text"
                  value={paTopic}
                  onChange={(e) => setPaTopic(e.target.value)}
                  placeholder="Misal: Iman Tanpa Perbuatan Adalah Mati..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Peserta / Sasaran Kelompok:
                </label>
                <input
                  type="text"
                  value={paAudience}
                  onChange={(e) => setPaAudience(e.target.value)}
                  placeholder="Misal: Persekutuan Doa Rayon I s/d IV..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* PA Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Preset Bahan PA Rayon:
                </label>
                <div className="space-y-1.5">
                  {[
                    { s: 'Yakobus 2:14-26', t: 'Iman Tanpa Perbuatan Adalah Mati' },
                    { s: 'Matius 6:25-34', t: 'Mengatasi Kekhawatiran Soal Rezeki' },
                    { s: 'Mazmur 133:1-3', t: 'Indahnya Hidup Rukun Bersaudara' },
                    { s: 'Galatia 5:22-26', t: 'Buah-Buah Roh Kudus di Tengah Jemaat' },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setPaScripture(preset.s);
                        setPaTopic(preset.t);
                      }}
                      className="w-full text-left p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-indigo-300 transition flex items-center justify-between cursor-pointer"
                    >
                      <span className="font-semibold">{preset.s}</span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[150px]">{preset.t}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerateBibleStudy}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <HelpCircle className="w-4 h-4" />}
                <span>{loading ? 'Menyusun Bahan PA...' : 'Susun Panduan Diskusi PA Rayon'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="p-5 rounded-2xl bg-[#0b1226] border border-slate-800 min-h-[500px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-indigo-400" />
                    <h4 className="font-bold text-white text-sm">Panduan Diskusi & Bahan PA Rayon</h4>
                  </div>
                  {paResult && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => copyToClipboard(paResult)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{copied ? 'Tersalin' : 'Salin'}</span>
                      </button>
                      <button
                        onClick={() => shareToWhatsApp(paResult)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Kirim WA Rayon</span>
                      </button>
                    </div>
                  )}
                </div>

                {paResult ? (
                  <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line select-text">
                    {paResult}
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-center text-slate-500">
                    <HelpCircle className="w-12 h-12 text-slate-700 mb-3" />
                    <p className="text-sm font-semibold text-slate-400">Panduan PA Interaktif Rayon I–IV</p>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      Menghasilkan latar belakang teologis, tafsiran ayat pokok, 4 pertanyaan diskusi kelompok yang menghidupkan percakapan, komitmen iman, dan doa penutup.
                    </p>
                  </div>
                )}
              </div>

              {paResult && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Mempererat persekutuan dan pendalaman firman di Rayon</span>
                  <span className="text-indigo-400 font-semibold">Fasilitator Guide Ready</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 6: ASISTEN KHOTBAH & RENUNGAN GMIT */}
      {/* ==================================================== */}
      {activeTab === 'sermon' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-[#0b1226] border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-amber-300">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-sm">Parameter Kerangka Khotbah</h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Jenis Ibadah:
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Ibadah Minggu">Ibadah Minggu Jemaat</option>
                  <option value="Ibadah Rayon (Rumah Tangga)">Ibadah Rayon (Rumah Tangga)</option>
                  <option value="Ibadah Pemuda (GP)">Ibadah Pemuda GMIT (GP)</option>
                  <option value="Ibadah Kaum Perempuan">Ibadah Kaum Perempuan GMIT</option>
                  <option value="Ibadah Kaum Bapak">Ibadah Kaum Bapak GMIT</option>
                  <option value="Ibadah Pengucapan Syukur Panen/Keluarga">Ibadah Pengucapan Syukur Panen</option>
                  <option value="Ibadah Penghiburan / Kedukaan">Ibadah Penghiburan / Kedukaan</option>
                  <option value="Ibadah Baptisan Kudus">Ibadah Sakramen Baptisan Kudus</option>
                  <option value="Ibadah Peneguhan Sidi">Ibadah Sakramen Peneguhan Sidi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nats Bacaan Alkitab:
                </label>
                <input
                  type="text"
                  value={scripture}
                  onChange={(e) => setScripture(e.target.value)}
                  placeholder="Misal: Mazmur 23:1-6, Yohanes 15:1-8"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tema / Judul Khotbah:
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Misal: Tuhan Gembala yang Memelihara Umat-Nya"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Masa / Kalender Gerejawi GMIT:
                </label>
                <select
                  value={liturgicalSeason}
                  onChange={(e) => setLiturgicalSeason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Minggu-minggu Biasa / Trinitas">Minggu-minggu Biasa / Trinitas</option>
                  <option value="Adven (Menanti Kedatangan Kristus)">Adven (Menanti Kedatangan Kristus)</option>
                  <option value="Natal & Epifania">Natal & Epifania</option>
                  <option value="Pra-Paskah & Minggu Sengsara">Pra-Paskah & Minggu Sengsara</option>
                  <option value="Paskah (Kebangkitan Kristus)">Paskah (Kebangkitan Kristus)</option>
                  <option value="Kenaikan & Pentakosta">Kenaikan & Pentakosta (Roh Kudus)</option>
                  <option value="Bulan Bahasa & Budaya Alor NTT">Bulan Bahasa & Budaya Alor NTT</option>
                  <option value="Bulan Keluarga & Lingkungan Hidup">Bulan Keluarga & Lingkungan Hidup</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Konteks Kehidupan Jemaat & Catatan Khusus:
                </label>
                <textarea
                  rows={3}
                  value={contextNotes}
                  onChange={(e) => setContextNotes(e.target.value)}
                  placeholder="Kondisi riil jemaat pedesaan di Alor Tengah Utara..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <button
                onClick={handleGenerateSermon}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{loading ? 'Menyusun Kerangka Khotbah...' : 'Hasilkan Draf Khotbah GMIT'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="p-5 rounded-2xl bg-[#0b1226] border border-slate-800 min-h-[500px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <h4 className="font-bold text-white text-sm">Draf Kerangka Khotbah Kontekstual</h4>
                  </div>
                  {sermonResult && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => copyToClipboard(sermonResult)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-400" />
                        <span>Cetak</span>
                      </button>
                    </div>
                  )}
                </div>

                {sermonResult ? (
                  <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line select-text">
                    {sermonResult}
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-center text-slate-500">
                    <BookOpen className="w-12 h-12 text-slate-700 mb-3" />
                    <p className="text-sm font-semibold text-slate-400">Belum ada Draf Khotbah</p>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      Pilih nats Alkitab dan tema di sebelah kiri, lalu tekan tombol "Hasilkan Draf Khotbah GMIT".
                    </p>
                  </div>
                )}
              </div>

              {sermonResult && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Draf khotbah siap dikembangkan oleh Pendeta / Majelis Jemaat.</span>
                  <span className="text-amber-400 font-semibold">Gemini 3.8 Flash Reformed</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 7: DOA PASTORAL & KUNJUNGAN */}
      {/* ==================================================== */}
      {activeTab === 'prayer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-[#0b1226] border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-amber-300">
                <HeartHandshake className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-sm">Data Kunjungan & Sasaran Doa</h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kategori Pelayanan Pastoral:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'ulang-tahun', label: 'Ulang Tahun / Syukur' },
                    { id: 'sakit', label: 'Orang Sakit / Pemulihan' },
                    { id: 'kunjungan-rumah', label: 'Lawatan Rumah Tangga' },
                    { id: 'duka', label: 'Penghiburan Kedukaan' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setPrayerCategory(cat.id as any)}
                      className={`p-2 rounded-xl border text-xs font-semibold text-center transition cursor-pointer ${
                        prayerCategory === cat.id
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {birthdayMembers.length > 0 && prayerCategory === 'ulang-tahun' && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <label className="block text-[11px] font-semibold text-amber-300 mb-1">
                    Jemaat Ulang Tahun Bulan Ini / Mendatang:
                  </label>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => handleSelectMember(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Pilih dari Database Jemaat --</option>
                    {birthdayMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.fullName} ({m.birthDate || 'Tgl Lahir'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Warga Jemaat / Keluarga:
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Misal: Opa Yulius Banamtuan / Ibu Maria"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Usia / Umur:
                  </label>
                  <input
                    type="text"
                    value={customAge}
                    onChange={(e) => setCustomAge(e.target.value)}
                    placeholder="Misal: 72"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Rayon Pelayanan:
                  </label>
                  <input
                    type="text"
                    value={customRayon}
                    onChange={(e) => setCustomRayon(e.target.value)}
                    placeholder="Misal: Rayon 1"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Catatan Khusus / Kondisi Nyata:
                </label>
                <textarea
                  rows={3}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Misal: Sudah 2 minggu terbaring sakit di rumah, memohon pemulihan kesehatan dan penghiburan bagi keluarga..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <button
                onClick={handleGeneratePrayer}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <HeartHandshake className="w-4 h-4" />}
                <span>{loading ? 'Menyusun Doa & Pesan Pastoral...' : 'Hasilkan Doa & Materi Pastoral'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="p-5 rounded-2xl bg-[#0b1226] border border-slate-800 min-h-[500px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-amber-400" />
                    <h4 className="font-bold text-white text-sm">Materi Lawatan Pastoral & Doa Khusus</h4>
                  </div>
                  {prayerResult && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => copyToClipboard(prayerResult)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
                      </button>
                      <button
                        onClick={() => shareToWhatsApp(prayerResult)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Kirim WA</span>
                      </button>
                    </div>
                  )}
                </div>

                {prayerResult ? (
                  <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line select-text">
                    {prayerResult}
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-center text-slate-500">
                    <HeartHandshake className="w-12 h-12 text-slate-700 mb-3" />
                    <p className="text-sm font-semibold text-slate-400">Belum ada Doa Pastoral</p>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      Pilih kategori pelayanan di samping, masukkan nama jemaat, dan klik tombol untuk menghasilkan materi lawatan dan naskah doa.
                    </p>
                  </div>
                )}
              </div>

              {prayerResult && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Dilengkapi naskah doa dan pesan ringkas WhatsApp.</span>
                  <span className="text-emerald-400 font-semibold">Gemini 3.8 Flash Pastoral</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 8: GENERATOR WARTA JEMAAT */}
      {/* ==================================================== */}
      {activeTab === 'warta' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-[#0b1226] border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-amber-300">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-sm">Penyusunan Butir-butir Warta</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tanggal Ibadah:
                  </label>
                  <input
                    type="date"
                    value={bulletinDate}
                    onChange={(e) => setBulletinDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Gaya Bahasa Warta:
                  </label>
                  <select
                    value={bulletinTone}
                    onChange={(e) => setBulletinTone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Hangat dan Menghidupkan Persekutuan">Hangat & Menghidupkan</option>
                    <option value="Formal Liturgis Resmi">Formal Liturgis Resmi</option>
                    <option value="Ringkas dan Informatif">Ringkas & Informatif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Daftar Pengumuman / Pokok Warta:
                </label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {bulletinItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-2"
                    >
                      <span className="text-amber-400 font-bold shrink-0">{idx + 1}.</span>
                      <span className="flex-1 leading-relaxed">{item}</span>
                      <button
                        onClick={() => setBulletinItems(bulletinItems.filter((_, i) => i !== idx))}
                        className="text-slate-500 hover:text-red-400 text-xs font-bold px-1 transition cursor-pointer"
                        title="Hapus poin"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={newItemInput}
                    onChange={(e) => setNewItemInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newItemInput.trim()) {
                        setBulletinItems([...bulletinItems, newItemInput.trim()]);
                        setNewItemInput('');
                      }
                    }}
                    placeholder="Tambah pengumuman baru lalu tekan Enter..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={() => {
                      if (newItemInput.trim()) {
                        setBulletinItems([...bulletinItems, newItemInput.trim()]);
                        setNewItemInput('');
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-700 transition cursor-pointer shrink-0"
                  >
                    Tambah
                  </button>
                </div>
              </div>

              <button
                onClick={handleGenerateWarta}
                disabled={loading || bulletinItems.length === 0}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                <span>{loading ? 'Menyusun Warta Jemaat...' : 'Susun Warta Jemaat Lengkap'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="p-5 rounded-2xl bg-[#0b1226] border border-slate-800 min-h-[500px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <h4 className="font-bold text-white text-sm">Naskah Warta Jemaat Siap Baca & Cetak</h4>
                  </div>
                  {wartaResult && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => copyToClipboard(wartaResult)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
                      </button>
                      <button
                        onClick={handleSaveToAnnouncements}
                        disabled={loading}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        {savedToWarta ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                        <span>{savedToWarta ? 'Tersimpan!' : 'Publikasi ke Sistem'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {wartaResult ? (
                  <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line select-text">
                    {wartaResult}
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-center text-slate-500">
                    <FileText className="w-12 h-12 text-slate-700 mb-3" />
                    <p className="text-sm font-semibold text-slate-400">Belum ada Naskah Warta</p>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      Ketikkan pengumuman mingguan di sebelah kiri, lalu tekan tombol "Susun Warta Jemaat Lengkap" untuk merapikannya.
                    </p>
                  </div>
                )}
              </div>

              {wartaResult && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Warta tersusun rapi dengan salam pembuka, jadwal rayon, doa syafaat & salam berkat.</span>
                  <span className="text-amber-400 font-semibold">Gemini 3.8 Flash Warta</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 9: ANALISIS PELAYANAN MAJELIS */}
      {/* ==================================================== */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0b1226] border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Analisis Strategis & Rekomendasi Pelayanan Majelis</h3>
                  <p className="text-xs text-slate-400">
                    Evaluasi otomatis terhadap komposisi jemaat, status sakramen (baptis/sidi), rayon, dan kategorial GMIT Betel Fuimelang.
                  </p>
                </div>
              </div>
              <button
                onClick={handleGenerateInsights}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-50 shrink-0"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{loading ? 'Menganalisis Data...' : 'Mulai Analisis AI Sekarang'}</span>
              </button>
            </div>

            {/* Quick Stats Summary for context */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block">Total Jiwa Jemaat</span>
                <span className="text-lg font-black text-amber-400">{members.length} Jiwa</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block">Sudah Dibaptis</span>
                <span className="text-lg font-black text-emerald-400">
                  {members.filter((m) => m.baptismStatus === 'Sudah').length} Jiwa
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block">Sudah Mengaku Sidi</span>
                <span className="text-lg font-black text-sky-400">
                  {members.filter((m) => m.confirmationStatus === 'Sudah').length} Jiwa
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block">Jumlah Rayon</span>
                <span className="text-lg font-black text-purple-400">{rayons.length} Rayon</span>
              </div>
            </div>

            {/* Analysis Result */}
            {insightsResult ? (
              <div className="mt-4 p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line select-text">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Laporan Rekomendasi Pelayanan Majelis Jemaat
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(insightsResult)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{copied ? 'Tersalin' : 'Salin Laporan'}</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400" />
                      <span>Cetak</span>
                    </button>
                  </div>
                </div>
                {insightsResult}
              </div>
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-center text-slate-500">
                <TrendingUp className="w-12 h-12 text-slate-700 mb-3" />
                <p className="text-sm font-semibold text-slate-400">Belum ada Analisis Pelayanan</p>
                <p className="text-xs text-slate-500 max-w-md mt-1">
                  Klik tombol "Mulai Analisis AI Sekarang" di atas untuk menganalisis data jemaat Anda dan mendapatkan rekomendasi pastoral bagi kepemimpinan Majelis GMIT Betel Fuimelang.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 10: ETIKA & PANDUAN PENGGUNAAN AI GEREJA */}
      {/* ==================================================== */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0b1226] border border-slate-800 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Pedoman Teologis & Etika Rohani Penggunaan AI di Gereja</h3>
                <p className="text-xs text-slate-400">
                  Memastikan teknologi kecerdasan buatan tetap menjadi sarana penopang pelayanan yang kudus, beretika, dan tidak menggantikan persekutuan pribadi dengan Tuhan.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
              <div className="p-4 rounded-xl bg-[#0c1328] border border-slate-800 space-y-2">
                <span className="font-bold text-amber-300 block text-sm">1. AI adalah Alat, Bukan Gembala</span>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Urapan Roh Kudus, doa penumpangan tangan, air mata simpati bagi orang yang berduka, serta sentuhan pastoral pribadi tidak dapat digantikan oleh mesin. AI hanya membantu mempercepat persiapan bahan ajar, draf tulisan, dan kerapian administrasi kantor gereja.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0c1328] border border-slate-800 space-y-2">
                <span className="font-bold text-amber-300 block text-sm">2. Kerahasiaan Penggembalaan</span>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Pokok pengakuan dosa, nama korban kekerasan, pergumulan intim rumah tangga, atau rahasia konsistori gereja tidak boleh dimasukkan ke dalam sistem AI publik. Selalu hormati privasi dan kehormatan warga jemaat sebagai bait Allah yang kudus.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0c1328] border border-slate-800 space-y-2">
                <span className="font-bold text-amber-300 block text-sm">3. Verifikasi Teologis Alkitabiah</span>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Setiap draf khotbah, renungan harian, dan tata ibadah yang dihasilkan wajib diteliti kembali oleh Pendeta atau Presbiter bertugas agar selaras dengan Kitab Suci (TB LAI), Tata Gereja GMIT, dan tradisi Reformasi Injili.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
