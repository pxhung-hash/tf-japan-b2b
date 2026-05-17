import Link from 'next/link';

export default function PendingApproval() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-japan-paper px-4">
      <div className="max-w-lg w-full bg-white shadow-xl rounded-sm p-10 text-center border-t-4 border-japan-indigo">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-japan-indigo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-japan-indigo mb-4">Application Under Review</h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Cảm ơn bạn đã đăng ký tài khoản đối tác (Buyer Account) tại ZENIX Japan. 
          <br /><br />
          Để đảm bảo tính bảo mật của mạng lưới nhà cung cấp và chất lượng giao thương, đội ngũ của chúng tôi đang tiến hành xác minh thông tin doanh nghiệp của bạn. Quá trình này thường mất từ 1-2 ngày làm việc.
        </p>
        <div className="bg-blue-50 p-4 rounded-sm text-sm text-japan-indigo font-medium mb-8">
          Chúng tôi sẽ gửi email thông báo ngay khi tài khoản của bạn được cấp quyền truy cập vào Master Catalog.
        </div>
        <Link href="/" className="inline-block bg-japan-indigo text-white px-8 py-3 rounded-sm text-sm font-bold hover:bg-opacity-90 transition">
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}