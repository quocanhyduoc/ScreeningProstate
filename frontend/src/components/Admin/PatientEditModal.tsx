import React from 'react';
import { motion } from 'framer-motion';
import { Edit, X, Save } from 'lucide-react';

export default function PatientEditModal({ 
  isEditingPatient, 
  editForm, 
  setEditForm, 
  setIsEditingPatient, 
  savePatientEdit 
}: any) {
  if (!isEditingPatient || !editForm) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70] flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-xl rounded-xl overflow-hidden shadow-2xl">
         <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center"><Edit size={24}/></div>
               <div>
                  <h3 className="text-xl font-bold">Chỉnh sửa thông tin</h3>
                  <p className="text-slate-400 text-[12px] font-medium uppercase tracking-widest mt-0.5">ID: {editForm.registration_number}</p>
               </div>
            </div>
            <button onClick={() => setIsEditingPatient(false)} className="p-2 hover:bg-white/10 rounded-md transition-colors"><X size={20}/></button>
         </div>
         
         <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Họ và tên</label>
                  <input 
                    value={editForm.full_name} 
                    onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm outline-none focus:border-blue-500"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Số CCCD</label>
                  <input 
                    value={editForm.cccd} 
                    onChange={(e) => setEditForm({...editForm, cccd: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm outline-none focus:border-blue-500"
                  />
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Số điện thoại</label>
                  <input 
                    value={editForm.phone} 
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm outline-none focus:border-blue-500"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Email</label>
                  <input 
                    value={editForm.email || ''} 
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm outline-none focus:border-blue-500"
                  />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Khung giờ hẹn</label>
               <input 
                 value={editForm.appointment_slot || ''} 
                 onChange={(e) => setEditForm({...editForm, appointment_slot: e.target.value})}
                 className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm outline-none focus:border-blue-500"
               />
            </div>
         </div>

         <div className="p-8 bg-slate-50 flex gap-3">
            <button onClick={() => setIsEditingPatient(false)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-100 transition-all">HỦY BỎ</button>
            <button 
              onClick={savePatientEdit}
              className="flex-1 py-4 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
            >
               <Save size={18} /> LƯU THAY ĐỔI
            </button>
         </div>
      </motion.div>
    </div>
  );
}
