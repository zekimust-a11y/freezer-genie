import { Handler, HandlerEvent } from '@netlify/functions';

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

/**
 * Extract user from Netlify Identity JWT token
 * Netlify automatically validates the JWT and adds user info to context
 */
export function getUserFromEvent(event: HandlerEvent): AuthUser | null {
  // Check for user in context (Netlify Identity adds this)
  const contextUser = (event as any).context?.clientContext?.user;
  
  if (contextUser) {
    return {
      id: contextUser.sub, // Subject is the user ID
      email: contextUser.email,
      fullName: contextUser.user_metadata?.full_name,
      avatarUrl: contextUser.user_metadata?.avatar_url,
    };
  }

  return null;
}

/**
 * Require authentication - returns 401 if not authenticated
 */
export function requireAuth(event: HandlerEvent): { user: AuthUser } | { statusCode: 401; body: string; headers: Record<string, string> } {
  const user = getUserFromEvent(event);
  
  if (!user) {
    return {
      statusCode: 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Unauthorized - Please log in' }),
    };
  }
  
  return { user };
}

/**
 * Wrapper to create authenticated handlers
 */
export function withAuth(
  handler: (event: HandlerEvent, user: AuthUser) => Promise<any>
): Handler {
  return async (event, context) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        },
        body: '',
      };
    }

    const authResult = requireAuth(event);
    
    if ('statusCode' in authResult) {
      return authResult; // Return 401 error
    }
    
    try {
      return await handler(event, authResult.user);
    } catch (error) {
      console.error('Handler error:', error);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        }),
      };
    }
  };
}

// CORS headers helper
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

export const successResponse = (data: any, statusCode = 200) => ({
  statusCode,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

export const errorResponse = (statusCode: number, message: string) => ({
  statusCode,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  body: JSON.stringify({ error: message }),
});

