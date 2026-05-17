import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Clock, Bell, Activity,
  UserCheck, ClipboardList, Droplets, MessageSquare, ShieldCheck, LayoutGrid
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const STATIONS = [
  { key: 'TIEP_NHAN', label: 'BÀN TIẾP NHẬN',    color: 'blue',    hex: '#3b82f6' },
  { key: 'TU_VAN_SL', label: 'TƯ VẤN SÀNG LỌC',  color: 'emerald', hex: '#10b981' },
  { key: 'LAY_MAU',   label: 'BÀN LẤY MÁU',       color: 'red',     hex: '#ef4444' },
  { key: 'TRA_KQ',    label: 'KẾT QUẢ & TƯ VẤN',  color: 'purple',  hex: '#a855f7' },
];

function getIcon(key: string, size = 40) {
  const cls = `w-[${size}px] h-[${size}px]`;
  if (key === 'TIEP_NHAN') return <UserCheck size={size} className="text-blue-400" />;
  if (key === 'TU_VAN_SL') return <ClipboardList size={size} className="text-emerald-400" />;
  if (key === 'LAY_MAU')   return <Droplets size={size} className="text-red-400" />;
  if (key === 'TRA_KQ')    return <MessageSquare size={size} className="text-purple-400" />;
  return <Activity size={size} />;
}

