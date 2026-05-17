import { createClient } from '@/lib/supabase/server';
import ProductEntryForm from '@/components/forms/ProductEntryForm';
import Link from 'next/link';
// Import Component Nút Excel vừa tạo
import AdminExcelActions from '@/components/ui/AdminExcelActions';

export default async function CreateMasterDataPage() {
  const supabase = await createClient();

  // 1. Lấy danh sách Categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name_en');
    
  // 2. Lấy danh sách Suppliers
  const { data: suppliers } = await supabase
    .from('suppliers')
    .select('*')
    .order('company_name');

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        
        {/* Phía trái: Tiêu đề và nút Back */}
        <div className="flex items-center gap-4">
          <Link href="/master-data" className="text-gray-400 hover:text-japan-indigo bg-white p-2 rounded-full border border-gray-100 shadow-sm transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-japan-indigo">Create Master Product</h1>
            <p className="text-gray-500 text-sm mt-1">Add single product or bulk import via Excel.</p>
          </div>
        </div>

        {/* Phía phải: Cụm nút Excel */}
        {/* Truyền suppliers và categories vào để nó có thể mapping từ Tên sang ID */}
        <AdminExcelActions suppliers={suppliers || []} categories={categories || []} />

      </div>

      {/* Truyền dữ liệu xuống Form Component (Thêm 1 sản phẩm thủ công) */}
      <ProductEntryForm categories={categories || []} suppliers={suppliers || []} />
    </div>
  );
}