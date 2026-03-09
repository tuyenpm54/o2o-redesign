import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';

let pool: Pool | null = null;
let initialized = false;

function convertQuery(sql: string) {
  let idx = 1;
  return sql.replace(/\?/g, () => `$${idx++}`);
}

// Map Postgres lowercase columns back to Original SQLite camelCase
function mapRowKeys(row: any) {
  if (!row) return row;
  const mapped = { ...row };
  if ('isguest' in mapped) {
    mapped.isGuest = mapped.isguest;
    delete mapped.isguest;
  }
  if ('lastactive' in mapped) {
    mapped.lastActive = mapped.lastactive;
    delete mapped.lastactive;
  }
  return mapped;
}

class DBWrapper {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async get(sql: string, params: any[] = []) {
    const pgSql = convertQuery(sql);
    try {
      const res = await this.pool.query(pgSql, params);
      return mapRowKeys(res.rows[0]);
    } catch (e) {
      console.error("PG GET Error:", e, "SQL:", pgSql, "Params:", params);
      throw e;
    }
  }

  async all(sql: string, params: any[] = []) {
    const pgSql = convertQuery(sql);
    try {
      const res = await this.pool.query(pgSql, params);
      return res.rows.map(mapRowKeys);
    } catch (e) {
      console.error("PG ALL Error:", e, "SQL:", pgSql, "Params:", params);
      throw e;
    }
  }

  async run(sql: string, params: any[] = []) {
    let pgSql = sql;
    // Map SQLite specific INSERT OR IGNORE to PG ON CONFLICT
    if (pgSql.includes('INSERT OR IGNORE INTO users')) {
      pgSql = pgSql.replace('INSERT OR IGNORE INTO users', 'INSERT INTO users');
      pgSql += ' ON CONFLICT (id) DO NOTHING';
    } else if (pgSql.includes('INSERT INTO users (') && !pgSql.includes('ON CONFLICT')) {
      pgSql += ' ON CONFLICT (id) DO NOTHING';
    }

    pgSql = convertQuery(pgSql);
    try {
      const res = await this.pool.query(pgSql, params);
      return { changes: res.rowCount || 0 };
    } catch (e) {
      console.error("PG RUN Error:", e, "SQL:", pgSql, "Params:", params);
      throw e;
    }
  }

  async exec(sql: string) {
    try {
      await this.pool.query(sql);
    } catch (e) {
      console.error("PG EXEC Error:", e);
      throw e;
    }
  }
}

let dbWrapperInstance: DBWrapper | null = null;

export async function getDb() {
  if (dbWrapperInstance) return dbWrapperInstance;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("DATABASE_URL is not set. Using fallback for local dev. This will fail on Netlify if not set.");
  }

  pool = new Pool({
    connectionString,
    // Add SSL for providers like Supabase/Neon/Render in production
    ssl: process.env.NODE_ENV === 'production' && connectionString && !connectionString.includes('localhost') ? { rejectUnauthorized: false } : undefined
  });

  dbWrapperInstance = new DBWrapper(pool);

  if (!initialized) {
    // Only init if we actually have a connection and it works
    try {
      if (connectionString) {
        await initDb(dbWrapperInstance);
        initialized = true;
      }
    } catch (e) {
      console.warn("Could not auto-initialize DB tables on startup. Proceeding anyway...", e);
    }
  }

  return dbWrapperInstance;
}

async function initDb(database: DBWrapper) {
  // Create Users table
  // Use INTEGER for isGuest to perfectly match the 0/1 SQLite logic in API routes
  await database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      phone TEXT,
      name TEXT,
      points INTEGER DEFAULT 0,
      tier TEXT DEFAULT 'Guest',
      avatar TEXT,
      preferences TEXT DEFAULT '[]',
      isGuest INTEGER DEFAULT 0, 
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Tables table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS tables (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      qr_code TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed default tables if not exists
  await database.run(
    `INSERT INTO tables (id, name) VALUES (?, ?) ON CONFLICT (id) DO NOTHING`,
    ['A-12', 'Bàn A-12']
  );
  await database.run(
    `INSERT INTO tables (id, name) VALUES (?, ?) ON CONFLICT (id) DO NOTHING`,
    ['T-1', 'Bàn 1']
  );

  // Create Orders table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      restaurant_id TEXT,
      table_id TEXT,
      status TEXT,
      items TEXT,
      total INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
      lastActive BIGINT,
      expires BIGINT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Create Relational Tables for Carts, Orders, Messages
  await database.exec(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id SERIAL PRIMARY KEY,
      user_id TEXT,
      resid TEXT,
      item_id INTEGER,
      name TEXT,
      price INTEGER,
      qty INTEGER,
      selections TEXT,
      added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Ensure selections column exists (for migrating existing local DBs)
  try {
    await database.exec(`ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS selections TEXT`);
  } catch (e) {
    // Column might already exist or table might not exist yet (though we just created it IF NOT EXISTS)
  }

  await database.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      resid TEXT,
      tableid TEXT,
      item_id INTEGER,
      name TEXT,
      price INTEGER,
      qty INTEGER,
      status TEXT,
      selections TEXT,
      timestamp BIGINT
    )
  `);

  try {
    await database.exec(`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS selections TEXT`);
  } catch (e) { }

  await database.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      resid TEXT,
      tableid TEXT,
      sender TEXT,
      type TEXT,
      typeId TEXT,
      content TEXT,
      time TEXT,
      timestamp BIGINT
    )
  `);

  // Create KV Store table for migrating carts, orders, messages
  await database.exec(`
    CREATE TABLE IF NOT EXISTS kv_store (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  // Migrate initial data from users.json if it exists (run on first start)
  const usersJsonPath = path.join(process.cwd(), 'src/data/users.json');
  if (fs.existsSync(usersJsonPath)) {
    try {
      const users = JSON.parse(fs.readFileSync(usersJsonPath, 'utf8'));
      for (const user of users) {
        await database.run(
          `INSERT INTO users (id, phone, name, points, tier, avatar, preferences, isGuest) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (id) DO NOTHING`,
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
    } catch (e) { }
  }
}

export async function getKV(key: string) {
  const db = await getDb();
  const row = await db.get('SELECT value FROM kv_store WHERE key = ?', [key]);
  if (row && row.value) {
    return JSON.parse(row.value);
  }
  // Default values
  if (key === 'messages') return [];
  return {};
}

export async function setKV(key: string, value: any) {
  const db = await getDb();
  await db.run('INSERT INTO kv_store (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value', [key, JSON.stringify(value)]);
}
