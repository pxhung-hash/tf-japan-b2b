'use client';

import { useState, useRef } from 'react';
import { addStaffToEntity } from '@/app/(internal)/settings/users/actions';

export default function AddStaffForm({
  entityId,
  entityType,
  companyName
}: {
  entityId: string;
  entityType: 'supplier' | 'buyer';
  companyName: string;
}) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setError('');
    setLoading(true);

    // Bổ sung dữ liệu ngầm vào form trước khi gửi
    formData.append('entityId', entityId);
    formData.append('entityType', entityType);
    formData.append('companyName', companyName);

    // Gọi hàm Action (Backend)
    const res = await addStaffToEntity(formData);

    if (res?.error) {
      setError(res.error); // Nếu backend trả về lỗi -> Hiển thị lỗi đỏ
    } else {
      formRef.current?.reset(); // Nếu thành công -> Xóa trắng form để nhập người tiếp theo
    }

    setLoading(false);
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-3">
      {/* VÙNG HIỂN THỊ THÔNG BÁO LỖI NẾU TRÙNG EMAIL */}
      {error && (
        <div className="bg-red-50 text-japan-crimson border border-red-200 text-xs font-bold p-3 rounded-lg flex items-start gap-2">
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <span>{error}</span>
        </div>
      )}

      <input type="text" name="fullName" placeholder="Staff Full Name" required className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded focus:border-japan-indigo outline-none" />
      <input type="email" name="email" placeholder="Staff Email" required className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded focus:border-japan-indigo outline-none" />
      <input type="text" name="password" placeholder="Temp Password" required className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded focus:border-japan-indigo outline-none" />

      <button type="submit" disabled={loading} className="w-full bg-gray-100 hover:bg-japan-indigo hover:text-white disabled:opacity-50 text-gray-600 transition text-xs font-bold py-2.5 rounded uppercase tracking-wider flex justify-center items-center gap-2">
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Processing...
          </>
        ) : '+ Create Account'}
      </button>
    </form>
  );
}