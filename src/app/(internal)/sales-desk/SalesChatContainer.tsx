'use client'

import { useState } from 'react';
import ChatBox from '@/components/chat/ChatBox';
import QuoteModal from '@/components/forms/QuoteModal';

export default function SalesChatContainer({ currentRfqId, currentUserId }: { currentRfqId: string | null, currentUserId: string }) {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  if (!currentRfqId) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded-sm shadow-sm">
        <div className="w-16 h-16 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center mb-4">💬</div>
        <p className="text-gray-500 font-medium">Select an RFQ from the list to start negotiating</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Action Bar của Sales */}
      <div className="bg-white border border-gray-200 border-b-0 rounded-t-sm p-3 flex justify-end gap-2 shadow-sm relative z-10">
         <button 
           onClick={() => setIsQuoteModalOpen(true)}
           className="bg-japan-gold hover:bg-yellow-500 text-japan-indigo font-black text-xs uppercase tracking-wider px-4 py-2 rounded-sm shadow-sm transition"
         >
           + Create Official Quote
         </button>
      </div>

      {/* Khung Chat */}
      <div className="flex-1 relative">
         <ChatBox rfqId={currentRfqId} currentUserId={currentUserId} />
      </div>

      {/* Gọi Modal Báo giá */}
      {isQuoteModalOpen && (
        <QuoteModal rfqId={currentRfqId} onClose={() => setIsQuoteModalOpen(false)} />
      )}
    </div>
  );
}