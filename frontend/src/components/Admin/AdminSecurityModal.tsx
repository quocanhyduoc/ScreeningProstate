import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminSecurityModal({ isOpen, onClose, onConfirm, title, description }: any) {
   const [password, setPassword] = useState('');
   const [error, setError] = useState('');
   const [isLoading, setIsLoading] = useState(false);
   
   if (!isOpen) return null;

   const handleConfirm = async () => {
      if (!password) {
         setError('Vui lòng nhập mật khẩu');
         return;
      }
      setError('');
      setIsLoading(true);
      try {
         // Expect onConfirm to be an async function that throws on error
         await onConfirm(password);
         setPassword('');
         setError('');
      } catch (err: any) {
         // Extract error message from API response if possible
         const msg = err.response?.data?.detail || 'Mật khẩu không chính xác';
         setError(msg);
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
         <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="bg-white w-full max-w-md rounded-xl overflow-hidden shadow-2xl border border-white"
         >
            <div className="p-8 bg-red-600 text-white flex items-center gap-4">
               <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center"><Lock size={24}/></div>
               <div>
                  <h3 className="text-xl font-bold">{title}</h3>
                  <p className="text-red-100 text-[12px] font-medium uppercase tracking-widest mt-0.5">Xác thực SuperAdmin</p>
               </div>
            </div>
            <div className="p-8 space-y-6">
               <p className="text-[14px] text-slate-500 font-medium leading-relaxed">{description}</p>
               
               <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mật khẩu xác nhận</label>
                     <AnimatePresence>
                        {error && (
                           <motion.span 
                              initial={{ x: 10, opacity: 0 }} 
                              animate={{ x: 0, opacity: 1 }}
                              className="text-red-500 text-[10px] font-bold flex items-center gap-1"
                           >
                              <AlertCircle size={12} /> {error}
                           </motion.span>
                        )}
                     </AnimatePresence>
                  </div>
                  <input 
                    type="password" 
                    autoFocus
                    value={password} 
                    onChange={(e) => {
                        setPassword(e.target.value);
                        if(error) setError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                    placeholder="••••••••"
                    className={`w-full p-4 bg-slate-50 border ${error ? 'border-red-500 bg-red-50' : 'border-slate-200'} rounded-lg text-lg font-bold outline-none focus:border-red-500 transition-all text-center tracking-[0.5em]`}
                  />
               </div>
               
               <div className="flex gap-3">
                  <button 
                     disabled={isLoading}
                     onClick={onClose} 
                     className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-200 transition-all disabled:opacity-50"
                  >
                     HỦY BỎ
                  </button>
                  <button 
                    disabled={isLoading}
                    onClick={handleConfirm}
                    className="flex-1 py-4 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-100 disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                     {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'XÁC NHẬN'}
                  </button>
               </div>
            </div>
         </motion.div>
      </div>
   );
}
