import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth-guard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function QuotesListPage() {
  await requireAuth(['admin', 'manager', 'sales']);
  const supabase = await createClient();

  // ✅ ĐÃ CẬP NHẬT: Kéo thêm thông tin seller_entities (Công ty phát hành báo giá)
  const { data: quotes, error } = await supabase
    .from('quotes')
    .select(`
      *,
      buyers ( company_name ),
      seller_entities ( name )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("LỖI KHI TẢI DANH SÁCH BÁO GIÁ:", error.message);
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* HEADER DANH SÁCH */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-japan-indigo tracking-tight">Quotations Management</h1>
          <p className="text-gray-500 mt-1">Configure pricing, manage tiers, and track commercial offers.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* ✅ BỔ SUNG: Nút truy cập nhanh vào trang Quản lý Pháp Nhân */}
          <Link 
            href="/settings/entities" 
            className="bg-white border border-gray-300 hover:bg-gray-50 transition text-gray-700 px-4 py-3 rounded-lg font-bold text-sm inline-flex items-center gap-2 shadow-sm uppercase tracking-wider"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            Manage Entities
          </Link>

          {/* Nút Tạo Báo Giá (Giữ nguyên) */}
          <Link 
            href="/quotes/create" 
            className="bg-japan-indigo hover:bg-opacity-90 transition text-white px-6 py-3 rounded-lg font-bold text-sm inline-flex items-center gap-2 shadow-md uppercase tracking-wider"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            New Quotation (CPQ)
          </Link>
        </div>
      </div>

      {/* BẢNG THỐNG KÊ BÁO GIÁ */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Quote Number</th>
                {/* ✅ BỔ SUNG: Cột Issuing Entity */}
                <th className="px-6 py-4">Issuing Entity</th>
                <th className="px-6 py-4">Client / Buyer</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Valid Until</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {quotes?.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-mono font-bold text-japan-indigo">{q.quote_number}</td>
                  
                  {/* ✅ BỔ SUNG: Hiển thị tên Pháp nhân xuất báo giá */}
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-gray-600 bg-gray-100 border border-gray-200 px-2 py-1 rounded uppercase tracking-wider">
                      {q.seller_entities?.name || 'ZENIX Default'}
                    </span>
                  </td>

                  <td className="px-6 py-4 font-bold text-gray-900">{q.buyers?.company_name || 'Unknown Buyer'}</td>
                  <td className="px-6 py-4 font-mono font-bold text-green-600">
                    {q.total_amount?.toLocaleString()} {q.currency}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {q.valid_until ? new Date(q.valid_until).toLocaleDateString('vi-VN') : 'No expiry'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase border ${
                      q.status === 'draft' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                      q.status === 'sent' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      q.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {q.status}
                    </span>
                  </td>
                  
                  {/* CỘT ACTIONS: View/PDF, Edit, Delete */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-4">
                      
                      {/* Nút View & PDF */}
                      <Link href={`/quotes/view/${q.id}`} className="text-japan-indigo hover:text-blue-700 font-bold text-xs flex items-center gap-1 transition" title="View & Export PDF">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        PDF
                      </Link>

                      {/* Nút Sửa */}
                      <Link href={`/quotes/edit/${q.id}`} className="text-amber-600 hover:text-amber-800 font-bold text-xs flex items-center gap-1 transition" title="Edit Quote">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        Edit
                      </Link>

                      {/* Nút Xóa (Sử dụng Server Action) */}
                      <form action={async (formData) => {
                        'use server';
                        const { deleteQuote } = await import('@/app/(internal)/quotes/actions');
                        await deleteQuote(formData);
                      }}>
                        <input type="hidden" name="id" value={q.id} />
                        <button type="submit" className="text-red-500 hover:text-red-700 font-bold text-xs flex items-center gap-1 transition" title="Delete Quote">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </form>

                    </div>
                  </td>
                </tr>
              ))}

              {(!quotes || quotes.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No quotations found. Click "New Quotation" above to launch the CPQ Engine.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}