import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';

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

let initializationPromise: Promise<DBWrapper> | null = null;

export async function getDb() {
  if (initializationPromise) {
    return initializationPromise.catch(err => {
      initializationPromise = null;
      throw err;
    });
  }

  initializationPromise = (async () => {
    let connectionString = process.env.DATABASE_URL;
    if (connectionString && connectionString.includes('sslmode=require') && !connectionString.includes('uselibpqcompat')) {
      connectionString += '&uselibpqcompat=true';
    }
    console.log("[DB] Connecting to database:", connectionString ? connectionString.split('@')[1] : "MISSING");

    const pool = new Pool({
      connectionString,
      ssl: connectionString && !connectionString.includes('localhost') ? { rejectUnauthorized: false } : undefined,
      connectionTimeoutMillis: 10000,
    });

    const wrapper = new DBWrapper(pool);

    try {
      if (connectionString) {
        console.log("[DB] Running initialization...");
        await initDb(wrapper);
        console.log("[DB] Initialization complete.");
      }
    } catch (e) {
      console.warn("[DB] Initialization error:", e);
      initializationPromise = null; // Allow retry
      throw e;
    }

    dbWrapperInstance = wrapper;
    return wrapper;
  })();

  return initializationPromise;
}

async function initDb(database: DBWrapper) {
  const startTime = Date.now();

  // ── DDL: Batch ALL table creation + migrations into a SINGLE round-trip ──
  // This reduces cold-start from ~42 sequential network calls to just 1.
  await database.exec(`
    -- Users
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      phone TEXT,
      name TEXT,
      points INTEGER DEFAULT 0,
      tier TEXT DEFAULT 'Guest',
      avatar TEXT,
      preferences TEXT DEFAULT '[]',
      isGuest INTEGER DEFAULT 0,
      visit_count INTEGER DEFAULT 1,
      last_visit_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ALTER TABLE users ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 1;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS last_visit_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences_history TEXT DEFAULT '[]';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'CUSTOMER';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS managed_chain_id TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;

    -- Restaurants (Cơ sở)
    CREATE TABLE IF NOT EXISTS restaurants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT,
      location_lat TEXT,
      location_lng TEXT,
      logo TEXT,
      banner TEXT,
      description TEXT,
      wifi_ssid TEXT,
      wifi_password TEXT,
      chain_id TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- User_Restaurants (Phân quyền quản trị viên)
    CREATE TABLE IF NOT EXISTS user_restaurants (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      restaurant_id TEXT NOT NULL,
      assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, restaurant_id)
    );

    -- Subscriptions (Gói cước API)
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT,
      chain_id TEXT,
      plan_type TEXT DEFAULT 'FREE',
      status TEXT DEFAULT 'ACTIVE',
      features_json TEXT DEFAULT '{}',
      start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP
    );

    -- User VAT Profiles
    CREATE TABLE IF NOT EXISTS user_vat_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      company_name TEXT NOT NULL,
      tax_code TEXT NOT NULL,
      address TEXT NOT NULL,
      email TEXT,
      is_default INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Tables
    CREATE TABLE IF NOT EXISTS tables (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      qr_code TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Orders
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
    );

    -- Sessions
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      resid TEXT,
      tableid TEXT,
      lastActive BIGINT,
      expires BIGINT,
      created_at BIGINT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    ALTER TABLE sessions ADD COLUMN IF NOT EXISTS created_at BIGINT;

    -- Session Presences
    CREATE TABLE IF NOT EXISTS session_presences (
      session_id TEXT,
      resid TEXT,
      tableid TEXT,
      last_active BIGINT,
      PRIMARY KEY (session_id, resid, tableid),
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    );

    -- Table Sessions (lifecycle tracking)
    CREATE TABLE IF NOT EXISTS table_sessions (
      id TEXT PRIMARY KEY,
      resid TEXT,
      tableid TEXT,
      status TEXT,
      started_at BIGINT,
      ended_at BIGINT,
      total INTEGER DEFAULT 0
    );

    -- Order Rounds
    CREATE TABLE IF NOT EXISTS order_rounds (
      id TEXT PRIMARY KEY,
      table_session_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      resid TEXT NOT NULL,
      tableid TEXT NOT NULL,
      status TEXT DEFAULT 'Chờ xác nhận',
      created_at BIGINT NOT NULL,
      confirmed_at BIGINT,
      FOREIGN KEY (table_session_id) REFERENCES table_sessions(id)
    );

    -- Cart Items
    CREATE TABLE IF NOT EXISTS cart_items (
      id SERIAL PRIMARY KEY,
      user_id TEXT,
      resid TEXT,
      item_id INTEGER,
      name TEXT,
      price INTEGER,
      qty INTEGER,
      selections TEXT,
      tableid TEXT,
      added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS selections TEXT;
    ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS img TEXT;
    ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS tableid TEXT;
    ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS table_session_id TEXT;
    ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS suggestion_source TEXT DEFAULT 'organic';

    -- Order Items
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
      img TEXT,
      timestamp BIGINT
    );
    ALTER TABLE order_items ADD COLUMN IF NOT EXISTS selections TEXT;
    ALTER TABLE order_items ADD COLUMN IF NOT EXISTS img TEXT;
    ALTER TABLE order_items ADD COLUMN IF NOT EXISTS status_updated_at BIGINT;
    ALTER TABLE order_items ADD COLUMN IF NOT EXISTS table_session_id TEXT;
    ALTER TABLE order_items ADD COLUMN IF NOT EXISTS order_round_id TEXT;
    ALTER TABLE order_items ADD COLUMN IF NOT EXISTS invoice_id TEXT;
    ALTER TABLE order_items ADD COLUMN IF NOT EXISTS suggestion_source TEXT DEFAULT 'organic';
    ALTER TABLE order_items ADD COLUMN IF NOT EXISTS confirmed_at BIGINT;
    ALTER TABLE order_items ADD COLUMN IF NOT EXISTS cooking_at BIGINT;
    ALTER TABLE order_items ADD COLUMN IF NOT EXISTS ready_at BIGINT;
    ALTER TABLE order_items ADD COLUMN IF NOT EXISTS served_at BIGINT;

    -- Suggestion Events (full funnel tracking: impression → click → add_to_cart → ordered)
    CREATE TABLE IF NOT EXISTS suggestion_events (
      id TEXT PRIMARY KEY,
      resid TEXT NOT NULL,
      user_id TEXT,
      table_session_id TEXT,
      suggestion_type TEXT NOT NULL,
      item_id INTEGER,
      item_name TEXT,
      event_type TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Invoices
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      table_session_id TEXT NOT NULL,
      resid TEXT NOT NULL,
      tableid TEXT NOT NULL,
      subtotal INTEGER DEFAULT 0,
      vat_amount INTEGER DEFAULT 0,
      total INTEGER DEFAULT 0,
      status TEXT DEFAULT 'PAID',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (table_session_id) REFERENCES table_sessions(id)
    );

    -- Invoice VATs
    CREATE TABLE IF NOT EXISTS invoice_vats (
      id TEXT PRIMARY KEY,
      invoice_id TEXT UNIQUE,
      user_id TEXT,
      company_name TEXT,
      tax_code TEXT,
      company_address TEXT,
      email TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id)
    );

    -- Reviews
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      invoice_id TEXT,
      user_id TEXT,
      rating INTEGER,
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(invoice_id, user_id),
      FOREIGN KEY (invoice_id) REFERENCES invoices(id)
    );

    -- Chat Messages
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
      timestamp BIGINT,
      status TEXT,
      status_updated_at BIGINT
    );
    ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Đã gửi';
    ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS status_updated_at BIGINT;

    -- KV Store
    CREATE TABLE IF NOT EXISTS kv_store (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    -- Restaurant Menus
    CREATE TABLE IF NOT EXISTS restaurant_menus (
      resid TEXT PRIMARY KEY,
      menu_data TEXT,
      item_overrides TEXT DEFAULT '{}',
      pos_sync_config TEXT DEFAULT '{}'
    );
    ALTER TABLE restaurant_menus ADD COLUMN IF NOT EXISTS item_overrides TEXT DEFAULT '{}';
    ALTER TABLE restaurant_menus ADD COLUMN IF NOT EXISTS pos_sync_config TEXT DEFAULT '{}';


    -- Restaurant Display Configs
    CREATE TABLE IF NOT EXISTS restaurant_display_configs (
      id TEXT PRIMARY KEY,
      res_id TEXT,
      draft_blocks TEXT DEFAULT '[]',
      published_blocks TEXT DEFAULT '[]',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(res_id)
    );

    -- Feedback
    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      invoice_id TEXT,
      table_session_id TEXT,
      user_id TEXT NOT NULL,
      resid TEXT NOT NULL,
      tableid TEXT NOT NULL,
      rating TEXT NOT NULL,
      tags TEXT DEFAULT '[]',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (table_session_id) REFERENCES table_sessions(id)
    );

    -- Vouchers
    CREATE TABLE IF NOT EXISTS vouchers (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      code TEXT NOT NULL,
      title TEXT NOT NULL,
      discount_type TEXT NOT NULL,
      discount_value INTEGER NOT NULL,
      min_order INTEGER DEFAULT 0,
      expiry TEXT,
      status TEXT DEFAULT 'active',
      qr_value TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // ── Index (separate — partial unique index) ──
  try {
    await database.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_active_table_session ON table_sessions (resid, tableid) WHERE status = 'ACTIVE'`);
  } catch (e) { }
  try {
    await database.exec(`CREATE INDEX IF NOT EXISTS idx_suggestion_events_lookup ON suggestion_events (resid, suggestion_type, event_type, created_at)`);
  } catch (e) { }

  // ── Seed data: batch into minimal calls ──
  await database.exec(`
    INSERT INTO tables (id, name) VALUES ('A-12', 'Bàn A-12') ON CONFLICT (id) DO NOTHING;
    INSERT INTO tables (id, name) VALUES ('T-1', 'Bàn 1') ON CONFLICT (id) DO NOTHING;
  `);

  // Seed users from JSON (if exists)
  const usersJsonPath = path.join(process.cwd(), 'src/data/users.json');
  if (fs.existsSync(usersJsonPath)) {
    try {
      const users = JSON.parse(fs.readFileSync(usersJsonPath, 'utf8'));
      for (const user of users) {
        await database.run(
          `INSERT INTO users (id, phone, name, points, tier, avatar, preferences, isGuest) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (id) DO NOTHING`,
          [user.id, user.phone, user.name, user.points || 0, user.tier || 'Guest', user.avatar, JSON.stringify(user.preferences || []), user.isGuest ? 1 : 0]
        );
      }
    } catch (e) { }
  }


  console.log(`[DB] initDb completed in ${Date.now() - startTime}ms`);
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
