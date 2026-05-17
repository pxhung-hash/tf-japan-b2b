'use client';

import { useState, useRef, useEffect } from 'react';
import { sendChatMessage, markChatAsRead } from '@/app/(internal)/sales-desk/direct-chats/actions';
import { useRouter } from 'next/navigation';

export default function StaffChatInterface({ 
  staffId, buyerId, buyerName, initialMessages 
}: { 
  staffId: string, buyerId: string, buyerName: string, initialMessages: any[] 
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => { setMessages(initialMessages); }, [initialMessages]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  
  // Tự động clear chấm đỏ khi Staff mở khung chat này
  useEffect(() => { markChatAsRead(); }, [buyerId]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    const contentToSend = newMessage.trim();
    setNewMessage('');
    setMessages(prev => [...prev, { id: Math.random().toString(), sender_id: staffId, content: contentToSend, created_at: new Date().toISOString() }]);
    
    setIsSending(true);
    await sendChatMessage(staffId, buyerId, contentToSend);
    router.refresh(); 
    setIsSending(false);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-200 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 bg-japan-indigo rounded-full flex items-center justify-center text-white font-bold">
          {buyerName.substring(0, 2).toUpperCase()}
        </div>
        <h2 className="font-bold text-japan-ink">{buyerName}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-[#f0f2f5] space-y-3">
        {messages.map((msg) => {
          const isMine = msg.sender_id === staffId;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2 text-sm shadow-sm ${isMine ? 'bg-japan-indigo text-white rounded-l-2xl rounded-br-2xl' : 'bg-white text-gray-800 rounded-r-2xl rounded-bl-2xl border border-gray-100'}`}>
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-200 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 outline-none text-sm"
        />
        <button onClick={handleSend} disabled={!newMessage.trim() || isSending} className="w-10 h-10 bg-japan-indigo text-white rounded-full flex items-center justify-center disabled:opacity-50">
          ➤
        </button>
      </div>
    </div>
  );
}