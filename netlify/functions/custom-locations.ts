import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq, and } from "drizzle-orm";
import { fromError } from "zod-validation-error";
import { randomUUID } from "crypto";
import { customLocations, insertCustomLocationSchema } from "./schema";
import { withAuth, successResponse, errorResponse } from "./auth-utils";

const { Pool } = pg;

const getDb = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return drizzle(pool);
};

export const handler = withAuth(async (event, user) => {
  const db = getDb();
  const method = event.httpMethod;
  
  const pathParts = event.path.split('/').filter(Boolean);
  const id = pathParts.length > 3 ? pathParts[3] : null;

  // GET /api/custom-locations - Get all user's custom locations
  if (method === 'GET' && !id) {
    const locations = await db
      .select()
      .from(customLocations)
      .where(eq(customLocations.userId, user.id));
    return successResponse(locations);
  }

  // GET /api/custom-locations/:id - Get a single custom location
  if (method === 'GET' && id) {
    const [location] = await db
      .select()
      .from(customLocations)
      .where(and(eq(customLocations.id, id), eq(customLocations.userId, user.id)));
    
    if (!location) {
      return errorResponse(404, "Custom location not found");
    }
    return successResponse(location);
  }

  // POST /api/custom-locations - Create a new custom location
  if (method === 'POST' && !id) {
    const body = JSON.parse(event.body || '{}');
    const result = insertCustomLocationSchema.safeParse(body);
    
    if (!result.success) {
      const validationError = fromError(result.error);
      return errorResponse(400, validationError.message);
    }
    
    const newId = randomUUID();
    const [location] = await db
      .insert(customLocations)
      .values({
        id: newId,
        userId: user.id,
        ...result.data,
      })
      .returning();
      
    return successResponse(location, 201);
  }

  // PUT /api/custom-locations/:id - Update an existing custom location
  if (method === 'PUT' && id) {
    const body = JSON.parse(event.body || '{}');
    const result = insertCustomLocationSchema.safeParse(body);
    
    if (!result.success) {
      const validationError = fromError(result.error);
      return errorResponse(400, validationError.message);
    }
    
    const [location] = await db
      .update(customLocations)
      .set(result.data)
      .where(and(eq(customLocations.id, id), eq(customLocations.userId, user.id)))
      .returning();
      
    if (!location) {
      return errorResponse(404, "Custom location not found");
    }
    
    return successResponse(location);
  }

  // DELETE /api/custom-locations/:id - Delete a custom location
  if (method === 'DELETE' && id) {
    const result = await db
      .delete(customLocations)
      .where(and(eq(customLocations.id, id), eq(customLocations.userId, user.id)))
      .returning();
    
    if (result.length === 0) {
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

  return errorResponse(405, "Method not allowed");
});
