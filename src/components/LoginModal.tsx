import React, { useState } from 'react';
import { ShieldAlert, X, Eye, EyeOff, UserCheck, Key, LogIn, Sparkles } from 'lucide-react';
import { UserRole } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: 'PPL' | 'POPT', name: string, email: string) => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (cleanEmail === 'george.ppl@singkap.id' && cleanPassword === 'george123') {
      onLoginSuccess('PPL', 'George Missa, S.Si. (PPL)', 'george.ppl@singkap.id');
      onClose();
    } else if (cleanEmail === 'george.popt@singkap.id' && cleanPassword === 'george123') {
      onLoginSuccess('POPT', 'George Missa, S.Si. (POPT)', 'george.popt@singkap.id');
      onClose();
    } else {
      setError('Email atau password tidak sesuai. Silakan periksa kembali kredensial Anda.');
    }
  };

  const handleShortcutLogin = (role: 'PPL' | 'POPT') => {
    if (role === 'PPL') {
      onLoginSuccess('PPL', 'George Missa, S.Si. (PPL)', 'george.ppl@singkap.id');
    } else {
      onLoginSuccess('POPT', 'George Missa, S.Si. (POPT)', 'george.popt@singkap.id');
    }
    onClose();
  };

  return (
    <div id="login-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div 
        id="login-modal-box" 
        className="relative w-full max-w-md bg-white border border-slate-150 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner header inside the login box */}
        <div className="bg-slate-900 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-15">
            <LogIn className="w-24 h-24" />
          </div>
          
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-white"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-emerald-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 fill-slate-950" /> Secure Gate
            </span>
            <span className="text-[10px] text-slate-350 font-mono">v2.1</span>
          </div>
          
          <h3 className="text-lg font-black tracking-tight">Kredensial Petugas SINGKAP</h3>
          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
            Silakan masuk untuk mengakses hak akses advis lapangan, otorisasi verifikasi fisik atau aksi bantuan APH terkendali.
          </p>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-800 flex items-start gap-2 animate-shake">
              <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Dinas</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="nama.petugas@singkap.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-205 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/20 font-medium text-slate-800"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kata Sandi</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-205 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/20 font-medium text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-850 text-white font-extrabold py-3.5 rounded-xl text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 text-emerald-400" />
              <span>Masuk Sekarang</span>
            </button>
          </form>

          {/* Quick Demo Accounts section (Extremely professional and easy-to-test) */}
          <div className="border-t border-slate-100 pt-4 space-y-2.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">PILIH LOGIN INSTAN (EASY ACCESS DEMO) :</span>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleShortcutLogin('PPL')}
                className="p-3 text-left bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 text-emerald-950 rounded-xl transition flex flex-col justify-between hover:scale-[1.02]"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800">PPL Verifikasi</span>
                </div>
                <div className="text-[11px] font-black leading-tight text-slate-800">George Missa, S.Si.</div>
                <div className="text-[9px] font-mono text-slate-500 mt-1 font-semibold leading-normal">george.ppl@singkap.id <br /> sandi: george123</div>
              </button>

              <button
                type="button"
                onClick={() => handleShortcutLogin('POPT')}
                className="p-3 text-left bg-sky-50/50 hover:bg-sky-50 border border-sky-100 text-sky-950 rounded-xl transition flex flex-col justify-between hover:scale-[1.02]"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-sky-800">POPT Pengendali</span>
                </div>
                <div className="text-[11px] font-black leading-tight text-slate-800">George Missa, S.Si.</div>
                <div className="text-[9px] font-mono text-slate-500 mt-1 font-semibold leading-normal">george.popt@singkap.id <br /> sandi: george123</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
