import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
const Scanner = dynamic(() => import('../../components/clinical/Scanner'), { ssr: false });
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, CheckCircle, XCircle, Clock, 
  Search, RefreshCw, QrCode, ClipboardList,
  Droplets, MessageSquare, ChevronRight, Bell,
  UserCheck, AlertCircle, Save, ArrowLeft, X,
  ChevronDown, HelpCircle, Activity, Zap, LogOut,
  Fingerprint, MapPin, Heart, Info, LayoutDashboard
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const STATION_MAP: Record<string, { label: string; status: string; nextStatus: string; icon: React.ReactNode }> = {
  clinical_reception: { label: 'Bàn Tiếp nhận', status: 'DA_XAC_NHAN', nextStatus: 'DA_TIEP_NHAN', icon: <UserCheck/> },
  clinical_screening: { label: 'Khám sàng lọc & Khảo sát', status: 'DA_TIEP_NHAN', nextStatus: 'CHO_XET_NGHIEM', icon: <ClipboardList/> },
  clinical_lab: { label: 'Xét nghiệm & Siêu âm', status: 'CHO_XET_NGHIEM', nextStatus: 'CHO_KET_QUA', icon: <Droplets/> },
  clinical_consult: { label: 'Tư vấn & Trả KQ', status: 'CHO_KET_QUA', nextStatus: 'HOAN_THANH', icon: <MessageSquare/> },
};

const STATION_TO_QUEUE_KEY: Record<string, string> = {
  clinical_reception: 'TIEP_NHAN',
  clinical_screening: 'TU_VAN_SL',
  clinical_lab: 'LAY_MAU',
  clinical_consult: 'TRA_KQ',
};

