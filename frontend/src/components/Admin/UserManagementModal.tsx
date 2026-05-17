import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, X, Save } from 'lucide-react';

export default function UserManagementModal({ 
  showUserModal, 
  setShowUserModal, 
  editingUser, 
  userForm, 
  setUserForm, 
  handleUserAction, 
  PERMISSIONS 
}: any) {
  if (!showUserModal) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[80] flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-lg rounded-xl overflow-hidden shadow-2xl">
         <div className="p-8 bg-[#121C2D] text-white flex justify-between items-center">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center"><UserPlus size={24}/></div>
               <div>
                  <h3 className="text-xl font-bold">{editingUser ? 'Cập nhật Người dùng' : 'Thêm Người dùng mới'}</h3>
                  <p className="text-slate-400 text-[12px] font-medium uppercase tracking-widest mt-0.5">Phân quyền hệ thống</p>
               </div>
            </div>
            <button onClick={() => setShowUserModal(false)} className="p-2 hover:bg-white/10 rounded-md transition-colors"><X size={20}/></button>
         </div>
         
         <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-2">
               <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tên đăng nhập</label>
               <input value={userForm.username} onChange={e=>setUserForm({...userForm, username: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm outline-none focus:border-blue-500" placeholder="admin_clinical" />
            </div>
            
            <div className="space-y-2">
               <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Mật khẩu {editingUser && '(Để trống nếu không đổi)'}</label>
               <input type="password" value={userForm.password} onChange={e=>setUserForm({...userForm, password: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm outline-none focus:border-blue-500" placeholder="••••••••" />
            </div>

            <div className="space-y-2">
               <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Vai trò</label>
               <select value={userForm.role} onChange={e=>setUserForm({...userForm, role: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm outline-none focus:border-blue-500">
                  <option value="CLINICAL">Nhân viên Lâm sàng</option>
                  <option value="CLINICAL">Nhân viên Lâm sàng (Clinical)</option>
                  <option value="SUPERADMIN">Super Admin</option>
               </select>
            </div>

            {userForm.role !== 'SUPERADMIN' && (
               <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Phân quyền chức năng</label>
                  <div className="grid grid-cols-1 gap-2">
                     {PERMISSIONS.map((p: any) => (
                        <label key={p.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-all border border-slate-200">
                           <input 
                             type="checkbox" 
                             checked={userForm.permissions?.includes(p.id)} 
                             onChange={e => {
                                const currentPerms = userForm.permissions || [];
                                const newPerms = e.target.checked 
                                  ? [...currentPerms, p.id]
                                  : currentPerms.filter((id: string) => id !== p.id);
                                setUserForm({...userForm, permissions: newPerms});
                             }}
                             className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                           />
                           <span className="text-[13px] font-bold text-slate-700">{p.label}</span>
                        </label>
                     ))}
                  </div>
               </div>
            )}
         </div>

         <div className="p-8 bg-slate-50 flex gap-3">
            <button onClick={() => setShowUserModal(false)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-100 transition-all">HỦY BỎ</button>
            <button onClick={handleUserAction} className="flex-1 py-4 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2">
               <Save size={18} /> LƯU NGƯỜI DÙNG
            </button>
         </div>
      </motion.div>
    </div>
  );
}
