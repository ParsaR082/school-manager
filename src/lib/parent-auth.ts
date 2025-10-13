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

export interface ParentAuthResult extends ParentSessionData {
  access_token: string;
}

/**
 * Get parent session from localStorage (client-side)
 */
export async function getParentSession(): Promise<ParentAuthResult | null> {
  try {
    if (typeof window === 'undefined') {
      return null; // Server-side, return null
    }
    
    const sessionData = localStorage.getItem('parent-session');
    if (!sessionData) {
      return null;
    }

    const session = JSON.parse(sessionData) as ParentAuthResult;
    
    // Check if session is expired (24 hours)
    const loginTime = new Date(session.login_time);
    const now = new Date();
    const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      localStorage.removeItem('parent-session');
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error getting parent session:', error);
    return null;
  }
}

/**
 * Set parent session in localStorage (client-side)
 */
export function setParentSession(sessionData: ParentAuthResult): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('parent-session', JSON.stringify(sessionData));
  }
}

/**
 * Clear parent session from localStorage (client-side)
 */
export function clearParentSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('parent-session');
  }
}

/**
 * Check if parent is authenticated (client-side)
 */
export async function isParentAuthenticated(): Promise<boolean> {
  const session = await getParentSession();
  return session !== null;
}

/**
 * Get parent info (client-side)
 */
export async function getParentInfo(): Promise<ParentSessionData | null> {
  const session = await getParentSession();
  if (!session) return null;
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { access_token, ...parentInfo } = session;
  return parentInfo;
}