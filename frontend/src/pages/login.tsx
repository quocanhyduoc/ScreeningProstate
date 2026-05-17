import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Lock, User, LogIn, AlertCircle, Activity } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function CleanLogin() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.append('username', data.username);
      params.append('password', data.password);

      const response = await axios.post(`${API_URL}/auth/login`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('username', data.username);
      localStorage.setItem('permissions', JSON.stringify(response.data.permissions || []));
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
      
      if (response.data.role === 'CLINICAL') {
        router.push('/clinical/dashboard');
      } else {
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Tên đăng nhập hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/50 rounded-md blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-100/30 rounded-md blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.05)] border border-white p-10 md:p-14 space-y-10">
          
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto text-white shadow-2xl shadow-blue-600/30">
              <Lock size={40} />
            </div>
            <div>
               <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Hệ thống Quản lý</h1>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bệnh viện Trung ương Huế</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Tên đăng nhập</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  {...register('username', { required: true })}
                  placeholder="admin_clinical"
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-lg focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password"
                  {...register('password', { required: true })}
                  placeholder="••••••••"
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-lg focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-900"
                />
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red-50 rounded-lg border border-red-100 text-red-500 text-center text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                <AlertCircle size={14} /> {error}
              </motion.div>
            )}

            <button
              disabled={loading}
              className="w-full py-6 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? 'Đang xác thực...' : 'Đăng nhập ngay'}
              <LogIn size={18} />
            </button>
          </form>

          <div className="pt-6 border-t border-slate-50 text-center">
             <div className="flex items-center justify-center gap-2 text-slate-300">
                <Activity size={16} />
                <p className="text-[10px] font-black uppercase tracking-widest">Hệ thống bảo mật y tế</p>
             </div>
          </div>
        </div>
      </motion.div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #F8FAFC; }
      `}</style>
    </div>
  );
}
