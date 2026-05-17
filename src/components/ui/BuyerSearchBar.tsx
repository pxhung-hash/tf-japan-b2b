'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function BuyerSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Lấy từ khóa hiện tại trên URL để nhét sẵn vào ô input (nếu có)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // Ngăn form reload lại toàn bộ trang
    
    // Đẩy từ khóa lên URL
    if (searchTerm.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push('/dashboard/search'); // Nếu xóa trắng thì quay về trang gốc
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl flex gap-2">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search for parts, materials, or products..."
        className="flex-1 px-4 py-3 rounded-lg text-sm text-gray-900 outline-none focus:ring-2 focus:ring-japan-crimson shadow-inner"
      />
      <button
        type="submit"
        className="bg-japan-crimson hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold text-sm transition uppercase tracking-wider shadow-md flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        Search
      </button>
    </form>
  );
}