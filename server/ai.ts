import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';

export const aiRouter = Router();

const apiKey = process.env.GEMINI_API_KEY || '';

const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const DEFAULT_MODEL = 'gemini-3.8-flash';

// Helper to check API key
function checkApiKey(res: any): boolean {
  if (!process.env.GEMINI_API_KEY) {
    res.status(503).json({
      success: false,
      message: 'GEMINI_API_KEY belum dikonfigurasi di server. Silakan pastikan API Key Gemini tersedia di Environment Secrets.',
    });
    return false;
  }
  return true;
}

// 1. Asisten Khotbah & Renungan GMIT
aiRouter.post('/sermon', async (req, res) => {
  if (!checkApiKey(res)) return;

  const {
    serviceType = 'Ibadah Minggu',
    scripture = 'Mazmur 23:1-6',
    topic = 'Tuhan Gembalaku yang Baik',
    liturgicalSeason = 'Umum',
    contextNotes = 'Jemaat sebagian besar bertani dan berkebun di Lembur Tengah Alor',
  } = req.body;

  try {
    const prompt = `Anda adalah seorang teolog dan pendeta berpengalaman di Gereja Masehi Injili di Timor (GMIT), melayani di Jemaat GMIT Betel Fuimelang, Desa Lembur Tengah, Klasis Alor Tengah Utara, Kabupaten Alor, Nusa Tenggara Timur (NTT).

Tolong susun draf dan pokok renungan / khotbah yang mendalam, alkitabiah, dan kontekstual dengan rincian berikut:
- Jenis Ibadah: ${serviceType}
- Nats Alkitab: ${scripture}
- Tema / Topik: ${topic}
- Periode/Tahun Gerejawi: ${liturgicalSeason}
- Konteks Jemaat: ${contextNotes}

Susun dalam format yang rapi dan mudah dibaca oleh Pendeta atau Majelis Jemaat:
1. JUDUL KHOTBAH: (Menarik, teologis, dan mudah diingat jemaat)
2. TEMA POKOK TEOLOGIS: (Intisari kebenaran firman Allah)
3. PENDAHULUAN: (Menghubungkan konteks kehidupan nyata jemaat di NTT/Alor dengan pergumulan iman)
4. TAFSIRAN DAN MAKNA NATS: (Latar belakang nats dan penjelasan inti firman)
5. BUTIR-BUTIR KHOTBAH (3 Poin Pokok):
   - Poin 1 + Ilustrasi Kontekstual & Aplikasi
   - Poin 2 + Ilustrasi Kontekstual & Aplikasi
   - Poin 3 + Ilustrasi Kontekstual & Aplikasi
6. KESIMPULAN & AJAKAN KOMITMEN: (Panggilan untuk bertindak dan hidup berbuah)
7. DOA SYAFAAT / DOA FIRMAN: (Naskah doa penutup yang menguatkan jemaat)`;

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        systemInstruction: 'Anda adalah konsultan teologi dan asisten pastoral pastoral GMIT yang berpegang pada tradisi Reformasi Injili, ramah, kontekstual budaya Nusa Tenggara Timur, dan setia pada Kitab Suci.',
      },
    });

    const resultText = response.text || '';
    return res.json({
      success: true,
      text: resultText,
    });
  } catch (err: any) {
    console.error('Error generating sermon outline:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Gagal menyusun khotbah dengan AI',
    });
  }
});

// 2. Pembuat Warta Jemaat Otomatis
aiRouter.post('/warta', async (req, res) => {
  if (!checkApiKey(res)) return;

  const {
    bulletinDate = new Date().toISOString().substring(0, 10),
    items = [],
    announcerName = 'Majelis Jemaat GMIT Betel Fuimelang',
    tone = 'Hangat dan Menghidupkan Persekutuan',
  } = req.body;

  try {
    const rawItems = Array.isArray(items) ? items.join('\n- ') : String(items);

    const prompt = `Anda adalah sekretariat Majelis Jemaat GMIT Betel Fuimelang, Klasis Alor Tengah Utara.
Buatlah Draf Warta Jemaat Mingguan resmi yang rapi, tertib, dan bernuansa pastoral untuk dibacakan pada Ibadah Minggu tanggal ${bulletinDate}.

Catatan / Pokok-pokok Warta:
- ${rawItems || 'Jadwal Ibadah Minggu, Perjamuan Kudus bulan depan, Pembersihan gedung gereja hari Sabtu, Doa syukur keluarga.'}

Gaya Bahasa: ${tone}
Penyampai: ${announcerName}

Format Warta Jemaat harus mencakup:
1. KEPALA WARTA: (Nama Gereja, Wilayah Klasis, Tanggal Ibadah)
2. SALAM PEMBUKA & UCAPAN SELAMAT DATANG: (Bagi jemaat tetap maupun saudara seiman/tamu yang baru pertama kali beribadah)
3. WARTA PELAYANAN & JADWAL IBADAH SEPEKAN: (Ibadah Rayon 1-6, Ibadah Kategorial PAR, Pemuda, Kaum Ibu, Kaum Bapak)
4. WARTA KHUSUS MAJELIS & PENGUMUMAN PERISTIWA: (Sakramen, mutasi, ucapan syukur)
5. POKOK-POKOK DOA SYAFAAT SEPEKAN: (Bagi warga jemaat lansia, sakit, studi anak-anak, pertanian/usaha, dan pelayanan gereja)
6. KATA PENUTUP & SALAM BERKAT DARI MAJELIS`;

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        systemInstruction: 'Anda adalah asisten administrasi gerejawi GMIT yang ahli menyusun warta jemaat dengan tata bahasa Indonesia yang baik, tertib liturgis, dan penuh persaudaraan kristiani.',
      },
    });

    const resultText = response.text || '';
    return res.json({
      success: true,
      text: resultText,
    });
  } catch (err: any) {
    console.error('Error generating warta jemaat:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Gagal menyusun warta jemaat dengan AI',
    });
  }
});

