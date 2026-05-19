import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // ✅ ĐÃ SỬA: Xóa bỏ chữ 'options' ở dòng request này
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          
          // Dòng response giữ nguyên 3 tham số
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Kiểm tra trạng thái đăng nhập (Có thẻ vào cổng không?)
  const { data: { user } } = await supabase.auth.getUser()

  // Lấy đường dẫn mà người dùng đang truy cập
  const url = new URL(request.url)
  const path = url.pathname

  // ĐỊNH NGHĨA CÁC KHU VỰC CẦN BẢO VỆ
  const isBuyerRoute = path.startsWith('/rfq') || path.startsWith('/dashboard') || path.startsWith('/profile') || path.startsWith('/verification')
  const isInternalRoute = path.startsWith('/master-data') || path.startsWith('/sales-desk') || path.startsWith('/approvals') || path.startsWith('/suppliers')

  // 1. Chặn vòng ngoài: Nếu vào khu vực kín mà chưa đăng nhập -> Đuổi ra Login
  if ((isBuyerRoute || isInternalRoute) && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Chống đi lùi: Nếu đã login rồi mà cố tình vào lại trang /login thì đá về trang chủ (hoặc dashboard)
  if (path === '/login' && user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}