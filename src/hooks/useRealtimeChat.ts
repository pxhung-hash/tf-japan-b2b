'use client'

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/browser';

export function useRealtimeChat(rfqId: string | null) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rfqId) return;

    // 1. Lấy lịch sử tin nhắn cũ
    const fetchMessages = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('rfq_id', rfqId)
        .order('created_at', { ascending: true });
      
      if (data) setMessages(data);
      setLoading(false);
      scrollToBottom();
    };

    fetchMessages();

    // 2. Đăng ký lắng nghe (Subscribe) các tin nhắn mới được Insert vào DB
    const channel = supabase
      .channel(`chat_rfq_${rfqId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages', 
          filter: `rfq_id=eq.${rfqId}` 
        },
        (payload) => {
          // Khi có tin nhắn mới, tự động nối vào mảng hiện tại
          setMessages((currentMessages) => [...currentMessages, payload.new]);
          scrollToBottom();
        }
      )
      .subscribe();

    // Dọn dẹp kết nối khi người dùng đóng khung chat
    return () => {
      supabase.removeChannel(channel);
    };
  }, [rfqId]);

  // Hàm cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
  };

  // Hàm gửi tin nhắn
  const sendMessage = async (content: string, senderId: string) => {
    if (!content.trim() || !rfqId) return;
    
    await supabase.from('messages').insert([
      { rfq_id: rfqId, sender_id: senderId, content: content.trim() }
    ]);
  };

  return { messages, loading, sendMessage, scrollRef };
}