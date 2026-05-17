import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
   UserCheck, ClipboardList, Droplets, MessageSquare,
   QrCode, RefreshCw, ChevronRight, X, Calendar, User, FlaskConical, Award, Activity, Printer, Search
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QRCodeSVG } from 'qrcode.react';
import { useReactToPrint } from 'react-to-print';
import { Badge, StatusProgress } from './UIComponents';
import SurveyPrintTemplate from './SurveyPrintTemplate';
import { formatDate } from '../../utils/date';
import { HOSPITAL_LOGO_BASE64 } from '../../utils/logo';

export default function ClinicalHubTab({ activeTab, API_URL, fetchData, setToast, role }: any) {
   const [qrInput, setQrInput] = useState('');
   const [showScanner, setShowScanner] = useState(false);
   const [scannedPatient, setScannedPatient] = useState<any>(null);
   const [loading, setLoading] = useState(false);
   const [loadingSurvey, setLoadingSurvey] = useState(false);
   const [stationSubTab, setStationSubTab] = useState<'pending' | 'completed'>('pending');
   const [searchTerm, setSearchTerm] = useState('');
   const [psaInput, setPsaInput] = useState('');
   const [ultraResult, setUltraResult] = useState('');
   const [savingLab, setSavingLab] = useState(false);
   const [registrations, setRegistrations] = useState<any[]>([]);
   const [selectedSurvey, setSelectedSurvey] = useState<any>(null);
   const printRef = React.useRef<HTMLDivElement>(null);
   const router = useRouter();

   const handlePrint = useReactToPrint({
      contentRef: printRef,
      documentTitle: `Phieu_Khao_Sat_${scannedPatient?.full_name || 'BN'}`,
   });

   useEffect(() => {
      let scanner: Html5QrcodeScanner | null = null;
      if (showScanner) {
         scanner = new Html5QrcodeScanner(
            "qr-reader",
            { fps: 10, qrbox: { width: 250, height: 250 }, supportedScanTypes: [0] },
            false
         );
         scanner.render(
            (decodedText) => {
               setQrInput(decodedText);
               setShowScanner(false);
               executeScan(decodedText);
            },
            (error) => {
               // Ignore continuous scan errors
            }
         );
      }
      return () => {
         if (scanner) {
            scanner.clear().catch(e => console.error("Lỗi đóng scanner:", e));
         }
      };
   }, [showScanner]);

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
        } else {
           setSelectedSurvey(null);
        }
     }, [scannedPatient, activeTab, stationSubTab]);

     useEffect(() => {
        if (scannedPatient && selectedSurvey && scannedPatient.id === selectedSurvey.registration_id) {
           setPsaInput(selectedSurvey.psa_value || '');
           setUltraResult(selectedSurvey.ultrasound_result || '');
        } else {
           setPsaInput('');
           setUltraResult('');
        }
     }, [scannedPatient, selectedSurvey]);

     const handleSaveLabResults = async () => {
        if (!scannedPatient) return;
        setSavingLab(true);
        try {
           const token = localStorage.getItem('token');
           
           // 1. Save Ultrasound
           const ultraFormData = new FormData();
           ultraFormData.append('result', ultraResult);
           await axios.post(`${API_URL}/admin/patient/${scannedPatient.id}/ultrasound`, ultraFormData, {
              headers: { 
                 Authorization: `Bearer ${token}`,
                 'Content-Type': 'multipart/form-data'
              }
           });

           // 2. Save PSA
           const psaFormData = new FormData();
           psaFormData.append('psa_value', psaInput);
           await axios.post(`${API_URL}/admin/patient/${scannedPatient.id}/psa`, psaFormData, {
              headers: { 
                 Authorization: `Bearer ${token}`,
                 'Content-Type': 'multipart/form-data'
              }
           });

           setToast(stationSubTab === 'completed' ? "Đã cập nhật kết quả xét nghiệm" : "Đã lưu và chuyển tư vấn thành công");
           
           if (stationSubTab === 'completed') {
              fetchSurveyData(scannedPatient.id);
              fetchStationData();
              fetchData();
           } else {
              setScannedPatient(null);
              fetchStationData();
              fetchData();
           }
        } catch (err) {
           console.error("Lỗi khi lưu kết quả xét nghiệm:", err);
           setToast("Lỗi khi lưu kết quả!");
        } finally {
           setSavingLab(false);
        }
     };

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

   const executeScan = async (code: string) => {
      if (!code.trim()) return;
      setLoading(true);
      try {
         const token = localStorage.getItem('token');
         const res = await axios.get(`${API_URL}/clinical/patient/${code.trim()}`, {
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

   const handleScan = async (e: React.FormEvent) => {
      e.preventDefault();
      executeScan(qrInput);
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
         <div className="bg-white rounded-xl p-4 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
               <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                  {React.cloneElement(currentStation.icon, { size: 20 })}
               </div>
               <div>
                  <h3 className="text-lg sm:text-xl font-bold">{currentStation.label}</h3>
                  <p className="text-slate-400 text-[10px] sm:text-[12px] font-medium uppercase tracking-widest">Quy trình Clinical Onsite</p>
               </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
               <button onClick={() => setShowScanner(true)} className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-900 transition-all text-xs">
                  <QrCode size={16} />
                  QUÉT CAMERA
               </button>
               <form onSubmit={handleScan} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 flex-1">
                  <div className="bg-white rounded-lg flex items-center px-3 py-2 w-full sm:w-64 border border-slate-100 shadow-sm">
                     <Search size={16} className="text-slate-400 mr-2 shrink-0" />
                     <input value={qrInput} onChange={e => setQrInput(e.target.value)} placeholder="Nhập mã QR / CCCD..." className="bg-transparent border-none outline-none text-[#121C2D] font-bold w-full text-xs sm:text-sm" />
                  </div>
                  <button type="submit" disabled={loading} className="px-3 sm:px-4 py-2 bg-[#0067b8] text-white rounded-lg font-bold hover:bg-blue-700 transition-all text-xs shrink-0 whitespace-nowrap">
                     TÌM
                  </button>
               </form>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
               <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 sm:p-6 border-b border-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-50/50 gap-4">
                     <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 w-full sm:w-auto">
                        <h4 className="font-bold text-sm flex items-center gap-2 whitespace-nowrap">Bệnh nhân ({registrations.length})</h4>

                        {(activeTab.startsWith('clinical_')) && (
                           <div className="flex bg-slate-200 p-1 rounded-lg w-full sm:w-auto">
                              <button
                                 onClick={() => setStationSubTab('pending')}
                                 className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${stationSubTab === 'pending' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                              >
                                 Chờ thực hiện
                              </button>
                              <button
                                 onClick={() => setStationSubTab('completed')}
                                 className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${stationSubTab === 'completed' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                              >
                                 Đã thực hiện
                              </button>
                           </div>
                        )}
                     </div>

                     <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                           <input
                              value={searchTerm}
                              onChange={e => setSearchTerm(e.target.value)}
                              placeholder="Tìm tên, CCCD, STT..."
                              className="pl-8 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold w-full sm:w-64 outline-none focus:border-blue-500 transition-all"
                           />
                           <RefreshCw size={12} className={`absolute left-3 top-2.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                        </div>
                        <button onClick={fetchStationData} className="p-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-all text-slate-400 shrink-0 shadow-sm"><RefreshCw size={14} /></button>
                     </div>
                  </div>
                  <div className="overflow-x-auto w-full">
                     <table className="w-full text-left text-[13px] min-w-[500px]">
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
                                          <img src={HOSPITAL_LOGO_BASE64} alt="Logo" className="w-full h-full object-contain" />
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
                                             <p className="text-[11px] font-black text-slate-800">{formatDate(scannedPatient.dob)}</p>
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
                                             onClick={handleSaveLabResults}
                                             disabled={savingLab}
                                             className={`w-full py-4 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 ${
                                                savingLab 
                                                   ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                                                   : stationSubTab === 'completed'
                                                      ? 'bg-emerald-600 hover:bg-emerald-700 hover:-translate-y-0.5 shadow-emerald-100'
                                                      : 'bg-red-600 hover:bg-red-700 hover:-translate-y-0.5 shadow-red-100'
                                             }`}
                                          >
                                             {savingLab ? (
                                                <RefreshCw className="animate-spin" size={18} />
                                             ) : (
                                                <FlaskConical size={18} />
                                             )}
                                             {savingLab 
                                                ? 'ĐANG LƯU...' 
                                                : stationSubTab === 'completed' 
                                                   ? 'LƯU CHỈNH SỬA' 
                                                   : 'LƯU & CHUYỂN TƯ VẤN'
                                             }
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

         {/* QR Scanner Modal */}
         <AnimatePresence>
            {showScanner && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                  <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md">
                     <div className="p-4 bg-slate-800 text-white flex items-center justify-between">
                        <h3 className="font-bold flex items-center gap-2"><QrCode size={18} /> Quét mã QR</h3>
                        <button onClick={() => setShowScanner(false)} className="p-1 hover:bg-slate-700 rounded-lg transition-colors"><X size={20} /></button>
                     </div>
                     <div className="p-4">
                        <div id="qr-reader" className="w-full overflow-hidden rounded-lg border-2 border-slate-200"></div>
                        <p className="text-center text-xs text-slate-500 mt-4">Hướng camera vào mã QR trên thẻ hoặc mã CCCD của bệnh nhân để tự động nhận diện.</p>
                     </div>
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
}

