import { pgTable, text, varchar, integer, numeric, date, timestamp, jsonb, index } from "drizzle-orm/pg-core";
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
  "desserts",
  "bread",
  "dairy",
  "frozen_goods",
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

export const produceSubcategories = [
  "fruit",
  "vegetable",
] as const;

export type ProduceSubcategory = (typeof produceSubcategories)[number];

export const preparedMealsSubcategories = [
  "home_made",
  "store_bought",
] as const;

export type PreparedMealsSubcategory = (typeof preparedMealsSubcategories)[number];

export const frozenGoodsSubcategories = [
  "pizza",
  "pasta",
  "pastry",
  "other_frozen",
] as const;

export type FrozenGoodsSubcategory = (typeof frozenGoodsSubcategories)[number];

export const dessertsSubcategories = [
  "home_made",
  "store_bought",
  "cakes",
  "sauces",
] as const;

export type DessertsSubcategory = (typeof dessertsSubcategories)[number];

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

export const defaultTags = [
  "organic",
  "vegan",
  "vegetarian",
  "free_range",
  "gluten_free",
  "low_fat",
  "sugar_free",
  "raw",
  "cooked",
] as const;

export type DefaultTag = (typeof defaultTags)[number];

export const tagLabels: Record<DefaultTag, string> = {
  organic: "Organic",
  vegan: "Vegan",
  vegetarian: "Vegetarian",
  free_range: "Free Range",
  gluten_free: "Gluten Free",
  low_fat: "Low Fat",
  sugar_free: "Sugar Free",
  raw: "Raw",
  cooked: "Cooked",
};

export const freezerItems = pgTable("freezer_items", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  subCategory: text("sub_category").$type<MeatSubcategory>(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull().default("1"),
  unit: text("unit").notNull().default("item"),
  expirationDate: date("expiration_date"),
  notes: text("notes"),
  lowStockThreshold: integer("low_stock_threshold").default(0),
  location: text("location").notNull().default("unassigned"),
  freezerId: text("freezer_id").default("default"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFreezerItemSchema = createInsertSchema(freezerItems).omit({
  id: true,
  createdAt: true,
});

export type InsertFreezerItem = z.infer<typeof insertFreezerItemSchema>;
export type FreezerItem = typeof freezerItems.$inferSelect;

export const freezerItemFormSchema = insertFreezerItemSchema.extend({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  category: z.string().min(1, "Category is required"),
  subCategory: z.string().nullable().optional(),
  quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0"),
  expirationDate: z.string().nullable().optional(),
  lowStockThreshold: z.coerce.number().min(0).optional(),
  location: z.string().optional(),
  freezerId: z.string().optional(),
  tags: z.array(z.string()).optional(),
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
