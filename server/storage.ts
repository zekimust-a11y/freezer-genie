import { type FreezerItem, type InsertFreezerItem } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getAllItems(): Promise<FreezerItem[]>;
  getItem(id: string): Promise<FreezerItem | undefined>;
  createItem(item: InsertFreezerItem): Promise<FreezerItem>;
  updateItem(id: string, item: InsertFreezerItem): Promise<FreezerItem | undefined>;
  deleteItem(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private items: Map<string, FreezerItem>;

  constructor() {
    this.items = new Map();
  }

  async getAllItems(): Promise<FreezerItem[]> {
    return Array.from(this.items.values());
  }

  async getItem(id: string): Promise<FreezerItem | undefined> {
    return this.items.get(id);
  }

  async createItem(insertItem: InsertFreezerItem): Promise<FreezerItem> {
    const id = randomUUID();
    const item: FreezerItem = { 
      ...insertItem, 
      id,
      expirationDate: insertItem.expirationDate || null,
      notes: insertItem.notes || null,
    };
    this.items.set(id, item);
    return item;
  }

  async updateItem(id: string, updateData: InsertFreezerItem): Promise<FreezerItem | undefined> {
    const existing = this.items.get(id);
    if (!existing) {
      return undefined;
    }
    const updated: FreezerItem = {
      ...existing,
      ...updateData,
      id,
      expirationDate: updateData.expirationDate || null,
      notes: updateData.notes || null,
    };
    this.items.set(id, updated);
    return updated;
  }

  async deleteItem(id: string): Promise<boolean> {
    return this.items.delete(id);
  }
}

export const storage = new MemStorage();
