import React from 'react';
import { QrCode } from 'lucide-react';

const PrintableResult = React.forwardRef(({ patient, survey }: any, ref: any) => {
   if (!patient) return null;
   return (
      <div ref={ref} className="p-20 bg-white text-black" style={{ width: '210mm', minHeight: '297mm', fontSize: '14pt', lineHeight: '1.5', fontFamily: '"Times New Roman", Times, serif' }}>
         {/* Header */}
         <div className="flex justify-between items-start border-b-4 border-black pb-8 mb-12" style={{ marginBottom: '25pt' }}>
            <div className="flex items-center gap-6">
               <div className="w-20 h-20 bg-blue-600 text-white flex items-center justify-center rounded-xl shadow-lg">
                  <QrCode size={48} />
               </div>
               <div>
                  <h1 style={{ fontSize: '18pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4pt' }}>Bệnh viện Trung ương Huế</h1>
                  <h2 style={{ fontSize: '14pt', fontWeight: 'bold', color: '#475569' }}>Chương trình Tầm soát Ung thư Tuyến Tiền Liệt 2026</h2>
               </div>
            </div>
            <div className="text-right">
               <p style={{ fontSize: '18pt', fontWeight: 'bold' }}>Mã số: #{patient.registration_number?.toString().padStart(4,'0')}</p>
               <p style={{ fontSize: '11pt', color: '#64748b' }}>Ngày in: {new Date().toLocaleDateString('vi-VN')}</p>
            </div>
         </div>

         {/* Title */}
         <h2 style={{ fontSize: '24pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '35pt', textTransform: 'uppercase' }}>Phiếu Kết Quả Cận Lâm Sàng</h2>

         {/* Patient Info */}
         <div className="mb-12 space-y-4">
            <h3 style={{ fontSize: '16pt', fontWeight: 'bold', borderBottom: '2px solid #cbd5e1', paddingBottom: '5pt', marginBottom: '12pt', textTransform: 'uppercase' }}>1. Thông tin Hành chính</h3>
            <div className="grid grid-cols-2 gap-y-4" style={{ fontSize: '14pt' }}>
               <p><b>Họ và tên:</b> <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{patient.full_name}</span></p>
               <p><b>Năm sinh:</b> {new Date(patient.dob).getFullYear()}</p>
               <p><b>CCCD:</b> {patient.cccd}</p>
               <p><b>Điện thoại:</b> {patient.phone}</p>
               <p className="col-span-2"><b>Địa chỉ:</b> {patient.ward}, {patient.district}, {patient.province}</p>
            </div>
         </div>

         {/* Clinical Info */}
         {survey && (
            <div className="mb-12 space-y-4">
               <h3 style={{ fontSize: '16pt', fontWeight: 'bold', borderBottom: '2px solid #cbd5e1', paddingBottom: '5pt', marginBottom: '12pt', textTransform: 'uppercase' }}>2. Yếu tố nguy cơ & Triệu chứng</h3>
               <div className="space-y-2" style={{ fontSize: '14pt' }}>
                  <p><b>Tiền sử K gia đình:</b> {patient.family_history ? 'Có' : 'Không'}</p>
                  <p><b>Đột biến BRCA:</b> {survey.brca_mutation ? 'Có' : 'Không'}</p>
                  <p><b>Triệu chứng đường tiểu dưới:</b> {patient.symptoms || 'Không ghi nhận rõ ràng'}</p>
               </div>
            </div>
         )}

         {/* Test Results */}
         {survey && (
            <div className="mb-12 space-y-8">
               <h3 style={{ fontSize: '16pt', fontWeight: 'bold', borderBottom: '2px solid #cbd5e1', paddingBottom: '5pt', marginBottom: '12pt', textTransform: 'uppercase' }}>3. Kết quả Cận lâm sàng</h3>
               
               <div className="p-8 border-2 border-black rounded-2xl bg-slate-50">
                  <h4 style={{ fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', marginBottom: '8pt' }}>Chỉ số PSA</h4>
                  <div className="flex items-baseline gap-4">
                     <span style={{ fontSize: '42pt', fontWeight: 'bold', lineHeight: '1' }}>{survey.psa_value || 'Chưa có'}</span>
                     <span style={{ fontSize: '18pt', fontWeight: 'bold' }}>ng/mL</span>
                  </div>
                  {survey.psa_value && parseFloat(survey.psa_value) > 4.0 && (
                     <div className="mt-4 p-3 bg-red-50 border-l-8 border-red-600">
                        <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '13pt', fontStyle: 'italic' }}>* Chỉ số vượt ngưỡng bình thường (&gt;4.0 ng/mL)</p>
                     </div>
                  )}
               </div>

               <div className="p-8 border-2 border-black rounded-2xl">
                  <h4 style={{ fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', marginBottom: '8pt' }}>Kết quả Siêu âm</h4>
                  <p style={{ fontSize: '14pt', lineHeight: '1.6' }}>{survey.ultrasound_result || 'Chưa có kết quả'}</p>
               </div>
            </div>
         )}

         {/* Doctor Signature */}
         <div className="mt-20 flex justify-end">
            <div className="text-center" style={{ width: '220pt' }}>
               <p style={{ fontStyle: 'italic', fontSize: '13pt', marginBottom: '70pt' }}>Huế, ngày {new Date().getDate()} tháng {new Date().getMonth()+1} năm {new Date().getFullYear()}</p>
               <p style={{ fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase' }}>BÁC SĨ CHUYÊN KHOA</p>
               <p style={{ fontSize: '11pt', color: '#64748b', marginTop: '4pt' }}>(Ký và ghi rõ họ tên)</p>
            </div>
         </div>
      </div>
   );
});

PrintableResult.displayName = 'PrintableResult';

export default PrintableResult;
