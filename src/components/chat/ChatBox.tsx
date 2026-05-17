'use client'

import { useState } from 'react';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';

interface ChatBoxProps {
  rfqId: string | null;
  currentUserId: string;
}

export default function ChatBox({ rfqId, currentUserId }: ChatBoxProps) {
  const { messages, loading, sendMessage, scrollRef } = useRealtimeChat(rfqId);
  const [inputText, setInputText] = useState('');

  if (!rfqId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-sm">
        <p className="text-gray-400 font-medium">Select an RFQ to start chatting</p>
      </div>
    );
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const textToSend = inputText;
    setInputText(''); // Xóa ô input ngay lập tức để tạo cảm giác mượt
    await sendMessage(textToSend, currentUserId);
  };

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-sm shadow-sm">
      {/* Tiêu đề khung chat */}
      <div className="p-4 border-b border-gray-200 bg-japan-paper flex justify-between items-center">
        <div>
          <h3 className="font-bold text-japan-indigo">Live Negotiation Desk</h3>
          <p className="text-xs text-green-600 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Secure Connection
          </p>
        </div>
      </div>

      {/* Khu vực hiển thị tin nhắn */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50"
      >
        {loading ? (
          <div className="text-center text-gray-400 text-sm mt-4">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm mt-4">No messages yet. Send a quote to start!</div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-sm px-4 py-2 shadow-sm ${
                  isMe ? 'bg-japan-indigo text-white' : 'bg-white border border-gray-200 text-japan-ink'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <span className={`text-[10px] mt-1 block ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Khu vực nhập tin nhắn */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message or attach a quote..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-sm outline-none focus:border-japan-indigo focus:ring-1 focus:ring-japan-indigo text-sm"
          />
          <button 
            type="submit" 
            disabled={!inputText.trim()}
            className="bg-japan-crimson hover:bg-red-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-sm font-bold transition"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}