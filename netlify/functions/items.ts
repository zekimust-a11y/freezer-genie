import { Handler } from '@netlify/functions';
import { storage } from "../../server/storage";
import { insertFreezerItemSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";
import { handleOptions, parseBody, errorResponse, successResponse } from './_shared';

export const handler: Handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  const path = event.path.replace('/.netlify/functions/items', '');
  const method = event.httpMethod;

  try {
    // GET /api/items - Get all freezer items
    if (method === 'GET' && path === '') {
      const items = await storage.getAllItems();
      return successResponse(items);
    }

    // GET /api/items/:id - Get a single item by ID
    if (method === 'GET' && path.startsWith('/')) {
      const id = path.substring(1);
      const item = await storage.getItem(id);
      if (!item) {
        return errorResponse(404, "Item not found");
      }
      return successResponse(item);
    }

    // POST /api/items - Create a new item
    if (method === 'POST' && path === '') {
      const body = parseBody(event);
      const result = insertFreezerItemSchema.safeParse(body);
      if (!result.success) {
        const validationError = fromError(result.error);
        return errorResponse(400, validationError.message);
      }
      const item = await storage.createItem(result.data);
      return successResponse(item, 201);
    }

    // PUT /api/items/:id - Update an existing item
    if (method === 'PUT' && path.startsWith('/')) {
      const id = path.substring(1);
      const body = parseBody(event);
      const result = insertFreezerItemSchema.safeParse(body);
      if (!result.success) {
        const validationError = fromError(result.error);
        return errorResponse(400, validationError.message);
      }
      const item = await storage.updateItem(id, result.data);
      if (!item) {
        return errorResponse(404, "Item not found");
      }
      return successResponse(item);
    }

    // DELETE /api/items/:id - Delete an item
    if (method === 'DELETE' && path.startsWith('/')) {
      const id = path.substring(1);
      const deleted = await storage.deleteItem(id);
      if (!deleted) {
        return errorResponse(404, "Item not found");
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
    console.error("Error in items function:", error);
    return errorResponse(500, "Internal server error");
  }
};