export default function QueueDisplay() {
  const router = useRouter();
  const { station: stationParam } = router.query;

  const [queueStatus, setQueueStatus]     = useState<any[]>([]);
  const [clinicalStats, setClinicalStats] = useState<any>(null);
  const [lastUpdated, setLastUpdated]     = useState<string>('');

  // Determine active station from URL param
  const activeStation = STATIONS.find(s => s.key === stationParam) || null;

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [qRes, sRes] = await Promise.all([
        axios.get(`${API_URL}/clinical/queue`),
        axios.get(`${API_URL}/clinical/stats`),
      ]);
      setQueueStatus(qRes.data);
      setClinicalStats(sRes.data);
      setLastUpdated(new Date().toLocaleTimeString('vi-VN'));
    } catch (e) {
      console.error(e);
    }
  };

  const selectStation = (key: string | null) => {
    if (key) {
      router.push(`/display?station=${key}`, undefined, { shallow: true });
    } else {
      router.push('/display', undefined, { shallow: true });
    }
  };

  // ── SINGLE STATION VIEW ─────────────────────────────────────
  if (activeStation) {
    const data = queueStatus.find(q => q.station === activeStation.key);
    const number = data?.current_number || 0;
    const waiting = clinicalStats?.station_counts?.[activeStation.key] || 0;

    return (
      <div className="min-h-screen bg-[#0F172A] text-white flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex justify-between items-center px-16 py-8 border-b border-white/5">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.4)]">
              <ShieldCheck size={32} className="text-white" />
            </div>
            <div>
              <p className="text-white font-black text-xl tracking-tight">ĐIỀU PHỐI TẦM SOÁT / 2026</p>
              <p className="text-slate-500 font-bold tracking-[0.3em] uppercase text-xs mt-1">
                <Activity size={12} className="inline text-blue-500 mr-1" />
                Bệnh viện Trung ương Huế
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-5xl font-black tabular-nums tracking-tighter">{lastUpdated.split(' ')[0]}</div>
              <p className="text-blue-500 font-black uppercase tracking-widest text-xs mt-1">Thời gian thực</p>
            </div>
            {/* Station switcher */}
            <div className="flex gap-2 ml-6">
              <button
                onClick={() => selectStation(null)}
                title="Tất cả bàn"
                className="p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all"
              >
                <LayoutGrid size={20} className="text-slate-400" />
              </button>
              {STATIONS.map(s => (
                <button
                  key={s.key}
                  onClick={() => selectStation(s.key)}
                  title={s.label}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest border transition-all ${
                    s.key === activeStation.key
                      ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {s.label.split(' ')[s.label.split(' ').length - 1]}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Main - full-screen station */}
        <main className="flex-1 flex flex-col items-center justify-center px-16 pb-32 gap-8">
          <div className="flex items-center gap-6 mb-4">
            <div className="p-6 bg-white/5 rounded-[36px] border border-white/10">
              {getIcon(activeStation.key, 56)}
            </div>
            <h1 className="text-6xl font-black tracking-[0.15em] text-slate-200">
              {activeStation.label}
            </h1>
          </div>

          <p className="text-blue-500 font-black text-2xl uppercase tracking-[0.6em]">
            Số đang mời
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={number}
              initial={{ y: 60, opacity: 0, scale: 0.85 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -60, opacity: 0, scale: 1.1 }}
              transition={{ type: 'spring', damping: 14, stiffness: 180 }}
              className="text-[28rem] font-black leading-none text-white tracking-tighter tabular-nums drop-shadow-[0_0_120px_rgba(59,130,246,0.3)]"
              style={{ lineHeight: 0.85 }}
            >
              {number.toString().padStart(3, '0')}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-10 mt-8">
            <div className="flex items-center gap-3 px-8 py-5 bg-white/5 rounded-lg border border-white/5">
              <div className="w-4 h-4 bg-green-500 rounded-md animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
              <span className="text-slate-400 font-black text-lg uppercase tracking-widest">Đang phục vụ</span>
            </div>
            <div className="flex items-center gap-3 px-8 py-5 bg-white/5 rounded-lg border border-white/5">
              <Users size={24} className="text-blue-500" />
              <span className="text-slate-400 font-black text-lg uppercase tracking-widest">Đang chờ:</span>
              <span className="text-white font-black text-3xl tabular-nums">{waiting}</span>
            </div>
          </div>
        </main>

        <Footer />
        <GlobalStyle />
      </div>
    );
  }

  // ── ALL STATIONS VIEW (default) ──────────────────────────────
  return (
    <div className="min-h-screen bg-[#0F172A] text-white overflow-hidden p-16 selection:bg-blue-500">

      {/* Header */}
      <header className="flex justify-between items-center mb-10 border-b border-white/5 pb-5">
        <div className="flex items-center gap-8">
          <div className="w-24 h-24 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_60px_rgba(37,99,235,0.4)] relative">
            <ShieldCheck size={48} className="text-white" />
            <div className="absolute inset-0 rounded-xl border border-white/20" />
          </div>
          <div>
            <h1 className="text-5xl font-black tracking-tight flex items-center gap-4">
              ĐIỀU PHỐI TẦM SOÁT <span className="text-blue-500 text-3xl font-medium">/ 2026</span>
            </h1>
            <p className="text-slate-500 font-bold tracking-[0.4em] uppercase mt-2 flex items-center gap-2">
              <Activity size={16} className="text-blue-500" /> Bệnh viện Trung ương Huế
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-7xl font-black tabular-nums tracking-tighter">{lastUpdated.split(' ')[0]}</div>
            <p className="text-blue-500 font-black uppercase tracking-widest mt-2">Cập nhật thời gian thực</p>
          </div>
        </div>
      </header>

      {/* Station selector chips */}
      <div className="flex gap-3 mb-10 justify-center">
        {STATIONS.map(s => (
          <button
            key={s.key}
            onClick={() => selectStation(s.key)}
            className="px-6 py-3 bg-white/5 hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/50 rounded-lg text-sm font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all flex items-center gap-2"
          >
            {getIcon(s.key, 16)}
            {s.label}
          </button>
        ))}
      </div>

      {/* Queue Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {STATIONS.map(({ key }) => {
          const data = queueStatus.find(q => q.station === key);
          const stationCount = clinicalStats?.station_counts?.[key] || 0;
          return (
            <QueueCard
              key={key}
              label={STATIONS.find(s => s.key === key)!.label}
              icon={getIcon(key)}
              number={data?.current_number || 0}
              waitingCount={stationCount}
              onExpand={() => selectStation(key)}
            />
          );
        })}
      </div>

      <Footer />
      <GlobalStyle />
    </div>
  );
}

// ── QUEUE CARD ────────────────────────────────────────────────
function QueueCard({ label, icon, number, waitingCount, onExpand }: any) {
  return (
    <motion.div
      layout
      className="bg-white/5 border border-white/10 rounded-lg p-12 flex flex-col items-center gap-10 relative backdrop-blur-3xl overflow-hidden group shadow-2xl cursor-pointer hover:bg-white/8 transition-colors"
      onClick={onExpand}
      title="Nhấn để xem toàn màn hình"
    >
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-80" />

      <div className="flex flex-col items-center gap-6">
        <div className="p-8 bg-white/5 rounded-lg group-hover:bg-blue-600/10 transition-colors duration-500">
          {icon}
        </div>
        <h3 className="text-3xl font-black text-slate-300 tracking-[0.2em]">{label}</h3>
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="text-blue-500 font-black text-sm uppercase tracking-[0.5em]">Số đang mời</p>
        <AnimatePresence mode="wait">
          <motion.div
            key={number}
            initial={{ y: 40, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -40, opacity: 0, scale: 1.1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="text-[16rem] font-black leading-none text-white tracking-tighter drop-shadow-[0_0_80px_rgba(59,130,246,0.25)] tabular-nums"
          >
            {number.toString().padStart(3, '0')}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-full flex justify-between items-center px-12 py-8 bg-white/5 rounded-xl mt-2 border border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-4 h-4 bg-green-500 rounded-md animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
          <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Đang phục vụ</span>
        </div>
        <div className="flex items-center gap-3 text-slate-400 font-black text-sm">
          <Users size={20} className="text-blue-500" />
          <span className="uppercase tracking-widest">Chờ:</span>
          <span className="text-white text-xl">{waitingCount}</span>
        </div>
      </div>

      {/* Expand hint */}
      <div className="absolute bottom-5 right-8 opacity-0 group-hover:opacity-60 transition-opacity text-[10px] font-black tracking-widest text-slate-400 uppercase">
        Nhấn để xem toàn màn hình →
      </div>
    </motion.div>
  );
}

// ── SHARED COMPONENTS ─────────────────────────────────────────
function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-[#1E293B] border-t border-white/5 p-8 flex items-center">
      <div className="flex items-center gap-4 px-10 border-r border-white/10 whitespace-nowrap">
        <Bell size={28} className="text-orange-400 animate-bounce" />
        <span className="font-black text-2xl tracking-tighter">THÔNG BÁO</span>
      </div>
      <div className="flex-1 px-10 overflow-hidden relative">
        <div className="animate-marquee whitespace-nowrap font-bold text-2xl uppercase tracking-widest text-slate-300">
          Vui lòng chuẩn bị sẵn mã QR hoặc CCCD. Mỗi người dân sẽ có một mã số riêng biệt. Hãy theo dõi số thứ tự trên màn hình để được phục vụ tốt nhất. Chúc quý khách sức khỏe.
        </div>
      </div>
    </footer>
  );
}

function GlobalStyle() {
  return (
    <style jsx global>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
      body { font-family: 'Inter', sans-serif; background: #0F172A; cursor: none; }
      @keyframes marquee {
        0%   { transform: translateX(100%); }
        100% { transform: translateX(-100%); }
      }
      .animate-marquee {
        display: inline-block;
        animation: marquee 20s linear infinite;
      }
    `}</style>
  );
}
