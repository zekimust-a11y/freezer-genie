import { Handler } from '@netlify/functions';
import { storage } from "./lib/storage";
import { insertFreezerSchema } from "../../shared/schema";
import { fromError } from "zod-validation-error";
import { handleOptions, parseBody, errorResponse, successResponse } from './_shared';

export const handler: Handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  const path = event.path.replace('/.netlify/functions/freezers', '');
  const method = event.httpMethod;

  try {
    // GET /api/freezers - Get all freezers
    if (method === 'GET' && path === '') {
      const freezers = await storage.getAllFreezers();
      return successResponse(freezers);
    }

    // POST /api/freezers - Create a new freezer
    if (method === 'POST' && path === '') {
      const body = parseBody(event);
      const result = insertFreezerSchema.safeParse(body);
      if (!result.success) {
        const validationError = fromError(result.error);
        return errorResponse(400, validationError.message);
      }
      const freezer = await storage.createFreezer(result.data);
      return successResponse(freezer, 201);
    }

    // PUT /api/freezers/:id - Update an existing freezer
    if (method === 'PUT' && path.startsWith('/')) {
      const id = path.substring(1);
      const body = parseBody(event);
      const result = insertFreezerSchema.safeParse(body);
      if (!result.success) {
        const validationError = fromError(result.error);
        return errorResponse(400, validationError.message);
      }
      const freezer = await storage.updateFreezer(id, result.data);
      if (!freezer) {
        return errorResponse(404, "Freezer not found");
      }
      return successResponse(freezer);
    }

    // DELETE /api/freezers/:id - Delete a freezer
    if (method === 'DELETE' && path.startsWith('/')) {
      const id = path.substring(1);
      const deleted = await storage.deleteFreezer(id);
      if (!deleted) {
        return errorResponse(404, "Freezer not found");
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
    console.error("Error in freezers function:", error);
    return errorResponse(500, "Internal server error");
  }
};
