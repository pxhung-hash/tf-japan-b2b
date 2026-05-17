import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PrintPdfButton from '@/components/forms/PrintPdfButton';

export const dynamic = 'force-dynamic';

export default async function QuotePdfViewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();

  // ✅ ĐÃ SỬA LẠI: Đơn giản hóa cú pháp join bảng profiles và log lỗi chi tiết
  const { data: quote, error } = await supabase
    .from('quotes')
    .select(`
      *,
      buyers ( company_name, country, tax_id, website, email, phone ),
      seller_entities ( name, address, email, phone, tax_id ),
      profiles ( full_name, email ),
      quote_items (
        id, quantity, unit_price, line_total, tier_type, remarks,
        products ( name, hs_code, suppliers ( id, company_name ) )
      ),
      quote_adjustments ( id, name, type, amount )
    `)
    .eq('id', resolvedParams.id)
    .single();

  // Nếu có lỗi SQL, in ra Terminal để dễ dàng kiểm tra
  if (error) {
    console.error("🚨 LỖI TRUY VẤN DỮ LIỆU PDF:", error.message, error.hint);
  }

  // Kích hoạt trang 404 nếu không tìm thấy dữ liệu
  if (error || !quote) {
    return notFound();
  }

  const fees = quote.quote_adjustments?.filter((a: any) => a.type === 'fee') || [];
  const discounts = quote.quote_adjustments?.filter((a: any) => a.type === 'discount') || [];
  const itemsSubtotal = quote.quote_items?.reduce((sum: number, item: any) => sum + item.line_total, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0">
      
      {/* THANH CÔNG CỤ (Ẩn khi in PDF) */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden px-4">
        <Link href="/quotes" className="text-gray-500 hover:text-japan-indigo font-bold text-sm flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Quotes
        </Link>
        <PrintPdfButton />
      </div>

      {/* TỜ GIẤY A4 */}
      <div className="max-w-4xl mx-auto bg-white shadow-2xl print:shadow-none p-12 print:p-0">
        
        {/* HEADER: LOGO */}
        <div className="flex justify-between items-start border-b-4 border-japan-indigo pb-8 mb-8">
          <div>
            <h1 className="text-4xl font-black text-japan-indigo tracking-tight">
              {quote.seller_entities?.name || 'ZENIX-JAPAN TRADING'}
            </h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-1">Commercial Quotation</p>
            <div className="mt-4 text-xs text-gray-500 space-y-1">
              <p>{quote.seller_entities?.address || 'Tokyo, Japan HQ'}</p>
              <p>Email: {quote.seller_entities?.email || 'trading@zenix-japan.com'}</p>
              {quote.seller_entities?.tax_id && <p>Tax ID: {quote.seller_entities.tax_id}</p>}
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-black text-gray-200 uppercase tracking-widest mb-2">Quote</h2>
            <p className="text-sm font-bold text-gray-800">No: <span className="font-mono text-japan-crimson">{quote.quote_number}</span></p>
            <p className="text-xs text-gray-500 mt-1">Date: {new Date(quote.created_at).toLocaleDateString('en-GB')}</p>
            <p className="text-xs text-gray-500">Valid Until: <span className="font-bold text-gray-800">{quote.valid_until ? new Date(quote.valid_until).toLocaleDateString('en-GB') : 'Open'}</span></p>
            
            {/* ✅ BỔ SUNG: Hiển thị Người báo giá */}
            {quote.profiles?.full_name && (
              <div className="mt-4 bg-gray-50 p-2 rounded border inline-block text-left">
                <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Sales Representative</p>
                <p className="text-xs font-black text-japan-indigo">{quote.profiles.full_name}</p>
                <p className="text-[10px] text-gray-500">{quote.profiles.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* ✅ BỔ SUNG: HIỂN THỊ ĐẦY ĐỦ THÔNG TIN BUYER */}
        <div className="mb-10">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Quote Prepared For:</h3>
          <div className="bg-gray-50 p-4 border-l-4 border-japan-gold grid grid-cols-2 gap-4">
            <div>
              <p className="text-lg font-black text-gray-900">{quote.buyers?.company_name || 'N/A'}</p>
              <p className="text-sm text-gray-600 mt-1">Country: {quote.buyers?.country || 'N/A'}</p>
              {quote.buyers?.tax_id && <p className="text-xs text-gray-500 font-mono mt-1">Tax ID: {quote.buyers.tax_id}</p>}
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              {quote.buyers?.email && <p><span className="font-bold text-gray-400 w-12 inline-block">Email:</span> {quote.buyers.email}</p>}
              {quote.buyers?.phone && <p><span className="font-bold text-gray-400 w-12 inline-block">Phone:</span> {quote.buyers.phone}</p>}
              {quote.buyers?.website && <p><span className="font-bold text-gray-400 w-12 inline-block">Web:</span> {quote.buyers.website}</p>}
            </div>
          </div>
        </div>

        {/* ITEMS TABLE */}
        <div className="mb-8">
          <table className="w-full text-sm text-left">
            <thead className="bg-japan-indigo text-white uppercase text-[10px] tracking-widest font-black">
              <tr>
                <th className="py-3 px-4 rounded-tl-sm">Item Description & Supplier Ref.</th>
                <th className="py-3 px-4 text-center">Type</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right rounded-tr-sm">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 border-b-2 border-gray-200">
              {quote.quote_items?.map((item: any) => (
                <tr key={item.id}>
                  <td className="py-4 px-4">
                    <p className="font-bold text-gray-900">{item.products?.name}</p>
                    
                    {/* ✅ BỔ SUNG: Hiển thị Mã HS và Mã Nhà Cung cấp (Cắt UUID ra 8 số đầu làm Code) */}
                    <div className="flex gap-3 mt-1">
                      {item.products?.hs_code && <span className="text-[10px] text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">HS: {item.products.hs_code}</span>}
                      {item.products?.suppliers?.id && (
                        <span className="text-[10px] text-japan-crimson font-mono bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                          MFR-ID: {item.products.suppliers.id.substring(0,8).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[9px] uppercase tracking-wider font-bold rounded">{item.tier_type}</span>
                  </td>
                  <td className="py-4 px-4 text-center font-mono font-bold text-gray-700">{item.quantity}</td>
                  <td className="py-4 px-4 text-right font-mono text-gray-700">${item.unit_price.toLocaleString()}</td>
                  <td className="py-4 px-4 text-right font-mono font-black text-japan-indigo">${item.line_total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FINANCIAL SUMMARY */}
        <div className="flex justify-end mb-12">
          <div className="w-1/2">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600 font-medium px-4">
                <span>Subtotal:</span>
                <span className="font-mono">${itemsSubtotal.toLocaleString()}</span>
              </div>
              
              {fees.map((fee: any) => (
                <div key={fee.id} className="flex justify-between text-gray-500 text-xs px-4">
                  <span>{fee.name}:</span><span className="font-mono">(+) ${Number(fee.amount).toLocaleString()}</span>
                </div>
              ))}

              {discounts.map((disc: any) => (
                <div key={disc.id} className="flex justify-between text-green-600 text-xs px-4">
                  <span>{disc.name}:</span><span className="font-mono">(-) ${Number(disc.amount).toLocaleString()}</span>
                </div>
              ))}

              <div className="flex justify-between bg-japan-indigo text-white p-4 rounded-sm items-center mt-2">
                <span className="font-black uppercase tracking-widest text-xs">Grand Total ({quote.currency}):</span>
                <span className="text-xl font-black font-mono text-japan-gold">${quote.total_amount?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {quote.notes && (
          <div className="border-t border-gray-200 pt-8 text-sm text-gray-600">
            <h4 className="font-black uppercase tracking-widest text-gray-900 mb-2 text-xs">Terms & Conditions</h4>
            <p className="whitespace-pre-wrap leading-relaxed">{quote.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}