'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// ✅ ĐÃ CẬP NHẬT: Import thêm hàm updateQuote
import { createQuote, updateQuote } from '@/app/(internal)/quotes/actions';
import PostToSOButton from '@/components/forms/PostToSOButton'; 

// ✅ ĐÃ CẬP NHẬT: Thêm initialData và quoteId vào props
export default function QuoteBuilderForm({ 
  buyers, products, sellerEntities, initialData, quoteId 
}: { 
  buyers: any[], products: any[], sellerEntities: any[], initialData?: any, quoteId?: string 
}) {
  const router = useRouter();
  
  // Khởi tạo State từ Dữ liệu cũ (nếu đang ở chế độ Edit) hoặc Mặc định (nếu Create)
  const defaultSellerId = sellerEntities.find(s => s.is_default)?.id || (sellerEntities[0]?.id || '');
  const [selectedSellerId, setSelectedSellerId] = useState(initialData?.seller_id || defaultSellerId);
  const [selectedBuyerId, setSelectedBuyerId] = useState(initialData?.buyer_id || '');
  const [validUntil, setValidUntil] = useState(initialData?.valid_until?.split('T')[0] || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [commissionRate, setCommissionRate] = useState<number>(initialData?.commission_rate || 0);
  const [status, setStatus] = useState(initialData?.status || 'draft');
  
  // ✅ Ánh xạ chi tiết sản phẩm cũ (nếu có)
  const initialItems = initialData?.quote_items?.map((item: any) => ({
    product_id: item.product_id,
    tier_type: item.tier_type,
    quantity: item.quantity,
    base_cost: products.find(p => p.id === item.product_id)?.base_cost || 0,
    margin: item.margin_applied || 20, // Khôi phục lại margin
    unit_price: item.unit_price,
    line_total: item.line_total,
    remarks: item.remarks || ''
  })) || [];

  const [items, setItems] = useState<any[]>(initialItems);
  const [adjustments, setAdjustments] = useState<any[]>(initialData?.quote_adjustments || []);
  const [loading, setLoading] = useState(false);

  // Thêm một dòng sản phẩm mới vào bảng tính
  const addItem = () => {
    setItems([...items, { product_id: '', tier_type: 'wholesale', quantity: 1, base_cost: 0, margin: 20, unit_price: 0, line_total: 0, remarks: '' }]);
  };

  // Cập nhật giá trị khi Admin thay đổi thông số trên từng dòng sản phẩm
  const updateItem = (index: number, key: string, value: any) => {
    const updated = [...items];
    const item = updated[index];

    if (key === 'product_id') {
      const prod = products.find(p => p.id === value);
      item.product_id = value;
      item.base_cost = prod ? Number(prod.base_cost) : 0;
    } else {
      item[key] = value;
    }

    // 💡 CÔNG THỨC CPQ LÕI: Tự động tính toán giá dựa theo loại hình mua hàng
    let computedPrice = item.base_cost * (1 + Number(item.margin) / 100);
    
    if (item.tier_type === 'sample') {
      computedPrice = computedPrice * 1.2; // Mua mẫu: Phạt thêm 20% phụ phí
    } else if (item.tier_type === 'wholesale' && item.quantity >= 100) {
      computedPrice = computedPrice * 0.9; // Mua sỉ số lượng lớn: Chiết khấu giảm 10%
    }

    item.unit_price = Math.round(computedPrice * 100) / 100;
    item.line_total = item.unit_price * Number(item.quantity);
    
    setItems(updated);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Thêm phụ phí phân bổ toàn đơn
  const addAdjustment = () => {
    setAdjustments([...adjustments, { name: '', type: 'fee', amount: 0 }]);
  };

  const updateAdjustment = (index: number, key: string, value: any) => {
    const updated = [...adjustments];
    updated[index][key] = value;
    setAdjustments(updated);
  };

  // Tính toán tổng số tiền cuối cùng của toàn bộ hóa đơn báo giá
  const itemsSubtotal = items.reduce((sum, item) => sum + (item.line_total || 0), 0);
  const adjustmentsTotal = adjustments.reduce((sum, adj) => {
    const amt = Number(adj.amount) || 0;
    return adj.type === 'fee' ? sum + amt : sum - amt;
  }, 0);
  const finalTotal = Math.max(0, itemsSubtotal + adjustmentsTotal);

  // Lưu hoặc Cập nhật dữ liệu
  const handleSave = async () => {
    if (!selectedSellerId) return alert('Vui lòng cấu hình ít nhất 1 Pháp nhân phát hành trong Settings!');
    if (!selectedBuyerId) return alert('Vui lòng chọn khách hàng doanh nghiệp!');
    if (items.length === 0) return alert('Vui lòng thêm ít nhất 1 mặt hàng!');

    setLoading(true);
    const quoteData = {
      buyer_id: selectedBuyerId,
      seller_id: selectedSellerId,
      commission_rate: commissionRate,
      status: status, // Kèm theo status hiện tại
      valid_until: validUntil || null,
      notes,
      total_amount: finalTotal,
      currency: 'USD'
    };

    // Đổi tên biến margin thành margin_applied trước khi lưu Database
    const itemsToSave = items.map(i => ({ ...i, margin_applied: i.margin }));

    // ✅ QUYẾT ĐỊNH LUỒNG: UPDATE NẾU CÓ QUOTE_ID, NGƯỢC LẠI THÌ CREATE
    const res = quoteId 
      ? await updateQuote(quoteId, quoteData, itemsToSave, adjustments)
      : await createQuote(quoteData, itemsToSave, adjustments);

    if (res.success) {
      router.push('/quotes');
    } else {
      alert('Lỗi hệ thống: ' + res.error);
    }
    setLoading(false);
  };

  // ✅ BẢO MẬT: Khóa form nếu Báo giá đã được chuyển thành Đơn hàng
  const isLocked = initialData?.status === 'posted';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative">
      
      {/* 🔒 LỚP PHỦ KHÓA MÀN HÌNH */}
      {isLocked && (
        <div className="absolute inset-0 bg-white/40 z-10 flex justify-center items-start pt-20 backdrop-blur-[1px] rounded-xl">
          <div className="bg-gray-800 text-white px-6 py-3 rounded-lg shadow-2xl font-bold flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            Báo giá đã được xuất thành Sales Order. Không thể chỉnh sửa.
          </div>
        </div>
      )}

      {/* KHU VỰC CẤU HÌNH SẢN PHẨM & GIÁ (BÊN TRÁI) */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Bảng cấu hình sản phẩm */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider">Line Items Configuration</h2>
            <button type="button" onClick={addItem} disabled={isLocked} className="text-xs bg-japan-indigo text-white px-3 py-1.5 rounded font-bold hover:bg-opacity-90 transition disabled:bg-gray-400">+ Add Product</button>
          </div>

          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="p-4 bg-gray-50 border rounded-lg grid grid-cols-1 md:grid-cols-12 gap-3 relative pt-8 md:pt-4">
                <button type="button" onClick={() => removeItem(idx)} disabled={isLocked} className="absolute top-2 right-2 text-red-500 hover:text-red-700 md:hidden disabled:opacity-50">✕</button>
                
                <div className="md:col-span-4">
                  <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">Select Product</label>
                  <select value={item.product_id} disabled={isLocked} onChange={(e) => updateItem(idx, 'product_id', e.target.value)} className="w-full text-xs p-2 bg-white border rounded outline-none disabled:bg-gray-100">
                    <option value="">-- Choose --</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} (Cost: {p.base_cost} {p.currency})</option>)}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">Tier Mode</label>
                  <select value={item.tier_type} disabled={isLocked} onChange={(e) => updateItem(idx, 'tier_type', e.target.value)} className="w-full text-xs p-2 bg-white border rounded outline-none font-bold disabled:bg-gray-100">
                    <option value="sample">Sample</option>
                    <option value="retail">Retail</option>
                    <option value="wholesale">Wholesale</option>
                  </select>
                </div>

                <div className="md:col-span-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">Qty</label>
                  <input type="number" min="1" disabled={isLocked} value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} className="w-full text-xs p-2 bg-white border rounded outline-none font-mono text-center disabled:bg-gray-100" />
                </div>

                <div className="md:col-span-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">Margin%</label>
                  <input type="number" disabled={isLocked} value={item.margin} onChange={(e) => updateItem(idx, 'margin', e.target.value)} className="w-full text-xs p-2 bg-white border rounded outline-none font-mono text-center text-japan-crimson font-bold disabled:bg-gray-100" />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">Final Unit Px</label>
                  <div className="w-full text-xs p-2 bg-gray-100 border rounded font-mono font-bold text-right text-gray-700">${item.unit_price}</div>
                </div>

                <div className="md:col-span-2 flex items-center justify-between gap-2">
                  <div className="w-full">
                    <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">Subtotal</label>
                    <div className="w-full text-xs p-2 bg-gray-200 border rounded font-mono font-black text-right text-japan-indigo">${item.line_total?.toLocaleString()}</div>
                  </div>
                  <button type="button" onClick={() => removeItem(idx)} disabled={isLocked} className="hidden md:block text-gray-400 hover:text-red-500 mt-4 disabled:opacity-50">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Khối quản lý phụ phí phân bổ */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider">Logistics & Adjustments</h2>
            <button type="button" onClick={addAdjustment} disabled={isLocked} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded font-bold transition disabled:opacity-50">+ Add Adjustment</button>
          </div>
          <div className="space-y-3">
            {adjustments.map((adj, idx) => (
              <div key={idx} className="flex gap-4 items-center bg-gray-50 p-3 rounded-lg border">
                <input type="text" disabled={isLocked} placeholder="e.g. Freight / Discount" value={adj.name} onChange={(e) => updateAdjustment(idx, 'name', e.target.value)} className="flex-1 text-xs p-2 border rounded outline-none bg-white disabled:bg-gray-100" required />
                <select value={adj.type} disabled={isLocked} onChange={(e) => updateAdjustment(idx, 'type', e.target.value)} className="text-xs p-2 border rounded outline-none bg-white font-bold disabled:bg-gray-100">
                  <option value="fee">(+) Extra Charge</option>
                  <option value="discount">(-) Discount</option>
                </select>
                <input type="number" disabled={isLocked} placeholder="Amount ($)" value={adj.amount} onChange={(e) => updateAdjustment(idx, 'amount', e.target.value)} className="w-32 text-xs p-2 border rounded outline-none bg-white font-mono text-right font-bold disabled:bg-gray-100" required />
                <button type="button" onClick={() => setAdjustments(adjustments.filter((_, i) => i !== idx))} disabled={isLocked} className="text-gray-400 hover:text-red-500 disabled:opacity-50">✕</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CỘT PHẢI (DEAL INFO & TOTAL) */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Deal Information</h2>
          
          {/* ✅ HIỂN THỊ CẬP NHẬT STATUS & NÚT POST SO NẾU LÀ CHẾ ĐỘ EDIT */}
          {quoteId && (
            <div className="p-3 bg-gray-50 border rounded-lg mb-4">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Quote Status</label>
              <div className="flex gap-2">
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)} 
                  disabled={isLocked}
                  className="flex-1 text-sm p-2 bg-white border rounded font-bold text-japan-indigo outline-none focus:border-japan-indigo disabled:bg-gray-100"
                >
                  <option value="draft">Draft (Bản nháp)</option>
                  <option value="sent">Sent (Đã gửi khách)</option>
                  <option value="accepted">Accepted (Khách chốt Deal)</option>
                  <option value="rejected">Rejected (Bị từ chối)</option>
                  <option value="expired">Expired (Quá hạn)</option>
                  {isLocked && <option value="posted">Posted (Đã thành SO)</option>}
                </select>
                
                {/* Nút Post to SO chỉ hiện khi đang ở trạng thái Accepted */}
                {status === 'accepted' && !isLocked && (
                  <PostToSOButton quoteId={quoteId} />
                )}
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-japan-indigo uppercase tracking-wider block mb-1">Issuing Entity (Seller) *</label>
            <select value={selectedSellerId} onChange={(e) => setSelectedSellerId(e.target.value)} disabled={isLocked} className="w-full text-sm p-2.5 bg-blue-50 border border-blue-200 rounded-lg font-bold text-japan-indigo outline-none disabled:bg-gray-100 disabled:text-gray-500">
              {sellerEntities.map(seller => <option key={seller.id} value={seller.id}>{seller.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1 mt-2">Target Account (Buyer) *</label>
            <select value={selectedBuyerId} onChange={(e) => setSelectedBuyerId(e.target.value)} disabled={isLocked} className="w-full text-sm p-2.5 bg-white border rounded-lg font-bold text-gray-800 outline-none focus:border-japan-indigo disabled:bg-gray-100">
              <option value="">-- Select Buyer Company --</option>
              {buyers.map(b => <option key={b.id} value={b.id}>{b.company_name} ({b.country})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Validity Expiry</label>
              <input type="date" value={validUntil} disabled={isLocked} onChange={(e) => setValidUntil(e.target.value)} className="w-full text-sm p-2.5 bg-white border rounded-lg outline-none focus:border-japan-indigo font-mono disabled:bg-gray-100" />
            </div>
            
            <div>
              <label className="text-[10px] font-bold text-japan-crimson uppercase tracking-wider block mb-1">Sales Comm. (%)</label>
              <input type="number" min="0" step="0.1" disabled={isLocked} placeholder="e.g. 2.5" value={commissionRate} onChange={(e) => setCommissionRate(Number(e.target.value))} className="w-full text-sm p-2.5 bg-red-50 border border-red-200 rounded-lg outline-none focus:border-japan-crimson font-mono font-bold text-japan-crimson disabled:bg-gray-100 disabled:text-gray-500" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Terms / Cover Note</label>
            <textarea rows={3} value={notes} disabled={isLocked} onChange={(e) => setNotes(e.target.value)} placeholder="Incoterms rules, payment terms or shipping schedule details..." className="w-full text-sm p-2.5 bg-white border rounded-lg outline-none focus:border-japan-indigo disabled:bg-gray-100" />
          </div>
        </div>

        {/* KHỐI CHỐT TIỀN XUẤT ĐƠN */}
        <div className="bg-japan-indigo text-white p-6 rounded-xl shadow-md space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-white/70 border-b border-white/10 pb-2">Financial Breakdown</h2>
          <div className="space-y-2 text-xs font-medium">
            <div className="flex justify-between"><span>Items Subtotal:</span><span className="font-mono">${itemsSubtotal.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Adjustments:</span><span className="font-mono">{adjustmentsTotal >= 0 ? `+$${adjustmentsTotal.toLocaleString()}` : `-$${Math.abs(adjustmentsTotal).toLocaleString()}`}</span></div>
            <div className="flex justify-between text-base font-black border-t border-white/10 pt-3"><span>Grand Total:</span><span className="font-mono text-japan-gold text-xl">${finalTotal.toLocaleString()} USD</span></div>
            
            {commissionRate > 0 && (
              <div className="flex justify-between text-japan-gold mt-2 pt-2 border-t border-dashed border-white/20">
                <span>Est. Commission ({commissionRate}%):</span>
                <span className="font-mono">${((finalTotal * commissionRate) / 100).toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Nút bấm thay đổi text tùy theo trạng thái Tạo mới hay Cập nhật */}
          <button 
            type="button" 
            onClick={handleSave} 
            disabled={loading || isLocked} 
            className={`w-full font-black text-xs uppercase tracking-widest py-3 rounded-lg shadow transition flex justify-center items-center gap-2 ${isLocked ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : 'bg-japan-crimson hover:bg-opacity-95 text-white'}`}
          >
            {loading ? 'Processing...' : quoteId ? '✓ Update Quote Details' : '✓ Lock & Create Quote'}
          </button>
        </div>
      </div>

    </div>
  );
}