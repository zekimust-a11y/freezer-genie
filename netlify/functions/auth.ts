import { Handler } from '@netlify/functions';
import { handleOptions, successResponse } from './_shared.js';

export const handler: Handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  const path = event.path.replace('/.netlify/functions/auth', '');
  const method = event.httpMethod;

  try {
    // GET /api/auth/user - Auth route - returns null when auth is disabled
    if (method === 'GET' && path === '/user') {
      return successResponse(null);
    }

    // Method not allowed
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
      body: JSON.stringify({ error: "Method not allowed" }),
    };

  } catch (error) {
    console.error("Error in auth function:", error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
