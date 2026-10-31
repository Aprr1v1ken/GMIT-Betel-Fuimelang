import React, { useState } from 'react';
import { X, Upload, CheckCircle2 } from 'lucide-react';
import type { Member, Rayon, CategorialGroup } from '../types/index.ts';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (members: Partial<Member>[]) => Promise<{ success: boolean; imported: number; failed: number; errors: string[] }>;
  rayons: Rayon[];
  categorials: CategorialGroup[];
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  rayons,
  categorials,
}) => {
  const [csvText, setCsvText] = useState('');
  const [fileError, setFileError] = useState('');
  const [fileName, setFileName] = useState('');
  const [previewData, setPreviewData] = useState<Partial<Member>[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; failed: number; errors: string[] } | null>(null);

  if (!isOpen) return null;

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      setPreviewData([]);
      return;
    }
    const headers = lines[0].split(',').map((h) => h.trim());
    const parsed: Partial<Member>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      if (cols.length >= 3 && cols[0]) {
        const item: any = {
          fullName: cols[0],
          gender: cols[1] || '',
          birthDate: cols[2] || '',
          birthPlace: cols[3] || '',
          address: cols[4] || '',
          rayonId: cols[5] || '',
          categorialGroupId: cols[6] || '',
          phone: cols[7] || '',
          familyRole: 'Anak',
          maritalStatus: 'Belum Menikah',
          membershipStatus: 'Tetap',
          baptismStatus: 'Belum',
          confirmationStatus: 'Belum',
          marriageChurchStatus: 'Belum',
          status: 'Aktif',
        };
        parsed.push(item);
      }
    }
    setPreviewData(parsed);
  };

  const handleExcelFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setFileError(''); setResult(null); setPreviewData([]); setCsvText(''); setFileName(file.name);
    try {
      if (!file.name.toLowerCase().endsWith('.xlsx') || file.size > 5 * 1024 * 1024) throw new Error('Pilih file .xlsx berukuran maksimal 5 MB.');
      const { readSheet } = await import('read-excel-file/browser');
      const rows = await readSheet(file, 'Data Jemaat');
      const headers = (rows[0] || []).map((value) => String(value || '').trim());
      const columns = ['fullName','nickname','nik','familyCardNo','familyNo','familyRole','gender','birthPlace','birthDate','address','kelurahan','kecamatan','kabupaten','phone','email','maritalStatus','spouseName','rayon','categorial','membershipStatus','baptismStatus','baptismDate','confirmationStatus','confirmationDate','marriageChurchStatus','marriageDate','education','occupation','joinDate','status','notes'];
      if (columns.some((name) => headers.filter((header) => header === name).length !== 1)) throw new Error('Kolom template tidak lengkap atau ganda. Gunakan template asli dan jangan ubah judul kolom.');
      const parsed = rows.slice(1).map((row, index) => {
        if (row.every((value) => value === null || value === '')) return null;
        const item: Record<string, string | number> = { _row: index + 2 };
        for (const name of columns) {
          const value = row[headers.indexOf(name)] as unknown;
          if ((name === 'nik' || name === 'familyCardNo' || name === 'phone') && typeof value === 'number') throw new Error(`Baris ${index + 2}: ${name} harus berupa teks; angka panjang dapat kehilangan digit. Isi sebagai teks di Excel.`);
          if (value instanceof Date) item[name] = value.toISOString().slice(0, 10);
          else item[name] = value == null ? '' : String(value).trim();
        }
        return item as unknown as Partial<Member>;
      }).filter((row): row is Partial<Member> => row !== null);
      if (!parsed.length) throw new Error('Belum ada data pada sheet Data Jemaat.');
      if (parsed.length > 500) throw new Error('Maksimal 500 baris per impor.');
      setPreviewData(parsed);
    } catch (error: any) {
      setFileError(error?.message || 'File Excel tidak dapat dibaca.');
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFileName(''); setFileError(''); setResult(null);
    setCsvText(e.target.value);
    parseCSV(e.target.value);
  };

  const handleStartImport = async () => {
    if (previewData.length === 0) return;
    setImporting(true);
    setResult(null);
    try {
      const res = await onImport(previewData);
      setResult({
        imported: res.imported,
        failed: res.failed,
        errors: res.errors || [],
      });
    } catch (err: any) {
      setResult({ imported: 0, failed: previewData.length, errors: [`${err.message}. Jika koneksi terputus, periksa daftar jemaat sebelum mencoba ulang agar tidak terjadi data ganda.`] });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#0b1226] border border-amber-500/30 rounded-3xl shadow-2xl p-6 text-xs text-slate-100 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-amber-500/20 mb-4">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              Impor Data Jemaat dari Format CSV / Excel
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          <div className="p-4 rounded-xl border border-cyan-500/40 bg-slate-900 space-y-3">
            <a href="/Template_Impor_Data_Jemaat.xlsx" download className="inline-block px-4 py-2 rounded-lg bg-cyan-600 text-white font-bold">Unduh Template Excel (.xlsx)</a>
            <p>Isi sheet <b>Data Jemaat</b>, simpan sebagai .xlsx, lalu pilih file di bawah. Lihat sheet Petunjuk untuk nama kolom dan pilihan yang valid. Foto diunggah lewat profil jemaat setelah impor.</p>
            <input type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={handleExcelFile} aria-label="Pilih file Excel data jemaat" className="block w-full text-xs" />
            {fileName && <p>File: {fileName}</p>}
            {fileError && <p role="alert" className="text-rose-300">{fileError}</p>}
          </div>
          <div className="space-y-1 text-slate-300">
            <p>
              Tempelkan data CSV berformat: <code className="text-amber-400 font-mono text-[11px]">fullName,gender,birthDate,birthPlace,address,rayonId,categorialGroupId,phone</code>
            </p>
            <p className="text-[11px] text-slate-400">Nama, jenis kelamin, tanggal lahir (YYYY-MM-DD), dan ID rayon wajib diisi. Baris tidak lengkap akan ditolak tanpa mengarang data.</p>
          </div>

          <textarea
            rows={5}
            value={csvText}
            onChange={handleTextChange}
            placeholder="Paste teks CSV disini..."
            className="w-full p-3 bg-[#050811] border border-slate-700 rounded-xl text-white font-mono text-[11px] outline-none focus:border-amber-400"
          />

          {previewData.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-200">
                <span>Pratinjau Data ({previewData.length} baris siap diimpor):</span>
              </div>
              <div className="rounded-xl border border-slate-800 overflow-hidden max-h-40 overflow-y-auto">
                <table className="w-full text-left text-[11px] text-slate-300">
                  <thead className="bg-[#070b18] text-amber-400 border-b border-slate-800">
                    <tr>
                      <th className="p-2">Nama</th>
                      <th className="p-2">Gender</th>
                      <th className="p-2">Tgl Lahir</th>
                      <th className="p-2">Rayon</th>
                      <th className="p-2">No HP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {previewData.map((d, i) => (
                      <tr key={i}>
                        <td className="p-2 font-semibold text-white">{d.fullName}</td>
                        <td className="p-2">{d.gender}</td>
                        <td className="p-2 font-mono">{d.birthDate}</td>
                        <td className="p-2">{rayons.find((r) => r.id === d.rayonId)?.name || d.rayonId || (d as any).rayon || '-'}</td>
                        <td className="p-2 font-mono">{d.phone || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {result && (
            <div
              className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                result.failed === 0
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-200'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Hasil Impor: {result.imported} data berhasil disimpan ke database.</span>
              </div>
              {result.failed > 0 && (
                <div className="text-amber-400">
                  {result.failed} baris gagal:
                  <ul className="list-disc pl-5 mt-1 space-y-0.5 text-[11px]">
                    {result.errors.map((e, idx) => (
                      <li key={idx}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-800 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            Tutup
          </button>
          <button
            type="button"
            disabled={importing || previewData.length === 0 || !!result}
            onClick={handleStartImport}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            {importing ? 'Mengimpor...' : `Mulai Impor (${previewData.length} Data)`}
          </button>
        </div>
      </div>
    </div>
  );
};
