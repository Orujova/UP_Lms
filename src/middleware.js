import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('jwtToken');
  const { pathname } = request.nextUrl; // Extract URL info

  // Redirect the root URL (/) to /admin/login
  if (pathname === '/') {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/admin/login';
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to login page if the token is missing and trying to access restricted admin routes
  if (
    !token &&
    pathname.startsWith('/admin') &&
    pathname !== '/admin/login' &&
    pathname !== '/admin/otp'
  ) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/admin/login';
    return NextResponse.redirect(loginUrl);
  }

  // Allow access if token exists or the path is permitted
  return NextResponse.next();
}

// Apply middleware to both the root URL and admin routes
export const config = {
  matcher: ['/', '/admin/:path*'],
};
