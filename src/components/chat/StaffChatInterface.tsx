'use client';

import { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '@/app/(internal)/sales-desk/direct-chats/actions'; // Dùng chung action gửi tin nhắn
import { useRouter } from 'next/navigation';

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export default function StaffChatInterface({ 
  staffId, 
  buyerId, 
  buyerName, 
  buyerCompany,
  initialMessages 
}: { 
  staffId: string, 
  buyerId: string, 
  buyerName: string, 
  buyerCompany: string,
  initialMessages: Message[] 
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setMessages(initialMessages); // Cập nhật lại tin nhắn khi đổi người chat
  }, [initialMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    const contentToSend = newMessage.trim();
    setNewMessage('');

    // Hiển thị tin nhắn ảo ngay lập tức
    const tempMsg: Message = {
      id: Math.random().toString(),
      sender_id: staffId,
      content: contentToSend,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);
    setIsSending(true);

    const res = await sendChatMessage(staffId, buyerId, contentToSend);
    
    if (!res.success) {
      alert("Error sending message: " + res.error);
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    } else {
      router.refresh(); 
    }
    setIsSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* HEADER KHUNG CHAT (Hiển thị tên Khách hàng) */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-japan-indigo rounded-full flex items-center justify-center text-white font-bold text-lg">
            {buyerName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-japan-ink font-bold text-base">{buyerName}</h2>
            <p className="text-gray-500 text-xs">{buyerCompany}</p>
          </div>
        </div>
        <button className="text-xs font-bold text-japan-crimson hover:bg-red-50 px-3 py-1.5 rounded-sm transition border border-japan-crimson">
          View Profile
        </button>
      </div>

      {/* KHU VỰC HIỂN THỊ TIN NHẮN */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#f0f2f5] space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 text-sm italic mt-10">
            No messages yet. Send a greeting to the client.
          </div>
        )}

        {messages.map((msg) => {
          const isMine = msg.sender_id === staffId; // Phân biệt tin của Staff và của Khách
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                isMine 
                  ? 'bg-japan-indigo text-white rounded-br-sm' // Tin của Staff màu xanh đen
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm' // Tin khách màu trắng
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                <div className={`text-[10px] mt-1 text-right ${isMine ? 'text-indigo-200' : 'text-gray-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* KHUNG NHẬP TIN NHẮN */}
      <div className="p-4 bg-white border-t border-gray-200 flex items-end gap-3 z-10">
        <div className="flex-1 bg-gray-100 rounded-2xl relative">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your reply to the client..."
            className="w-full bg-transparent p-3 outline-none resize-none max-h-32 min-h-[44px] text-sm text-gray-800"
            rows={1}
          />
        </div>
        <button 
          onClick={handleSend}
          disabled={!newMessage.trim() || isSending}
          className="p-3 bg-japan-indigo hover:bg-opacity-90 text-white transition rounded-full disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex-shrink-0"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
        </button>
      </div>
    </div>
  );
}