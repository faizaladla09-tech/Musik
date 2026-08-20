'use client';

import Image from 'next/image';
import { ArrowLeft, Globe, Instagram, Twitter, Coffee, Download, Tv, CheckCircle2, Radio, BatteryCharging, Sparkles, Sliders, Moon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { usePlayerStore } from '@/lib/store';
import { SleepTimerModal } from '@/components/SleepTimerModal';
import { useState } from 'react';

export default function DeveloperPage() {
  const router = useRouter();
  const { installPWA } = usePWAInstall();
  const backgroundPlayEnabled = usePlayerStore((state) => state.backgroundPlayEnabled);
  const setBackgroundPlayEnabled = usePlayerStore((state) => state.setBackgroundPlayEnabled);
  const sleepTimerTarget = usePlayerStore((state) => state.sleepTimerTarget);
  const sleepTimerEndOfTrack = usePlayerStore((state) => state.sleepTimerEndOfTrack);
  const clearSleepTimer = usePlayerStore((state) => state.clearSleepTimer);
  const [showSleepTimerModal, setShowSleepTimerModal] = useState(false);

  return (
    <main className="min-h-screen pb-32">
      <div className="sticky top-0 z-10 bg-black/50 backdrop-blur-md pt-6 pb-4 px-4 flex items-center gap-4">
        <button 
          onClick={() => router.back()} 
          className="w-10 h-10 rounded-full liquid-glass-icon flex items-center justify-center text-white hover:scale-105 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-white">Tentang & Pengaturan</h1>
      </div>

      <div className="px-5 pt-4 max-w-lg mx-auto space-y-6">
        {/* Playback Settings Section */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Sliders className="w-4 h-4 text-[#81B29A]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white/70">Pengaturan Pemutaran</h2>
          </div>

          <div className="liquid-glass rounded-3xl p-5 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3.5">
                <div className="w-11 h-11 rounded-2xl liquid-glass-icon flex items-center justify-center text-[#81B29A] shrink-0 mt-0.5">
                  <Radio className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Play Latar Belakang</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${backgroundPlayEnabled ? 'bg-[#81B29A]/20 text-[#81B29A] border border-[#81B29A]/30' : 'bg-white/10 text-white/50 border border-white/10'}`}>
                      {backgroundPlayEnabled ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Izinkan musik tetap berputar saat layar HP terkunci atau saat Anda membuka aplikasi lain.
                  </p>
                </div>
              </div>

              {/* Custom Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={backgroundPlayEnabled}
                onClick={() => setBackgroundPlayEnabled(!backgroundPlayEnabled)}
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none ${
                  backgroundPlayEnabled 
                    ? 'bg-[#81B29A] shadow-md' 
                    : 'bg-white/15'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-300 ease-in-out ${
                    backgroundPlayEnabled ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center gap-2 text-[11px] text-white/50">
              <Sparkles className="w-3.5 h-3.5 text-[#81B29A] shrink-0" />
              <span>Didukung oleh MediaSession API dan background audio engine.</span>
            </div>
          </div>

          {/* Sleep Timer Setting Card */}
          <div className="liquid-glass rounded-3xl p-5 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3.5">
                <div className="w-11 h-11 rounded-2xl liquid-glass-icon flex items-center justify-center text-[#81B29A] shrink-0 mt-0.5">
                  <Moon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Timer Tidur (Sleep Timer)</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${(sleepTimerTarget || sleepTimerEndOfTrack) ? 'bg-[#81B29A]/20 text-[#81B29A] border border-[#81B29A]/30' : 'bg-white/10 text-white/50 border border-white/10'}`}>
                      {(sleepTimerTarget || sleepTimerEndOfTrack) ? 'Aktif' : 'Mati'}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Hentikan musik secara otomatis setelah durasi tertentu atau saat lagu yang sedang diputar selesai.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSleepTimerModal(true)}
                className="px-3.5 py-1.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-all shrink-0 self-center"
              >
                {(sleepTimerTarget || sleepTimerEndOfTrack) ? 'Ubah' : 'Atur'}
              </button>
            </div>
          </div>

          {/* Dynamic Island Feature Card */}
          <div className="liquid-glass rounded-3xl p-5 border border-white/10 shadow-xl space-y-3">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl liquid-glass-icon flex items-center justify-center text-white shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5 text-[#81B29A]" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">Dynamic Island Pop-Up</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[#81B29A]/20 text-[#81B29A] border border-[#81B29A]/30">
                    Aktif
                  </span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">
                  Pill interaktif melayang di bagian atas layar bergaya Dynamic Island iPhone. Ketuk untuk memperluas kontrol instan, putar/jeda, ganti lagu, dan atur durasi.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Lead Developer Section */}
        <section className="space-y-3 pt-2">
          <div className="flex items-center gap-2 px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#81B29A]">Lead Developer</h2>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center space-y-5"
          >
            {/* Blob Avatar */}
            <div className="relative w-40 h-40 mb-1">
              <div className="absolute inset-0 bg-[#1A2E23] rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%] animate-[blob_8s_ease-in-out_infinite] scale-110" />
              <div className="absolute inset-0 bg-[#224032] rounded-[60%_40%_30%_70%_/_50%_60%_40%_50%] animate-[blob_8s_ease-in-out_infinite_reverse] scale-105" />
              <div className="relative w-full h-full rounded-[50%_50%_40%_60%_/_60%_40%_50%_50%] overflow-hidden border-2 border-[#81B29A]/30 z-10 shadow-2xl">
                <Image 
                  src="https://f.top4top.io/p_3733w0g4e0.jpg" 
                  alt="SANN404 FORUM" 
                  fill 
                  sizes="160px"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <h2 className="text-2xl font-bold text-white">SANN404 FORUM</h2>
              <CheckCircle2 className="w-5 h-5 text-blue-400 fill-blue-400/20" />
            </div>

            <p className="text-white/60 text-xs sm:text-sm leading-relaxed max-w-sm">
              <strong className="text-white font-semibold">Musicfly</strong> adalah platform streaming musik modern gratis tanpa iklan. Nikmati jutaan lagu, buat daftar putar kustom, dan temukan musik baru setiap hari dengan visual liquid glass dan audio premium tanpa batasan.
            </p>

            {/* Social Links Grid */}
            <div className="grid grid-cols-4 gap-2.5 w-full">
              <a href="#" className="flex flex-col items-center justify-center gap-2 liquid-glass-subtle hover:bg-white/10 p-3.5 rounded-2xl transition-all group">
                <Globe className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
                <span className="text-[10px] text-white/70 font-medium">Website</span>
              </a>
              <a href="https://whatsapp.com/channel/0029Vb6ukqnHQbS4mKP0j80L" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-2 liquid-glass-subtle hover:bg-white/10 p-3.5 rounded-2xl transition-all group">
                <Tv className="w-5 h-5 text-[#81B29A] group-hover:scale-110 transition-transform" />
                <span className="text-[10px] text-white/70 font-medium">Saluran</span>
              </a>
              <a href="#" className="flex flex-col items-center justify-center gap-2 liquid-glass-subtle hover:bg-white/10 p-3.5 rounded-2xl transition-all group">
                <Twitter className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
                <span className="text-[10px] text-white/70 font-medium">X</span>
              </a>
              <a href="#" className="flex flex-col items-center justify-center gap-2 liquid-glass-subtle hover:bg-white/10 p-3.5 rounded-2xl transition-all group">
                <Instagram className="w-5 h-5 text-pink-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] text-white/70 font-medium">Instagram</span>
              </a>
            </div>

            {/* Buy me a coffee */}
            <a 
              href="https://saweria.co/sannnforums"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-4 liquid-glass hover:bg-white/10 p-4 rounded-3xl transition-all group border border-white/10 shadow-lg"
            >
              <div className="w-12 h-12 rounded-2xl liquid-glass-green flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Coffee className="w-6 h-6 text-zinc-950" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="text-white font-bold text-sm">Like what I do?</div>
                <div className="text-white/60 text-xs">Buy me a coffee / Dukung Pengembang</div>
              </div>
            </a>

            {/* Download APK / Install PWA */}
            <button 
              onClick={installPWA}
              className="w-full flex items-center justify-center gap-3 bg-white text-zinc-950 font-bold py-3.5 px-6 rounded-2xl hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl text-sm"
            >
              <Download className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
              <span>Download APK / Pasang App</span>
            </button>
          </motion.div>
        </section>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0%, 100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
          34% { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; }
          67% { border-radius: 100% 60% 60% 100% / 100% 100% 60% 60%; }
        }
      `}</style>

      {/* Sleep Timer Modal */}
      <SleepTimerModal
        isOpen={showSleepTimerModal}
        onClose={() => setShowSleepTimerModal(false)}
      />
    </main>
  );
}
