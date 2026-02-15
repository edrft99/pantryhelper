import db from '../db/init.js';
import * as mealie from './mealie.js';

export function getAllItems() {
  return db.prepare('SELECT * FROM pantry_items ORDER BY category, name').all();
}

export async function addItems(items) {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO pantry_items (name, category, quantity, unit)
    VALUES (@name, @category, @quantity, @unit)
  `);

  const added = [];
  const transaction = db.transaction((items) => {
    for (const item of items) {
      const result = insert.run({
        name: item.name,
        category: item.category || 'other',
        quantity: item.quantity || 1,
        unit: item.unit || 'item'
      });
      if (result.changes > 0) {
        added.push({ id: result.lastInsertRowid, ...item });
      }
    }
  });

  transaction(items);
  
  // Sync added items to Mealie
  if (added.length > 0) {
    await mealie.batchSyncFoods(added);
  }
  
  return added;
}

export async function updateItem(id, data) {
  const fields = [];
  const values = { id };

  if (data.name !== undefined) { fields.push('name = @name'); values.name = data.name; }
  if (data.category !== undefined) { fields.push('category = @category'); values.category = data.category; }
  if (data.quantity !== undefined) { fields.push('quantity = @quantity'); values.quantity = data.quantity; }
  if (data.unit !== undefined) { fields.push('unit = @unit'); values.unit = data.unit; }

  if (fields.length === 0) return null;

  fields.push("updated_at = datetime('now')");
  const stmt = db.prepare(`UPDATE pantry_items SET ${fields.join(', ')} WHERE id = @id`);
  stmt.run(values);

  const updatedItem = db.prepare('SELECT * FROM pantry_items WHERE id = ?').get(id);
  
  // Sync updated item to Mealie
  if (updatedItem) {
    await mealie.addFood(updatedItem.name, updatedItem.quantity, updatedItem.unit);
  }
  
  return updatedItem;
}

export async function deleteItem(id) {
  // Get the item name before deleting
  const item = db.prepare('SELECT name FROM pantry_items WHERE id = ?').get(id);
  
  const result = db.prepare('DELETE FROM pantry_items WHERE id = ?').run(id);
  
  // Remove from Mealie if deletion was successful
  if (result.changes > 0 && item) {
    await mealie.removeFood(item.name);
  }
  
  return result;
}

export async function clearAll() {
  // Get all item names before clearing
  const items = db.prepare('SELECT name FROM pantry_items').all();
  const names = items.map(item => item.name);
  
  // Clear from database
  const result = db.prepare('DELETE FROM pantry_items').run();
  
  // Remove all from Mealie if items were deleted
  if (result.changes > 0 && names.length > 0) {
    await mealie.batchRemoveFoods(names);
  }
  
  return result;
}

export async function mergeIngredients(ingredients) {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO pantry_items (name, category)
    VALUES (@name, @category)
  `);

  const added = [];
  const transaction = db.transaction((ingredients) => {
    for (const ing of ingredients) {
      const result = insert.run({ name: ing.name, category: ing.category || 'other' });
      if (result.changes > 0) {
        added.push({ name: ing.name, category: ing.category || 'other', quantity: 1, unit: 'item' });
      }
    }
  });

  transaction(ingredients);
  
  // Sync newly added ingredients to Mealie
  if (added.length > 0) {
    await mealie.batchSyncFoods(added);
  }
  
  return getAllItems();
}
