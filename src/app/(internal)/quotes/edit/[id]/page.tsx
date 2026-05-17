import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
// ✅ IMPORT component form cấu hình báo giá (Nơi chứa toàn bộ giao diện và logic Deep Edit)
import QuoteBuilderForm from '@/components/forms/QuoteBuilderForm';

export const dynamic = 'force-dynamic';

export default async function EditQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const quoteId = resolvedParams.id;
  const supabase = await createClient();

  // 1. KÉO SÂU DỮ LIỆU CỦA BÁO GIÁ HIỆN TẠI (Kèm cả Items và Phụ phí)
  const { data: quote, error } = await supabase
    .from('quotes')
    .select('*, quote_items(*), quote_adjustments(*)')
    .eq('id', quoteId)
    .single();

  if (error || !quote) return notFound();

  // 2. KÉO DỮ LIỆU MASTER DATA CHO DROPDOWNS
  const { data: buyers } = await supabase.from('buyers').select('id, company_name, country');
  const { data: products } = await supabase.from('products').select('id, name, base_cost, currency, hs_code');
  const { data: sellers } = await supabase.from('seller_entities').select('id, name, is_default');

  // TRẢ VỀ GIAO DIỆN
  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8 border-b border-gray-200 pb-6">
        <Link href="/quotes" className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition text-gray-500 shadow-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-japan-indigo">Deep Edit Quotation</h1>
          <p className="text-sm text-gray-500 mt-1 font-mono">Ref: <span className="text-japan-crimson font-bold">{quote.quote_number}</span></p>
        </div>
      </div>

      {/* ✅ LẮP RÁP FORM VÀ TRUYỀN DỮ LIỆU CŨ XUỐNG */}
      <QuoteBuilderForm 
        buyers={buyers || []} 
        products={products || []} 
        sellerEntities={sellers || []} 
        initialData={quote} // Truyền toàn bộ cấu hình cũ xuống Form
        quoteId={quote.id}  // Cung cấp ID để Form biết là đang ở chế độ Update
      />
    </div>
  );
}