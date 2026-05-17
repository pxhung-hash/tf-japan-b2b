'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ============================================================================
// XÓA SALES ORDER
// ============================================================================
export async function deleteSalesOrder(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get('id') as string;

  if (!id) return;

  const { error } = await supabase.from('sales_orders').delete().eq('id', id);
  if (error) {
    console.error("LỖI XÓA SALES ORDER:", error.message);
    throw new Error(error.message);
  }

  revalidatePath('/sales-orders');
}

// ============================================================================
// TẠO SALES ORDER THỦ CÔNG (MANUAL ENTRY)
// ============================================================================
export async function createManualSalesOrder(soData: any, items: any[]) {
  const supabase = await createClient();

  try {
    const soNumber = `ZNX-SO-${Date.now().toString().slice(-6)}`; 
    
    // 1. Tạo Header Đơn hàng
    const { data: newSO, error: soErr } = await supabase
      .from('sales_orders')
      .insert([{
        so_number: soNumber,
        buyer_id: soData.buyer_id,
        seller_id: soData.seller_id,
        status: 'confirmed', // Đơn thủ công thường là đã chốt (Confirmed)
        currency: 'USD',
        total_amount: soData.total_amount,
        notes: soData.notes
      }])
      .select('id')
      .single();

    if (soErr) throw new Error("Lỗi tạo SO: " + soErr.message);

    // 2. Lưu Chi tiết Đơn hàng
    if (items && items.length > 0) {
      const soItemsToInsert = items.map(item => ({
        so_id: newSO.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.line_total,
        remarks: item.remarks
      }));

      const { error: itemsErr } = await supabase.from('sales_order_items').insert(soItemsToInsert);
      if (itemsErr) throw new Error("Lỗi lưu chi tiết đơn: " + itemsErr.message);
    }

    revalidatePath('/sales-orders');
    return { success: true, soId: newSO.id };

  } catch (error: any) {
    console.error("LỖI MANUAL SO:", error.message);
    return { error: error.message };
  }
}

// ============================================================================
// CẬP NHẬT ĐƠN HÀNG (EDIT SALES ORDER)
// ============================================================================
export async function updateSalesOrder(soId: string, soData: any, items: any[]) {
  const supabase = await createClient();
  try {
    // 1. Cập nhật Header
    const { error: soErr } = await supabase.from('sales_orders').update({
      buyer_id: soData.buyer_id,
      seller_id: soData.seller_id,
      status: soData.status,
      notes: soData.notes,
      total_amount: soData.total_amount
    }).eq('id', soId);
    if (soErr) throw new Error("Lỗi cập nhật SO: " + soErr.message);

    // 2. Xóa Items cũ & Thêm Items mới
    await supabase.from('sales_order_items').delete().eq('so_id', soId);
    if (items?.length) {
      const itemsToInsert = items.map(i => ({ ...i, so_id: soId }));
      await supabase.from('sales_order_items').insert(itemsToInsert);
    }

    revalidatePath('/sales-orders');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}