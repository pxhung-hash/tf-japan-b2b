'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// ✅ ĐÃ CẬP NHẬT: Import thêm hàm updateSalesOrder
import { createManualSalesOrder, updateSalesOrder } from '@/app/(internal)/sales-orders/actions';

// ✅ ĐÃ CẬP NHẬT: Khai báo thêm initialData và soId vào props
export default function SOBuilderForm({ 
  buyers, products, sellerEntities, initialData, soId 
}: { 
  buyers: any[], products: any[], sellerEntities: any[], initialData?: any, soId?: string 
}) {
  const router = useRouter();
  
  // Khởi tạo state từ dữ liệu cũ (nếu có) hoặc mặc định
  const defaultSellerId = sellerEntities.find(s => s.is_default)?.id || (sellerEntities[0]?.id || '');
  const [selectedSellerId, setSelectedSellerId] = useState(initialData?.seller_id || defaultSellerId);
  const [selectedBuyerId, setSelectedBuyerId] = useState(initialData?.buyer_id || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [status, setStatus] = useState(initialData?.status || 'confirmed');
  
  // Ánh xạ danh sách sản phẩm của Đơn hàng cũ (nếu đang Edit)
  const initialItems = initialData?.sales_order_items?.map((item: any) => ({
    product_id: item.product_id, 
    quantity: item.quantity, 
    unit_price: item.unit_price, 
    line_total: item.line_total, 
    remarks: item.remarks || ''
  })) || [];

  const [items, setItems] = useState<any[]>(initialItems);
  const [loading, setLoading] = useState(false);

  const addItem = () => setItems([...items, { product_id: '', quantity: 1, unit_price: 0, line_total: 0, remarks: '' }]);

  const updateItem = (index: number, key: string, value: any) => {
    const updated = [...items];
    const item = updated[index];

    if (key === 'product_id') {
      const prod = products.find(p => p.id === value);
      item.product_id = value;
      // Gợi ý giá gốc để Sale tự sửa thành giá bán
      item.unit_price = prod ? Number(prod.base_cost) : 0; 
    } else {
      item[key] = value;
    }

    // Tự động tính Line Total
    item.line_total = Number(item.unit_price) * Number(item.quantity);
    setItems(updated);
  };

  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const finalTotal = items.reduce((sum, item) => sum + (item.line_total || 0), 0);

  const handleSave = async () => {
    if (!selectedSellerId) return alert('Vui lòng chọn Pháp nhân phát hành!');
    if (!selectedBuyerId) return alert('Vui lòng chọn Khách hàng!');
    if (items.length === 0) return alert('Vui lòng thêm ít nhất 1 mặt hàng!');

    setLoading(true);
    const soData = {
      buyer_id: selectedBuyerId,
      seller_id: selectedSellerId,
      status, // ✅ Kèm theo trạng thái để update
      notes,
      total_amount: finalTotal,
    };

    // ✅ QUYẾT ĐỊNH GỌI CREATE HAY UPDATE DỰA VÀO soId
    const res = soId 
      ? await updateSalesOrder(soId, soData, items)
      : await createManualSalesOrder(soData, items);

    if (res.success) {
      router.push('/sales-orders');
    } else {
      alert('Lỗi hệ thống: ' + res.error);
    }
    setLoading(false);
  };

  // ✅ BẢO MẬT: Khóa form nếu Đơn hàng đã xuất kho hoặc hoàn thành
  const isLocked = initialData?.status === 'shipped' || initialData?.status === 'completed';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative">
      
      {/* 🔒 LỚP PHỦ KHÓA MÀN HÌNH NẾU ĐƠN HÀNG ĐÃ ĐI */}
      {isLocked && (
        <div className="absolute inset-0 bg-white/40 z-10 flex justify-center items-start pt-20 backdrop-blur-[1px] rounded-xl">
          <div className="bg-gray-800 text-white px-6 py-3 rounded-lg shadow-2xl font-bold flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            Đơn hàng đã được Giao hoặc Hoàn thành. Không thể chỉnh sửa dữ liệu.
          </div>
        </div>
      )}

      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider">Order Line Items</h2>
            <button type="button" onClick={addItem} disabled={isLocked} className="text-xs bg-japan-indigo text-white px-3 py-1.5 rounded font-bold hover:bg-opacity-90 transition disabled:bg-gray-400">+ Add Product</button>
          </div>

          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="p-4 bg-gray-50 border rounded-lg flex gap-3 items-center relative">
                <div className="flex-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">Product</label>
                  <select value={item.product_id} disabled={isLocked} onChange={(e) => updateItem(idx, 'product_id', e.target.value)} className="w-full text-xs p-2 bg-white border rounded outline-none font-bold disabled:bg-gray-100">
                    <option value="">-- Choose --</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="w-20">
                  <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">Qty</label>
                  <input type="number" min="1" disabled={isLocked} value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} className="w-full text-xs p-2 bg-white border rounded outline-none font-mono text-center disabled:bg-gray-100" />
                </div>
                <div className="w-32">
                  <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">Final Unit Px ($)</label>
                  <input type="number" disabled={isLocked} value={item.unit_price} onChange={(e) => updateItem(idx, 'unit_price', e.target.value)} className="w-full text-xs p-2 bg-white border rounded outline-none font-mono text-right text-japan-crimson font-bold disabled:bg-gray-100" />
                </div>
                <div className="w-32">
                  <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">Subtotal</label>
                  <div className="w-full text-xs p-2 bg-gray-200 border rounded font-mono font-black text-right text-japan-indigo">${item.line_total?.toLocaleString()}</div>
                </div>
                <button type="button" disabled={isLocked} onClick={() => removeItem(idx)} className="text-gray-400 hover:text-red-500 mt-4 disabled:opacity-50">✕</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Order Setup</h2>
          
          {/* ✅ HIỂN THỊ CẬP NHẬT STATUS NẾU LÀ CHẾ ĐỘ EDIT */}
          {soId && (
            <div className="p-3 bg-gray-50 border rounded-lg mb-4">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Fulfillment Status</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)} 
                disabled={isLocked}
                className="w-full text-sm p-2 bg-white border rounded font-bold text-blue-600 outline-none focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="draft">Draft (Bản nháp)</option>
                <option value="confirmed">Confirmed (Đã xác nhận Order)</option>
                <option value="processing">Processing (Đang chuẩn bị hàng)</option>
                <option value="shipped">Shipped (Đã giao lên tàu/xe)</option>
                <option value="completed">Completed (Hoàn tất)</option>
                <option value="cancelled">Cancelled (Hủy đơn)</option>
              </select>
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-japan-indigo uppercase tracking-wider block mb-1">Issuing Entity (Seller) *</label>
            <select value={selectedSellerId} disabled={isLocked} onChange={(e) => setSelectedSellerId(e.target.value)} className="w-full text-sm p-2.5 bg-blue-50 border border-blue-200 rounded-lg font-bold text-japan-indigo outline-none disabled:bg-gray-100 disabled:text-gray-500">
              {sellerEntities.map(seller => <option key={seller.id} value={seller.id}>{seller.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Target Account (Buyer) *</label>
            <select value={selectedBuyerId} disabled={isLocked} onChange={(e) => setSelectedBuyerId(e.target.value)} className="w-full text-sm p-2.5 bg-white border rounded-lg font-bold text-gray-800 outline-none disabled:bg-gray-100">
              <option value="">-- Select Buyer Company --</option>
              {buyers.map(b => <option key={b.id} value={b.id}>{b.company_name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Shipping / Order Notes</label>
            <textarea rows={3} value={notes} disabled={isLocked} onChange={(e) => setNotes(e.target.value)} placeholder="Mã vận đơn, hướng dẫn giao hàng..." className="w-full text-sm p-2.5 bg-white border rounded-lg outline-none disabled:bg-gray-100" />
          </div>
        </div>

        <div className="bg-japan-indigo text-white p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <span className="font-black uppercase tracking-widest text-sm">Grand Total:</span>
            <span className="font-mono text-japan-gold text-2xl">${finalTotal.toLocaleString()}</span>
          </div>
          <button 
            type="button" 
            onClick={handleSave} 
            disabled={loading || isLocked} 
            className={`w-full font-black text-xs uppercase tracking-widest py-3 rounded-lg shadow transition flex justify-center items-center gap-2 ${isLocked ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : 'bg-japan-crimson hover:bg-opacity-95 text-white'}`}
          >
            {loading ? 'Processing...' : soId ? '✓ Update Order Details' : '✓ Confirm & Create Order'}
          </button>
        </div>
      </div>
    </div>
  );
}