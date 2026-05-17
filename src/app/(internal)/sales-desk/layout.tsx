import Link from 'next/link';

export default function SalesDeskLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      
      {/* THANH TAB NỘI BỘ SIÊU MỎNG DÀNH CHO SALES DESK */}
      <div className="flex items-center gap-8 mb-4 border-b border-gray-200 pb-3">
        <h1 className="text-2xl font-black text-japan-indigo tracking-tight">Sales Desk</h1>
        
        <div className="flex items-center gap-6 mt-1">
          <Link href="/sales-desk" className="text-sm font-bold text-gray-500 hover:text-japan-indigo transition">
            MANAGE RFQs
          </Link>
          <Link href="/sales-desk/direct-chats" className="text-sm font-bold text-gray-500 hover:text-japan-indigo transition flex items-center gap-1.5">
            CLIENT CHATS
            {/* Chú ý: Ta không cần hiện số đỏ ở đây nữa vì đã có chuông bên trên lo việc báo hiệu rồi, giao diện sẽ sạch sẽ hơn */}
          </Link>
        </div>
      </div>

      {/* KHÔNG GIAN RỘNG RÃI CHO KHUNG CHAT / DANH SÁCH RFQ */}
      <div className="flex-1 min-h-0">
         {children}
      </div>
      
    </div>
  );
}