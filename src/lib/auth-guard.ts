// src/lib/auth-guard.ts
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function requireAuth(routePath: string, routeName?: string) {
  // =========================================================
  // GIÁP CHỐNG ĐẠN (BULLETPROOF): Ép kiểu dữ liệu an toàn
  // Nếu truyền nhầm object/array/undefined, nó sẽ tự biến thành chuỗi
  // =========================================================
  const safePath = typeof routePath === 'string' ? routePath : String(routePath || '');

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  // Nếu chưa đăng nhập, đá về Trạm trung chuyển /portal thay vì /login của Buyer
  if (!user) redirect('/portal');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  const userRole = profile?.role?.toLowerCase()?.trim() || 'buyer';

  // =========================================================
  // LỚP 1: CHỐNG ĐI LẠC (DÙNG safePath THAY VÌ routePath)
  // Chặn ngay lập tức nếu đi sai "cổng" của mình
  // =========================================================

  // 1. Nhà cung cấp (Supplier) không được lang thang ra ngoài
  if (userRole === 'supplier' && !safePath.startsWith('/supplier-desk')) {
    redirect('/supplier-desk');
  }

  // 2. Khách hàng (Buyer) không được vào cổng Nội bộ hoặc cổng Supplier
  if (userRole === 'buyer' && (safePath.startsWith('/sales-desk') || safePath.startsWith('/settings') || safePath.startsWith('/supplier-desk'))) {
    redirect('/dashboard');
  }

  // 3. Nhân viên nội bộ (Staff) không được vào cổng của Supplier
  if ((userRole === 'admin' || userRole === 'manager' || userRole === 'sales') && safePath.startsWith('/supplier-desk')) {
    redirect('/sales-desk');
  }

  // =========================================================
  // LỚP 2: KIỂM TRA MA TRẬN QUYỀN (PERMISSION MATRIX)
  // Quản lý các trang con nằm bên trong Cổng
  // =========================================================

  let { data: permission } = await supabase.from('route_permissions').select('allowed_roles').eq('route_path', safePath).single();

  // Tự động khai báo trang mới nếu admin đi vào trang chưa có trong database
  if (!permission) {
    if (userRole === 'admin') {
      const { data: newPerm } = await supabase.from('route_permissions').insert([{ 
        route_path: safePath, route_name: routeName || safePath, allowed_roles: ['admin'] 
      }]).select('allowed_roles').single();
      permission = newPerm;
    } else {
      permission = { allowed_roles: ['admin'] }; 
    }
  }

  const allowedRoles = permission?.allowed_roles || ['admin'];

  // Xử lý khi người dùng KHÔNG CÓ QUYỀN vào trang hiện tại
  if (!allowedRoles.includes(userRole)) {
    
    // Đá về "nhà" mặc định để tránh vòng lặp vô tận (Infinite Redirect Loop)
    if (userRole === 'supplier' && safePath !== '/supplier-desk') {
      redirect('/supplier-desk');
    }
    
    if (userRole === 'buyer' && !safePath.startsWith('/dashboard') && !safePath.startsWith('/products') && !safePath.startsWith('/rfq') && !safePath.startsWith('/profile') && !safePath.startsWith('/verification')) {
       redirect('/dashboard');
    }
    
    if ((userRole === 'admin' || userRole === 'manager' || userRole === 'sales') && safePath !== '/sales-desk') {
       redirect('/sales-desk');
    }
    
    // Nếu kẹt ở chính nhà mình (vd: Buyer kẹt ở Dashboard, Admin kẹt ở Sales Desk) 
    // -> Trả về cờ lỗi để giao diện UI tự xử lý hiển thị màn hình "Access Denied"
    return { user, profile, role: userRole, hasError: true };
  }

  return { user, profile, role: userRole, hasError: false };
}