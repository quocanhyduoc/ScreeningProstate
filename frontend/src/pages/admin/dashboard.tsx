import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, CheckCircle, XCircle, 
  RefreshCw, Activity, 
  Filter, Download, Fingerprint, Heart,
  Phone, Calendar, Zap, Bell, X, Info, Trash2, Edit,
  QrCode, AlertCircle, Search, UserPlus, Menu
} from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

// Components
import Sidebar from '../../components/Admin/Sidebar';
import PatientDetailModal from '../../components/Admin/PatientDetailModal';
import UserManagementModal from '../../components/Admin/UserManagementModal';
import PatientEditModal from '../../components/Admin/PatientEditModal';
import AdminSecurityModal from '../../components/Admin/AdminSecurityModal';
import ClinicalHubTab from '../../components/Admin/ClinicalHubTab';
import ReportsTab from '../../components/Admin/ReportsTab';
import CalendarTab from '../../components/Admin/CalendarTab';
import PrintableResult from '../../components/Admin/PrintableResult';
import { 
  StatCard, Tab, Badge, LoadingScreen, StatusProgress 
} from '../../components/Admin/UIComponents';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const PERMISSIONS = [
  { id: 'overview', label: 'Tổng quan hệ thống' },
  { id: 'patients', label: 'Quản lý Bệnh nhân' },
  { id: 'clinical_reception', label: 'Clinical: Quản lý Đón tiếp' },
  { id: 'clinical_screening', label: 'Clinical: Khám sàng lọc & Khảo sát' },
  { id: 'clinical_lab', label: 'Clinical: Quản lý PSA & Siêu âm' },
  { id: 'clinical_consult', label: 'Clinical: Tư vấn chuyên sâu & Trả KQ' },
  { id: 'calendar', label: 'Lịch khám & Điều phối' },
  { id: 'reports', label: 'Báo cáo & Thống kê' },
  { id: 'results', label: 'Xem & In kết quả CLS' },
  { id: 'settings', label: 'Cài đặt & Reset' },
];

