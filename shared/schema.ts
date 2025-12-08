import { pgTable, text, varchar, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const categories = [
  "meat",
  "vegetables",
  "fruits",
  "prepared_meals",
  "dairy",
  "frozen_goods",
  "other",
] as const;

export type Category = (typeof categories)[number];

export const freezerItems = pgTable("freezer_items", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull().$type<Category>(),
  quantity: integer("quantity").notNull().default(1),
  unit: text("unit").notNull().default("item"),
  expirationDate: date("expiration_date"),
  notes: text("notes"),
});

export const insertFreezerItemSchema = createInsertSchema(freezerItems).omit({
  id: true,
});

export type InsertFreezerItem = z.infer<typeof insertFreezerItemSchema>;
export type FreezerItem = typeof freezerItems.$inferSelect;

// For frontend validation with additional rules
export const freezerItemFormSchema = insertFreezerItemSchema.extend({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  expirationDate: z.string().nullable().optional(),
});

export type FreezerItemFormData = z.infer<typeof freezerItemFormSchema>;
