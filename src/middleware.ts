import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Không sử dụng middleware để redirect
    return NextResponse.next()
}

// Config chỉ định những route nào sẽ kích hoạt middleware
export const config = {
    matcher: ['/dashboard/:path*']
}