export default function ProfessionalAdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('patients');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (router.isReady && router.query.tab) {
      setActiveTab(router.query.tab as string);
    }
  }, [router.isReady, router.query.tab]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Extra Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [slotFilter, setSlotFilter] = useState('ALL');
  const [extraSlotFilter, setExtraSlotFilter] = useState('ALL');
  const [historyFilter, setHistoryFilter] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);

  // Detail Modal
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [selectedSurvey, setSelectedSurvey] = useState<any>(null);
  const [loadingSurvey, setLoadingSurvey] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const prevCountRef = useRef(0);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Selection & Management
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState<any>({ username: '', password: '', role: 'CLINICAL', permissions: [] });

  // Admin Security Modal
  const [securityModal, setSecurityModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: (password: string) => void;
    actionType: 'DELETE_PATIENT' | 'DELETE_SELECTED' | 'RESET_ALL' | null;
    targetId?: number;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
    actionType: null
  });

  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('User');
  
  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
      contentRef: printRef,
      documentTitle: `Phieu_Ket_Qua_${selectedPatient?.registration_number}`,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchData();
    if (typeof window !== 'undefined') {
      setRole(localStorage.getItem('role'));
      setUsername(localStorage.getItem('username') || 'User');
      const perms = JSON.parse(localStorage.getItem('permissions') || '[]');
      setUserPermissions(perms);
    }
    
    const wsUrl = API_URL.replace('http', 'ws');
    const ws = new WebSocket(`${wsUrl}/admin/ws`);
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'NEW_REGISTRATION' || data.type === 'UPDATE_PATIENT' || data.type === 'SURVEY_SUBMITTED') {
            fetchData(true);
            if (data.type === 'NEW_REGISTRATION') {
               setToast("Có đăng ký mới từ hệ thống!");
            } else if (data.status === 'DA_CO_KET_QUA_MAU' && data.psa_value) {
               if (parseFloat(data.psa_value) > 4.0) {
                  setToast(`⚠️ CẢNH BÁO: Phát hiện bệnh nhân có PSA cao (${data.psa_value})!`);
               }
            }
        }
    };
    
    const interval = setInterval(() => fetchData(true), 30000);
    return () => {
        clearInterval(interval);
        ws.close();
    };
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchSurvey(selectedPatient.id);
    } else {
      setSelectedSurvey(null);
    }
  }, [selectedPatient]);

  const fetchSurvey = async (regId: number) => {
    setLoadingSurvey(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/admin/survey/${regId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedSurvey(res.data);
    } catch (e) {
      setSelectedSurvey(null);
    } finally {
      setLoadingSurvey(false);
    }
  };

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [statsRes, regRes] = await Promise.all([
        axios.get(`${API_URL}/admin/stats`, config),
        axios.get(`${API_URL}/admin/registrations`, config)
      ]);
      
      const newRegs = regRes.data;
      if (prevCountRef.current > 0 && newRegs.length > prevCountRef.current) {
        const diff = newRegs.length - prevCountRef.current;
        setToast(`Có ${diff} bệnh nhân mới vừa đăng ký!`);
        setUnreadCount(prev => prev + diff);
        setNotifications(prev => [...newRegs.slice(0, diff), ...prev].slice(0, 10));
      }
      prevCountRef.current = newRegs.length;
      setStats(statsRes.data);
      setRegistrations(newRegs);

      const currentRole = localStorage.getItem('role');
      if (currentRole === 'SUPERADMIN') {
        const usersRes = await axios.get(`${API_URL}/admin/users`, config);
        setUsers(usersRes.data);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.clear();
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/admin/registration/${id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast(`Đã cập nhật trạng thái thành ${newStatus === 'DA_XAC_NHAN' ? 'Đã chốt' : 'Đã hủy'}`);
      fetchData();
    } catch (e: any) {
      const errorMsg = e.response?.data?.detail || "Lỗi khi cập nhật trạng thái";
      setToast(errorMsg);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/export`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Danh_sach_tam_soat_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xlsx`);
      document.body.appendChild(link);
      link.click();
    } catch (e) {
      setToast("Lỗi khi xuất file");
    }
  };

  const handleSelectAll = (e: any) => {
    if (e.target.checked) {
      setSelectedIds(filteredRegistrations.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const confirmDeletePatient = (id: number) => {
    setSecurityModal({
      isOpen: true,
      title: "Xóa bệnh nhân",
      description: "Hành động này không thể hoàn tác. Vui lòng nhập mật khẩu SuperAdmin để xác nhận xóa bản ghi này.",
      actionType: 'DELETE_PATIENT',
      targetId: id,
      onConfirm: (password) => executeDeletePatient(id, password)
    });
  };

  const executeDeletePatient = async (id: number, password: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/registration/${id}`, {
        data: { password },
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast("Đã xóa bản ghi thành công");
      fetchData();
      setSelectedPatient(null);
      setSecurityModal(prev => ({ ...prev, isOpen: false }));
    } catch (e: any) {
      throw e; // Re-throw to be caught by security modal
    }
  };

  const confirmDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setSecurityModal({
      isOpen: true,
      title: `Xóa ${selectedIds.length} bản ghi`,
      description: `Bạn sắp xóa ${selectedIds.length} bệnh nhân. Vui lòng nhập mật khẩu SuperAdmin để xác nhận.`,
      actionType: 'DELETE_SELECTED',
      onConfirm: (password) => executeDeleteSelected(password)
    });
  };

  const executeDeleteSelected = async (password: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      for (const id of selectedIds) {
        await axios.delete(`${API_URL}/admin/registration/${id}`, {
          data: { password },
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setToast(`Đã xóa ${selectedIds.length} bản ghi`);
      setSelectedIds([]);
      fetchData();
      setSecurityModal(prev => ({ ...prev, isOpen: false }));
    } catch (e: any) {
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const confirmResetAll = () => {
    setSecurityModal({
      isOpen: true,
      title: "RESET TOÀN BỘ DỮ LIỆU",
      description: "CẢNH BÁO: Hành động này sẽ xóa sạch tất cả bệnh nhân và khảo sát. Vui lòng nhập mật khẩu SuperAdmin để xác nhận.",
      actionType: 'RESET_ALL',
      onConfirm: (password) => executeResetAll(password)
    });
  };

  const executeResetAll = async (password: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/admin/reset-all`, { password }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast("Hệ thống đã được reset sạch dữ liệu.");
      setSelectedIds([]);
      fetchData();
      setSecurityModal(prev => ({ ...prev, isOpen: false }));
    } catch (e: any) {
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const handleEditPatient = (reg: any) => {
    setEditForm({ ...reg });
    setIsEditingPatient(true);
  };

  const savePatientEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/admin/registration/${editForm.id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast("Đã cập nhật thông tin thành công");
      setIsEditingPatient(false);
      fetchData();
      if (selectedPatient?.id === editForm.id) {
        setSelectedPatient({ ...editForm });
      }
    } catch (e) {
      setToast("Lỗi khi cập nhật thông tin");
    }
  };

  const handleUserAction = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (editingUser) {
        await axios.patch(`${API_URL}/admin/users/${editingUser.id}`, userForm, config);
        setToast("Đã cập nhật người dùng");
      } else {
        await axios.post(`${API_URL}/admin/users`, userForm, config);
        setToast("Đã thêm người dùng mới");
      }
      setShowUserModal(false);
      fetchData();
    } catch (e) {
      setToast("Lỗi khi thao tác người dùng");
    }
  };

  const deleteUser = async (id: number) => {
    if (!window.confirm("Xóa người dùng này?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast("Đã xóa người dùng");
      fetchData();
    } catch (e) {
      setToast("Lỗi khi xóa người dùng");
    }
  };

  const filteredRegistrations = registrations.filter(r => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = 
      r.full_name.toLowerCase().includes(searchTermLower) || 
      r.phone.includes(searchTerm) || 
      r.cccd.includes(searchTerm) ||
      (r.registration_number && String(r.registration_number).includes(searchTerm));
      
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesHistory = historyFilter === 'ALL' || (historyFilter === 'YES' && r.family_history) || (historyFilter === 'NO' && !r.family_history);
    const matchesSlot = slotFilter === 'ALL' || r.appointment_slot === slotFilter;
    const matchesExtra = extraSlotFilter === 'ALL' || (extraSlotFilter === 'EXTRA' && r.is_extra_slot) || (extraSlotFilter === 'STANDARD' && !r.is_extra_slot);
    
    return matchesSearch && matchesStatus && matchesHistory && matchesSlot && matchesExtra;
  });

  if (loading && !stats) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-[#1E293B] font-sans selection:bg-blue-100 overflow-x-hidden">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -100, opacity: 0 }} className="fixed top-4 right-4 z-[100] bg-[#0067b8] text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-4 border border-blue-500">
             <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"><Bell size={18} /></div>
             <p className="font-bold text-[14px]">{toast}</p>
             <button onClick={() => setToast(null)} className="p-1 hover:bg-white/10 rounded-md"><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <PatientDetailModal
        selectedPatient={selectedPatient}
        setSelectedPatient={setSelectedPatient}
        selectedSurvey={selectedSurvey}
        loadingSurvey={loadingSurvey}
        updatingStatus={updatingStatus}
        handleUpdateStatus={handleUpdateStatus}
        confirmDeletePatient={confirmDeletePatient}
        handlePrint={handlePrint}
        role={role}
        userPermissions={userPermissions}
      />

      {/* Hidden Print Component - Positioned outside viewport to fix printing issues */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
         <PrintableResult ref={printRef} patient={selectedPatient} survey={selectedSurvey} />
      </div>

      <Sidebar
        role={role}
        username={username}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userPermissions={userPermissions}
        router={router}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content */}
      <main className="md:ml-64 flex-1 p-4 md:p-8 w-full">
        <header className="flex justify-between items-center mb-6 md:mb-10 relative">
          <div className="flex items-center gap-3 md:gap-6">
             <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 shadow-sm"
             >
                <Menu size={20} />
             </button>
             
             <div className="relative hidden md:block">
                <button 
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications) setUnreadCount(0);
                  }} 
                  className={`p-3 rounded-lg transition-all relative ${showNotifications ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white border border-slate-200 text-slate-400 hover:bg-slate-50"}`}
                >
                   <Bell size={22} />
                   {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-md flex items-center justify-center border-2 border-white animate-bounce">
                         {unreadCount}
                      </span>
                   )}
                </button>

                <AnimatePresence>
                   {showNotifications && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 mt-4 w-80 bg-white border border-slate-200 rounded-lg shadow-2xl z-50 overflow-hidden"
                      >
                         <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-[13px] font-black text-[#121C2D] uppercase tracking-wider">Thông báo mới nhất</h3>
                            <button onClick={() => setNotifications([])} className="text-[10px] font-bold text-blue-600 hover:underline">Xóa tất cả</button>
                         </div>
                         <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                               <div className="p-8 text-center">
                                  <div className="w-12 h-12 bg-slate-50 rounded-md flex items-center justify-center mx-auto mb-3">
                                     <Bell size={20} className="text-slate-300" />
                                  </div>
                                  <p className="text-[12px] text-slate-400 font-medium">Chưa có thông báo nào</p>
                               </div>
                            ) : (
                               notifications.map((n, i) => (
                                  <div key={i} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 items-start">
                                     <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                                        <Users size={14} className="text-blue-600" />
                                     </div>
                                     <div>
                                        <p className="text-[13px] font-bold text-slate-700 leading-tight">
                                           {typeof n === "string" ? n : `Bệnh nhân mới: ${n.full_name}`}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-medium mt-1">Vừa mới đăng ký hệ thống</p>
                                     </div>
                                  </div>
                               ))
                            )}
                         </div>
                      </motion.div>
                   )}
                </AnimatePresence>
             </div>
             <div className="space-y-0.5 md:space-y-1">
              <h2 className="text-lg md:text-2xl font-bold tracking-tight text-[#121C2D]">
                {role === 'SUPERADMIN' ? 'Hệ thống Quản trị' : 'Quản lý Lâm sàng'}
              </h2>
              <p className="text-[10px] md:text-[12px] text-slate-400 font-medium italic hidden sm:block">Quản lý Bệnh nhân & Quy trình Lâm sàng Sàng lọc</p>
           </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
             <button onClick={handleExport} className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-[#121C2D] rounded-lg font-bold text-[13px] hover:bg-slate-50 transition-all shadow-sm">
                <Download size={18} /> Xuất Excel
             </button>
             <button onClick={() => fetchData()} className="p-2.5 md:p-3 bg-white border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 transition-all shadow-sm">
               <RefreshCw size={18} />
             </button>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label="Chờ duyệt" value={stats?.pending_registrations} color="border-orange-100 text-orange-600" />
                <StatCard label="Đã chốt" value={stats?.confirmed_registrations} color="border-green-100 text-green-600" />
                <StatCard label="Suất ngoài dự kiến" value={registrations.filter(r=>r.is_extra_slot).length} color="border-purple-100 text-purple-600" />
                <StatCard label="Tổng hồ sơ" value={stats?.total_registrations} color="border-slate-100 text-slate-600" />
             </div>

             {selectedIds.length > 0 && role === 'SUPERADMIN' && (
                <div className="flex items-center gap-4 p-4 bg-white border border-red-100 rounded-lg shadow-lg sticky bottom-8 z-30">
                   <p className="text-[13px] font-bold text-slate-600">Đã chọn <span className="text-red-600">{selectedIds.length}</span> bản ghi</p>
                   <button onClick={confirmDeleteSelected} className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg font-bold text-[13px] hover:bg-red-700 transition-all shadow-md">
                      <Trash2 size={16} /> XÓA DỮ LIỆU ĐÃ CHỌN
                   </button>
                </div>
             )}
          </div>
        )}

        {activeTab === 'users' && role === 'SUPERADMIN' && (
           <div className="space-y-6">
              <div className="flex justify-between items-center">
                 <h3 className="text-xl font-bold text-[#121C2D]">Danh sách Người dùng hệ thống</h3>
                  <button onClick={() => { setEditingUser(null); setUserForm({ username: '', password: '', role: 'CLINICAL', permissions: [] }); setShowUserModal(true); }} className="flex items-center gap-2 px-6 py-2.5 bg-[#0067b8] text-white rounded-lg font-bold text-[13px] hover:bg-blue-700 transition-all shadow-md">
                    <UserPlus size={18} /> THÊM NGƯỜI DÙNG
                 </button>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-x-auto">
                 <table className="w-full text-left border-collapse whitespace-nowrap md:whitespace-normal min-w-[500px]">
                    <thead>
                       <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-wider">Người dùng</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-wider">Vai trò</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-wider text-right">Thao tác</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {users.map(user => (
                          <tr key={user.id} className="hover:bg-slate-50">
                             <td className="px-6 py-4">
                                <p className="font-bold text-[14px]">{user.username}</p>
                             </td>
                             <td className="px-6 py-4">
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black border border-blue-100 uppercase tracking-widest">{user.role}</span>
                             </td>
                             <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                   <button onClick={() => { setEditingUser(user); setUserForm({ username: user.username, password: '', role: user.role, permissions: user.permissions || [] }); setShowUserModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={16}/></button>
                                   <button onClick={() => deleteUser(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        )}

        {activeTab === 'patients' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
               <div className="flex gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 overflow-x-auto whitespace-nowrap w-full sm:w-auto scrollbar-hide">
                  <Tab label="Tất cả" active={statusFilter === 'ALL'} onClick={() => setStatusFilter('ALL')} count={registrations.length} />
                  <Tab label="Chờ duyệt" active={statusFilter === 'CHO_XAC_NHAN'} onClick={() => setStatusFilter('CHO_XAC_NHAN')} count={registrations.filter(r=>r.status==='CHO_XAC_NHAN').length} />
                  <Tab label="Đã chốt" active={statusFilter === 'DA_XAC_NHAN'} onClick={() => setStatusFilter('DA_XAC_NHAN')} count={registrations.filter(r=>r.status==='DA_XAC_NHAN').length} />
                  <Tab label="Tiếp đón" active={statusFilter === 'DA_TIEP_NHAN'} onClick={() => setStatusFilter('DA_TIEP_NHAN')} count={registrations.filter(r=>r.status==='DA_TIEP_NHAN').length} />
                  <Tab label="Xét nghiệm" active={statusFilter === 'DA_XET_NGHIEM'} onClick={() => setStatusFilter('DA_XET_NGHIEM')} count={registrations.filter(r=>r.status==='DA_XET_NGHIEM').length} />
                  <Tab label="Tư vấn" active={statusFilter === 'CHO_TU_VAN'} onClick={() => setStatusFilter('CHO_TU_VAN')} count={registrations.filter(r=>r.status==='CHO_TU_VAN').length} />
                  <Tab label="Hoàn thành" active={statusFilter === 'HOAN_THANH'} onClick={() => setStatusFilter('HOAN_THANH')} count={registrations.filter(r=>r.status==='HOAN_THANH').length} />
               </div>
               
               <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input autoComplete="off" name="screening-search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm tên, SĐT, CCCD..." className="bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-[13px] outline-none focus:border-blue-500 w-full sm:w-64 font-medium" />
                  </div>
                  <button onClick={() => setShowFilters(!showFilters)} className={`flex shrink-0 items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-[13px] border ${showFilters ? 'bg-[#0067b8] text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200'}`}><Filter size={16} /> Lọc</button>
               </div>
            </div>

            <AnimatePresence>
               {showFilters && (
                 <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-white border border-slate-200 rounded-lg p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 shadow-sm mt-4">
                    <div className="space-y-2">
                       <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Calendar size={14}/> Khung giờ</label>
                       <select value={slotFilter} onChange={(e) => setSlotFilter(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold outline-none">
                          <option value="ALL">Tất cả khung giờ</option>
                          <option value="7:00-11:30 ngày 30/5 (Thứ 7)">Sáng 30/5</option>
                          <option value="13:30-16:00 ngày 30/5 (Thứ 7)">Chiều 30/5</option>
                          <option value="7:00-11:30 ngày 31/5 (Chủ nhật)">Sáng 31/5</option>
                          <option value="13:30-16:00 ngày 31/5 (Chủ nhật)">Chiều 31/5</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Zap size={14}/> Loại suất</label>
                       <select value={extraSlotFilter} onChange={(e) => setExtraSlotFilter(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold outline-none">
                          <option value="ALL">Tất cả loại</option>
                          <option value="STANDARD">Suất chuẩn</option>
                          <option value="EXTRA">Suất ngoài (Extra)</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Heart size={14}/> Nhóm nguy cơ</label>
                       <select value={historyFilter} onChange={(e) => setHistoryFilter(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold outline-none">
                          <option value="ALL">Tất cả bệnh nhân</option>
                          <option value="YES">Có tiền sử gia đình</option>
                          <option value="NO">Không có tiền sử</option>
                       </select>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-x-auto">
               <table className="w-full text-left border-collapse whitespace-nowrap md:whitespace-normal min-w-[800px]">
                  <thead>
                     <tr className="bg-slate-50 border-b border-slate-200">
                         <th className="px-6 py-4 w-10">
                            <input type="checkbox" className="rounded cursor-pointer" onChange={handleSelectAll} checked={selectedIds.length === filteredRegistrations.length && filteredRegistrations.length > 0} />
                         </th>
                         <th className="px-2 py-4 text-[10px] font-black uppercase text-slate-500 tracking-wider">STT / Bệnh nhân</th>
                        <th className="px-4 py-4 text-[10px] font-black uppercase text-slate-500 tracking-wider">CCCD / Phone</th>
                        <th className="px-4 py-4 text-[10px] font-black uppercase text-slate-500 tracking-wider">Địa chỉ</th>
                        <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Khung giờ hẹn</th>
                        <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Trạng thái</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-wider text-right">Thao tác</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {filteredRegistrations.map((reg) => (
                        <tr key={reg.id} className={`hover:bg-blue-50/20 transition-all cursor-pointer ${selectedIds.includes(reg.id) ? 'bg-blue-50/40' : ''}`} onClick={() => setSelectedPatient(reg)}>
                           <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                              <input type="checkbox" className="rounded cursor-pointer" checked={selectedIds.includes(reg.id)} onChange={() => handleSelectRow(reg.id)} />
                           </td>
                           <td className="px-2 py-4">
                              <div className="flex items-center gap-3">
                                 <div className="h-9 px-3 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-black text-[12px] border border-slate-200 shadow-sm whitespace-nowrap min-w-[40px]">
                                    #{reg.registration_number || "N/A"}
                                 </div>
                                 <div>
                                    <p className="font-bold text-[14px] text-[#121C2D]">{reg.full_name}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                       {reg.family_history && <span className="p-0.5 bg-red-50 text-red-500 rounded" title="Có tiền sử gia đình"><Heart size={10} fill="currentColor"/></span>}
                                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{new Date(reg.dob).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-4 py-4">
                              <div className="space-y-0.5">
                                 <p className="text-[12px] font-bold text-slate-700 flex items-center gap-1.5"><Fingerprint size={12} className="text-slate-400"/> {reg.cccd}</p>
                                 <p className="text-[12px] font-medium text-slate-500 flex items-center gap-1.5"><Phone size={12} className="text-slate-400"/> {reg.phone}</p>
                              </div>
                           </td>
                           <td className="px-4 py-4 max-w-[200px]">
                              <p className="text-[11px] font-medium text-slate-500 line-clamp-2 leading-relaxed">
                                 {reg.ward}, {reg.district}
                              </p>
                           </td>
                           <td className="px-4 py-4">
                              <div className="flex flex-col gap-1">
                                 <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 w-fit">
                                    <Calendar size={12} />
                                    {reg.appointment_slot || 'N/A'}
                                 </div>
                                 {reg.is_extra_slot && (
                                    <span className="text-[9px] font-black text-orange-500 uppercase tracking-tighter flex items-center gap-1">
                                       <Zap size={10} fill="currentColor"/> Suất ngoài dự kiến
                                    </span>
                                 )}
                              </div>
                           </td>
                           <td className="px-4 py-4">
                              <div className="flex flex-col gap-2">
                                 <Badge status={reg.status} />
                                 <StatusProgress status={reg.status} />
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                 <button onClick={() => setSelectedPatient(reg)} title="Xem chi tiết" className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><Info size={16}/></button>
                                 <button onClick={() => handleUpdateStatus(reg.id, 'DA_XAC_NHAN')} title="Chốt lịch" className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all"><CheckCircle size={16}/></button>
                                 <button onClick={() => handleUpdateStatus(reg.id, 'HUY')} title="Hủy lịch" className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-red-600 hover:text-white transition-all"><XCircle size={16}/></button>
                                 {role === 'SUPERADMIN' && (
                                    <>
                                       <button onClick={() => handleEditPatient(reg)} title="Chỉnh sửa" className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all"><Edit size={16}/></button>
                                       <button onClick={() => confirmDeletePatient(reg.id)} title="Xóa" className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16}/></button>
                                    </>
                                 )}
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}
        
        {activeTab.startsWith('clinical_') && (
           <ClinicalHubTab 
             key={activeTab}
             activeTab={activeTab}
             API_URL={API_URL} 
             fetchData={fetchData} 
             setToast={setToast} 
             role={role} 
           />
        )}
        {activeTab === 'reports' && <ReportsTab registrations={registrations} stats={stats} role={role} userPermissions={userPermissions} />}
        {activeTab === 'calendar' && <CalendarTab registrations={registrations} />}
        {activeTab === 'settings' && role === 'SUPERADMIN' && (
           <div className="max-w-2xl space-y-8">
              <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center"><AlertCircle size={24}/></div>
                    <div>
                       <h3 className="text-xl font-bold text-slate-900">Khu vực nguy hiểm</h3>
                       <p className="text-[13px] text-slate-500 font-medium">Hành động này sẽ xóa sạch toàn bộ cơ sở dữ liệu bệnh nhân.</p>
                    </div>
                 </div>
                 
                 <div className="p-6 bg-red-50 rounded-lg border border-red-100 border-dashed">
                    <p className="text-[12px] font-bold text-red-700 leading-relaxed mb-6">
                       Việc Reset dữ liệu sẽ xóa toàn bộ danh sách đăng ký và kết quả khảo sát. Hành động này thường được thực hiện khi kết thúc một đợt tầm soát để chuẩn bị cho đợt tiếp theo.
                    </p>
                    <button 
                      onClick={confirmResetAll}
                      className="w-full py-4 bg-red-600 text-white rounded-lg font-black text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-3"
                    >
                       <RefreshCw size={18} /> RESET TOÀN BỘ DỮ LIỆU HỆ THỐNG
                    </button>
                 </div>
              </div>
           </div>
        )}
        
        <UserManagementModal
          showUserModal={showUserModal}
          setShowUserModal={setShowUserModal}
          editingUser={editingUser}
          userForm={userForm}
          setUserForm={setUserForm}
          handleUserAction={handleUserAction}
          PERMISSIONS={PERMISSIONS}
        />

        <AdminSecurityModal 
          isOpen={securityModal.isOpen}
          onClose={() => setSecurityModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={securityModal.onConfirm}
          title={securityModal.title}
          description={securityModal.description}
        />

        <PatientEditModal
          isEditingPatient={isEditingPatient}
          editForm={editForm}
          setEditForm={setEditForm}
          setIsEditingPatient={setIsEditingPatient}
          savePatientEdit={savePatientEdit}
        />
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; background: #F8FAFC; color: #1E293B; }
      `}</style>
    </div>
  );
}
