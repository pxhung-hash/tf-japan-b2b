import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth-guard';
// Gọi cái Bảng chứa tính năng mới vào đây
import CategoryInteractiveTable from './CategoryInteractiveTable'; 

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CategoryManagementPage() {
  await requireAuth('/master-data/categories', 'Master Category Management');
  const supabase = await createClient();

  // Bổ sung gọi thêm parent_id và name_ja để lấy đủ dữ liệu
  const { data: categories } = await supabase
    .from('categories')
    .select('*, profiles(company_name, full_name, role)')
    .order('is_official', { ascending: false })
    .order('name_en', { ascending: true });

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Header cũ của bạn được giữ nguyên 100% */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-japan-indigo tracking-tight">Category Master Data</h1>
        <p className="text-gray-500 mt-1">Manage system taxonomy. Review and approve custom categories created by suppliers.</p>
      </div>

      {/* Dùng Bảng Interactive thay vì HTML cũ */}
      <CategoryInteractiveTable categories={categories || []} />
    </div>
  );
}