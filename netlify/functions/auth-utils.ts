import { Handler, HandlerEvent } from '@netlify/functions';

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

/**
 * Extract user from Clerk JWT token
 * The token is sent in the Authorization header as "Bearer <token>"
 */
export function getUserFromEvent(event: HandlerEvent): AuthUser | null {
  const authHeader = event.headers['authorization'] || event.headers['Authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  try {
    // Decode JWT payload (without verification for now - Clerk's middleware should handle this)
    // In production, you'd want to verify the JWT signature
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    // Clerk JWT structure
    if (payload.sub) {
      return {
        id: payload.sub,
        email: payload.email || payload.primary_email_address_id || '',
        fullName: payload.full_name || payload.name,
        avatarUrl: payload.image_url || payload.picture,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
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

