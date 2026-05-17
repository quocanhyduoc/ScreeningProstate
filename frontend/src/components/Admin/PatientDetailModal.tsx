import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Fingerprint, Phone, Mail, MapPin, Clock, Heart, 
  RefreshCw, CheckCircle, XCircle, Trash2, Download 
} from 'lucide-react';
import { Badge, SurveyTag } from './UIComponents';

export default function PatientDetailModal({ 
  selectedPatient, 
  setSelectedPatient, 
  selectedSurvey, 
  loadingSurvey, 
  updatingStatus, 
  handleUpdateStatus, 
  confirmDeletePatient, 
  handlePrint, 
  role, 
  userPermissions 
}: any) {
  if (!selectedPatient) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl">
         <div className="p-8 bg-[#0067b8] text-white flex justify-between items-center">
            <div className="flex items-center gap-4">
                            <div className="h-12 px-4 bg-white/20 rounded-lg flex items-center justify-center font-black text-[15px] whitespace-nowrap shadow-inner">
                #{selectedPatient.registration_number}
              </div>
              <div>
                <h3 className="text-xl font-bold">{selectedPatient.full_name}</h3>
                <p className="text-blue-100 text-[12px] flex items-center gap-2">
                  <Fingerprint size={14} /> CCCD: {selectedPatient.cccd}
                </p>
              </div>
            </div>
            <button onClick={() => setSelectedPatient(null)} className="p-2 hover:bg-white/10 rounded-md transition-colors"><X size={20}/></button>
         </div>
         
         <div className="p-8 grid grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Thông tin liên lạc</label>
                <p className="text-[14px] font-bold text-slate-700 flex items-center gap-2"><Phone size={14} className="text-blue-500" /> {selectedPatient.phone}</p>
                <p className="text-[14px] font-medium text-slate-500 flex items-center gap-2"><Mail size={14} /> {selectedPatient.email || 'N/A'}</p>
              </div>
              
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Địa chỉ</label>
                <p className="text-[14px] font-medium text-slate-700 flex items-start gap-2">
                  <MapPin size={14} className="text-red-500 mt-1 flex-shrink-0" />
                  <span>{selectedPatient.address_detail}, {selectedPatient.ward}, {selectedPatient.district}, {selectedPatient.province}</span>
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Khung giờ hẹn</label>
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <Clock size={16} className="text-blue-600" />
                  <span className="text-[14px] font-bold text-blue-700">{selectedPatient.appointment_slot}</span>
                  {selectedPatient.is_extra_slot && (
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-black rounded-md uppercase">Suất ngoài</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tiền sử & Triệu chứng (Lúc đăng ký)</label>
                <div className="space-y-2">
                  <div className={`p-3 rounded-lg border flex items-center justify-between ${selectedPatient.family_history ? 'bg-red-50 border-red-100 text-red-700' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                    <span className="text-[12px] font-bold">Tiền sử gia đình</span>
                    <Heart size={16} fill={selectedPatient.family_history ? "currentColor" : "none"} />
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Ghi chú triệu chứng</p>
                    <p className="text-[13px] font-medium italic text-slate-600">{selectedPatient.symptoms || 'Không có ghi chú'}</p>
                  </div>
                </div>
              </div>

              {selectedSurvey && (role === 'SUPERADMIN' || userPermissions.includes('results')) && (
                 <div className="space-y-3 p-5 bg-blue-50 rounded-lg border border-blue-100">
                    <label className="text-[11px] font-black text-blue-400 uppercase tracking-widest block">Kết quả khảo sát lâm sàng</label>
                    <div className="grid grid-cols-1 gap-2">
                       {selectedSurvey.brca_mutation && <SurveyTag label="Đột biến BRCA" color="bg-red-100 text-red-700" />}
                       {(selectedSurvey.father_age_diag || selectedSurvey.brother_age_diag) && (
                          <div className="text-[12px] font-bold text-blue-700">
                             K gia đình: {selectedSurvey.father_age_diag ? `Cha (${selectedSurvey.father_age_diag}t)` : ''} {selectedSurvey.brother_age_diag ? `Anh/Em (${selectedSurvey.brother_age_diag}t)` : ''}
                          </div>
                       )}
                       {(selectedSurvey.exclusion_sex_24h || selectedSurvey.exclusion_cystoscopy_48h || selectedSurvey.exclusion_dre_1w) && (
                          <SurveyTag label="Vi phạm tiêu chuẩn loại trừ" color="bg-orange-100 text-orange-700" />
                       )}
                       {selectedSurvey.cancer_treatment && <SurveyTag label="Đang điều trị Ung thư" color="bg-red-100 text-red-700" />}
                       {selectedSurvey.prostatectomy && <SurveyTag label="Đã cắt bỏ TTL" color="bg-slate-200 text-slate-700" />}
                       {selectedSurvey.biopsy_3y && <SurveyTag label="Sinh thiết < 3 năm" color="bg-slate-200 text-slate-700" />}
                    </div>
                 </div>
              )}
              
              {!selectedSurvey && !loadingSurvey && (
                 <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Chưa có dữ liệu khảo sát</p>
                 </div>
              )}
              
              {loadingSurvey && (
                 <div className="p-4 flex justify-center"><RefreshCw className="animate-spin text-blue-400" size={20} /></div>
              )}

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Thao tác phê duyệt</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    disabled={updatingStatus || selectedPatient.status === 'DA_XAC_NHAN'}
                    onClick={() => handleUpdateStatus(selectedPatient.id, 'DA_XAC_NHAN')}
                    className="py-3 bg-green-600 text-white rounded-lg font-bold text-[13px] hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} /> CHỐT HẸN
                  </button>
                  <button 
                    disabled={updatingStatus || selectedPatient.status === 'HUY'}
                    onClick={() => handleUpdateStatus(selectedPatient.id, 'HUY')}
                    className="py-3 bg-slate-100 text-slate-600 rounded-lg font-bold text-[13px] hover:bg-slate-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <XCircle size={16} /> HỦY LỊCH
                  </button>
                  {role === 'SUPERADMIN' && (
                    <button 
                      onClick={() => confirmDeletePatient(selectedPatient.id)}
                      className="py-3 bg-red-50 text-red-600 rounded-lg font-bold text-[13px] hover:bg-red-100 transition-all flex items-center justify-center gap-2 col-span-2"
                    >
                      <Trash2 size={16} /> XÓA DỮ LIỆU
                    </button>
                  )}
                  {(role === 'SUPERADMIN' || userPermissions.includes('results')) && (
                    <button 
                        onClick={handlePrint}
                        className="py-3 bg-blue-600 text-white rounded-lg font-bold text-[13px] hover:bg-blue-700 transition-all flex items-center justify-center gap-2 col-span-2 shadow-md"
                      >
                        <Download size={16} /> IN PHIẾU KẾT QUẢ
                    </button>
                  )}
                </div>
              </div>
            </div>
         </div>
      </motion.div>
    </div>
  );
}
