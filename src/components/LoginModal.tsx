import React, { useState, useEffect } from 'react';
import {
  Lock,
  User,
  ArrowRight,
  Shield,
  AlertCircle,
  X,
  Check,
  Fingerprint,
  ScanFace,
  Sparkles,
  KeyRound,
  Trash2,
} from 'lucide-react';
import { loginApi } from '../services/api.ts';
import { auth, googleProvider } from '../services/firebase.ts';
import { signInWithPopup } from 'firebase/auth';
import type { User as UserType } from '../types/index.ts';
import {
  isWebAuthnSupported,
  isPlatformBiometricAvailable,
  getRegisteredBiometricCredential,
  registerBiometricCredential,
  authenticateWithBiometrics,
  clearRegisteredBiometricCredential,
  type StoredBiometricCredential,
} from '../utils/webauthn.ts';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [biometricMessage, setBiometricMessage] = useState('');
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [storedBiometric, setStoredBiometric] = useState<StoredBiometricCredential | null>(null);
  const [showEnrollSection, setShowEnrollSection] = useState(false);
  const [selectedEnrollRole, setSelectedEnrollRole] = useState<string>('admingereja');

  // Check biometric support and load saved credentials on open
  useEffect(() => {
    if (isOpen) {
      const supported = isWebAuthnSupported();
      setBiometricSupported(supported);
      setStoredBiometric(getRegisteredBiometricCredential());
      setError('');
      setBiometricMessage('');

      if (supported) {
        isPlatformBiometricAvailable().then((avail) => {
          if (!avail && !getRegisteredBiometricCredential()) {
            setBiometricSupported(false);
          }
        });
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // WebAuthn Biometric Login Handler (Fingerprint / Face Unlock / Touch ID)
  const handleBiometricLogin = async () => {
    setError('');
    setBiometricMessage('');
    setBiometricLoading(true);

    try {
      const res = await authenticateWithBiometrics();
      if (res.success && res.user) {
        setBiometricMessage(res.message);
        setTimeout(() => {
          onLoginSuccess(res.user!);
          onClose();
        }, 400);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err?.message || 'Gagal memverifikasi sensor sidik jari / wajah.');
    } finally {
      setBiometricLoading(false);
    }
  };

  // Register device biometrics for a church staff member
  const handleEnrollBiometrics = async (presetUser?: UserType) => {
    setError('');
    setBiometricMessage('');
    setBiometricLoading(true);

    let targetUser: UserType | null = presetUser || null;

    if (!targetUser) {
      if (selectedEnrollRole === 'superadmin') {
        targetUser = {
          id: 'u1',
          username: 'superadmin',
          name: 'Super Admin SYSJEGER',
          role: 'Super Admin',
          status: 'Aktif',
        };
      } else if (selectedEnrollRole === 'admingereja') {
        targetUser = {
          id: 'u2',
          username: 'admingereja',
          name: 'Dkn. Elisabeth Lopo',
          role: 'Admin Gereja',
          status: 'Aktif',
        };
      } else if (selectedEnrollRole === 'pendeta') {
        targetUser = {
          id: 'u3',
          username: 'pendeta',
          name: 'Pdt. Sonya W. Isu, S.Th',
          role: 'Ketua Majelis/Pendeta',
          status: 'Aktif',
        };
      } else {
        targetUser = {
          id: 'u4',
          username: 'majelisrayon1',
          name: 'Pnt. Yulius Banamtuan',
          role: 'Majelis/Rayon',
          status: 'Aktif',
        };
      }
    }

    try {
      const res = await registerBiometricCredential(targetUser);
      if (res.success) {
        setStoredBiometric(getRegisteredBiometricCredential());
        setBiometricMessage(res.message);
        setShowEnrollSection(false);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err?.message || 'Pendaftaran biometrik gagal');
    } finally {
      setBiometricLoading(false);
    }
  };

  const handleRemoveBiometric = () => {
    clearRegisteredBiometricCredential();
    setStoredBiometric(null);
    setBiometricMessage('Pendaftaran biometrik dihapus dari perangkat ini.');
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const isAdminEmail = fbUser.email === 'aprryviken@gmail.com';
      const userObj: UserType = {
        id: fbUser.uid,
        username: fbUser.email?.split('@')[0] || 'google_user',
        name: fbUser.displayName || fbUser.email || 'Admin Gereja',
        role: isAdminEmail ? 'Super Admin' : 'Admin Gereja',
        email: fbUser.email || undefined,
        phone: fbUser.phoneNumber || undefined,
        status: 'Aktif',
      };
      onLoginSuccess(userObj);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal masuk menggunakan Google Firebase');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginApi(username, password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
        onClose();
      } else {
        setError(res.message || 'Nama pengguna atau kata sandi tidak valid');
      }
    } catch (err: any) {
      setError('Gagal terhubung ke server autentikasi');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0b1226] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-b from-[#131d3b] to-[#0b1226] border-b border-amber-500/20 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 mx-auto mb-3 rounded-full border-2 border-amber-400/60 overflow-hidden bg-slate-900 shadow-lg">
            <img
              src="/src/assets/images/regenerated_image_1792510154483.png"
              alt="GMIT Betel Fuimelang"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <h3 className="text-lg font-bold text-amber-300">
            Masuk Sistem SYSJEGER V2.0
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            GMIT BETEL FUIMELANG · SISTEM INFORMASI GEREJA
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-[11px] text-amber-200/90 leading-relaxed">
            <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Akses khusus Majelis Jemaat & Administrator resmi GMIT Betel Fuimelang. Masuk menggunakan biometrik sensor perangkat atau akun terdaftar.
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {biometricMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{biometricMessage}</span>
            </div>
          )}

          {/* WebAuthn Biometric Section */}
          {biometricSupported && (
            <div className="space-y-3">
              {storedBiometric ? (
                /* Registered Biometric Quick Unlock */
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-400/20 to-amber-500/15 border border-amber-400/50 shadow-lg shadow-amber-500/5 text-slate-100">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-md bg-amber-400/20 text-amber-300">
                        <Fingerprint className="w-4 h-4 text-amber-300 animate-pulse" />
                      </span>
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <span>Biometrik WebAuthn Aktif</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                          Tersedia
                        </span>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveBiometric}
                      className="text-[11px] text-slate-400 hover:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                      title="Hapus pendaftaran biometrik dari perangkat ini"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleBiometricLogin}
                    disabled={loading || biometricLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1 rounded bg-black/10">
                        <Fingerprint className={`w-4 h-4 ${biometricLoading ? 'animate-spin' : ''}`} />
                      </div>
                      <div className="text-left">
                        <div className="leading-tight">
                          {biometricLoading ? 'Memindai Sensor Biometrik...' : 'Buka dengan Sidik Jari / Face ID'}
                        </div>
                        <div className="text-[10px] text-slate-900/80 font-normal">
                          {storedBiometric.user.name} ({storedBiometric.user.role})
                        </div>
                      </div>
                    </div>
                    <ScanFace className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              ) : (
                /* Enrollment helper when device supports WebAuthn but no credential saved yet */
                <div className="rounded-2xl bg-[#070c1b] border border-amber-500/25 p-3 text-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-300 font-semibold">
                      <Fingerprint className="w-4 h-4 text-amber-400" />
                      <span>Masuk Cepat Sidik Jari / Wajah</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-medium">
                      WebAuthn
                    </span>
                  </div>

                  {!showEnrollSection ? (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        Buka data gereja lebih cepat tanpa perlu ketik sandi berulang kali.
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowEnrollSection(true)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-[11px] whitespace-nowrap transition-colors cursor-pointer"
                      >
                        + Daftarkan
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-1 border-t border-slate-800">
                      <div className="text-[11px] text-slate-300 font-medium">
                        Pilih profil presbiter untuk didaftarkan ke biometrik perangkat ini:
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedEnrollRole('admingereja')}
                          className={`p-2 rounded-lg text-left text-[11px] border transition-all cursor-pointer ${
                            selectedEnrollRole === 'admingereja'
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div>Admin Gereja</div>
                          <div className="text-[10px] opacity-75">Dkn. Elisabeth (TU)</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedEnrollRole('pendeta')}
                          className={`p-2 rounded-lg text-left text-[11px] border transition-all cursor-pointer ${
                            selectedEnrollRole === 'pendeta'
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div>Ketua Majelis</div>
                          <div className="text-[10px] opacity-75">Pdt. Sonya W. Isu</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedEnrollRole('superadmin')}
                          className={`p-2 rounded-lg text-left text-[11px] border transition-all cursor-pointer ${
                            selectedEnrollRole === 'superadmin'
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div>Super Admin</div>
                          <div className="text-[10px] opacity-75">Full Control</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedEnrollRole('majelisrayon1')}
                          className={`p-2 rounded-lg text-left text-[11px] border transition-all cursor-pointer ${
                            selectedEnrollRole === 'majelisrayon1'
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div>Majelis Rayon 1</div>
                          <div className="text-[10px] opacity-75">Pnt. Yulius B.</div>
                        </button>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleEnrollBiometrics()}
                          disabled={biometricLoading}
                          className="flex-1 py-2 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Fingerprint className={`w-3.5 h-3.5 ${biometricLoading ? 'animate-spin' : ''}`} />
                          <span>{biometricLoading ? 'Menyentuh Sensor...' : 'Pindai Sidik Jari / Wajah Sekarang'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowEnrollSection(false)}
                          className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs transition-colors cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-[#0b1226] px-2 text-slate-500 font-semibold">
                    atau gunakan kata sandi
                  </span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nama Pengguna (Username)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Contoh: admingereja"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#070c1b] border border-slate-700 focus:border-amber-400 rounded-xl text-white outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#070c1b] border border-slate-700 focus:border-amber-400 rounded-xl text-white outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Memverifikasi...</span>
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-[#0b1226] px-2 text-slate-500 font-semibold">atau autentikasi</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/40 text-slate-200 font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
                <path fill="#FBBC05" d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.4s.2-1.7.4-2.4L1.9 7C.7 9.4 0 12 0 14.7s.7 5.3 1.9 7.7l3.7-2.7z"/>
                <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 16.4C3.7 20.2 7.5 23.5 12 23.5z"/>
              </svg>
              <span>Masuk dengan Akun Google (Firebase)</span>
            </button>
          </form>

          {/* Quick Preset Selector */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
              Pilih Akun Cepat Pengujian:
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickSelect('superadmin', 'admin123')}
                className="p-2 text-left rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white"
              >
                <div className="font-bold text-amber-400">Super Admin</div>
                <div className="text-[10px] text-slate-400">admin / full control</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect('admingereja', 'admin123')}
                className="p-2 text-left rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white"
              >
                <div className="font-bold text-amber-400">Admin Gereja</div>
                <div className="text-[10px] text-slate-400">Tata Usaha Jemaat</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect('pendeta', 'pendeta123')}
                className="p-2 text-left rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white"
              >
                <div className="font-bold text-amber-400">Ketua Majelis</div>
                <div className="text-[10px] text-slate-400">Pdt. Sonya W. Isu, S.Th</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect('majelisrayon1', 'rayon123')}
                className="p-2 text-left rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white"
              >
                <div className="font-bold text-amber-400">Majelis Rayon 1</div>
                <div className="text-[10px] text-slate-400">Pnt. Yulius B.</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
