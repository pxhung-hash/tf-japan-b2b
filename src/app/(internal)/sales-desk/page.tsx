import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import SalesChatContainer from './SalesChatContainer'; 
import { requireAuth } from '@/lib/auth-guard';

export default async function SalesDeskPage({
  searchParams,
}: {
  searchParams: Promise<{ rfq?: string }>
}) {
  const params = await searchParams;
  const currentRfqId = params?.rfq || null;

  // SỬA LỖI VÒNG LẶP: Truyền CHUỖI ĐƯỜNG DẪN thay vì truyền mảng []
  // Lấy thêm cờ hasError để chặn trang nếu chưa được Admin gán quyền
  const { user, hasError } = await requireAuth('/sales-desk', 'Sales Negotiation Desk');

  // NẾU CHƯA CÓ QUYỀN (VD: Admin quên thêm role Sales vào trang này trong DB)
  if (hasError) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 shadow-sm">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h1 className="text-2xl font-black text-japan-indigo mb-2">Access Restricted</h1>
        <p className="text-gray-500 max-w-md">Your account role does not have permission to view the Sales Desk yet. Please contact your System Administrator to update your permissions.</p>
      </div>
    );
  }

  // 3. Query DB để lấy danh sách RFQ
  const supabase = await createClient();
  const { data: rfqs } = await supabase
    .from('rfqs')
    .select(`
      id,
      status,
      created_at,
      profiles!rfqs_buyer_id_fkey(company_name, country)
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="h-[85vh] flex flex-col gap-4">
      
      {/* Header của Page */}
      <div>
        <h1 className="text-3xl font-black text-japan-indigo tracking-tight">Sales Negotiation Desk</h1>
        <p className="text-gray-500 text-sm mt-1">Manage active RFQs and communicate directly with buyers.</p>
      </div>
      
      <div className="flex-1 flex gap-6 min-h-0 mt-2"> 
        
        {/* ==========================================
            CỘT TRÁI: DANH SÁCH RFQ
            ========================================== */}
        <div className="w-1/3 bg-white border border-gray-200 rounded-lg flex flex-col shadow-sm flex-shrink-0 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <span className="font-bold text-japan-ink text-xs uppercase tracking-wider">Active Requests</span>
            <span className="bg-japan-crimson text-white px-2 py-0.5 rounded text-xs font-bold shadow-sm">
              {rfqs?.length || 0}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {rfqs?.map((rfq) => (
              <Link 
                href={`/sales-desk?rfq=${rfq.id}`} 
                key={rfq.id}
                className={`block p-4 border-b border-gray-100 hover:bg-blue-50 transition cursor-pointer group ${
                  currentRfqId === rfq.id ? 'bg-blue-50 border-l-4 border-l-japan-indigo' : 'border-l-4 border-l-transparent'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-japan-ink group-hover:text-japan-indigo transition truncate pr-2">
                    {rfq.profiles?.company_name || 'Unknown Company'}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest whitespace-nowrap ${
                    rfq.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 
                    rfq.status === 'quoting' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 
                    'bg-green-100 text-green-700 border border-green-200'
                  }`}>
                    {rfq.status}
                  </span>
                </div>
                
                <div className="text-xs text-gray-500 flex justify-between items-center">
                  <span className="flex items-center gap-1 font-medium">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    {rfq.profiles?.country || 'N/A'}
                  </span>
                  <span className="font-mono text-[10px] text-gray-400">
                    {new Date(rfq.created_at).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
            
            {(!rfqs || rfqs.length === 0) && (
              <div className="p-8 flex flex-col items-center justify-center text-center h-full">
                <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                <p className="text-gray-400 text-sm font-medium">No active RFQs found.</p>
              </div>
            )}
          </div>
        </div>

        {/* ==========================================
            CỘT PHẢI: KHUNG CHAT & QUOTATION
            ========================================== */}
        <div className="w-2/3 bg-white border border-gray-200 rounded-lg shadow-sm relative overflow-hidden flex flex-col">
          {currentRfqId ? (
            <SalesChatContainer currentRfqId={currentRfqId} currentUserId={user.id} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 p-8 text-center">
              <div className="w-20 h-20 bg-white border border-gray-200 rounded-full flex items-center justify-center text-japan-indigo mb-5 shadow-sm">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-japan-ink mb-2">Select a Request</h3>
              <p className="text-gray-500 text-sm max-w-sm">
                Click on an RFQ from the list on the left to view details, send messages, and issue quotations.
              </p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}