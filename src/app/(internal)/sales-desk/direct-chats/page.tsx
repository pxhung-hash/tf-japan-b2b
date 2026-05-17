import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import StaffChatInterface from '@/components/chat/StaffChatInterface';

export const dynamic = 'force-dynamic';

export default async function StaffDirectChatsPage({ searchParams }: { searchParams: Promise<{ buyerId?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/portal');

  // Lấy params ID của khách hàng đang được chọn
  const resolvedParams = await searchParams;
  const activeBuyerId = resolvedParams.buyerId;

  // 1. KIỂM TRA QUYỀN TRUY CẬP (Chỉ cho Staff)
  const { data: profile } = await supabase.from('profiles').select('id, role').eq('id', user.id).single();
  const isStaff = profile?.role === 'admin' || profile?.role === 'manager' || profile?.role === 'sales';
  if (!isStaff) return <div className="p-10 text-center text-red-500 font-bold">Access Restricted. Staff only.</div>;

  const currentStaffId = profile.id;

  // 2. LẤY SỐ TIN NHẮN CHƯA ĐỌC (Để biết ai đang nhắn tin cho mình)
  const { data: unreadMsgs } = await supabase
    .from('direct_messages')
    .select('sender_id')
    .eq('receiver_id', currentStaffId)
    .eq('is_read', false);

  const unreadMap: Record<string, number> = {};
  const unreadSenderIds = new Set<string>(); // Lưu ID những người đã nhắn tin cho mình

  unreadMsgs?.forEach(msg => {
    unreadMap[msg.sender_id] = (unreadMap[msg.sender_id] || 0) + 1;
    unreadSenderIds.add(msg.sender_id);
  });

  // 3. LẤY DANH SÁCH NGƯỜI DÙNG HIỂN THỊ CỘT TRÁI
  // ✅ SỬA LỖI GHOST NOTIFICATION: Lấy toàn bộ profiles
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, company_name, role')
    .order('created_at', { ascending: false });

  // Lọc ra danh sách cần hiển thị: Là Buyer HOẶC là người đang có tin nhắn chưa đọc gửi cho mình (Giúp test bằng tài khoản Admin không bị ẩn)
  const displayClients = allProfiles?.filter(p => 
    p.role === 'buyer' || 
    p.role === 'user' || 
    unreadSenderIds.has(p.id) || 
    p.id === activeBuyerId
  ) || [];

  // 4. LẤY LỊCH SỬ CHAT VỚI NGƯỜI ĐANG ĐƯỢC CHỌN (Cột phải)
  let activeMessages = [];
  let activeClient = null;

  if (activeBuyerId) {
    activeClient = displayClients.find(c => c.id === activeBuyerId);
    
    // Kéo tin nhắn của 2 người
    const { data } = await supabase
      .from('direct_messages')
      .select('*')
      .or(`and(sender_id.eq.${currentStaffId},receiver_id.eq.${activeBuyerId}),and(sender_id.eq.${activeBuyerId},receiver_id.eq.${currentStaffId})`)
      .order('created_at', { ascending: true });
    
    activeMessages = data || [];

    // Tự động đánh dấu đã đọc khi Staff click vào người này
    await supabase
      .from('direct_messages')
      .update({ is_read: true })
      .eq('sender_id', activeBuyerId)
      .eq('receiver_id', currentStaffId)
      .eq('is_read', false);
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-6">
        <Link href="/sales-desk" className="text-sm font-bold text-gray-500 hover:text-japan-indigo flex items-center gap-2 mb-2 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Sales Desk
        </Link>
        <h1 className="text-3xl font-black text-japan-indigo">Client Communications</h1>
      </div>

      {/* GIAO DIỆN CHAT 2 CỘT */}
      <div className="flex h-[75vh] bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        
        {/* CỘT TRÁI: DANH SÁCH KHÁCH HÀNG */}
        <div className="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-white">
            <input 
              type="text" 
              placeholder="Search clients..." 
              className="w-full bg-gray-100 px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-japan-indigo/20"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {displayClients.map(client => {
              const isActive = client.id === activeBuyerId;
              const unreadCount = unreadMap[client.id] || 0;
              const displayName = client.company_name || client.full_name || 'Unnamed Client';

              return (
                <Link 
                  key={client.id} 
                  href={`/sales-desk/direct-chats?buyerId=${client.id}`} 
                  className={`flex items-center p-4 border-b border-gray-100 transition cursor-pointer ${isActive ? 'bg-indigo-50 border-l-4 border-l-japan-indigo' : 'hover:bg-gray-100 border-l-4 border-l-transparent'}`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-sm">
                      {displayName.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-sm font-bold text-gray-900 truncate">{displayName}</h3>
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full ml-2 flex-shrink-0">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{client.full_name}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* CỘT PHẢI: KHUNG CHAT */}
        <div className="w-2/3 flex flex-col bg-[#f0f2f5]">
          {activeClient ? (
            <StaffChatInterface 
              staffId={currentStaffId}
              buyerId={activeClient.id}
              buyerName={activeClient.full_name || activeClient.company_name || 'Unnamed Client'}
              buyerCompany={activeClient.company_name || (activeClient.role === 'admin' ? 'System Admin' : 'Tier 1 Partner')}
              initialMessages={activeMessages}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
              </div>
              <p className="text-sm font-medium">Select a client from the list to start messaging.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}