export default function ClinicalDashboard() {
  const [activeStation, setActiveStation] = useState('clinical_reception');
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [queueStatus, setQueueStatus] = useState<any[]>([]);
  const [clinicalStats, setClinicalStats] = useState<any>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [manualNumber, setManualNumber] = useState('');
  const [role, setRole] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  const router = useRouter();
  const [username, setUsername] = useState('Clinical Staff');

  const allowedStations = role === 'SUPERADMIN'
    ? Object.keys(STATION_MAP)
    : Object.keys(STATION_MAP).filter(s => userPermissions.includes(s));

  const currentStation = STATION_MAP[activeStation] || STATION_MAP.clinical_reception;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedRole = localStorage.getItem('role') || '';
    const savedPerms = JSON.parse(localStorage.getItem('permissions') || '[]');
    const savedUsername = localStorage.getItem('username') || 'Nhân viên Lâm sàng';
    if (!token || (savedRole !== 'SUPERADMIN' && savedRole !== 'CLINICAL')) {
      router.push('/login');
      return;
    }
    setRole(savedRole);
    setUserPermissions(savedPerms);
    setUsername(savedUsername);

    const firstAllowed = savedRole === 'SUPERADMIN'
      ? 'clinical_reception'
      : Object.keys(STATION_MAP).find(s => savedPerms.includes(s)) || 'clinical_reception';
    setActiveStation(firstAllowed);
  }, []);

  useEffect(() => {
    if (activeStation && role) {
      fetchData();
    }
  }, [activeStation, role]);

  useEffect(() => {
    if (!role) return;
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [activeStation, role]);

  useEffect(() => {
    const queueKey = STATION_TO_QUEUE_KEY[activeStation];
    const q = queueStatus.find(item => item.station === queueKey);
    if (q) setManualNumber(String(q.current_number));
  }, [queueStatus, activeStation]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [regRes, queueRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/clinical/registrations?status=${currentStation.status}`, config),
        axios.get(`${API_URL}/clinical/queue`, config),
        axios.get(`${API_URL}/clinical/stats`, config)
      ]);
      setRegistrations(regRes.data);
      setQueueStatus(queueRes.data);
      setClinicalStats(statsRes.data);
      const queueKey = STATION_TO_QUEUE_KEY[activeStation];
      const currentQ = queueRes.data.find((q: any) => q.station === queueKey);
      if (currentQ) setManualNumber(String(currentQ.current_number));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, nextStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/clinical/status/${id}?new_status=${nextStatus}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast('Đã cập nhật tiến độ bệnh nhân');
      setSelectedPatient(null);
      fetchData();
    } catch (e) {
      setToast('Lỗi khi cập nhật');
    }
  };

  const handleCallNext = async (number?: number) => {
    const queueKey = STATION_TO_QUEUE_KEY[activeStation];
    const currentQ = queueStatus.find(q => q.station === queueKey);
    const nextNumber = number ?? (currentQ?.current_number || 0) + 1;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/clinical/queue/call`, {
        station: queueKey,
        current_number: nextNumber
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast(`Đã mời số ${nextNumber}`);
      setManualNumber(String(nextNumber));
      fetchData();
    } catch (e) {
      setToast('Lỗi hàng đợi');
    }
  };

  const handleScanMock = async (scannedText: string) => {
    let cccd = scannedText.trim();
    try {
      const data = JSON.parse(scannedText);
      if (data.cccd) cccd = data.cccd;
    } catch (e) {}
    if (cccd.includes('|')) {
      const parts = cccd.split('|');
      if (parts[0] && parts[0].length >= 9) cccd = parts[0];
    }
    if (!cccd) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/clinical/patient/${cccd}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedPatient(response.data);
      setToast(`Đã tìm thấy bệnh nhân: ${response.data.full_name}`);
    } catch (err) {
      setToast('Mã định danh hoặc CCCD không tồn tại trên hệ thống');
    }
  };

  const switchStation = (key: string) => {
    setActiveStation(key);
    setSelectedPatient(null);
    setLoading(true);
    const queueKey = STATION_TO_QUEUE_KEY[key];
    const q = queueStatus.find(item => item.station === queueKey);
    setManualNumber(String(q?.current_number || ''));
  };

  if (loading && !clinicalStats && !role) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-[#1E293B]">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -100, opacity: 0 }} className="fixed top-4 right-4 z-[100] bg-[#0067b8] text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-4 border border-blue-500">
             <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"><Bell size={18} /></div>
             <p className="font-bold text-[14px]">{toast}</p>
             <button onClick={() => setToast(null)} className="p-1 hover:bg-white/10 rounded-md"><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <aside className="w-64 bg-white border-r border-slate-200 fixed h-full z-40 flex flex-col shadow-sm">
        <div className="p-6 space-y-10 flex-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <Activity size={20} className="text-white" />
            </div>
            <div>
              <span className="text-[15px] font-bold tracking-tight block leading-none">Hệ thống Lâm sàng</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">BV Trung ương Huế</span>
            </div>
          </div>
          <nav className="space-y-1">
            {allowedStations.map(key => {
              const s = STATION_MAP[key];
              return (
                <NavIcon
                  key={key}
                  icon={React.cloneElement(s.icon as React.ReactElement, { size: 18 })}
                  label={s.label}
                  active={activeStation === key}
                  onClick={() => switchStation(key)}
                />
              );
            })}
          </nav>
        </div>
        <div className="p-6 border-t border-slate-100 space-y-4">
          <div className="px-4 py-3 bg-slate-50 rounded-lg">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nhân viên Clinical</p>
             <p className="text-[13px] font-bold text-slate-700 truncate">{username}</p>
          </div>
          <button onClick={() => router.push('/login')} className="w-full flex items-center justify-center gap-2 py-3 text-[12px] font-bold text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-all">
            <LogOut size={16} /> Thoát
          </button>
        </div>
      </aside>

      <main className="ml-64 flex-1 p-8">
        <header className="flex justify-between items-center mb-10">
          <div className="space-y-1">
             <h2 className="text-2xl font-bold tracking-tight text-[#121C2D]">
               {currentStation.label}
             </h2>
             <p className="text-[12px] text-slate-400 font-medium italic">Hệ thống quản lý hàng đợi và tiến trình Lâm sàng</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-1 shadow-sm">
               <input
                 type="number"
                 min={1}
                 value={manualNumber}
                 onChange={e => setManualNumber(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handleCallNext(parseInt(manualNumber) || 1)}
                 className="w-20 text-center text-lg font-black outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                 placeholder="Số"
               />
             </div>
             <button onClick={() => handleCallNext(parseInt(manualNumber) || 1)} className="flex items-center gap-2 px-6 py-3 bg-[#0067b8] text-white rounded-lg font-black text-[13px] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95">
               <Bell size={18} className="animate-pulse" /> MỜI
             </button>
             <button onClick={() => {
               const currentQ = queueStatus.find(q => q.station === STATION_TO_QUEUE_KEY[activeStation]);
               handleCallNext((currentQ?.current_number || 0) + 1);
             }} className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-600 rounded-lg font-black text-[12px] hover:bg-slate-50 transition-all shadow-sm">
               KẾ TIẾP <ChevronRight size={16} />
             </button>
             <button onClick={fetchData} className="p-3 bg-white border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 transition-all shadow-sm">
               <RefreshCw size={18} />
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
           <StatCard label="Đang đợi tại bàn" value={registrations.length} color="border-blue-100 text-blue-600" />
           <StatCard label="Số đang gọi" value={queueStatus.find(q=>q.station===STATION_TO_QUEUE_KEY[activeStation])?.current_number || 0} color="border-orange-100 text-orange-600" />
           <StatCard label="Đang trong quy trình" value={clinicalStats?.in_progress || 0} color="border-purple-100 text-purple-600" />
           <StatCard label="Đã hoàn thành" value={clinicalStats?.completed || 0} color="border-green-100 text-green-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-8">
              <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -mr-10 -mt-10 opacity-50"></div>
                 <div className="flex items-center justify-between mb-8">
                   <h3 className="font-bold text-lg flex items-center gap-3"><QrCode className="text-blue-600" /> Nhận diện Bệnh nhân</h3>
                 </div>
                 <div className="max-w-md mx-auto aspect-square bg-[#0F172A] rounded-xl relative overflow-hidden flex flex-col items-center justify-center gap-6 border-4 border-slate-100 shadow-inner">
                   {isScannerActive ? (
                     <div className="w-full h-full relative">
                       <Scanner onScanSuccess={(text) => { handleScanMock(text); setIsScannerActive(false); }} />
                       <button onClick={() => setIsScannerActive(false)} className="absolute top-6 right-6 z-20 p-3 bg-black/60 text-white rounded-md hover:bg-black/80 transition-all backdrop-blur-md border border-white/10">
                         <XCircle size={28} />
                       </button>
                     </div>
                   ) : (
                     <>
                       <div className="w-56 h-56 border-2 border-blue-500/30 rounded-xl relative flex items-center justify-center">
                          <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1 rounded-tl-2xl"></div>
                          <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1 rounded-tr-2xl"></div>
                          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1 rounded-bl-2xl"></div>
                          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1 rounded-br-2xl"></div>
                          <QrCode size={80} className="text-slate-800 opacity-20" />
                          <motion.div animate={{ top: ['10%', '90%', '10%'] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute left-4 right-4 h-1 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,1)] rounded-md" />
                       </div>
                       <div className="text-center space-y-4 px-10">
                          <button onClick={() => setIsScannerActive(true)} className="px-10 py-5 bg-[#0067b8] text-white rounded-lg font-black text-[13px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all active:translate-y-0">
                             KÍCH HOẠT CAMERA
                          </button>
                          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] leading-loose">Quét mã trên Digital Badge<br/>hoặc thẻ CCCD vật lý</p>
                       </div>
                     </>
                   )}
                   <div className={`absolute bottom-10 w-full max-w-[280px] px-4 z-20 transition-all duration-500 ${isScannerActive ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
                     <div className="relative">
                         <input onKeyDown={(e) => e.key === 'Enter' && handleScanMock(e.currentTarget.value)} placeholder="Hoặc nhập CCCD..." className={`w-full border rounded-lg px-6 py-4 text-sm font-bold outline-none shadow-sm transition-all ${isScannerActive ? 'bg-white/10 border-white/20 text-white placeholder:text-white/30 backdrop-blur-md' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-300'}`} />
                         <Search className={`absolute right-6 top-1/2 -translate-y-1/2 ${isScannerActive ? 'text-white/30' : 'text-slate-300'}`} size={18} />
                     </div>
                   </div>
                 </div>
              </section>

              <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                 <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                   <h3 className="font-bold text-lg flex items-center gap-3"><Users className="text-blue-600" /> Bệnh nhân chờ tại bàn</h3>
                   <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm tên, STT..." className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-blue-500 w-48" />
                   </div>
                 </div>
                 <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="bg-slate-50/50">
                           <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">STT</th>
                           <th className="px-4 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Bệnh nhân</th>
                           <th className="px-4 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Khung giờ hẹn</th>
                           <th className="px-8 py-4 text-right text-[10px] font-black uppercase text-slate-400 tracking-wider">Thao tác</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {registrations.filter(r => r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || String(r.registration_number).includes(searchTerm)).map((reg) => (
                           <tr key={reg.id} className="hover:bg-blue-50/20 transition-all cursor-pointer" onClick={() => setSelectedPatient(reg)}>
                             <td className="px-8 py-4">
                               <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center font-black text-xs text-slate-600 border border-slate-200">
                                  {reg.registration_number?.toString().padStart(3, '0')}
                               </div>
                             </td>
                             <td className="px-4 py-4">
                               <p className="font-bold text-sm text-[#121C2D]">{reg.full_name}</p>
                               <p className="text-[10px] text-slate-400 font-bold uppercase">{reg.phone}</p>
                             </td>
                             <td className="px-4 py-4">
                               <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600">
                                  <Clock size={12} /> {reg.appointment_slot}
                               </div>
                             </td>
                             <td className="px-8 py-4 text-right">
                               <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><ChevronRight size={16}/></button>
                             </td>
                           </tr>
                         ))}
                         {registrations.length === 0 && (
                           <tr>
                             <td colSpan={4} className="py-20 text-center">
                               <div className="flex flex-col items-center gap-3 opacity-30">
                                  <UserCheck size={48} />
                                  <p className="text-sm font-bold uppercase tracking-widest">Không có bệnh nhân chờ</p>
                               </div>
                             </td>
                           </tr>
                         )}
                      </tbody>
                   </table>
                 </div>
              </section>
           </div>

           <div className="space-y-8">
              <AnimatePresence mode="wait">
                 {selectedPatient ? (
                   <motion.section initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden sticky top-8">
                      <div className="p-8 bg-[#0067b8] text-white">
                         <div className="flex justify-between items-start mb-6">
                           <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center font-black text-2xl">
                              #{selectedPatient.registration_number?.toString().padStart(3, '0')}
                           </div>
                           <button onClick={() => setSelectedPatient(null)} className="p-2 hover:bg-white/10 rounded-md transition-colors"><XCircle size={24}/></button>
                         </div>
                         <h4 className="text-xl font-bold mb-1">{selectedPatient.full_name}</h4>
                         <p className="text-blue-100 text-[11px] font-bold flex items-center gap-2 uppercase tracking-widest"><Fingerprint size={14}/> CCCD: {selectedPatient.cccd}</p>
                      </div>

                      <div className="p-8 space-y-6">
                         <div className="space-y-4">
                           <InfoRow label="Ngày sinh" value={new Date(selectedPatient.dob).toLocaleDateString('vi-VN')} />
                           <InfoRow label="SĐT" value={selectedPatient.phone} />
                           <InfoRow label="Địa chỉ" value={`${selectedPatient.ward}, ${selectedPatient.district}`} />
                         </div>

                         <div className="pt-6 border-t border-slate-100 space-y-4">
                           <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hành động Onsite</h5>

                           {activeStation === 'clinical_reception' && (
                             <ActionButton icon={<CheckCircle/>} label="XÁC NHẬN TIẾP NHẬN" color="bg-green-600 hover:bg-green-700" onClick={() => handleUpdateStatus(selectedPatient.id, 'DA_TIEP_NHAN')} />
                           )}

                           {activeStation === 'clinical_screening' && (
                             <ActionButton icon={<ClipboardList/>} label="THỰC HIỆN BẢNG HỎI" color="bg-[#0067b8] hover:bg-blue-700" onClick={() => router.push(`/clinical/survey?id=${selectedPatient.id}`)} />
                           )}

                           {activeStation === 'clinical_lab' && (
                             <ActionButton icon={<Droplets/>} label="XÁC NHẬN LẤY MÁU" color="bg-red-500 hover:bg-red-600" onClick={() => handleUpdateStatus(selectedPatient.id, 'CHO_KET_QUA')} />
                           )}

                           {activeStation === 'clinical_consult' && (
                             <ActionButton icon={<MessageSquare/>} label="HOÀN TẤT TƯ VẤN" color="bg-purple-600 hover:bg-purple-700" onClick={() => handleUpdateStatus(selectedPatient.id, 'HOAN_THANH')} />
                           )}

                           <div className="bg-slate-50 p-4 rounded-lg flex gap-3">
                              <AlertCircle size={16} className="text-slate-400 flex-shrink-0" />
                              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                 Kiểm tra kỹ thông tin bệnh nhân trước khi xác nhận tiến trình.
                              </p>
                           </div>
                         </div>
                      </div>
                   </motion.section>
                 ) : (
                   <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-sm text-slate-300"><UserCheck size={32} /></div>
                      <p className="font-bold text-slate-400 text-sm uppercase tracking-widest">Chưa chọn hồ sơ</p>
                   </div>
                 )}
              </AnimatePresence>
           </div>
        </div>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        body { font-family: 'Inter', sans-serif; background: #F8FAFC; }
      `}</style>
    </div>
  );
}

function NavIcon({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 p-3.5 rounded-lg text-[13px] font-bold transition-all ${active ? 'bg-blue-50 text-[#0067b8]' : 'text-slate-500 hover:bg-slate-50'}`}>
      {icon} <span>{label}</span>
    </button>
  );
}

function StatCard({ label, value, color }: any) {
  return (
    <div className={`p-6 bg-white rounded-lg border shadow-sm ${color}`}>
       <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">{label}</p>
       <p className="text-3xl font-black tracking-tight tabular-nums">{value || 0}</p>
    </div>
  );
}

function ActionButton({ icon, label, color, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full ${color} text-white py-4 rounded-lg font-black text-sm flex items-center justify-center gap-3 shadow-lg shadow-blue-50 transition-all active:scale-95`}>
       {React.cloneElement(icon, { size: 18 })} {label}
    </button>
  );
}

function InfoRow({ label, value }: any) {
  return (
    <div className="flex justify-between items-center text-[13px]">
       <span className="font-bold text-slate-400">{label}</span>
       <span className="font-bold text-slate-700">{value}</span>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
       <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-50 border-t-[#0067b8] rounded-md animate-spin" />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Syncing Clinical Data...</p>
       </div>
    </div>
  );
}
