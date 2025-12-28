import { Handler } from '@netlify/functions';
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq } from "drizzle-orm";
import { fromError } from "zod-validation-error";
import { customLocations, insertCustomLocationSchema } from "../../shared/schema";

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
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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
  const path = event.path.replace('/.netlify/functions/custom-locations', '');
  const method = event.httpMethod;

  try {
    // GET /api/custom-locations - Get all custom locations
    if (method === 'GET' && path === '') {
      const locations = await db.select().from(customLocations);
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(locations),
      };
    }

    // POST /api/custom-locations - Create a new custom location
    if (method === 'POST' && path === '') {
      const body = JSON.parse(event.body || '{}');
      const result = insertCustomLocationSchema.safeParse(body);
      if (!result.success) {
        const validationError = fromError(result.error);
        return {
          statusCode: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: validationError.message }),
        };
      }
      
      const id = crypto.randomUUID();
      const [location] = await db
        .insert(customLocations)
        .values({
          id,
          name: result.data.name,
        })
        .returning();
        
      return {
        statusCode: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(location),
      };
    }

    // DELETE /api/custom-locations/:id - Delete a custom location
    if (method === 'DELETE' && path.startsWith('/')) {
      const id = path.substring(1);
      const result = await db.delete(customLocations).where(eq(customLocations.id, id)).returning();
      if (result.length === 0) {
        return {
          statusCode: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: "Custom location not found" }),
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
    console.error("Error in custom-locations function:", error);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: "Internal server error", message: error instanceof Error ? error.message : 'Unknown error' }),
    };
  }
};