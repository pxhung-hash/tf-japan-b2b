'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { markAllNotificationsAsRead } from '@/app/(buyer)/actions';

export default function NotificationBell({ 
  unreadMessageCount = 0, 
  systemNotifs = [],
  userType = 'buyer' // ✅ THÊM PHÂN LOẠI NGƯỜI DÙNG (Mặc định là buyer)
}: { 
  unreadMessageCount?: number, 
  systemNotifs?: any[],
  userType?: 'buyer' | 'staff' // ✅ KIỂU DỮ LIỆU
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const [isPending, startTransition] = useTransition();

  const safeNotifs = systemNotifs || []; 
  const unreadNotifsCount = safeNotifs.filter(n => !n.is_read).length;
  const totalUnread = unreadMessageCount + unreadNotifsCount;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllAsRead = () => {
    if (totalUnread === 0) return;

    startTransition(async () => {
      const res = await markAllNotificationsAsRead();
      if (res?.success) {
        router.refresh();
        setIsOpen(false); 
      } else {
        alert("Có lỗi xảy ra khi cập nhật thông báo!");
      }
    });
  };

  // ✅ XÁC ĐỊNH ĐƯỜNG DẪN VÀ TEXT DỰA TRÊN USER TYPE
  const messagesLink = userType === 'staff' ? '/sales-desk/direct-chats' : '/dashboard/messages';
  const messagesSenderText = userType === 'staff' ? 'from your clients' : 'from your representative';

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 transition rounded-full ${isOpen ? 'bg-japan-indigo text-white' : 'text-gray-400 hover:text-japan-crimson hover:bg-gray-100'}`}
        title="Notifications"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
        
        {totalUnread > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-japan-crimson opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-japan-crimson"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 origin-top-right">
          <div className="bg-gray-50 border-b border-gray-100 p-4 flex justify-between items-center">
            <h3 className="font-black text-japan-indigo text-sm uppercase tracking-wider">Notifications</h3>
            {totalUnread > 0 && (
              <span className="bg-japan-crimson text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {totalUnread} New
              </span>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {totalUnread === 0 && safeNotifs.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                You're all caught up!
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-gray-50">
                
                {/* 1. HIỂN THỊ TIN NHẮN THEO ĐÚNG ĐỐI TƯỢNG */}
                {unreadMessageCount > 0 && (
                  <Link href={messagesLink} onClick={() => setIsOpen(false)} className="p-4 hover:bg-blue-50/50 transition flex items-start gap-3 bg-blue-50/30">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">New Messages</p>
                      {/* Text thay đổi dựa vào role */}
                      <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">You have {unreadMessageCount} unread message(s) {messagesSenderText}.</p>
                      <p className="text-[10px] text-blue-600 font-bold mt-1 uppercase tracking-wider">Click to reply</p>
                    </div>
                  </Link>
                )}

                {/* 2. HIỂN THỊ THÔNG BÁO HỆ THỐNG */}
                {safeNotifs.map((notif) => (
                  <Link 
                    key={notif.id} 
                    href={notif.link || '#'} 
                    onClick={() => setIsOpen(false)}
                    className={`p-4 hover:bg-gray-50 transition flex items-start gap-3 ${!notif.is_read ? 'bg-gray-50/50' : 'opacity-70'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${!notif.is_read ? 'bg-japan-indigo text-white' : 'bg-gray-200 text-gray-500'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div>
                      <p className={`text-sm ${!notif.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>{notif.title}</p>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{notif.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(notif.created_at).toLocaleDateString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 p-2 border-t border-gray-100 text-center flex justify-center">
            <button 
              onClick={handleMarkAllAsRead}
              disabled={isPending || totalUnread === 0}
              className="text-xs text-gray-500 hover:text-japan-indigo font-bold transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPending ? 'Marking...' : 'Mark all as read'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}