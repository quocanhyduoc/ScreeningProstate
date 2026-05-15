import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, CheckCircle, XCircle, Clock, 
  BarChart3, LogOut, Search, RefreshCw, 
  Activity, LayoutDashboard, ChevronRight,
  MoreVertical, Filter, Download, Fingerprint, Heart,
  Phone, Calendar, ArrowUpRight, Zap, Bell, X, Info, Trash2, Edit, Save, Plus,
  Mail, MessageSquare, Send, ShieldCheck, MapPin, QrCode, AlertCircle, UserPlus, Shield, Lock,
  UserCheck, ClipboardList, Droplets
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { format } from 'date-fns';
import { useReactToPrint } from 'react-to-print';

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
  const [stats, setStats] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('patients');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Extra Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [slotFilter, setSlotFilter] = useState('ALL');
  const [extraSlotFilter, setExtraSlotFilter] = useState('ALL'); // ALL, STANDARD, EXTRA
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

  const router = useRouter();
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
    
    // WebSocket Connection
    const wsUrl = API_URL.replace('http', 'ws');
    const ws = new WebSocket(`${wsUrl}/admin/ws`);
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("WS Event:", data);
        if (data.type === 'NEW_REGISTRATION' || data.type === 'UPDATE_PATIENT' || data.type === 'SURVEY_SUBMITTED') {
            fetchData(true); // silent fetch
            if (data.type === 'NEW_REGISTRATION') {
               setToast("Có đăng ký mới từ hệ thống!");
            } else if (data.status === 'DA_CO_KET_QUA_MAU' && data.psa_value) {
               if (parseFloat(data.psa_value) > 4.0) {
                  setToast(`⚠️ CẢNH BÁO: Phát hiện bệnh nhân có PSA cao (${data.psa_value})!`);
               }
            }
        }
    };
    
    const interval = setInterval(() => fetchData(true), 30000); // 30s auto-refresh fallback
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

      // Fetch users if superadmin
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
    } catch (e) {
      setToast("Lỗi khi cập nhật trạng thái");
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
      setToast(e.response?.data?.detail || "Lỗi khi xóa bản ghi");
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
      setToast(e.response?.data?.detail || "Lỗi khi xóa dữ liệu");
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
      setToast(e.response?.data?.detail || "Lỗi khi reset dữ liệu");
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
          <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -100, opacity: 0 }} className="fixed top-4 right-4 z-[100] bg-[#0067b8] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-blue-500">
             <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"><Bell size={18} /></div>
             <p className="font-bold text-[14px]">{toast}</p>
             <button onClick={() => setToast(null)} className="p-1 hover:bg-white/10 rounded-md"><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Patient Detail Modal */}
      <AnimatePresence>
        {selectedPatient && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl">
               <div className="p-8 bg-[#0067b8] text-white flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center font-bold text-xl">
                      #{selectedPatient.registration_number?.toString().padStart(3, '0')}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{selectedPatient.full_name}</h3>
                      <p className="text-blue-100 text-[12px] flex items-center gap-2">
                        <Fingerprint size={14} /> CCCD: {selectedPatient.cccd}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedPatient(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
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
                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
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
                        <div className={`p-3 rounded-xl border flex items-center justify-between ${selectedPatient.family_history ? 'bg-red-50 border-red-100 text-red-700' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                          <span className="text-[12px] font-bold">Tiền sử gia đình</span>
                          <Heart size={16} fill={selectedPatient.family_history ? "currentColor" : "none"} />
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Ghi chú triệu chứng</p>
                          <p className="text-[13px] font-medium italic text-slate-600">{selectedPatient.symptoms || 'Không có ghi chú'}</p>
                        </div>
                      </div>
                    </div>

                    {selectedSurvey && (role === 'SUPERADMIN' || userPermissions.includes('results')) && (
                       <div className="space-y-3 p-5 bg-blue-50 rounded-2xl border border-blue-100">
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
                       <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
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
                          className="py-3 bg-green-600 text-white rounded-xl font-bold text-[13px] hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={16} /> CHỐT HẸN
                        </button>
                        <button 
                          disabled={updatingStatus || selectedPatient.status === 'HUY'}
                          onClick={() => handleUpdateStatus(selectedPatient.id, 'HUY')}
                          className="py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-[13px] hover:bg-slate-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <XCircle size={16} /> HỦY LỊCH
                        </button>
                        {role === 'SUPERADMIN' && (
                          <button 
                            onClick={() => confirmDeletePatient(selectedPatient.id)}
                            className="py-3 bg-red-50 text-red-600 rounded-xl font-bold text-[13px] hover:bg-red-100 transition-all flex items-center justify-center gap-2 col-span-2"
                          >
                            <Trash2 size={16} /> XÓA DỮ LIỆU
                          </button>
                        )}
                        {(role === 'SUPERADMIN' || userPermissions.includes('results')) && (
                          <button 
                              onClick={handlePrint}
                              className="py-3 bg-blue-600 text-white rounded-xl font-bold text-[13px] hover:bg-blue-700 transition-all flex items-center justify-center gap-2 col-span-2 shadow-md"
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
        )}
      </AnimatePresence>

      {/* Hidden Print Component */}
      <div style={{ display: 'none' }}>
         <PrintableResult ref={printRef} patient={selectedPatient} survey={selectedSurvey} />
      </div>

      {/* Sidebar */}
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
              <NavIcon icon={<LayoutDashboard size={18}/>} label="Tổng quan" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            )}
            <NavIcon icon={<Users size={18}/>} label="DS Bệnh nhân" active={activeTab === 'patients'} onClick={() => setActiveTab('patients')} />
            { (role === 'SUPERADMIN' || userPermissions.includes('clinical_reception')) && (
               <NavIcon icon={<UserCheck size={18}/>} label="Clinical: Đón tiếp" active={activeTab === 'clinical_reception'} onClick={() => setActiveTab('clinical_reception')} />
            )}
            { (role === 'SUPERADMIN' || userPermissions.includes('clinical_screening')) && (
               <NavIcon icon={<ClipboardList size={18}/>} label="Clinical: Khám sàng lọc" active={activeTab === 'clinical_screening'} onClick={() => setActiveTab('clinical_screening')} />
            )}
            { (role === 'SUPERADMIN' || userPermissions.includes('clinical_lab')) && (
               <NavIcon icon={<Droplets size={18}/>} label="Clinical: Xét nghiệm & S.Âm" active={activeTab === 'clinical_lab'} onClick={() => setActiveTab('clinical_lab')} />
            )}
            { (role === 'SUPERADMIN' || userPermissions.includes('clinical_consult')) && (
               <NavIcon icon={<MessageSquare size={18}/>} label="Clinical: Tư vấn & Trả KQ" active={activeTab === 'clinical_consult'} onClick={() => setActiveTab('clinical_consult')} />
            )}
            {role === 'SUPERADMIN' && (
              <NavIcon icon={<Shield size={18}/>} label="Quản lý Vai trò" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
            )}
            {(role === 'SUPERADMIN' || userPermissions.includes('calendar')) && (
              <NavIcon icon={<Calendar size={18}/>} label="Lịch khám" active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
            )}
            {(role === 'SUPERADMIN' || userPermissions.includes('reports')) && (
              <NavIcon icon={<BarChart3 size={18}/>} label="Báo cáo" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
            )}
            {role === 'SUPERADMIN' && (
              <NavIcon icon={<ShieldCheck size={18}/>} label="Cài đặt hệ thống" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
            )}
          </nav>
        </div>
        <div className="p-6 border-t border-slate-100 space-y-4">
          <div className="px-4 py-3 bg-slate-50 rounded-xl">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{role === 'SUPERADMIN' ? 'Quản trị viên' : 'Điều hành Clinical'}</p>
             <p className="text-[13px] font-bold text-slate-700 truncate">{username === 'admin' ? 'admin_clinical' : username}</p>
          </div>
          <button onClick={() => router.push('/login')} className="w-full flex items-center justify-center gap-2 py-3 text-[12px] font-bold text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-all">
            <LogOut size={16} /> Thoát
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        <header className="flex justify-between items-center mb-10">
          <div className="space-y-1">
             <h2 className="text-2xl font-bold tracking-tight text-[#121C2D]">
               {role === 'SUPERADMIN' ? 'Hệ thống Quản trị Cấp cao' : 'Hệ thống Quản lý Lâm sàng'}
             </h2>
             <p className="text-[12px] text-slate-400 font-medium italic">Quản lý Bệnh nhân & Quy trình Lâm sàng Sàng lọc</p>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={handleExport} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-[#121C2D] rounded-xl font-bold text-[13px] hover:bg-slate-50 transition-all shadow-sm">
                <Download size={18} /> Xuất Excel
             </button>
             <button onClick={() => fetchData()} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-50 transition-all shadow-sm">
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
                <div className="flex items-center gap-4 p-4 bg-white border border-red-100 rounded-2xl shadow-lg sticky bottom-8 z-30">
                   <p className="text-[13px] font-bold text-slate-600">Đã chọn <span className="text-red-600">{selectedIds.length}</span> bản ghi</p>
                   <button onClick={confirmDeleteSelected} className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-xl font-bold text-[13px] hover:bg-red-700 transition-all shadow-md">
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
                  <button onClick={() => { setEditingUser(null); setUserForm({ username: '', password: '', role: 'CLINICAL', permissions: [] }); setShowUserModal(true); }} className="flex items-center gap-2 px-6 py-2.5 bg-[#0067b8] text-white rounded-xl font-bold text-[13px] hover:bg-blue-700 transition-all shadow-md">
                    <UserPlus size={18} /> THÊM NGƯỜI DÙNG
                 </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                 <table className="w-full text-left border-collapse">
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
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black border border-blue-100 uppercase tracking-widest">{user.role}</span>
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
            <div className="flex flex-wrap items-center justify-between gap-4">
               <div className="flex gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <Tab label="Tất cả" active={statusFilter === 'ALL'} onClick={() => setStatusFilter('ALL')} count={registrations.length} />
                  <Tab label="Chờ duyệt" active={statusFilter === 'CHO_XAC_NHAN'} onClick={() => setStatusFilter('CHO_XAC_NHAN')} count={registrations.filter(r=>r.status==='CHO_XAC_NHAN').length} />
                  <Tab label="Đã chốt" active={statusFilter === 'DA_XAC_NHAN'} onClick={() => setStatusFilter('DA_XAC_NHAN')} count={registrations.filter(r=>r.status==='DA_XAC_NHAN').length} />
               </div>
               
               <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm tên, SĐT, CCCD, Mã số..." className="bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-[13px] outline-none focus:border-blue-500 w-64 font-medium" />
                  </div>
                  <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[13px] border ${showFilters ? 'bg-[#0067b8] text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200'}`}><Filter size={16} /> Lọc</button>
               </div>
            </div>

            <AnimatePresence>
               {showFilters && (
                 <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-white border border-slate-200 rounded-2xl p-6 grid grid-cols-4 gap-6 shadow-sm mt-4">
                    <div className="space-y-2">
                       <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock size={14}/> Khung giờ</label>
                       <select value={slotFilter} onChange={(e) => setSlotFilter(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold outline-none">
                          <option value="ALL">Tất cả khung giờ</option>
                          <option value="7:00-11:30 ngày 30/5 (Thứ 7)">Sáng 30/5</option>
                          <option value="13:30-16:00 ngày 30/5 (Thứ 7)">Chiều 30/5</option>
                          <option value="7:00-11:30 ngày 31/5 (Chủ nhật)">Sáng 31/5</option>
                          <option value="13:30-16:00 ngày 31/5 (Chủ nhật)">Chiều 31/5</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Zap size={14}/> Loại suất</label>
                       <select value={extraSlotFilter} onChange={(e) => setExtraSlotFilter(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold outline-none">
                          <option value="ALL">Tất cả loại</option>
                          <option value="STANDARD">Suất chuẩn</option>
                          <option value="EXTRA">Suất ngoài (Extra)</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Heart size={14}/> Nhóm nguy cơ</label>
                       <select value={historyFilter} onChange={(e) => setHistoryFilter(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold outline-none">
                          <option value="ALL">Tất cả bệnh nhân</option>
                          <option value="YES">Có tiền sử gia đình</option>
                          <option value="NO">Không có tiền sử</option>
                       </select>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
               <table className="w-full text-left border-collapse">
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
                                 <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-black text-[12px] border border-slate-200">
                                    {reg.registration_number?.toString().padStart(3, '0') || 'N/A'}
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
                                    <Clock size={12} />
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
                              <Badge status={reg.status} />
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                 <button onClick={() => setSelectedPatient(reg)} title="Xem chi tiết" className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Info size={16}/></button>
                                 <button onClick={() => handleUpdateStatus(reg.id, 'DA_XAC_NHAN')} title="Chốt lịch" className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all"><CheckCircle size={16}/></button>
                                 <button onClick={() => handleUpdateStatus(reg.id, 'HUY')} title="Hủy lịch" className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-red-600 hover:text-white transition-all"><XCircle size={16}/></button>
                                 {role === 'SUPERADMIN' && (
                                    <>
                                       <button onClick={() => handleEditPatient(reg)} title="Chỉnh sửa" className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"><Edit size={16}/></button>
                                       <button onClick={() => confirmDeletePatient(reg.id)} title="Xóa" className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16}/></button>
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
              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center"><AlertCircle size={24}/></div>
                    <div>
                       <h3 className="text-xl font-bold text-slate-900">Khu vực nguy hiểm</h3>
                       <p className="text-[13px] text-slate-500 font-medium">Hành động này sẽ xóa sạch toàn bộ cơ sở dữ liệu bệnh nhân.</p>
                    </div>
                 </div>
                 
                 <div className="p-6 bg-red-50 rounded-2xl border border-red-100 border-dashed">
                    <p className="text-[12px] font-bold text-red-700 leading-relaxed mb-6">
                       Việc Reset dữ liệu sẽ xóa toàn bộ danh sách đăng ký và kết quả khảo sát. Hành động này thường được thực hiện khi kết thúc một đợt tầm soát để chuẩn bị cho đợt tiếp theo.
                    </p>
                    <button 
                      onClick={confirmResetAll}
                      className="w-full py-4 bg-red-600 text-white rounded-xl font-black text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-3"
                    >
                       <RefreshCw size={18} /> RESET TOÀN BỘ DỮ LIỆU HỆ THỐNG
                    </button>
                 </div>
              </div>
           </div>
        )}
        
        {/* User Management Modal */}
        <AnimatePresence>
          {showUserModal && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[80] flex items-center justify-center p-6">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl">
                 <div className="p-8 bg-[#121C2D] text-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center"><UserPlus size={24}/></div>
                       <div>
                          <h3 className="text-xl font-bold">{editingUser ? 'Cập nhật Người dùng' : 'Thêm Người dùng mới'}</h3>
                          <p className="text-slate-400 text-[12px] font-medium uppercase tracking-widest mt-0.5">Phân quyền hệ thống</p>
                       </div>
                    </div>
                    <button onClick={() => setShowUserModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
                 </div>
                 
                 <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-2">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tên đăng nhập</label>
                       <input value={userForm.username} onChange={e=>setUserForm({...userForm, username: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-500" placeholder="admin_clinical" />
                    </div>
                    
                    <div className="space-y-2">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Mật khẩu {editingUser && '(Để trống nếu không đổi)'}</label>
                       <input type="password" value={userForm.password} onChange={e=>setUserForm({...userForm, password: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-500" placeholder="••••••••" />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Vai trò</label>
                       <select value={userForm.role} onChange={e=>setUserForm({...userForm, role: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-500">
                          <option value="CLINICAL">Nhân viên Lâm sàng</option>
                          <option value="CLINICAL">Nhân viên Lâm sàng (Clinical)</option>
                          <option value="SUPERADMIN">Super Admin</option>
                       </select>
                    </div>

                    {userForm.role !== 'SUPERADMIN' && (
                       <div className="space-y-3">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Phân quyền chức năng</label>
                          <div className="grid grid-cols-1 gap-2">
                             {PERMISSIONS.map(p => (
                                <label key={p.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all border border-slate-200">
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
                    <button onClick={() => setShowUserModal(false)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all">HỦY BỎ</button>
                    <button onClick={handleUserAction} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2">
                       <Save size={18} /> LƯU NGƯỜI DÙNG
                    </button>
                 </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Security Verification Modal */}
        <AdminSecurityModal 
          isOpen={securityModal.isOpen}
          onClose={() => setSecurityModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={securityModal.onConfirm}
          title={securityModal.title}
          description={securityModal.description}
        />

        {/* Patient Edit Modal */}
        <AnimatePresence>
          {isEditingPatient && editForm && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70] flex items-center justify-center p-6">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-xl rounded-[32px] overflow-hidden shadow-2xl">
                 <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center"><Edit size={24}/></div>
                       <div>
                          <h3 className="text-xl font-bold">Chỉnh sửa thông tin</h3>
                          <p className="text-slate-400 text-[12px] font-medium uppercase tracking-widest mt-0.5">ID: {editForm.registration_number}</p>
                       </div>
                    </div>
                    <button onClick={() => setIsEditingPatient(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
                 </div>
                 
                 <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Họ và tên</label>
                          <input 
                            value={editForm.full_name} 
                            onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-500"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Số CCCD</label>
                          <input 
                            value={editForm.cccd} 
                            onChange={(e) => setEditForm({...editForm, cccd: e.target.value})}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-500"
                          />
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Số điện thoại</label>
                          <input 
                            value={editForm.phone} 
                            onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-500"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Email</label>
                          <input 
                            value={editForm.email || ''} 
                            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-500"
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Khung giờ hẹn</label>
                       <input 
                         value={editForm.appointment_slot || ''} 
                         onChange={(e) => setEditForm({...editForm, appointment_slot: e.target.value})}
                         className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-500"
                       />
                    </div>
                 </div>

                 <div className="p-8 bg-slate-50 flex gap-3">
                    <button onClick={() => setIsEditingPatient(false)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all">HỦY BỎ</button>
                    <button 
                      onClick={savePatientEdit}
                      className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                    >
                       <Save size={18} /> LƯU THAY ĐỔI
                    </button>
                 </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; background: #F8FAFC; color: #1E293B; }
      `}</style>
    </div>
  );
}

function NavIcon({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-[13px] font-bold transition-all ${active ? 'bg-blue-50 text-[#0067b8]' : 'text-slate-500 hover:bg-slate-50'}`}>
      {icon} <span>{label}</span>
    </button>
  );
}

function StatCard({ label, value, color }: any) {
  return (
    <div className={`p-6 bg-white rounded-3xl border shadow-sm ${color}`}>
       <p className="text-[11px] font-black uppercase tracking-widest opacity-60 mb-2">{label}</p>
       <p className="text-3xl font-black tracking-tight">{value || 0}</p>
    </div>
  );
}

function Tab({ label, active, onClick, count }: any) {
  return (
    <button onClick={onClick} className={`px-5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${active ? 'bg-white text-[#0067b8] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
      {label} <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${active ? 'bg-blue-50' : 'bg-slate-200'}`}>{count}</span>
    </button>
  );
}

function Badge({ status }: any) {
  const config: any = {
    'CHO_XAC_NHAN': { label: 'Chờ duyệt', color: 'bg-orange-50 text-orange-600 border-orange-100' },
    'DA_XAC_NHAN': { label: 'Đã chốt hẹn', color: 'bg-blue-50 text-blue-600 border-blue-100' },
    'DA_KHAO_SAT': { label: 'Đã khảo sát', color: 'bg-teal-50 text-teal-600 border-teal-100' },
    'DA_SIEU_AM': { label: 'Đã siêu âm', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    'DA_CO_KET_QUA_MAU': { label: 'Đã có kết quả', color: 'bg-green-50 text-green-600 border-green-100' },
    'HOAN_THANH': { label: 'Hoàn thành', color: 'bg-slate-800 text-white border-slate-900' },
    'HUY': { label: 'Đã hủy', color: 'bg-slate-100 text-slate-500 border-slate-200' },
  };
  const { label, color } = config[status] || { label: status, color: 'bg-slate-100 text-slate-500' };
  return <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${color}`}>{label}</span>;
}

function SurveyTag({ label, color }: any) {
   return (
      <div className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${color}`}>
         <ShieldCheck size={12} /> {label}
      </div>
   );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
       <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-50 border-t-[#0067b8] rounded-full animate-spin" />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Loading System...</p>
       </div>
    </div>
  );
}

function AdminSecurityModal({ isOpen, onClose, onConfirm, title, description }: any) {
   const [password, setPassword] = useState('');
   
   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
         <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-white">
            <div className="p-8 bg-red-600 text-white flex items-center gap-4">
               <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"><Lock size={24}/></div>
               <div>
                  <h3 className="text-xl font-bold">{title}</h3>
                  <p className="text-red-100 text-[12px] font-medium uppercase tracking-widest mt-0.5">Xác thực SuperAdmin</p>
               </div>
            </div>
            <div className="p-8 space-y-6">
               <p className="text-[14px] text-slate-500 font-medium leading-relaxed">{description}</p>
               
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mật khẩu xác nhận</label>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-bold outline-none focus:border-red-500 transition-all text-center tracking-[0.5em]"
                  />
               </div>
               
               <div className="flex gap-3">
                  <button onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all">HỦY BỎ</button>
                  <button 
                    onClick={() => {
                        onConfirm(password);
                        setPassword('');
                    }}
                    className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-100"
                  >
                     XÁC NHẬN
                  </button>
               </div>
            </div>
         </motion.div>
      </div>
   );
}

// --- NEW COMPONENTS ---

function ClinicalHubTab({ activeTab, API_URL, fetchData, setToast, role }: any) {
   const [qrInput, setQrInput] = useState('');
   const [scannedPatient, setScannedPatient] = useState<any>(null);
   const [loading, setLoading] = useState(false);
   const [psaInput, setPsaInput] = useState('');
   const [ultraResult, setUltraResult] = useState('');
   const [registrations, setRegistrations] = useState<any[]>([]);
   const router = useRouter();

   const stationMap: any = {
      'clinical_reception': { label: 'Bàn Tiếp nhận', status: 'DA_XAC_NHAN', nextStatus: 'DA_TIEP_NHAN', icon: <UserCheck/> },
      'clinical_screening': { label: 'Khám sàng lọc', status: 'DA_TIEP_NHAN', nextStatus: 'CHO_XET_NGHIEM', icon: <ClipboardList/> },
      'clinical_lab': { label: 'Xét nghiệm & Siêu âm', status: 'CHO_XET_NGHIEM', nextStatus: 'CHO_KET_QUA', icon: <Droplets/> },
      'clinical_consult': { label: 'Tư vấn & Trả KQ', status: 'CHO_KET_QUA', nextStatus: 'HOAN_THANH', icon: <MessageSquare/> },
   };

   const currentStation = stationMap[activeTab] || stationMap['clinical_reception'];

   useEffect(() => {
      fetchStationData();
   }, [activeTab]);

   const fetchStationData = async () => {
      setLoading(true);
      try {
         const token = localStorage.getItem('token');
         const res = await axios.get(`${API_URL}/clinical/registrations?status=${currentStation.status}`, {
            headers: { Authorization: `Bearer ${token}` }
         });
         setRegistrations(res.data);
      } catch (e) {
         console.error(e);
      } finally {
         setLoading(false);
      }
   };

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
         await axios.patch(`${API_URL}/clinical/status/${id}?new_status=${nextStatus}`, {}, {
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
         <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  {React.cloneElement(currentStation.icon, { size: 24 })}
               </div>
               <div>
                  <h3 className="text-xl font-bold">{currentStation.label}</h3>
                  <p className="text-slate-400 text-[12px] font-medium uppercase tracking-widest">Quy trình Clinical Onsite</p>
               </div>
            </div>
            <form onSubmit={handleScan} className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
               <div className="bg-white rounded-xl flex items-center px-4 py-2 w-64 border border-slate-100 shadow-sm">
                  <QrCode size={18} className="text-slate-400 mr-2" />
                  <input autoFocus value={qrInput} onChange={e=>setQrInput(e.target.value)} placeholder="Quét QR / Nhập CCCD..." className="bg-transparent border-none outline-none text-[#121C2D] font-bold w-full text-sm" />
               </div>
               <button type="submit" disabled={loading} className="px-4 py-2 bg-[#0067b8] text-white rounded-xl font-bold hover:bg-blue-700 transition-all text-xs">
                  KIỂM TRA
               </button>
            </form>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
               <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                     <h4 className="font-bold text-sm flex items-center gap-2">Bệnh nhân đang chờ ({registrations.length})</h4>
                     <button onClick={fetchStationData} className="p-2 hover:bg-slate-200 rounded-lg transition-all"><RefreshCw size={14} className={loading ? 'animate-spin' : ''}/></button>
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
                                 <td className="px-6 py-4 font-bold text-slate-400">#{r.registration_number?.toString().padStart(3,'0')}</td>
                                 <td className="px-4 py-4 font-bold">{r.full_name}</td>
                                 <td className="px-4 py-4 text-blue-600 font-bold">{r.appointment_slot}</td>
                                 <td className="px-6 py-4 text-right">
                                    <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><ChevronRight size={14}/></button>
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
                     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white rounded-[32px] border border-slate-200 shadow-xl overflow-hidden">
                        <div className="p-6 bg-blue-600 text-white flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-black">#{scannedPatient.registration_number}</div>
                              <h4 className="font-bold truncate max-w-[150px]">{scannedPatient.full_name}</h4>
                           </div>
                           <button onClick={() => setScannedPatient(null)} className="p-1 hover:bg-white/10 rounded-full"><X size={20}/></button>
                        </div>
                        <div className="p-6 space-y-6">
                           <div className="space-y-3">
                              <div className="flex justify-between text-xs"><span className="text-slate-400 font-bold uppercase">Năm sinh</span><span className="font-bold">{new Date(scannedPatient.dob).getFullYear()}</span></div>
                              <div className="flex justify-between text-xs"><span className="text-slate-400 font-bold uppercase">Điện thoại</span><span className="font-bold">{scannedPatient.phone}</span></div>
                              <div className="flex justify-between text-xs"><span className="text-slate-400 font-bold uppercase">Trạng thái</span><Badge status={scannedPatient.status}/></div>
                           </div>

                           <div className="pt-6 border-t border-slate-50 space-y-4">
                              {activeTab === 'clinical_reception' && (
                                 <button onClick={() => handleUpdateStatus(scannedPatient.id, 'DA_TIEP_NHAN')} className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-green-700 transition-all">XÁC NHẬN TIẾP NHẬN</button>
                              )}
                              {activeTab === 'clinical_screening' && (
                                 <button onClick={() => router.push(`/clinical/survey?id=${scannedPatient.id}`)} className="w-full py-4 bg-[#0067b8] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">THỰC HIỆN KHẢO SÁT</button>
                              )}
                              {activeTab === 'clinical_lab' && (
                                 <div className="space-y-3">
                                    <input value={psaInput} onChange={e=>setPsaInput(e.target.value)} placeholder="Nhập PSA value..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm" />
                                    <textarea value={ultraResult} onChange={e=>setUltraResult(e.target.value)} placeholder="Nhập kết quả Siêu âm..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm min-h-[100px]" />
                                    <button onClick={() => handleUpdateStatus(scannedPatient.id, 'CHO_KET_QUA')} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-100 hover:bg-red-700 transition-all">LƯU KẾT QUẢ CLS</button>
                                 </div>
                              )}
                              {activeTab === 'clinical_consult' && (
                                 <button onClick={() => handleUpdateStatus(scannedPatient.id, 'HOAN_THANH')} className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-purple-100 hover:bg-purple-700 transition-all">HOÀN TẤT QUY TRÌNH</button>
                              )}
                           </div>
                        </div>
                     </motion.div>
                  ) : (
                     <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] p-10 text-center flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-300 shadow-sm"><UserCheck size={24}/></div>
                        <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Chọn BN để xử lý</p>
                     </div>
                  )}
               </AnimatePresence>
            </div>
         </div>
      </div>
   );
}

function ReportsTab({ registrations, stats, role, userPermissions }: any) {
   // Calculate risk distributions
   const hasRisk = registrations.filter((r: any) => r.family_history).length;
   const noRisk = registrations.length - hasRisk;
   const pieData = [
      { name: 'Có tiền sử GD', value: hasRisk, color: '#ef4444' },
      { name: 'Không có tiền sử', value: noRisk, color: '#3b82f6' }
   ];

   const districts = registrations.reduce((acc: any, r: any) => {
      acc[r.district] = (acc[r.district] || 0) + 1;
      return acc;
   }, {});

   const barData = Object.keys(districts).map(d => ({ name: d, 'Bệnh nhân': districts[d] })).sort((a, b) => b['Bệnh nhân'] - a['Bệnh nhân']).slice(0, 5);

   const statusDistribution = [
      { name: 'Đã chốt', value: stats?.confirmed_registrations || 0, color: '#22c55e' },
      { name: 'Đã hủy', value: stats?.cancelled_registrations || 0, color: '#94a3b8' },
      { name: 'Chờ duyệt', value: stats?.pending_registrations || 0, color: '#f59e0b' }
   ];

   const isAuthorized = role === 'SUPERADMIN' || userPermissions.includes('reports');

   return (
      <div className="space-y-6">
         <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-[350px]">
               <h4 className="text-[12px] font-black uppercase tracking-widest text-slate-500 mb-6">Trạng thái Lịch hẹn</h4>
               <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                     <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {statusDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                     </Pie>
                     <Tooltip />
                     <Legend />
                  </PieChart>
               </ResponsiveContainer>
            </div>
            {isAuthorized && (
               <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-[350px]">
                  <h4 className="text-[12px] font-black uppercase tracking-widest text-slate-500 mb-6">Tỷ lệ yếu tố nguy cơ</h4>
                  <ResponsiveContainer width="100%" height="80%">
                     <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                           {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                     </PieChart>
                  </ResponsiveContainer>
               </div>
            )}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-[350px]">
               <h4 className="text-[12px] font-black uppercase tracking-widest text-slate-500 mb-6">Phân bố theo Quận/Huyện</h4>
               <ResponsiveContainer width="100%" height="80%">
                  <BarChart data={barData}>
                     <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                     <YAxis fontSize={10} tickLine={false} axisLine={false} />
                     <Tooltip cursor={{fill: 'transparent'}} />
                     <Bar dataKey="Bệnh nhân" fill="#0067b8" radius={[4,4,0,0]} barSize={30} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* High Risk Alerts */}
         <div className="bg-red-50 border border-red-200 rounded-3xl p-6">
            <h4 className="text-[14px] font-black uppercase tracking-widest text-red-600 mb-4 flex items-center gap-2"><AlertCircle size={16}/> Bệnh nhân nguy cơ cao (Cần chú ý)</h4>
            <div className="space-y-3">
               {registrations.filter(r => r.family_history).slice(0,5).map(r => (
                  <div key={r.id} className="bg-white p-4 rounded-xl border border-red-100 flex items-center justify-between">
                     <div>
                        <p className="font-bold text-[14px]">{r.full_name}</p>
                        <p className="text-[11px] text-slate-500">Mã: #{r.registration_number}</p>
                     </div>
                     <span className="px-3 py-1 bg-red-100 text-red-600 rounded-md text-[10px] font-black uppercase">Có tiền sử GD</span>
                  </div>
               ))}
               {registrations.filter(r => r.family_history).length === 0 && <p className="text-[12px] text-slate-500 font-medium italic">Không có dữ liệu nguy cơ cao.</p>}
            </div>
         </div>
      </div>
   );
}

function CalendarTab({ registrations }: any) {
   // Group by slots
   const slots = registrations.reduce((acc: any, curr: any) => {
      const s = curr.appointment_slot || 'Khác';
      if (!acc[s]) acc[s] = [];
      acc[s].push(curr);
      return acc;
   }, {});

   return (
      <div className="space-y-8">
         {Object.keys(slots).map(slot => (
            <div key={slot} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                  <h4 className="font-bold text-[#121C2D] flex items-center gap-2"><Calendar size={18} className="text-blue-600"/> Khung giờ: {slot}</h4>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-[11px] font-black">{slots[slot].length} bệnh nhân</span>
               </div>
               <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {slots[slot].map((r: any) => (
                     <div key={r.id} className="p-4 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors bg-white">
                        <div className="flex justify-between items-start mb-3">
                           <span className="text-[18px] font-black text-slate-300">#{r.registration_number?.toString().padStart(3,'0')}</span>
                           <Badge status={r.status} />
                        </div>
                        <p className="font-bold text-[15px]">{r.full_name}</p>
                        <p className="text-[12px] text-slate-500 flex items-center gap-1.5 mt-1"><Phone size={12}/> {r.phone}</p>
                     </div>
                  ))}
               </div>
            </div>
         ))}
      </div>
   );
}

const PrintableResult = React.forwardRef(({ patient, survey }: any, ref: any) => {
   if (!patient) return null;
   return (
      <div ref={ref} className="p-10 bg-white text-black font-sans w-full max-w-4xl mx-auto">
         {/* Header */}
         <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-6">
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 bg-blue-600 text-white flex items-center justify-center rounded-xl">
                  <QrCode size={32} />
               </div>
               <div>
                  <h1 className="text-xl font-black uppercase tracking-tight">Bệnh viện Trung ương Huế</h1>
                  <h2 className="text-[14px] font-bold text-slate-600">Chương trình Tầm soát Ung thư Tuyến Tiền Liệt 2026</h2>
               </div>
            </div>
            <div className="text-right">
               <p className="font-bold text-[18px]">Mã số: #{patient.registration_number?.toString().padStart(3,'0')}</p>
               <p className="text-[12px] text-slate-500">Ngày in: {new Date().toLocaleDateString('vi-VN')}</p>
            </div>
         </div>

         {/* Title */}
         <h2 className="text-2xl font-black text-center mb-8 uppercase tracking-widest">Phiếu Kết Quả Cận Lâm Sàng</h2>

         {/* Patient Info */}
         <div className="mb-8 space-y-2">
            <h3 className="font-black border-b border-slate-300 pb-1 mb-3 uppercase">1. Thông tin Hành chính</h3>
            <div className="grid grid-cols-2 gap-4 text-[14px]">
               <p><b>Họ và tên:</b> {patient.full_name}</p>
               <p><b>Năm sinh:</b> {new Date(patient.dob).getFullYear()}</p>
               <p><b>CCCD:</b> {patient.cccd}</p>
               <p><b>Điện thoại:</b> {patient.phone}</p>
               <p className="col-span-2"><b>Địa chỉ:</b> {patient.address_detail}, {patient.ward}, {patient.district}, {patient.province}</p>
            </div>
         </div>

         {/* Clinical Info */}
         {survey && (
            <div className="mb-8 space-y-2">
               <h3 className="font-black border-b border-slate-300 pb-1 mb-3 uppercase">2. Yếu tố nguy cơ & Triệu chứng</h3>
               <div className="text-[14px] space-y-1">
                  <p><b>Tiền sử K gia đình:</b> {patient.family_history ? 'Có' : 'Không'}</p>
                  <p><b>Đột biến BRCA:</b> {survey.brca_mutation ? 'Có' : 'Không'}</p>
                  <p><b>Triệu chứng đường tiểu dưới:</b> {patient.symptoms || 'Không ghi nhận rõ ràng'}</p>
               </div>
            </div>
         )}

         {/* Test Results */}
         {survey && (
            <div className="mb-8 space-y-4">
               <h3 className="font-black border-b border-slate-300 pb-1 mb-3 uppercase">3. Kết quả Cận lâm sàng</h3>
               
               <div className="p-4 border border-black rounded-lg">
                  <h4 className="font-bold uppercase text-[12px] text-slate-500 mb-2">Chỉ số PSA</h4>
                  <div className="flex items-end gap-2">
                     <span className="text-3xl font-black">{survey.psa_value || 'Chưa có'}</span>
                     <span className="font-bold mb-1">ng/mL</span>
                  </div>
                  {survey.psa_value && parseFloat(survey.psa_value) > 4.0 && (
                     <p className="text-red-600 font-bold text-[12px] mt-2 italic">* Chỉ số vượt ngưỡng bình thường (&gt;4.0 ng/mL)</p>
                  )}
               </div>

               <div className="p-4 border border-black rounded-lg">
                  <h4 className="font-bold uppercase text-[12px] text-slate-500 mb-2">Kết quả Siêu âm</h4>
                  <p className="text-[14px] font-medium leading-relaxed">{survey.ultrasound_result || 'Chưa có kết quả'}</p>
               </div>
            </div>
         )}

         {/* Doctor Signature */}
         <div className="mt-16 flex justify-end">
            <div className="text-center">
               <p className="italic text-[14px] mb-20">Huế, ngày {new Date().getDate()} tháng {new Date().getMonth()+1} năm {new Date().getFullYear()}</p>
               <p className="font-bold">BÁC SĨ CHUYÊN KHOA</p>
               <p className="text-[12px] text-slate-500 mt-1">(Ký và ghi rõ họ tên)</p>
            </div>
         </div>
      </div>
   );
});
