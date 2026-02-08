import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Check if the current path matches any of our protected routes
    const isAdminRoute =
        request.nextUrl.pathname.startsWith('/create') ||
        request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/admin');

    if (isAdminRoute) {
        const adminSession = request.cookies.get('admin_session');

        // Redirect to login if no session cookie
        if (!adminSession?.value) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Check if user is already logged in (visiting /login with valid session)
    if (request.nextUrl.pathname.startsWith('/login')) {
        const adminSession = request.cookies.get('admin_session');
        if (adminSession?.value) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    // Allow request to proceed
    const response = NextResponse.next();

    // Prevent caching of protected pages to fix "Back button" issues
    if (isAdminRoute || request.nextUrl.pathname.startsWith('/login')) {
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
    }

    return response;
}

export const config = {
    matcher: ['/create/:path*', '/dashboard/:path*', '/admin/:path*', '/login'],
};
