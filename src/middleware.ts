import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Kiểm tra nếu là trang auth
    if (request.nextUrl.pathname.startsWith('/auth')) {
        // Kiểm tra query parameter đặc biệt cho admin
        const adminToken = request.nextUrl.searchParams.get('admin_token')
        const validAdminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN

        // Cho phép truy cập nếu có admin token hợp lệ
        if (adminToken === validAdminToken) {
            return NextResponse.next()
        }

        // Chuyển hướng về trang chủ nếu không phải admin
        return NextResponse.redirect(new URL('/', request.url))
    }
    
    return NextResponse.next()
}

// Config chỉ định những route nào sẽ kích hoạt middleware
export const config = {
    matcher: ['/auth/:path*', '/dashboard/:path*']
}