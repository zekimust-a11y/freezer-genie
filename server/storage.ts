import { 
  freezerItems, 
  users,
  type FreezerItem, 
  type InsertFreezerItem, 
  type Category,
  type Location,
  type User,
  type UpsertUser
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  // Freezer item operations
  getAllItems(): Promise<FreezerItem[]>;
  getItem(id: string): Promise<FreezerItem | undefined>;
  createItem(item: InsertFreezerItem): Promise<FreezerItem>;
  updateItem(id: string, item: InsertFreezerItem): Promise<FreezerItem | undefined>;
  deleteItem(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Freezer item operations
  async getAllItems(): Promise<FreezerItem[]> {
    return await db.select().from(freezerItems);
  }

  async getItem(id: string): Promise<FreezerItem | undefined> {
    const [item] = await db.select().from(freezerItems).where(eq(freezerItems.id, id));
    return item || undefined;
  }

  async createItem(insertItem: InsertFreezerItem): Promise<FreezerItem> {
    const id = crypto.randomUUID();
    const [item] = await db
      .insert(freezerItems)
      .values({
        id,
        name: insertItem.name,
        category: insertItem.category as Category,
        subCategory: insertItem.subCategory || null,
        quantity: insertItem.quantity ?? 1,
        unit: insertItem.unit ?? "item",
        expirationDate: insertItem.expirationDate || null,
        notes: insertItem.notes || null,
        lowStockThreshold: insertItem.lowStockThreshold ?? 0,
        location: (insertItem.location as Location) ?? "unassigned",
      })
      .returning();
    return item;
  }

  async updateItem(id: string, updateData: InsertFreezerItem): Promise<FreezerItem | undefined> {
    const [item] = await db
      .update(freezerItems)
      .set({
        name: updateData.name,
        category: updateData.category as Category,
        subCategory: updateData.subCategory || null,
        quantity: updateData.quantity ?? 1,
        unit: updateData.unit ?? "item",
        expirationDate: updateData.expirationDate || null,
        notes: updateData.notes || null,
        lowStockThreshold: updateData.lowStockThreshold ?? 0,
        location: (updateData.location as Location) ?? "unassigned",
      })
      .where(eq(freezerItems.id, id))
      .returning();
    return item || undefined;
  }

  async deleteItem(id: string): Promise<boolean> {
    const result = await db.delete(freezerItems).where(eq(freezerItems.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
