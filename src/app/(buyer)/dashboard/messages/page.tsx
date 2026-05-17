import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import BuyerChatInterface from './BuyerChatInterface'; // Gọi component vừa tạo

export const dynamic = 'force-dynamic';

export default async function BuyerMessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/portal');

  // Tìm nhân viên chuyên trách hoặc Admin tạm thời
  const { data: profile } = await supabase.from('profiles').select('id, assigned_staff_id').eq('id', user.id).single();
  let staffId = profile?.assigned_staff_id;
  let staffName = 'ZENIX Support Team';

  if (!staffId) {
    const { data: admin } = await supabase.from('profiles').select('id, full_name').in('role', ['admin', 'sales']).limit(1).single();
    if (admin) {
      staffId = admin.id;
      staffName = admin.full_name || staffName;
    }
  } else {
    const { data: staff } = await supabase.from('profiles').select('id, full_name').eq('id', staffId).single();
    if (staff) staffName = staff.full_name || staffName;
  }

  if (!staffId) return <div className="p-10 text-center">System Error: No Support Staff available.</div>;

  // Lấy lịch sử chat
  const { data: messages } = await supabase
    .from('direct_messages')
    .select('*')
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${staffId}),and(sender_id.eq.${staffId},receiver_id.eq.${user.id})`)
    .order('created_at', { ascending: true });

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm font-bold text-gray-500 hover:text-japan-indigo flex items-center gap-2 mb-4 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-black text-japan-indigo">Dedicated Support</h1>
        <p className="text-gray-500 text-sm mt-1">Chat directly with your assigned account manager.</p>
      </div>

      <BuyerChatInterface 
        currentUserId={user.id} 
        staffId={staffId} 
        staffName={staffName} 
        initialMessages={messages || []} 
      />
    </div>
  );
}