import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq, and } from "drizzle-orm";
import { fromError } from "zod-validation-error";
import { randomUUID } from "crypto";
import { freezerItems, insertFreezerItemSchema, users } from "./schema";
import { withAuth, successResponse, errorResponse } from "./auth-utils";

const { Pool } = pg;

// Initialize database connection
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
  
  // Extract ID from path if present
  const pathParts = event.path.split('/').filter(Boolean);
  const id = pathParts.length > 3 ? pathParts[3] : null;

  // Ensure user exists in database
  const [dbUser] = await db.select().from(users).where(eq(users.id, user.id));
  if (!dbUser) {
    await db.insert(users).values({
      id: user.id,
      email: user.email,
      fullName: user.fullName || null,
      avatarUrl: user.avatarUrl || null,
    });
  }

  // GET /api/items - Get all user's freezer items
  if (method === 'GET' && !id) {
    const items = await db
      .select()
      .from(freezerItems)
      .where(eq(freezerItems.userId, user.id));
    return successResponse(items);
  }

  // GET /api/items/:id - Get a single item by ID (must belong to user)
  if (method === 'GET' && id) {
    const [item] = await db
      .select()
      .from(freezerItems)
      .where(and(eq(freezerItems.id, id), eq(freezerItems.userId, user.id)));
    
    if (!item) {
      return errorResponse(404, "Item not found");
    }
    return successResponse(item);
  }

  // POST /api/items - Create a new item
  if (method === 'POST' && !id) {
    const body = JSON.parse(event.body || '{}');
    const result = insertFreezerItemSchema.safeParse(body);
    
    if (!result.success) {
      const validationError = fromError(result.error);
      return errorResponse(400, validationError.message);
    }
    
    const newId = randomUUID();
    const [item] = await db
      .insert(freezerItems)
      .values({
        id: newId,
        userId: user.id,
        ...result.data,
        quantity: result.data.quantity ?? "1",
        unit: result.data.unit ?? "item",
        lowStockThreshold: result.data.lowStockThreshold ?? 0,
        location: result.data.location ?? "unassigned",
        freezerId: result.data.freezerId ?? "default",
      })
      .returning();
      
    return successResponse(item, 201);
  }

  // PUT /api/items/:id - Update an existing item (must belong to user)
  if (method === 'PUT' && id) {
    const body = JSON.parse(event.body || '{}');
    const result = insertFreezerItemSchema.safeParse(body);
    
    if (!result.success) {
      const validationError = fromError(result.error);
      return errorResponse(400, validationError.message);
    }
    
    const [item] = await db
      .update(freezerItems)
      .set({
        ...result.data,
        quantity: result.data.quantity ?? "1",
        unit: result.data.unit ?? "item",
        lowStockThreshold: result.data.lowStockThreshold ?? 0,
        location: result.data.location ?? "unassigned",
        freezerId: result.data.freezerId ?? "default",
      })
      .where(and(eq(freezerItems.id, id), eq(freezerItems.userId, user.id)))
      .returning();
      
    if (!item) {
      return errorResponse(404, "Item not found");
    }
    
    return successResponse(item);
  }

  // DELETE /api/items/:id - Delete an item (must belong to user)
  if (method === 'DELETE' && id) {
    const result = await db
      .delete(freezerItems)
      .where(and(eq(freezerItems.id, id), eq(freezerItems.userId, user.id)))
      .returning();
    
    if (result.length === 0) {
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

  return errorResponse(405, "Method not allowed");
});
