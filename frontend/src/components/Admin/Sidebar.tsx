import React from 'react';
import {
  QrCode, LayoutDashboard, Users, UserCheck, ClipboardList,
  Droplets, MessageSquare, Shield, Calendar, BarChart3,
  ShieldCheck, LogOut
} from 'lucide-react';
import { NavIcon } from './UIComponents';

export default function Sidebar({
  role,
  username,
  activeTab,
  setActiveTab,
  userPermissions,
  router
}: any) {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 fixed h-full z-40 flex flex-col">
      <div className="p-6 space-y-10 flex-1">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <QrCode size={20} className="text-white" />
          </div>
          <div>
            <span className="text-[15px] font-bold tracking-tight block leading-none">BV Trung ương Huế</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Quản trị Lâm sàng
            </span>
          </div>
        </div>
        <nav className="space-y-1">
          {(role === 'SUPERADMIN' || userPermissions.includes('overview')) && (
            <NavIcon icon={<LayoutDashboard size={18} />} label="Tổng quan" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          )}
          <NavIcon icon={<Users size={18} />} label="DS Bệnh nhân" active={activeTab === 'patients'} onClick={() => setActiveTab('patients')} />
          {(role === 'SUPERADMIN' || userPermissions.includes('clinical_reception')) && (
            <NavIcon icon={<UserCheck size={18} />} label="B1:Đón tiếp" active={activeTab === 'clinical_reception'} onClick={() => setActiveTab('clinical_reception')} />
          )}
          {(role === 'SUPERADMIN' || userPermissions.includes('clinical_screening')) && (
            <NavIcon icon={<ClipboardList size={18} />} label="B2: Khám sàng lọc" active={activeTab === 'clinical_screening'} onClick={() => setActiveTab('clinical_screening')} />
          )}
          {(role === 'SUPERADMIN' || userPermissions.includes('clinical_lab')) && (
            <NavIcon icon={<Droplets size={18} />} label="B3: PSA & Siêu âm" active={activeTab === 'clinical_lab'} onClick={() => setActiveTab('clinical_lab')} />
          )}
          {(role === 'SUPERADMIN' || userPermissions.includes('clinical_consult')) && (
            <NavIcon icon={<MessageSquare size={18} />} label="B4: Tư vấn & Trả KQ" active={activeTab === 'clinical_consult'} onClick={() => setActiveTab('clinical_consult')} />
          )}
          {role === 'SUPERADMIN' && (
            <NavIcon icon={<Shield size={18} />} label="Quản lý Vai trò" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
          )}
          {(role === 'SUPERADMIN' || userPermissions.includes('calendar')) && (
            <NavIcon icon={<Calendar size={18} />} label="Lịch khám" active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
          )}
          {(role === 'SUPERADMIN' || userPermissions.includes('reports')) && (
            <NavIcon icon={<BarChart3 size={18} />} label="Báo cáo" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
          )}
          {role === 'SUPERADMIN' && (
            <NavIcon icon={<ShieldCheck size={18} />} label="Cài đặt hệ thống" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          )}
        </nav>
      </div>
      <div className="p-6 border-t border-slate-100 space-y-4">
        <div className="px-4 py-3 bg-slate-50 rounded-lg">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{role === 'SUPERADMIN' ? 'Quản trị viên' : 'Điều hành Clinical'}</p>
          <p className="text-[13px] font-bold text-slate-700 truncate">{username === 'admin' ? 'admin_clinical' : username}</p>
        </div>
        <button onClick={() => router.push('/login')} className="w-full flex items-center justify-center gap-2 py-3 text-[12px] font-bold text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-all">
          <LogOut size={16} /> Thoát
        </button>
      </div>
    </aside>
  );
}
