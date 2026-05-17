import React from 'react';

interface SurveyPrintTemplateProps {
   patient: any;
   survey: any;
}

const SurveyPrintTemplate = React.forwardRef<HTMLDivElement, SurveyPrintTemplateProps>(({ patient, survey }, ref) => {
   if (!patient) return null;
   const today = new Date();

   return (
      <div ref={ref} className="p-20 bg-white text-black" style={{ width: '210mm', minHeight: '297mm', fontSize: '14pt', lineHeight: '1.5', fontFamily: '"Times New Roman", Times, serif' }}>
         {/* Header */}
         <div className="flex justify-between items-start mb-6 border-b-4 border-black pb-8" style={{ marginBottom: '20pt' }}>
            <div className="text-left">
               <h1 style={{ fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4pt' }}>Bệnh viện Trung ương Huế</h1>
               <p style={{ fontSize: '10pt', fontWeight: 'bold', textTransform: 'uppercase' }}>Chương trình Tầm soát Ung thư Tuyến tiền liệt</p>
               <p style={{ fontSize: '10pt', fontWeight: 'bold' }}>Năm 2026</p>
            </div>
            <div className="text-right">
               <p style={{ fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase' }}>Số đăng ký: <span style={{ fontSize: '20pt' }}>{patient.registration_number?.toString().padStart(4, '0')}</span></p>
               <p style={{ fontSize: '11pt' }}>Mã hồ sơ: {patient.id}</p>
            </div>
         </div>

         <div className="text-center mb-12" style={{ marginBottom: '30pt' }}>
            <h2 style={{ fontSize: '24pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8pt' }}>PHIẾU KHẢO SÁT SÀNG LỌC</h2>
            <p style={{ fontSize: '14pt', fontStyle: 'italic' }}>(Dùng cho quy trình khám sàng lọc  tại bệnh viện)</p>
         </div>

         {/* Patient Info */}
         <div className="grid grid-cols-2 gap-y-4 mb-10" style={{ fontSize: '14pt', marginBottom: '25pt' }}>
            <div className="flex gap-2"><strong>Họ và tên:</strong> <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{patient.full_name}</span></div>
            <div className="flex gap-2"><strong>Năm sinh:</strong> <span>{new Date(patient.dob).getFullYear()}</span></div>
            <div className="flex gap-2"><strong>Số CCCD:</strong> <span>{patient.cccd}</span></div>
            <div className="flex gap-2"><strong>Số điện thoại:</strong> <span>{patient.phone}</span></div>
            <div className="col-span-2 flex gap-2"><strong>Địa chỉ:</strong> <span>{patient.ward}, {patient.district}, {patient.province}</span></div>
         </div>

         {/* Survey Results */}
         <div className="space-y-6" style={{ marginTop: '20pt' }}>

            {/* Phần 1 */}
            <div>
               <h3 style={{ fontSize: '16pt', fontWeight: 'bold', borderBottom: '2px solid #cbd5e1', paddingBottom: '3pt', marginBottom: '8pt' }}>1. DI TRUYỀN & TIỀN SỬ GIA ĐÌNH</h3>
               <table className="w-full" style={{ fontSize: '13pt', borderCollapse: 'collapse', border: '1px solid #94a3b8' }}>
                  <tbody className="divide-y divide-slate-400">
                     <tr className="bg-slate-50">
                        <td className="p-2 w-3/4" style={{ border: '1px solid #94a3b8' }}>Đột biến gen BRCA1/BRCA2?</td>
                        <td className="p-2 font-black text-center" style={{ border: '1px solid #94a3b8', fontSize: '14pt' }}>{survey?.brca_mutation ? 'CÓ' : 'KHÔNG'}</td>
                     </tr>
                     <tr>
                        <td className="p-2" style={{ border: '1px solid #94a3b8' }}>Cha chẩn đoán Ung thư lúc:</td>
                        <td className="p-2 font-black text-center" style={{ border: '1px solid #94a3b8', fontSize: '14pt' }}>{survey?.father_age_diag ? `${survey.father_age_diag} tuổi` : 'Không có'}</td>
                     </tr>
                     <tr className="bg-slate-50">
                        <td className="p-2" style={{ border: '1px solid #94a3b8' }}>Anh/Em chẩn đoán Ung thư lúc:</td>
                        <td className="p-2 font-black text-center" style={{ border: '1px solid #94a3b8', fontSize: '14pt' }}>{survey?.brother_age_diag ? `${survey.brother_age_diag} tuổi` : 'Không có'}</td>
                     </tr>
                  </tbody>
               </table>
            </div>

            {/* Phần 2 */}
            <div>
               <h3 style={{ fontSize: '16pt', fontWeight: 'bold', borderBottom: '2px solid #cbd5e1', paddingBottom: '3pt', marginBottom: '8pt' }}>2. TIỀN SỬ BỆNH LÝ & SÀNG LỌC</h3>
               <table className="w-full" style={{ fontSize: '13pt', borderCollapse: 'collapse', border: '1px solid #94a3b8' }}>
                  <tbody className="divide-y divide-slate-400">
                     <tr>
                        <td className="p-2 w-3/4" style={{ border: '1px solid #94a3b8' }}>Sinh thiết tuyến tiền liệt trong 3 năm qua?</td>
                        <td className="p-2 font-black text-center" style={{ border: '1px solid #94a3b8' }}>{survey?.biopsy_3y ? 'CÓ' : 'KHÔNG'}</td>
                     </tr>
                     <tr className="bg-slate-50">
                        <td className="p-2" style={{ border: '1px solid #94a3b8' }}>Đã từng phẫu thuật cắt bỏ tuyến tiền liệt?</td>
                        <td className="p-2 font-black text-center" style={{ border: '1px solid #94a3b8' }}>{survey?.prostatectomy ? 'CÓ' : 'KHÔNG'}</td>
                     </tr>
                     <tr>
                        <td className="p-2" style={{ border: '1px solid #94a3b8' }}>Tiền sử Ung thư (TTL, Phổi...)?</td>
                        <td className="p-2 font-black text-center" style={{ border: '1px solid #94a3b8' }}>{(survey?.cancer_history && survey?.cancer_history.length > 0) ? 'CÓ' : 'KHÔNG'}</td>
                     </tr>
                     <tr className="bg-slate-50">
                        <td className="p-2" style={{ border: '1px solid #94a3b8' }}>Đang điều trị ung thư?</td>
                        <td className="p-2 font-black text-center" style={{ border: '1px solid #94a3b8' }}>{survey?.cancer_treatment ? 'CÓ' : 'KHÔNG'}</td>
                     </tr>
                     <tr>
                        <td className="p-2" style={{ border: '1px solid #94a3b8' }}>Mắc bệnh cơ quan nặng / Sa sút trí tuệ?</td>
                        <td className="p-2 font-black text-center" style={{ border: '1px solid #94a3b8' }}>{(survey?.severe_organ_disease || survey?.alzheimer) ? 'CÓ' : 'KHÔNG'}</td>
                     </tr>
                     <tr className="bg-slate-50">
                        <td className="p-2" style={{ border: '1px solid #94a3b8' }}>QHTD/Xuất tinh (24h) hoặc Nội soi BQ (48h)?</td>
                        <td className="p-2 font-black text-center" style={{ border: '1px solid #94a3b8' }}>{(survey?.exclusion_sex_24h || survey?.exclusion_cystoscopy_48h) ? 'CÓ' : 'KHÔNG'}</td>
                     </tr>
                     <tr>
                        <td className="p-2" style={{ border: '1px solid #94a3b8' }}>Thăm trực tràng / Đạp xe (1 tuần)?</td>
                        <td className="p-2 font-black text-center" style={{ border: '1px solid #94a3b8' }}>{survey?.exclusion_dre_1w ? 'CÓ' : 'KHÔNG'}</td>
                     </tr>
                  </tbody>
               </table>
            </div>

            {/* Phần 3 */}
            <div style={{ pageBreakBefore: 'always', paddingTop: '10pt' }}>
               <h3 style={{ fontSize: '16pt', fontWeight: 'bold', borderBottom: '2px solid #cbd5e1', paddingBottom: '3pt', marginBottom: '8pt' }}>3. THÔNG TIN THUỐC ĐANG SỬ DỤNG</h3>
               <div className="grid grid-cols-2 gap-2 uppercase font-bold" style={{ fontSize: '11pt' }}>
                  <div className={`p-2 border-2 ${survey?.meds_5alpha_inhibitor ? 'bg-slate-100 border-black' : 'border-slate-200 opacity-100'}`}>[ {survey?.meds_5alpha_inhibitor ? 'X' : ' '} ] 5-Alpha Inhibitor</div>
                  <div className={`p-2 border-2 ${survey?.meds_estrogen ? 'bg-slate-100 border-black' : 'border-slate-200 opacity-100'}`}>[ {survey?.meds_estrogen ? 'X' : ' '} ] Estrogen</div>
                  <div className={`p-2 border-2 ${survey?.meds_progesterone ? 'bg-slate-100 border-black' : 'border-slate-200 opacity-100'}`}>[ {survey?.meds_progesterone ? 'X' : ' '} ] Progesterone</div>
                  <div className={`p-2 border-2 ${survey?.meds_androgen ? 'bg-slate-100 border-black' : 'border-slate-200 opacity-100'}`}>[ {survey?.meds_androgen ? 'X' : ' '} ] Androgen</div>
                  <div className={`p-2 border-2 ${survey?.meds_corticoids ? 'bg-slate-100 border-black' : 'border-slate-200 opacity-100'}`}>[ {survey?.meds_corticoids ? 'X' : ' '} ] Corticoids</div>
                  <div className={`p-2 border-2 ${survey?.meds_saw_palmetto ? 'bg-slate-100 border-black' : 'border-slate-200 opacity-100'}`}>[ {survey?.meds_saw_palmetto ? 'X' : ' '} ] Thảo dược (Cọ lùn)</div>
               </div>
            </div>

            {/* Phần 4 */}
            <div>
               <h3 style={{ fontSize: '16pt', fontWeight: 'bold', borderBottom: '2px solid #cbd5e1', paddingBottom: '3pt', marginBottom: '8pt' }}>4. TRIỆU CHỨNG ĐƯỜNG TIỂU</h3>
               <div className="grid grid-cols-2 gap-x-16 gap-y-2 italic" style={{ fontSize: '13pt' }}>
                  <div className="flex justify-between border-b pb-1 border-slate-300"><span>Tiểu khó / Tia yếu:</span> <strong style={{ fontSize: '15pt' }}>{survey?.symptom_difficulty ? 'X' : '...'}</strong></div>
                  <div className="flex justify-between border-b pb-1 border-slate-300"><span>Tiểu nhiều lần:</span> <strong style={{ fontSize: '15pt' }}>{survey?.symptom_frequency ? 'X' : '...'}</strong></div>
                  <div className="flex justify-between border-b pb-1 border-slate-300"><span>Tiểu gấp:</span> <strong style={{ fontSize: '15pt' }}>{survey?.symptom_urgency ? 'X' : '...'}</strong></div>
                  <div className="flex justify-between border-b pb-1 border-slate-300"><span>Tiểu không hết:</span> <strong style={{ fontSize: '15pt' }}>{survey?.symptom_incomplete ? 'X' : '...'}</strong></div>
                  <div className="flex justify-between border-b pb-1 border-slate-300"><span>Tiểu nhỏ giọt:</span> <strong style={{ fontSize: '15pt' }}>{survey?.symptom_dribbling ? 'X' : '...'}</strong></div>
                  <div className="flex justify-between border-b pb-1 border-slate-300"><span>Đau xương:</span> <strong style={{ fontSize: '15pt' }}>{survey?.symptom_bone_pain ? 'X' : '...'}</strong></div>
                  <div className="flex justify-between border-b pb-1 border-slate-300"><span>Tiểu máu:</span> <strong style={{ fontSize: '15pt' }}>{survey?.symptom_hematuria ? 'X' : '...'}</strong></div>
               </div>
            </div>
         </div>

         {/* Footer Signatures */}
         <div className="mt-16 grid grid-cols-2 text-center" style={{ fontSize: '14pt' }}>
            <div>
               <p style={{ fontSize: '12pt' }}>&nbsp;</p>
               <p className="font-bold uppercase tracking-widest pt-1">BỆNH NHÂN XÁC NHẬN</p>
               <p style={{ fontSize: '12pt', fontStyle: 'italic' }}>(Ký và ghi rõ họ tên)</p>
               <div className="h-24"></div>
               <p className="font-bold">{patient.full_name}</p>
            </div>
            <div>
               <p style={{ fontSize: '12pt' }}>Huế, ngày {today.getDate()} tháng {today.getMonth() + 1} năm {today.getFullYear()}</p>
               <p className="font-bold uppercase tracking-widest pt-1">Bác sĩ/Cán bộ khảo sát</p>
               <p style={{ fontSize: '12pt', fontStyle: 'italic' }}>(Ký tên)</p>
            </div>
         </div>
         <div className="mt-20 pt-8 border-t border-t-slate-300 border-dashed text-[10px] text-slate-400 text-center">
            Đây là bản in điện tử từ Hệ thống Quản lý Sàng lọc Tuyến tiền liệt - BV Trung ương Huế
         </div>
      </div>
   );
});

SurveyPrintTemplate.displayName = 'SurveyPrintTemplate';

export default SurveyPrintTemplate;
