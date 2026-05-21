'use client';

import { useState, useRef, useEffect } from 'react';
// ✅ ĐÃ SỬA: Đổi sendChatMessage thành sendMessage cho khớp với convention thông thường
import { sendMessage, markChatAsRead } from '@/app/(buyer)/dashboard/messages/actions'; 
import { useRouter } from 'next/navigation';

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export default function ChatInterface({ 
  currentUserId, 
  repId, 
  repName, 
  initialMessages 
}: { 
  currentUserId: string, 
  repId: string, 
  repName: string, 
  initialMessages: Message[] 
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Tự động đánh dấu đã đọc và clear chấm đỏ khi mở khung chat
  useEffect(() => {
    markChatAsRead();
  }, []);

  // Handle khi user bấm Gửi hoặc Enter
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    const contentToSend = newMessage.trim();
    setNewMessage(''); // Xóa khung nhập ngay lập tức tạo cảm giác mượt

    // Tạo tin nhắn "ảo" hiển thị ngay lập tức (Optimistic UI)
    const tempMsg: Message = {
      id: Math.random().toString(),
      sender_id: currentUserId,
      content: contentToSend,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);

    setIsSending(true);
    // ✅ ĐÃ SỬA: Gọi hàm sendMessage ở đây
    const res = await sendMessage(repId, contentToSend);
    
    if (!res.success) {
      alert("Lỗi gửi tin: " + res.error);
      // Xóa tin nhắn ảo nếu gửi xịt
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    } else {
      router.refresh(); // Fetch lại data thực từ server để lấy ID chuẩn
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
    <div className="flex flex-col h-[70vh] bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden relative">
      
      {/* HEADER KHUNG CHAT */}
      <div className="bg-japan-indigo px-6 py-4 flex items-center gap-4 shadow-sm z-10">
        <div className="relative">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-japan-indigo font-black text-lg border-2 border-white shadow-sm">
            {repName.substring(0, 2).toUpperCase()}
          </div>
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-japan-indigo rounded-full"></div>
        </div>
        <div>
          <h2 className="text-white font-bold text-lg">{repName}</h2>
          <p className="text-indigo-200 text-xs flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"></span>
            Technical Sales Representative • Online
          </p>
        </div>
      </div>

      {/* KHU VỰC HIỂN THỊ TIN NHẮN (BONG BÓNG) */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#f0f2f5] space-y-4">
        <div className="text-center mb-8">
          <span className="bg-gray-200 text-gray-500 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">
            End-to-End Encrypted Chat
          </span>
        </div>

        {messages.length === 0 && (
          <div className="text-center text-gray-500 text-sm italic mt-10">
            Send a message to start negotiating with your Representative.
          </div>
        )}

        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                isMine 
                  ? 'bg-blue-600 text-white rounded-br-sm' 
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                <div className={`text-[10px] mt-1 text-right ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
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
        <button className="p-3 text-gray-400 hover:text-japan-indigo transition bg-gray-50 hover:bg-gray-100 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
        </button>
        <div className="flex-1 bg-gray-100 rounded-2xl relative">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift + Enter for new line)"
            className="w-full bg-transparent p-3 outline-none resize-none max-h-32 min-h-[44px] text-sm text-gray-800"
            rows={1}
          />
        </div>
        <button 
          onClick={handleSend}
          disabled={!newMessage.trim() || isSending}
          className="p-3 bg-japan-crimson hover:bg-red-700 text-white transition rounded-full disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex-shrink-0"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
        </button>
      </div>
    </div>
  );
}