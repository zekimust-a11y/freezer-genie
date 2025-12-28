import { Handler, HandlerEvent } from '@netlify/functions';
import { verifyToken } from '@clerk/backend';

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

/**
 * Extract and verify user from Clerk JWT token
 * The token is sent in the Authorization header as "Bearer <token>"
 * This properly verifies the cryptographic signature using Clerk's backend SDK
 */
export async function getUserFromEvent(event: HandlerEvent): Promise<AuthUser | null> {
  const authHeader = event.headers['authorization'] || event.headers['Authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  try {
    // Verify JWT signature using Clerk's backend SDK
    // This validates the token hasn't been tampered with
    const secretKey = process.env.CLERK_SECRET_KEY;
    
    if (!secretKey) {
      console.error('CLERK_SECRET_KEY is not set');
      return null;
    }

    const payload = await verifyToken(token, {
      secretKey,
    });
    
    // Clerk JWT structure - payload is now cryptographically verified
    if (payload.sub) {
      // Get the actual email from the payload
      // Clerk tokens include email_addresses array with the primary email
      let email = '';
      
      if (payload.email) {
        email = payload.email as string;
      } else if (payload.email_addresses && Array.isArray(payload.email_addresses)) {
        // Find the primary email from the email_addresses array
        const emailAddresses = payload.email_addresses as any[];
        const primaryEmail = emailAddresses.find((e: any) => e.id === payload.primary_email_address_id);
        if (primaryEmail && primaryEmail.email_address) {
          email = primaryEmail.email_address;
        }
      }
      
      return {
        id: payload.sub,
        email: email || '', // Now correctly using actual email, not ID
        fullName: (payload.full_name || payload.name) as string | undefined,
        avatarUrl: (payload.image_url || payload.picture) as string | undefined,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

/**
 * Require authentication - returns 401 if not authenticated
 * Now properly async to support JWT verification
 */
export async function requireAuth(event: HandlerEvent): Promise<{ user: AuthUser } | { statusCode: 401; body: string; headers: Record<string, string> }> {
  const user = await getUserFromEvent(event);
  
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
 * Now properly async to support JWT verification
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

    const authResult = await requireAuth(event); // Now awaits the async verification
    
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

