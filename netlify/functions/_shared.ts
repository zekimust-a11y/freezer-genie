import { storage } from "../../server/storage.js";
import { insertFreezerItemSchema, insertFreezerSchema, insertCustomLocationSchema } from "../../shared/schema.js";
import { fromError } from "zod-validation-error";

// Common response headers for CORS
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Handle CORS preflight requests
export function handleOptions() {
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: '',
  };
}

// Parse request body
export function parseBody(event: any) {
  try {
    return event.body ? JSON.parse(event.body) : {};
  } catch (error) {
    throw new Error('Invalid JSON body');
  }
}

// Common error response
export function errorResponse(statusCode: number, message: string) {
  return {
    statusCode,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ error: message }),
  };
}

// Success response
export function successResponse(data: any, statusCode = 200) {
  return {
    statusCode,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };
}
