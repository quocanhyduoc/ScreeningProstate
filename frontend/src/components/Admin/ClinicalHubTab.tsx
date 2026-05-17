import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
   UserCheck, ClipboardList, Droplets, MessageSquare,
   QrCode, RefreshCw, ChevronRight, X, Calendar, User, FlaskConical, Award, Activity, Printer, Search
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useReactToPrint } from 'react-to-print';
import { Badge, StatusProgress } from './UIComponents';
import SurveyPrintTemplate from './SurveyPrintTemplate';

export default function ClinicalHubTab({ activeTab, API_URL, fetchData, setToast, role }: any) {
   const [qrInput, setQrInput] = useState('');
   const [scannedPatient, setScannedPatient] = useState<any>(null);
   const [loading, setLoading] = useState(false);
   const [loadingSurvey, setLoadingSurvey] = useState(false);
   const [stationSubTab, setStationSubTab] = useState<'pending' | 'completed'>('pending');
   const [searchTerm, setSearchTerm] = useState('');
   const [psaInput, setPsaInput] = useState('');
   const [ultraResult, setUltraResult] = useState('');
   const [registrations, setRegistrations] = useState<any[]>([]);
   const [selectedSurvey, setSelectedSurvey] = useState<any>(null);
   const printRef = React.useRef<HTMLDivElement>(null);
   const router = useRouter();

   const handlePrint = useReactToPrint({
      contentRef: printRef,
      documentTitle: `Phieu_Khao_Sat_${scannedPatient?.full_name || 'BN'}`,
   });

   const fetchSurveyData = async (regId: number) => {
      setLoadingSurvey(true);
      try {
         const token = localStorage.getItem('token');
         const res = await axios.get(`${API_URL}/clinical/survey/${regId}`, {
            headers: { Authorization: `Bearer ${token}` }
         });
         setSelectedSurvey(res.data);
      } catch (e) {
         console.error("No survey found", e);
         setSelectedSurvey(null);
      } finally {
         setLoadingSurvey(false);
      }
   };

    useEffect(() => {
       const hasSurvey = scannedPatient && (
          (activeTab === 'clinical_screening' && stationSubTab === 'completed') ||
          (activeTab === 'clinical_lab') ||
          (activeTab === 'clinical_consult')
       );
       
       if (hasSurvey) {
          fetchSurveyData(scannedPatient.id);
       }
    }, [scannedPatient, activeTab, stationSubTab]);

   const stationMap: any = {
      'clinical_reception': { label: 'Bàn Tiếp nhận', status: 'DA_XAC_NHAN', nextStatus: 'DA_TIEP_NHAN', icon: <UserCheck /> },
      'clinical_screening': { label: 'Khám sàng lọc', status: 'DA_TIEP_NHAN', nextStatus: 'CHO_XET_NGHIEM', icon: <ClipboardList /> },
      'clinical_lab': { label: 'Xét nghiệm & Siêu âm', status: 'CHO_XET_NGHIEM', nextStatus: 'DA_XET_NGHIEM', icon: <Droplets /> },
      'clinical_consult': { label: 'Tư vấn & Trả KQ', status: 'CHO_TU_VAN', nextStatus: 'HOAN_THANH', icon: <MessageSquare /> },
   };

   const currentStation = stationMap[activeTab] || stationMap['clinical_reception'];

   useEffect(() => {
      fetchStationData();
   }, [activeTab]);

   const fetchStationData = async () => {
      setLoading(true);
      try {
         const token = localStorage.getItem('token');
         
         let status = currentStation.status;
         if (stationSubTab === 'completed') {
            if (activeTab === 'clinical_reception') status = 'DA_TIEP_NHAN,CHO_XET_NGHIEM,DA_XET_NGHIEM,CHO_TU_VAN,HOAN_THANH';
            if (activeTab === 'clinical_screening') status = 'CHO_XET_NGHIEM,DA_XET_NGHIEM,CHO_TU_VAN,HOAN_THANH';
            if (activeTab === 'clinical_lab') status = 'DA_XET_NGHIEM,CHO_TU_VAN,HOAN_THANH';
            if (activeTab === 'clinical_consult') status = 'HOAN_THANH';
         }

         const res = await axios.get(`${API_URL}/clinical/registrations?status=${status}`, {
            headers: { Authorization: `Bearer ${token}` }
         });

         let filtered = res.data;
         if (searchTerm) {
            filtered = filtered.filter((r: any) =>
               r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               r.cccd?.includes(searchTerm) ||
               r.registration_number?.toString().includes(searchTerm)
            );
         }
         setRegistrations(filtered);
      } catch (e) {
         console.error(e);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchStationData();
   }, [activeTab, stationSubTab, searchTerm]);

   const handleScan = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!qrInput.trim()) return;
      setLoading(true);
      try {
         const token = localStorage.getItem('token');
         const res = await axios.get(`${API_URL}/clinical/patient/${qrInput.trim()}`, {
            headers: { Authorization: `Bearer ${token}` }
         });
         setScannedPatient(res.data);
         setToast("Đã tìm thấy bệnh nhân!");
         setQrInput('');
      } catch {
         setToast("Không tìm thấy bệnh nhân với mã này!");
         setScannedPatient(null);
      } finally {
         setLoading(false);
      }
   };

   const handleUpdateStatus = async (id: number, nextStatus: string) => {
      try {
         const token = localStorage.getItem('token');
         await axios.patch(`${API_URL}/clinical/status/${id}`, { status: nextStatus }, {
            headers: { Authorization: `Bearer ${token}` }
         });
         setToast("Đã cập nhật tiến độ bệnh nhân");
         setScannedPatient(null);
         fetchStationData();
         fetchData();
      } catch (e) {
         setToast("Lỗi khi cập nhật");
      }
   };

   return (
      <div className="space-y-8">
         <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  {React.cloneElement(currentStation.icon, { size: 24 })}
               </div>
               <div>
                  <h3 className="text-xl font-bold">{currentStation.label}</h3>
                  <p className="text-slate-400 text-[12px] font-medium uppercase tracking-widest">Quy trình Clinical Onsite</p>
               </div>
            </div>
            <form onSubmit={handleScan} className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
               <div className="bg-white rounded-lg flex items-center px-4 py-2 w-64 border border-slate-100 shadow-sm">
                  <QrCode size={18} className="text-slate-400 mr-2" />
                  <input autoFocus value={qrInput} onChange={e => setQrInput(e.target.value)} placeholder="Quét QR / Nhập CCCD..." className="bg-transparent border-none outline-none text-[#121C2D] font-bold w-full text-sm" />
               </div>
               <button type="submit" disabled={loading} className="px-4 py-2 bg-[#0067b8] text-white rounded-lg font-bold hover:bg-blue-700 transition-all text-xs">
                  KIỂM TRA
               </button>
            </form>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
               <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                     <div className="flex items-center gap-6">
                        <h4 className="font-bold text-sm flex items-center gap-2">Bệnh nhân ({registrations.length})</h4>

                        {(activeTab.startsWith('clinical_')) && (
                           <div className="flex bg-slate-200 p-1 rounded-lg">
                              <button
                                 onClick={() => setStationSubTab('pending')}
                                 className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${stationSubTab === 'pending' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                              >
                                 Chờ thực hiện
                              </button>
                              <button
                                 onClick={() => setStationSubTab('completed')}
                                 className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${stationSubTab === 'completed' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                              >
                                 Đã thực hiện
                              </button>
                           </div>
                        )}
                     </div>

                     <div className="flex items-center gap-3">
                        <div className="relative">
                           <input
                              value={searchTerm}
                              onChange={e => setSearchTerm(e.target.value)}
                              placeholder="Tìm tên, CCCD, STT..."
                              className="pl-8 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold w-64 outline-none focus:border-blue-500 transition-all"
                           />
                           <RefreshCw size={12} className={`absolute left-3 top-2.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                        </div>
                        <button onClick={fetchStationData} className="p-2 hover:bg-slate-200 rounded-lg transition-all text-slate-400"><RefreshCw size={14} /></button>
                     </div>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left text-[13px]">
                        <thead>
                           <tr className="border-b border-slate-50">
                              <th className="px-6 py-4 font-black uppercase text-slate-400 text-[10px]">Mã số</th>
                              <th className="px-4 py-4 font-black uppercase text-slate-400 text-[10px]">Họ và tên</th>
                              <th className="px-4 py-4 font-black uppercase text-slate-400 text-[10px]">Hẹn lúc</th>
                              <th className="px-6 py-4 text-right font-black uppercase text-slate-400 text-[10px]">Hành động</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {registrations.map(r => (
                              <tr key={r.id} className="hover:bg-slate-50 transition-all cursor-pointer" onClick={() => setScannedPatient(r)}>
                                 <td className="px-6 py-4 font-bold text-slate-400">#{r.registration_number?.toString().padStart(3, '0')}</td>
                                 <td className="px-4 py-4 font-bold">{r.full_name}</td>
                                 <td className="px-4 py-4 text-blue-600 font-bold">{r.appointment_slot}</td>
                                 <td className="px-6 py-4 text-right">
                                    <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><ChevronRight size={14} /></button>
                                 </td>
                              </tr>
                           ))}
                           {registrations.length === 0 && (
                              <tr>
                                 <td colSpan={4} className="py-12 text-center text-slate-400 font-bold italic">Không có bệnh nhân chờ tại bước này</td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>

            <div className="lg:col-span-1">
               <AnimatePresence mode="wait">
                  {scannedPatient ? (
                     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden sticky top-8">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hồ sơ lâm sàng chi tiết</span>
                           <button onClick={() => setScannedPatient(null)} className="p-2 hover:bg-slate-200 rounded-full transition-all text-slate-400"><X size={18} /></button>
                        </div>

                        <div className="p-6">
                           <div className="relative group max-w-full mx-auto mb-8">
                              <div className="absolute -inset-2 bg-blue-100/50 rounded-[15px] blur-lg opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                              <div className="relative bg-white rounded-[12px] shadow-xl border border-slate-200 text-left overflow-hidden w-full aspect-[1.586/1] flex flex-col mx-auto">
                                 <div className="bg-[#005ba1] p-3 text-white flex justify-between items-center h-[65px]">
                                    <div className="flex items-center gap-3">
                                       <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1 shadow-sm">
                                          <img src="/logo-benh-vien-trung-uong-hue-compressed.webp" alt="Logo" className="w-full h-full object-contain" />
                                       </div>
                                       <div>
                                          <p className="text-[9px] font-black leading-tight uppercase tracking-tight">Bệnh viện Trung ương Huế</p>
                                          <p className="text-[7px] font-bold text-blue-100 uppercase tracking-widest">Chương trình Sàng lọc miễn phí</p>
                                       </div>
                                    </div>
                                    <div className="text-right flex items-center gap-3">
                                       <div className="hidden sm:block">
                                          <p className="text-[6px] font-black uppercase tracking-[0.2em] opacity-60">PROSTATE</p>
                                          <p className="text-[8px] font-black tracking-tighter">2026</p>
                                       </div>
                                       <Activity size={20} className="text-blue-300 opacity-80" />
                                    </div>
                                 </div>

                                 <div className="flex-1 pt-2 pb-4 px-4 flex">
                                    <div className="flex-1 space-y-2 pt-1 pr-4 border-r border-slate-100">
                                       <div>
                                          <h3 className="text-[8px] font-black text-[#005ba1] uppercase tracking-[0.1em] mb-1.5 opacity-80">Thẻ Tầm Soát Ung Thư TTL</h3>
                                          <div className="space-y-0">
                                             <p className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">Họ và tên</p>
                                             <p className="text-[14px] font-black text-[#003d6b] uppercase leading-tight whitespace-nowrap truncate">{scannedPatient.full_name}</p>
                                          </div>
                                       </div>

                                       <div className="grid grid-cols-2 gap-2">
                                          <div className="space-y-0">
                                             <p className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">Ngày sinh</p>
                                             <p className="text-[11px] font-black text-slate-800">{new Date(scannedPatient.dob).toLocaleDateString("vi-VN")}</p>
                                          </div>
                                          <div className="space-y-0">
                                             <p className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">Số CCCD</p>
                                             <p className="text-[11px] font-black text-slate-800">{scannedPatient.cccd}</p>
                                          </div>
                                       </div>

                                       <div className="grid grid-cols-2 gap-2">
                                          <div className="space-y-0">
                                             <p className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">Mã đăng ký</p>
                                             <p className="text-[14px] font-black text-[#005ba1]">#{scannedPatient.registration_number?.toString().padStart(3, '0')}</p>
                                          </div>
                                          <div className="space-y-0">
                                             <p className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">SĐT</p>
                                             <p className="text-[11px] font-black text-slate-600">{scannedPatient.phone}</p>
                                          </div>
                                       </div>
                                    </div>

                                    <div className="w-[100px] flex flex-col items-center justify-center pt-1 pl-4">
                                       <div className="p-1 bg-white border-[1.5px] border-[#005ba1] rounded-lg shadow-sm">
                                          <QRCodeSVG
                                             value={String(scannedPatient.cccd)}
                                             size={70}
                                             level="H"
                                             includeMargin={false}
                                          />
                                       </div>
                                       <div className="mt-2 space-y-1 text-center">
                                          <p className="text-[7px] font-black text-[#005ba1] uppercase tracking-widest">CHECK-IN QR</p>
                                          <div className="px-2 py-0.5 bg-blue-50 text-[#005ba1] rounded-md text-[6px] font-black border border-blue-100 uppercase text-center flex flex-col items-center leading-tight">
                                             <span>Hẹn: {scannedPatient.appointment_slot?.split(" ")[0]}</span>
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-6">
                              <div className="space-y-3">
                                 <div className="flex items-center justify-between">
                                    <h5 className="font-black text-[10px] uppercase tracking-widest text-slate-500">Tiến độ hiện tại</h5>
                                    <Badge status={scannedPatient.status} />
                                 </div>
                                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-inner">
                                    <StatusProgress status={scannedPatient.status} />
                                 </div>
                              </div>

                              <div className="pt-2">
                                 <h5 className="font-black text-[10px] uppercase tracking-widest text-slate-500 mb-3">Thao tác nghiệp vụ</h5>
                                 <div className="space-y-3">
                                    {activeTab === 'clinical_reception' && (
                                       <button
                                          onClick={() => handleUpdateStatus(scannedPatient.id, 'DA_TIEP_NHAN')}
                                          className="w-full py-4 bg-green-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-green-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                       >
                                          <UserCheck size={18} />
                                          XÁC NHẬN TIẾP NHẬN
                                       </button>
                                    )}
                                    {activeTab === 'clinical_screening' && (
                                       <div className="space-y-3">
                                          <button
                                             onClick={() => router.push(`/clinical/survey?id=${scannedPatient.id}`)}
                                             className="w-full py-4 bg-[#0067b8] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                          >
                                             <ClipboardList size={18} />
                                             {stationSubTab === 'completed' ? 'CHỈNH SỬA KHẢO SÁT' : 'THỰC HIỆN KHẢO SÁT'}
                                          </button>
                                          {stationSubTab === 'completed' && (
                                             <button
                                                onClick={handlePrint}
                                                disabled={loadingSurvey}
                                                className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 ${loadingSurvey ? 'bg-slate-400 text-slate-200 cursor-not-allowed' : 'bg-slate-800 text-white hover:bg-slate-900 hover:-translate-y-0.5 shadow-slate-100'}`}
                                             >
                                                {loadingSurvey ? <RefreshCw className="animate-spin" size={18} /> : <Printer size={18} />}
                                                {loadingSurvey ? 'ĐANG TẢI DỮ LIỆU...' : 'IN PHIẾU KHẢO SÁT (PDF)'}
                                             </button>
                                          )}
                                       </div>
                                    )}
                                    {activeTab === 'clinical_lab' && (
                                       <div className="space-y-3">
                                          <input value={psaInput} onChange={e => setPsaInput(e.target.value)} placeholder="Giá trị PSA..." className="w-full p-4 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-sm shadow-sm" />
                                          <textarea value={ultraResult} onChange={e => setUltraResult(e.target.value)} placeholder="Ghi chú siêu âm..." className="w-full p-4 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-xs min-h-[80px] shadow-sm" />
                                          <button
                                             onClick={async () => {
                                                await handleUpdateStatus(scannedPatient.id, 'DA_XET_NGHIEM');
                                                setTimeout(() => handleUpdateStatus(scannedPatient.id, 'CHO_TU_VAN'), 500);
                                             }}
                                             className="w-full py-4 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-100 hover:bg-red-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                          >
                                             <FlaskConical size={18} />
                                             LƯU & CHUYỂN TƯ VẤN
                                          </button>
                                          <button
                                             onClick={handlePrint}
                                             disabled={loadingSurvey}
                                             className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 ${loadingSurvey ? 'bg-slate-400 text-slate-200 cursor-not-allowed' : 'bg-slate-800 text-white hover:bg-slate-900 hover:-translate-y-0.5 shadow-slate-100'}`}
                                          >
                                             {loadingSurvey ? <RefreshCw className="animate-spin" size={18} /> : <Printer size={18} />}
                                             {loadingSurvey ? 'ĐANG TẢI DỮ LIỆU...' : 'XEM PHIẾU KHẢO SÁT'}
                                          </button>
                                       </div>
                                    )}
                                    {activeTab === 'clinical_consult' && (
                                       <div className="space-y-3">
                                          <button
                                             onClick={() => handleUpdateStatus(scannedPatient.id, 'HOAN_THANH')}
                                             className="w-full py-4 bg-purple-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-purple-100 hover:bg-purple-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                          >
                                             <Award size={18} />
                                             HOÀN TẤT QUY TRÌNH
                                          </button>
                                          <button
                                             onClick={handlePrint}
                                             disabled={loadingSurvey}
                                             className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 ${loadingSurvey ? 'bg-slate-400 text-slate-200 cursor-not-allowed' : 'bg-slate-800 text-white hover:bg-slate-900 hover:-translate-y-0.5 shadow-slate-100'}`}
                                          >
                                             {loadingSurvey ? <RefreshCw className="animate-spin" size={18} /> : <Printer size={18} />}
                                             {loadingSurvey ? 'ĐANG TẢI DỮ LIỆU...' : 'XEM PHIẾU KHẢO SÁT'}
                                          </button>
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </div>
                        </div>
                     </motion.div>
                  ) : (
                     <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-10 text-center flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-slate-300 shadow-sm"><UserCheck size={24} /></div>
                        <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Chọn BN để xử lý</p>
                     </div>
                  )}
               </AnimatePresence>
            </div>
         </div>

         {/* Survey Print Template - Positioned outside viewport */}
         <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
            <SurveyPrintTemplate ref={printRef} patient={scannedPatient} survey={selectedSurvey} />
         </div>
      </div>
   );
}

