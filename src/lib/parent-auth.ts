import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// JWT secret key - in production, this should be a strong secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface ParentSessionData {
  parent_id: string;
  parent_name: string;
  parent_phone: string;
  student_id: string;
  student_name: string;
  student_national_id: string;
  class_id: string;
  login_time: string;
}

export interface ParentAuthResult {
  authenticated: boolean;
  session?: ParentSessionData;
  error?: string;
}

/**
 * ایجاد JWT token برای والد
 */
export function createParentToken(sessionData: ParentSessionData): string {
  return jwt.sign(sessionData, JWT_SECRET, { 
    expiresIn: '24h' // توکن برای ۲۴ ساعت معتبر است
  });
}

/**
 * تأیید اعتبار JWT token والد
 */
export function verifyParentToken(token: string): ParentSessionData | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as ParentSessionData;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * تنظیم کوکی نشست والد
 */
export async function setParentSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('parent_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // ۲۴ ساعت
    path: '/',
  });
}

/**
 * دریافت نشست والد از کوکی
 */
export async function getParentSession(): Promise<ParentAuthResult> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('parent_session');

    if (!sessionCookie?.value) {
      return {
        authenticated: false,
        error: 'نشست یافت نشد'
      };
    }

    const sessionData = verifyParentToken(sessionCookie.value);

    if (!sessionData) {
      return {
        authenticated: false,
        error: 'نشست نامعتبر است'
      };
    }

    return {
      authenticated: true,
      session: sessionData
    };
  } catch (error) {
    console.error('Session verification error:', error);
    return {
      authenticated: false,
      error: 'خطا در بررسی نشست'
    };
  }
}

/**
 * حذف نشست والد
 */
export async function clearParentSession(response: unknown) {
  const cookieStore = await cookies();
  cookieStore.delete('parent_session');
}

/**
 * بررسی اینکه آیا والد وارد شده است یا نه
 */
export async function isParentAuthenticated(): Promise<boolean> {
  const result = await getParentSession();
  return result.authenticated;
}

/**
 * دریافت اطلاعات والد از نشست
 */
export async function getParentInfo(): Promise<ParentSessionData | null> {
  const result = await getParentSession();
  return result.authenticated ? result.session! : null;
}