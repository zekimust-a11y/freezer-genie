import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFreezerItemSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
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

  return httpServer;
}
