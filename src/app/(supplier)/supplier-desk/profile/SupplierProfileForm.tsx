'use client'

import { useState, useTransition } from 'react';
import { updateSupplierProfile } from './actions';

export default function SupplierProfileForm({ initialData, email }: { initialData: any, email: string }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Hàm xử lý Submit ảo để hiển thị trạng thái Loading & Thông báo
  async function handleSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      try {
        await updateSupplierProfile(formData);
        setMessage({ type: 'success', text: 'Hồ sơ doanh nghiệp đã được cập nhật thành công!' });
        // Tự tắt thông báo sau 3 giây
        setTimeout(() => setMessage(null), 3000);
      } catch (error: any) {
        setMessage({ type: 'error', text: error.message || 'Có lỗi xảy ra khi lưu dữ liệu.' });
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-10">
      
      {/* Thông báo trạng thái Real-time */}
      {message && (
        <div className={`p-4 rounded-sm text-sm font-bold shadow-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.type === 'success' ? '✓' : '✖'} {message.text}
        </div>
      )}

      {/* ==========================================
          SECTION 1: THÔNG TIN CƠ BẢN
          ========================================== */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">1. General Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Company Name *</label>
            <input name="companyName" defaultValue={initialData?.company_name || ''} required className="w-full px-4 py-2.5 border border-slate-300 rounded outline-none focus:border-teal-500 transition text-sm bg-slate-50 font-bold" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Company Website</label>
            <input name="website" defaultValue={initialData?.website || ''} placeholder="https://www..." className="w-full px-4 py-2.5 border border-slate-300 rounded outline-none focus:border-teal-500 transition text-sm text-teal-700 font-medium" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Country / Region *</label>
            <select name="country" defaultValue={initialData?.country || 'Japan'} required className="w-full px-4 py-2.5 border border-slate-300 rounded outline-none focus:border-teal-500 transition text-sm">
              <option value="Japan">Japan</option>
              <option value="Vietnam">Vietnam</option>
              <option value="Taiwan">Taiwan</option>
              <option value="South Korea">South Korea</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Account Email (Login ID)</label>
            <input value={email} disabled className="w-full px-4 py-2.5 border border-slate-200 rounded text-slate-400 text-sm bg-slate-100 cursor-not-allowed" />
          </div>
        </div>
      </div>

      {/* ==========================================
          SECTION 2: LIÊN HỆ & TÀI CHÍNH
          ========================================== */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">2. Contact & Billing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Contact Person *</label>
            <input name="contactPerson" defaultValue={initialData?.contact_person || ''} required className="w-full px-4 py-2.5 border border-slate-300 rounded outline-none focus:border-teal-500 transition text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Direct Phone</label>
            <input name="contactPhone" defaultValue={initialData?.contact_phone || ''} placeholder="+81..." className="w-full px-4 py-2.5 border border-slate-300 rounded outline-none focus:border-teal-500 transition text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Bank Account Info</label>
            <input name="bankAccount" defaultValue={initialData?.bank_account || ''} placeholder="Bank Name, SWIFT, Account No." className="w-full px-4 py-2.5 border border-slate-300 rounded outline-none focus:border-teal-500 transition text-sm" />
          </div>
        </div>
      </div>

      {/* ==========================================
          SECTION 3: NĂNG LỰC NHÀ MÁY
          ========================================== */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">3. Manufacturing Profile</h2>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Core Capabilities (Tags)</label>
            <input 
              name="capabilities" 
              defaultValue={initialData?.capabilities || ''} 
              placeholder="E.g., CNC Machining, Injection Molding, 5-Axis Turning..." 
              className="w-full px-4 py-2.5 border border-slate-300 rounded outline-none focus:border-teal-500 transition text-sm font-medium text-slate-700" 
            />
            <p className="text-[10px] text-slate-400 mt-1">Separate capabilities with commas to help buyers find you easier.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Factory Description</label>
            <textarea 
              name="description" 
              defaultValue={initialData?.description || ''} 
              rows={5} 
              placeholder="Detail your manufacturing history, factory size, certifications (ISO), machinery list, and quality control processes..." 
              className="w-full px-4 py-2.5 border border-slate-300 rounded outline-none focus:border-teal-500 transition text-sm resize-none" 
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-6 border-t border-slate-200 flex justify-end gap-4">
        <button type="reset" className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded transition">
          Reset Form
        </button>
        <button 
          type="submit" 
          disabled={isPending}
          className="bg-teal-600 text-white font-bold px-8 py-2.5 rounded hover:bg-teal-700 transition shadow-md uppercase text-xs tracking-widest disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          {isPending ? 'Saving Data...' : 'Save Complete Profile'}
        </button>
      </div>
      
    </form>
  );
}