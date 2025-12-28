import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq, and } from "drizzle-orm";
import { fromError } from "zod-validation-error";
import { randomUUID } from "crypto";
import { freezers, insertFreezerSchema } from "./schema";
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

  // GET /api/freezers - Get all user's freezers
  if (method === 'GET' && !id) {
    const userFreezers = await db
      .select()
      .from(freezers)
      .where(eq(freezers.userId, user.id));
    return successResponse(userFreezers);
  }

  // GET /api/freezers/:id - Get a single freezer
  if (method === 'GET' && id) {
    const [freezer] = await db
      .select()
      .from(freezers)
      .where(and(eq(freezers.id, id), eq(freezers.userId, user.id)));
    
    if (!freezer) {
      return errorResponse(404, "Freezer not found");
    }
    return successResponse(freezer);
  }

  // POST /api/freezers - Create a new freezer
  if (method === 'POST' && !id) {
    const body = JSON.parse(event.body || '{}');
    const result = insertFreezerSchema.safeParse(body);
    
    if (!result.success) {
      const validationError = fromError(result.error);
      return errorResponse(400, validationError.message);
    }
    
    const newId = randomUUID();
    const [freezer] = await db
      .insert(freezers)
      .values({
        id: newId,
        userId: user.id,
        ...result.data,
      })
      .returning();
      
    return successResponse(freezer, 201);
  }

  // PUT /api/freezers/:id - Update an existing freezer
  if (method === 'PUT' && id) {
    const body = JSON.parse(event.body || '{}');
    const result = insertFreezerSchema.safeParse(body);
    
    if (!result.success) {
      const validationError = fromError(result.error);
      return errorResponse(400, validationError.message);
    }
    
    const [freezer] = await db
      .update(freezers)
      .set(result.data)
      .where(and(eq(freezers.id, id), eq(freezers.userId, user.id)))
      .returning();
      
    if (!freezer) {
      return errorResponse(404, "Freezer not found");
    }
    
    return successResponse(freezer);
  }

  // DELETE /api/freezers/:id - Delete a freezer
  if (method === 'DELETE' && id) {
    const result = await db
      .delete(freezers)
      .where(and(eq(freezers.id, id), eq(freezers.userId, user.id)))
      .returning();
    
    if (result.length === 0) {
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

  return errorResponse(405, "Method not allowed");
});
