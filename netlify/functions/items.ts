import { Handler } from '@netlify/functions';
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq } from "drizzle-orm";
import { fromError } from "zod-validation-error";
import { randomUUID } from "crypto";
import { freezerItems, insertFreezerItemSchema, type FreezerItem } from "./schema";

const { Pool } = pg;

// Initialize database connection
const getDb = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return drizzle(pool);
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

export const handler: Handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  const db = getDb();
  const method = event.httpMethod;
  
  // Extract ID from path if present
  // Path will be like /.netlify/functions/items or /.netlify/functions/items/some-id
  const pathParts = event.path.split('/').filter(Boolean);
  const id = pathParts.length > 3 ? pathParts[3] : null; // ['.netlify', 'functions', 'items', 'id']

  try {
    // GET /api/items - Get all freezer items
    if (method === 'GET' && !id) {
      const items = await db.select().from(freezerItems);
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      };
    }

    // GET /api/items/:id - Get a single item by ID
    if (method === 'GET' && id) {
      const [item] = await db.select().from(freezerItems).where(eq(freezerItems.id, id));
      if (!item) {
        return {
          statusCode: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: "Item not found" }),
        };
      }
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      };
    }

    // POST /api/items - Create a new item
    if (method === 'POST' && !id) {
      const body = JSON.parse(event.body || '{}');
      const result = insertFreezerItemSchema.safeParse(body);
      if (!result.success) {
        const validationError = fromError(result.error);
        return {
          statusCode: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: validationError.message }),
        };
      }
      
      const newId = randomUUID();
      const [item] = await db
        .insert(freezerItems)
        .values({
          id: newId,
          ...result.data,
          quantity: result.data.quantity ?? "1",
          unit: result.data.unit ?? "item",
          lowStockThreshold: result.data.lowStockThreshold ?? 0,
          location: result.data.location ?? "unassigned",
          freezerId: result.data.freezerId ?? "default",
        })
        .returning();
        
      return {
        statusCode: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      };
    }

    // PUT /api/items/:id - Update an existing item
    if (method === 'PUT' && id) {
      const body = JSON.parse(event.body || '{}');
      const result = insertFreezerItemSchema.safeParse(body);
      if (!result.success) {
        const validationError = fromError(result.error);
        return {
          statusCode: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: validationError.message }),
        };
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
        .where(eq(freezerItems.id, id))
        .returning();
        
      if (!item) {
        return {
          statusCode: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: "Item not found" }),
        };
      }
      
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      };
    }

    // DELETE /api/items/:id - Delete an item
    if (method === 'DELETE' && id) {
      const result = await db.delete(freezerItems).where(eq(freezerItems.id, id)).returning();
      if (result.length === 0) {
        return {
          statusCode: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: "Item not found" }),
        };
      }
      return {
        statusCode: 204,
        headers: corsHeaders,
        body: '',
      };
    }

    // Method not allowed
    return {
      statusCode: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: "Method not allowed" }),
    };

  } catch (error) {
    console.error("Error in items function:", error);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: "Internal server error", message: error instanceof Error ? error.message : 'Unknown error' }),
    };
  }
};