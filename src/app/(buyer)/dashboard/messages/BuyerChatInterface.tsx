'use client';

import { useState, useRef, useEffect } from 'react';
import { sendBuyerDirectMessage, markBuyerChatAsRead } from './actions';
import { useRouter } from 'next/navigation';

export default function BuyerChatInterface({ 
  currentUserId, staffId, staffName, initialMessages 
}: { 
  currentUserId: string, staffId: string, staffName: string, initialMessages: any[] 
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { markBuyerChatAsRead(); }, []); // Tự tắt chấm đỏ

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;
    const contentToSend = newMessage.trim();
    setNewMessage('');
    
    setMessages(prev => [...prev, { id: Math.random().toString(), sender_id: currentUserId, content: contentToSend, created_at: new Date().toISOString() }]);
    
    setIsSending(true);
    await sendBuyerDirectMessage(staffId, contentToSend);
    router.refresh(); 
    setIsSending(false);
  };

  return (
    <div className="flex flex-col h-[65vh] bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 p-4 font-bold text-japan-ink flex items-center gap-3">
        <div className="w-10 h-10 bg-japan-crimson rounded-full text-white flex items-center justify-center">
            {staffName.charAt(0).toUpperCase()}
        </div>
        <div>
          <div>{staffName}</div>
          <div className="text-xs text-green-600 font-normal">Account Manager</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-[#f0f2f5] space-y-4">
        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isMine ? 'bg-japan-indigo text-white rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'}`}>
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
          placeholder="Type your message to support..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 outline-none text-sm"
        />
        <button onClick={handleSend} disabled={!newMessage.trim() || isSending} className="w-10 h-10 bg-japan-crimson text-white rounded-full flex items-center justify-center disabled:opacity-50">
          ➤
        </button>
      </div>
    </div>
  );
}