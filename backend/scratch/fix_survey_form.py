import os

filepath = '/Users/quocanhyduoc/ScreeningProstate/frontend/src/components/btc/SurveyForm.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'onChange={(e) => setFormData({...formData, father_age_diag: e.target.value ? parseInt(e.target.value) : null})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-500 transition-all" placeholder="Tuổi" />',
    'value={formData.father_age_diag || ""} onChange={(e) => setFormData({...formData, father_age_diag: e.target.value ? parseInt(e.target.value) : null})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-500 transition-all" placeholder="Tuổi" />'
)

content = content.replace(
    'onChange={(e) => setFormData({...formData, brother_age_diag: e.target.value ? parseInt(e.target.value) : null})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-500 transition-all" placeholder="Tuổi" />',
    'value={formData.brother_age_diag || ""} onChange={(e) => setFormData({...formData, brother_age_diag: e.target.value ? parseInt(e.target.value) : null})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-500 transition-all" placeholder="Tuổi" />'
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
