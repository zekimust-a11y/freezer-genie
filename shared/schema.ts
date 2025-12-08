import { pgTable, text, varchar, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const categories = [
  "meat",
  "vegetables",
  "fruits",
  "prepared_meals",
  "other",
] as const;

export type Category = (typeof categories)[number];

export const locations = [
  "top_shelf",
  "middle_shelf",
  "bottom_shelf",
  "door",
  "drawer_1",
  "drawer_2",
  "drawer_3",
  "unassigned",
] as const;

export type Location = (typeof locations)[number];

export const freezerItems = pgTable("freezer_items", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull().$type<Category>(),
  quantity: integer("quantity").notNull().default(1),
  unit: text("unit").notNull().default("item"),
  expirationDate: date("expiration_date"),
  notes: text("notes"),
  lowStockThreshold: integer("low_stock_threshold").default(0),
  location: text("location").notNull().default("unassigned").$type<Location>(),
});

export const insertFreezerItemSchema = createInsertSchema(freezerItems).omit({
  id: true,
});

export type InsertFreezerItem = z.infer<typeof insertFreezerItemSchema>;
export type FreezerItem = typeof freezerItems.$inferSelect;

export const freezerItemFormSchema = insertFreezerItemSchema.extend({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  expirationDate: z.string().nullable().optional(),
  lowStockThreshold: z.coerce.number().min(0).optional(),
  location: z.string().optional(),
});

export type FreezerItemFormData = z.infer<typeof freezerItemFormSchema>;

export const locationLabels: Record<Location, string> = {
  top_shelf: "Top Shelf",
  middle_shelf: "Middle Shelf",
  bottom_shelf: "Bottom Shelf",
  door: "Door",
  drawer_1: "Drawer 1",
  drawer_2: "Drawer 2",
  drawer_3: "Drawer 3",
  unassigned: "Unassigned",
};
