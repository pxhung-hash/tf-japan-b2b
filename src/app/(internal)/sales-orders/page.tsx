import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth-guard';
import Link from 'next/link';
import { redirect } from 'next/navigation'; // ✅ Đã thêm import

export const dynamic = 'force-dynamic';

export default async function SalesOrdersPage() {
  // ✅ SỬA LỖI YÊU CẦU QUYỀN TRUY CẬP
  const { profile, hasError } = await requireAuth('/sales-orders', 'Sales Orders');
  if (hasError) redirect('/portal');
  
  const role = profile?.role;
  if (role !== 'admin' && role !== 'manager' && role !== 'sales') {
    redirect('/dashboard');
  }

  const supabase = await createClient();

  // Kéo danh sách SO
  const { data: orders } = await supabase
    .from('sales_orders')
    .select('*, buyers(company_name), quotes(quote_number)')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-japan-indigo tracking-tight">Sales Orders (SO)</h1>
          <p className="text-gray-500 mt-1">Manage confirmed orders, operational fulfillment, and invoicing.</p>
        </div>
        
        {/* NÚT TẠO SO THỦ CÔNG */}
        <Link 
          href="/sales-orders/create" 
          className="bg-japan-crimson hover:bg-opacity-90 text-white px-6 py-3 rounded-lg font-bold text-sm shadow-md uppercase tracking-wider flex items-center gap-2 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Manual SO Entry
        </Link>
      </div>

      {/* BẢNG SO */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">SO Number</th>
                <th className="px-6 py-4">Ref Quote</th>
                <th className="px-6 py-4">Buyer Entity</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Order Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders?.map((so) => (
                <tr key={so.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-mono font-bold text-japan-indigo">{so.so_number}</td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">
                    {so.quotes?.quote_number ? (
                      <Link href={`/quotes/view/${so.quote_id}`} className="hover:text-japan-indigo hover:underline" title="View Source Quote">
                        {so.quotes.quote_number}
                      </Link>
                    ) : 'N/A (Manual)'}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">{so.buyers?.company_name}</td>
                  <td className="px-6 py-4 font-mono font-bold text-green-600">{so.total_amount?.toLocaleString()} {so.currency}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase border ${
                      so.status === 'draft' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                      so.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      so.status === 'shipped' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      so.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      {so.status}
                    </span>
                  </td>

                  {/* CÁC NÚT THAO TÁC */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-4">
                      
                      {/* Nút View & PDF Order */}
                      <Link href={`/sales-orders/view/${so.id}`} className="text-japan-indigo hover:text-blue-700 font-bold text-xs flex items-center gap-1 transition" title="View Order PDF">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        PDF
                      </Link>

                      {/* Nút Sửa Trạng Thái Order */}
                      <Link href={`/sales-orders/edit/${so.id}`} className="text-amber-600 hover:text-amber-800 font-bold text-xs flex items-center gap-1 transition" title="Update Order Status">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        Edit
                      </Link>

                      {/* Nút Xóa: ĐÃ XÓA SỰ KIỆN ONCLICK ĐỂ FIX LỖI SERVER COMPONENT */}
                      <form action={async (formData) => {
                        'use server';
                        const { deleteSalesOrder } = await import('@/app/(internal)/sales-orders/actions');
                        await deleteSalesOrder(formData);
                      }}>
                        <input type="hidden" name="id" value={so.id} />
                        <button type="submit" className="text-red-500 hover:text-red-700 font-bold text-xs flex items-center gap-1 transition" title="Cancel & Delete Order">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </form>

                    </div>
                  </td>
                </tr>
              ))}

              {(!orders || orders.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No Sales Orders found. Create a manual order or post from an Accepted Quotation.
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