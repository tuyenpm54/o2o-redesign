const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
            const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
            if (match) {
                const key = match[1];
                let value = match[2] || '';
                if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
                process.env[key] = value;
            }
        });
    }
}

async function check() {
    console.log("Starting DB Check...");
    loadEnv();
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("CRITICAL: DATABASE_URL is missing");
        process.exit(1);
    }

    const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const res = await pool.query("SELECT 1 as connected");
        console.log("Connection Success:", res.rows[0]);

        const tablesRes = await pool.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
        console.log("Tables in public schema:", tablesRes.rows.map(r => r.tablename));

        if (tablesRes.rows.some(r => r.tablename === 'tables')) {
            const rowCount = await pool.query("SELECT COUNT(*) FROM tables");
            console.log("Rows in 'tables' table:", rowCount.rows[0].count);
            const data = await pool.query("SELECT * FROM tables");
            console.log("Data in 'tables':", JSON.stringify(data.rows, null, 2));
        } else {
            console.log("Table 'tables' DOES NOT EXIST!");
        }

    } catch (err) {
        console.error("DB Error:", err.message);
    } finally {
        await pool.end();
    }
}

check();
