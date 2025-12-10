import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFreezerItemSchema, insertFreezerSchema, insertCustomLocationSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth route - returns null when auth is disabled
  app.get('/api/auth/user', async (_req, res) => {
    res.json(null);
  });

  // Get all freezer items
  app.get("/api/items", async (_req, res) => {
    try {
      const items = await storage.getAllItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching items:", error);
      res.status(500).json({ error: "Failed to fetch items" });
    }
  });

  // Get a single item by ID
  app.get("/api/items/:id", async (req, res) => {
    try {
      const item = await storage.getItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching item:", error);
      res.status(500).json({ error: "Failed to fetch item" });
    }
  });

  // Create a new item
  app.post("/api/items", async (req, res) => {
    try {
      const result = insertFreezerItemSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromError(result.error);
        return res.status(400).json({ error: validationError.message });
      }
      const item = await storage.createItem(result.data);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating item:", error);
      res.status(500).json({ error: "Failed to create item" });
    }
  });

  // Update an existing item
  app.put("/api/items/:id", async (req, res) => {
    try {
      const result = insertFreezerItemSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromError(result.error);
        return res.status(400).json({ error: validationError.message });
      }
      const item = await storage.updateItem(req.params.id, result.data);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating item:", error);
      res.status(500).json({ error: "Failed to update item" });
    }
  });

  // Delete an item
  app.delete("/api/items/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting item:", error);
      res.status(500).json({ error: "Failed to delete item" });
    }
  });

  // Freezer routes
  app.get("/api/freezers", async (_req, res) => {
    try {
      const freezersList = await storage.getAllFreezers();
      res.json(freezersList);
    } catch (error) {
      console.error("Error fetching freezers:", error);
      res.status(500).json({ error: "Failed to fetch freezers" });
    }
  });

  app.post("/api/freezers", async (req, res) => {
    try {
      const result = insertFreezerSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromError(result.error);
        return res.status(400).json({ error: validationError.message });
      }
      const freezer = await storage.createFreezer(result.data);
      res.status(201).json(freezer);
    } catch (error) {
      console.error("Error creating freezer:", error);
      res.status(500).json({ error: "Failed to create freezer" });
    }
  });

  app.put("/api/freezers/:id", async (req, res) => {
    try {
      const result = insertFreezerSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromError(result.error);
        return res.status(400).json({ error: validationError.message });
      }
      const freezer = await storage.updateFreezer(req.params.id, result.data);
      if (!freezer) {
        return res.status(404).json({ error: "Freezer not found" });
      }
      res.json(freezer);
    } catch (error) {
      console.error("Error updating freezer:", error);
      res.status(500).json({ error: "Failed to update freezer" });
    }
  });

  app.delete("/api/freezers/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteFreezer(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Freezer not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting freezer:", error);
      res.status(500).json({ error: "Failed to delete freezer" });
    }
  });

  // Custom locations routes
  app.get("/api/custom-locations", async (_req, res) => {
    try {
      const locations = await storage.getAllCustomLocations();
      res.json(locations);
    } catch (error) {
      console.error("Error fetching custom locations:", error);
      res.status(500).json({ error: "Failed to fetch custom locations" });
    }
  });

  app.post("/api/custom-locations", async (req, res) => {
    try {
      const result = insertCustomLocationSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromError(result.error);
        return res.status(400).json({ error: validationError.message });
      }
      const location = await storage.createCustomLocation(result.data);
      res.status(201).json(location);
    } catch (error) {
      console.error("Error creating custom location:", error);
      res.status(500).json({ error: "Failed to create custom location" });
    }
  });

  app.delete("/api/custom-locations/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCustomLocation(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Custom location not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting custom location:", error);
      res.status(500).json({ error: "Failed to delete custom location" });
    }
  });

  return httpServer;
}
