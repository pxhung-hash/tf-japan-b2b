import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import SOBuilderForm from '@/components/forms/SOBuilderForm';

export const dynamic = 'force-dynamic';

export default async function EditSalesOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const soId = resolvedParams.id;
  const supabase = await createClient();

  // Kéo sâu dữ liệu Đơn hàng
  const { data: order, error } = await supabase
    .from('sales_orders')
    .select('*, sales_order_items(*)')
    .eq('id', soId)
    .single();

  if (error || !order) return notFound();

  // Kéo Master Data
  const { data: buyers } = await supabase.from('buyers').select('id, company_name, country');
  const { data: products } = await supabase.from('products').select('id, name, base_cost, currency, hs_code');
  const { data: sellers } = await supabase.from('seller_entities').select('id, name, is_default');

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8 border-b border-gray-200 pb-6">
        <Link href="/sales-orders" className="p-2 bg-white border rounded-full hover:bg-gray-50 text-gray-500 shadow-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-japan-indigo">Deep Edit Sales Order</h1>
          <p className="text-sm text-gray-500 mt-1 font-mono">Ref: <span className="text-japan-crimson font-bold">{order.so_number}</span></p>
        </div>
      </div>

      <SOBuilderForm 
        buyers={buyers || []} 
        products={products || []} 
        sellerEntities={sellers || []} 
        initialData={order} 
        soId={order.id} 
      />
    </div>
  );
}