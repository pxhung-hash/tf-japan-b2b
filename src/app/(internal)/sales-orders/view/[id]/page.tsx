import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PrintPdfButton from '@/components/forms/PrintPdfButton';

export const dynamic = 'force-dynamic';

export default async function SOPdfViewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from('sales_orders')
    .select(`
      *,
      buyers ( company_name, country, tax_id, website, email, phone ),
      seller_entities ( name, address, email, phone, tax_id ),
      sales_order_items (
        id, quantity, unit_price, line_total, remarks,
        products ( name, hs_code )
      )
    `)
    .eq('id', resolvedParams.id)
    .single();

  if (error || !order) return notFound();

  return (
    <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0">
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden px-4">
        <Link href="/sales-orders" className="text-gray-500 hover:text-japan-indigo font-bold text-sm flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Sales Orders
        </Link>
        <PrintPdfButton />
      </div>

      <div className="max-w-4xl mx-auto bg-white shadow-2xl print:shadow-none p-12 print:p-0">
        
        {/* HEADER */}
        <div className="flex justify-between items-start border-b-4 border-japan-crimson pb-8 mb-8">
          <div>
            <h1 className="text-4xl font-black text-japan-indigo tracking-tight">
              {order.seller_entities?.name || 'ZENIX-JAPAN'}
            </h1>
            <p className="text-japan-crimson font-bold uppercase tracking-widest text-xs mt-1">Official Sales Order</p>
            <div className="mt-4 text-xs text-gray-500 space-y-1">
              <p>{order.seller_entities?.address}</p>
              <p>Email: {order.seller_entities?.email}</p>
              {order.seller_entities?.tax_id && <p>Tax ID: {order.seller_entities.tax_id}</p>}
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-black text-gray-200 uppercase tracking-widest mb-2">Order Conf.</h2>
            <p className="text-sm font-bold text-gray-800">SO No: <span className="font-mono text-japan-crimson">{order.so_number}</span></p>
            <p className="text-xs text-gray-500 mt-1">Date: {new Date(order.created_at).toLocaleDateString('en-GB')}</p>
          </div>
        </div>

        {/* BILL TO */}
        <div className="mb-10">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Bill To / Ship To:</h3>
          <div className="bg-gray-50 p-4 border-l-4 border-japan-indigo grid grid-cols-2 gap-4">
            <div>
              <p className="text-lg font-black text-gray-900">{order.buyers?.company_name}</p>
              <p className="text-sm text-gray-600 mt-1">Country: {order.buyers?.country}</p>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              {order.buyers?.email && <p><span className="font-bold text-gray-400 w-12 inline-block">Email:</span> {order.buyers.email}</p>}
              {order.buyers?.phone && <p><span className="font-bold text-gray-400 w-12 inline-block">Phone:</span> {order.buyers.phone}</p>}
            </div>
          </div>
        </div>

        {/* ITEMS TABLE */}
        <div className="mb-8">
          <table className="w-full text-sm text-left">
            <thead className="bg-japan-indigo text-white uppercase text-[10px] tracking-widest font-black">
              <tr>
                <th className="py-3 px-4 rounded-tl-sm">Product Description</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right rounded-tr-sm">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 border-b-2 border-gray-200">
              {order.sales_order_items?.map((item: any) => (
                <tr key={item.id}>
                  <td className="py-4 px-4 font-bold text-gray-900">
                    {item.products?.name}
                    {item.products?.hs_code && <span className="block text-[10px] text-gray-500 font-mono font-normal mt-1">HS: {item.products.hs_code}</span>}
                  </td>
                  <td className="py-4 px-4 text-center font-mono font-bold text-gray-700">{item.quantity}</td>
                  <td className="py-4 px-4 text-right font-mono text-gray-700">${item.unit_price.toLocaleString()}</td>
                  <td className="py-4 px-4 text-right font-mono font-black text-japan-indigo">${item.line_total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTAL */}
        <div className="flex justify-end mb-12">
          <div className="w-1/2">
            <div className="flex justify-between bg-gray-50 border-t-2 border-japan-crimson p-4 items-center">
              <span className="font-black uppercase tracking-widest text-sm text-gray-800">Grand Total ({order.currency}):</span>
              <span className="text-2xl font-black font-mono text-japan-crimson">${order.total_amount?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* NOTES */}
        {order.notes && (
          <div className="border-t border-gray-200 pt-8 text-sm text-gray-600">
            <h4 className="font-black uppercase tracking-widest text-gray-900 mb-2 text-xs">Order Remarks</h4>
            <p className="whitespace-pre-wrap leading-relaxed">{order.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}