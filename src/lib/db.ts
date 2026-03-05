import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

let db: Database | null = null;

export async function getDb() {
  if (db) return db;

  const dbPath = path.join(process.cwd(), 'src/data/database.sqlite');
  const dbExists = fs.existsSync(dbPath);

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  if (!dbExists) {
    await initDb(db);
  }

  return db;
}

async function initDb(database: Database) {
  // Create Users table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      phone TEXT,
      name TEXT,
      points INTEGER DEFAULT 0,
      tier TEXT DEFAULT 'Guest',
      avatar TEXT,
      preferences TEXT DEFAULT '[]',
      isGuest BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Orders table to track if user has ordered
  await database.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      restaurant_id TEXT,
      table_id TEXT,
      status TEXT,
      items TEXT,
      total INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Create Sessions table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      resid TEXT,
      tableid TEXT,
      lastActive INTEGER,
      expires INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Migrate initial data from users.json if it exists
  const usersJsonPath = path.join(process.cwd(), 'src/data/users.json');
  if (fs.existsSync(usersJsonPath)) {
    const users = JSON.parse(fs.readFileSync(usersJsonPath, 'utf8'));
    for (const user of users) {
      await database.run(
        `INSERT OR IGNORE INTO users (id, phone, name, points, tier, avatar, preferences, isGuest) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          user.phone,
          user.name,
          user.points || 0,
          user.tier || 'Guest',
          user.avatar,
          JSON.stringify(user.preferences || []),
          user.isGuest ? 1 : 0
        ]
      );
    }
  }
}
