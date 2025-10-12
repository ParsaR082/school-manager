// Client-side authentication utilities
'use client';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  full_name: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: AuthUser;
  session?: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}

export interface VerifyResponse {
  authenticated: boolean;
  user?: AuthUser | null;
  error?: string;
  session?: {
    expires_at: number;
  };
}

// Login function
export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include', // Include cookies
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'خطا در برقراری ارتباط با سرور',
    };
  }
}

// Logout function
export async function logoutUser(): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include', // Include cookies
    });

    const data = await response.json();
    
    // Clear any client-side storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      sessionStorage.clear();
    }
    
    return data;
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: 'خطا در برقراری ارتباط با سرور',
    };
  }
}

// Verify authentication status
export async function verifyAuth(): Promise<VerifyResponse> {
  try {
    const response = await fetch('/api/auth/verify', {
      method: 'GET',
      credentials: 'include', // Include cookies
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Auth verification error:', error);
    return {
      authenticated: false,
      error: 'خطا در برقراری ارتباط با سرور',
    };
  }
}

// Get user info from cookie (client-side)
export function getUserFromCookie(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cookies = document.cookie.split(';');
    const userInfoCookie = cookies.find(cookie => 
      cookie.trim().startsWith('user-info=')
    );
    
    if (!userInfoCookie) return null;
    
    const userInfoValue = userInfoCookie.split('=')[1];
    const decodedValue = decodeURIComponent(userInfoValue);
    return JSON.parse(decodedValue);
  } catch (error) {
    console.error('Error parsing user cookie:', error);
    return null;
  }
}

// Check if user is authenticated (client-side check)
export function isAuthenticated(): boolean {
  return getUserFromCookie() !== null;
}

// Check if user is admin (client-side check)
export function isAdmin(): boolean {
  const user = getUserFromCookie();
  return user?.role === 'admin';
}

// Redirect to login page
export function redirectToLogin(): void {
  if (typeof window !== 'undefined') {
    window.location.href = '/admin/login';
  }
}

// Redirect to admin dashboard
export function redirectToAdmin(): void {
  if (typeof window !== 'undefined') {
    window.location.href = '/admin';
  }
}