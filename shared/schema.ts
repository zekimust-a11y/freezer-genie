import { pgTable, text, varchar, integer, date, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const categories = [
  "meat_fish",
  "produce",
  "prepared_meals",
  "frozen_goods",
  "desserts",
  "bread",
  "other",
] as const;

export type Category = (typeof categories)[number];

export const meatSubcategories = [
  "chicken",
  "beef",
  "pork",
  "lamb",
  "fish",
  "seafood",
  "other_meat",
] as const;

export type MeatSubcategory = (typeof meatSubcategories)[number];

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
  subCategory: text("sub_category").$type<MeatSubcategory>(),
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
