import { Handler } from '@netlify/functions';
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq } from "drizzle-orm";
import { fromError } from "zod-validation-error";
import { freezers, insertFreezerSchema } from "../../shared/schema";

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
  const path = event.path.replace('/.netlify/functions/freezers', '');
  const method = event.httpMethod;

  try {
    // GET /api/freezers - Get all freezers
    if (method === 'GET' && path === '') {
      let result = await db.select().from(freezers);
      if (result.length === 0) {
        // Create default freezer if none exist
        const id = crypto.randomUUID();
        const [defaultFreezer] = await db
          .insert(freezers)
          .values({ id, name: "My Freezer", type: "fridge_freezer" })
          .returning();
        result = [defaultFreezer];
      }
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      };
    }

    // POST /api/freezers - Create a new freezer
    if (method === 'POST' && path === '') {
      const body = JSON.parse(event.body || '{}');
      const result = insertFreezerSchema.safeParse(body);
      if (!result.success) {
        const validationError = fromError(result.error);
        return {
          statusCode: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: validationError.message }),
        };
      }
      
      const id = crypto.randomUUID();
      const [freezer] = await db
        .insert(freezers)
        .values({
          id,
          name: result.data.name,
          type: result.data.type ?? "fridge_freezer",
        })
        .returning();
        
      return {
        statusCode: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(freezer),
      };
    }

    // PUT /api/freezers/:id - Update an existing freezer
    if (method === 'PUT' && path.startsWith('/')) {
      const id = path.substring(1);
      const body = JSON.parse(event.body || '{}');
      const result = insertFreezerSchema.safeParse(body);
      if (!result.success) {
        const validationError = fromError(result.error);
        return {
          statusCode: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: validationError.message }),
        };
      }
      
      const [freezer] = await db
        .update(freezers)
        .set({
          name: result.data.name,
          type: result.data.type ?? "fridge_freezer",
        })
        .where(eq(freezers.id, id))
        .returning();
        
      if (!freezer) {
        return {
          statusCode: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: "Freezer not found" }),
        };
      }
      
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(freezer),
      };
    }

    // DELETE /api/freezers/:id - Delete a freezer
    if (method === 'DELETE' && path.startsWith('/')) {
      const id = path.substring(1);
      const result = await db.delete(freezers).where(eq(freezers.id, id)).returning();
      if (result.length === 0) {
        return {
          statusCode: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: "Freezer not found" }),
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
    console.error("Error in freezers function:", error);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: "Internal server error", message: error instanceof Error ? error.message : 'Unknown error' }),
    };
  }
};