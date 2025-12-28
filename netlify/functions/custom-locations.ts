import { Handler } from '@netlify/functions';
import { storage } from "../../server/storage.js";
import { insertCustomLocationSchema } from "../../shared/schema.js";
import { fromError } from "zod-validation-error";
import { handleOptions, parseBody, errorResponse, successResponse } from './_shared.js';

export const handler: Handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  const path = event.path.replace('/.netlify/functions/custom-locations', '');
  const method = event.httpMethod;

  try {
    // GET /api/custom-locations - Get all custom locations
    if (method === 'GET' && path === '') {
      const locations = await storage.getAllCustomLocations();
      return successResponse(locations);
    }

    // POST /api/custom-locations - Create a new custom location
    if (method === 'POST' && path === '') {
      const body = parseBody(event);
      const result = insertCustomLocationSchema.safeParse(body);
      if (!result.success) {
        const validationError = fromError(result.error);
        return errorResponse(400, validationError.message);
      }
      const location = await storage.createCustomLocation(result.data);
      return successResponse(location, 201);
    }

    // DELETE /api/custom-locations/:id - Delete a custom location
    if (method === 'DELETE' && path.startsWith('/')) {
      const id = path.substring(1);
      const deleted = await storage.deleteCustomLocation(id);
      if (!deleted) {
        return errorResponse(404, "Custom location not found");
      }
      return {
        statusCode: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        },
        body: '',
      };
    }

    // Method not allowed
    return errorResponse(405, "Method not allowed");

  } catch (error) {
    console.error("Error in custom-locations function:", error);
    return errorResponse(500, "Internal server error");
  }
};