// 3. Rekomendasi Doa & Kunjungan Pastoral (Ulang Tahun, Kunjungan Rumah Tangga, Orang Sakit, Duka)
aiRouter.post('/pastoral-prayer', async (req, res) => {
  if (!checkApiKey(res)) return;

  const {
    category = 'ulang-tahun', // 'ulang-tahun' | 'sakit' | 'kunjungan-rumah' | 'duka' | 'syukuran'
    memberName = 'Bapak/Ibu Jemaat',
    age = '',
    rayon = '',
    notes = '',
  } = req.body;

  try {
    const prompt = `Anda adalah seorang pendeta / presbiter GMIT Betel Fuimelang yang hendak melayani pastoral jemaat.

Buatlah materi kunjungan pastoral dan doa khusus dengan data berikut:
- Kategori Pelayanan: ${category}
- Nama Anggota Jemaat: ${memberName}
- Usia / Usia Pernikahan: ${age ? `${age} tahun` : 'Tidak disebutkan'}
- Rayon Pelayanan: ${rayon || 'GMIT Betel Fuimelang'}
- Catatan / Kondisi Khusus: ${notes || 'Kunjungan rutin pastoral'}

Hasilkan output yang terstruktur:
1. AYAT ALKITAB PENGUATAN: (Satu atau dua ayat firman Tuhan yang sangat mengena dan menenangkan)
2. PESAN PASTORAL SINGKAT (3 Menit): (Kata-kata penguatan iman yang hangat dan penuh kasih saat bercakap-cakap dengan keluarga)
3. NASKAH DOA PASTORAL: (Doa yang sungguh-sungguh, menyebut nama ${memberName}, mendoakan kesehatan, damai sejahtera, rezeki, dan perlindungan Tuhan bagi seisi rumah)
4. DRAF PESAN WHATSAPP: (Teks ucapan dan doa yang ringkas, hangat, siap di-copy paste ke WhatsApp anggota jemaat)`;

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        systemInstruction: 'Anda adalah gembala jemaat yang penuh empati, memiliki bahasa pastoral yang lembut, menguatkan hati, dan berakar pada pengharapan di dalam Kristus Yesus.',
      },
    });

    const resultText = response.text || '';
    return res.json({
      success: true,
      text: resultText,
    });
  } catch (err: any) {
    console.error('Error generating pastoral prayer:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Gagal menghasilkan doa pastoral dengan AI',
    });
  }
});

// 4. Analisis & Rekomendasi Pelayanan Majelis (Ministry Insights)
aiRouter.post('/insights', async (req, res) => {
  if (!checkApiKey(res)) return;

  const { statsSummary } = req.body;

  try {
    const prompt = `Anda adalah penasihat strategis pelayanan GMIT (Gereja Masehi Injili di Timor).
Berikut adalah ringkasan data statistik Jemaat GMIT Betel Fuimelang saat ini:
${JSON.stringify(statsSummary || {}, null, 2)}

Berdasarkan data di atas (komposisi jemaat, kategorial, sakramen baptis/sidi, keuangan, dsb), berikan 4 hingga 5 REKOMENDASI STRATEGIS & PASTORAL untuk Majelis Jemaat GMIT Betel Fuimelang:
1. Prioritas Pembinaan Kategorial (Anak & Remaja / Pemuda / Kaum Ibu / Kaum Bapak)
2. Perhatian Khusus Sakramen & Pelayanan Sidi
3. Pendampingan Jemaat Lanjut Usia & Lansia
4. Optimalisasi Persekutuan Rayon Pelayanan
5. Pengelolaan Sumber Daya & Partisipasi Warga Jemaat

Tulis dengan bahasa yang konstruktif, praktis, relevan dengan konteks pedesaan di Alor NTT, dan berorientasi pada kemajuan iman jemaat.`;

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        systemInstruction: 'Anda adalah konsultan kepemimpinan gerejawi GMIT yang bijaksana, praktis, dan berwawasan luas.',
      },
    });

    const resultText = response.text || '';
    return res.json({
      success: true,
      text: resultText,
    });
  } catch (err: any) {
    console.error('Error generating ministry insights:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Gagal menganalisis data jemaat dengan AI',
    });
  }
});
