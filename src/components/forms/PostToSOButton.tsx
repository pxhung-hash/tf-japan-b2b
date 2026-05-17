'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { postQuoteToSalesOrder } from '@/app/(internal)/quotes/actions';

export default function PostToSOButton({ quoteId }: { quoteId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePost = async (e: React.MouseEvent) => {
    e.preventDefault(); // Ngăn form mặc định submit
    
    if (!confirm('Bạn có chắc chắn muốn xuất Báo giá này thành Đơn hàng (Sales Order)? Báo giá sẽ bị khóa cứng.')) return;
    
    setLoading(true);
    const res = await postQuoteToSalesOrder(quoteId);
    
    if (res.success) {
      alert('Tạo Đơn Hàng Thành Công!');
      router.push('/sales-orders'); // Bay thẳng sang trang Quản lý Đơn hàng
    } else {
      // Nếu bạn chưa tạo bảng SQL sales_orders, nó sẽ báo lỗi ở đây để bạn biết
      alert('LỖI: ' + res.error); 
    }
    setLoading(false);
  };

  return (
    <button 
      type="button" 
      onClick={handlePost}
      disabled={loading}
      className={`px-6 py-3 rounded-lg text-sm font-black shadow-md flex items-center gap-2 uppercase tracking-wider transition ${loading ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
      {loading ? 'Posting...' : 'Post to Sales Order'}
    </button>
  );
}