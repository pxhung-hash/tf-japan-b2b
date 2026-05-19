import { createClient } from '@/lib/supabase/server';
import ChatBox from '@/components/chat/ChatBox';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth-guard';

export default async function BuyerRFQDashboard({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const params = await searchParams;
  const currentRfqId = params?.id || null;

  const { user, hasError } = await requireAuth('/rfq', 'My RFQs');

  // CHẶN TRUY CẬP NẾU CHƯA CÓ QUYỀN
  if (hasError) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h1 className="text-3xl font-black text-japan-indigo mb-2">Access Restricted</h1>
        <p className="text-gray-500 max-w-md mx-auto mb-6">Your account does not have permission to view the RFQ page yet.</p>
      </div>
    );
  }

  const supabase = await createClient();

  const { data: rfqs } = await supabase
    .from('rfqs')
    .select(`
      id,
      status,
      created_at,
      rfq_items (
        requested_quantity,
        products (name)
      )
    `)
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="py-8 h-[85vh] flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-japan-indigo tracking-tight">My Requests (RFQs)</h1>
        <p className="text-gray-600 text-sm">Track your quotation requests and communicate directly with our sales team.</p>
      </div>
      
      <div className="flex-1 flex gap-6 overflow-hidden">
        <div className="w-1/3 bg-white border border-gray-200 rounded-sm flex flex-col shadow-sm">
          <div className="flex-1 overflow-y-auto">
            {rfqs?.map((rfq) => {
              const item = rfq.rfq_items?.[0]; 
              
              // ✅ GIẢI PHÁP VÁ LỖI BIÊN DỊCH TYPESCRIPT Ở ĐÂY:
              const productsData = item?.products as any;
              const productName = productsData?.name || productsData?.[0]?.name || 'Multiple Items';
              
              return (
                <Link 
                  href={`/rfq?id=${rfq.id}`} 
                  key={rfq.id}
                  className={`block p-5 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer ${
                    currentRfqId === rfq.id ? 'bg-gray-50 border-l-4 border-l-japan-crimson' : 'border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-japan-ink text-sm line-clamp-1">{productName}</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    Qty: <strong className="text-gray-700">{item?.requested_quantity || 0}</strong> units
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-sm uppercase ${
                      rfq.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                      rfq.status === 'quoting' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {rfq.status}
                    </span>
                    <span className="text-[10px] text-gray-400">{new Date(rfq.created_at).toLocaleDateString()}</span>
                  </div>
                </Link>
              );
            })}
            {(!rfqs || rfqs.length === 0) && (
              <div className="p-8 text-center text-gray-400 text-sm">You haven't submitted any requests yet.</div>
            )}
          </div>
        </div>

        <div className="w-2/3 h-full">
          <ChatBox rfqId={currentRfqId} currentUserId={user.id} />
        </div>
      </div>
    </div>
  );
}