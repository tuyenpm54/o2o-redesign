import { Pool } from 'pg';
async function run() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://tuyenpham:D48u87Rsv9Zc@ep-blue-recipe-a1i602ue-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&uselibpqcompat=true' });
  const res = await pool.query('SELECT user_id, count(*) FROM order_items GROUP BY user_id');
  console.log('Order items by user:', res?.rows);
  const res2 = await pool.query('SELECT user_id, ts.status as __status__, count(*) as c FROM order_items oi LEFT JOIN table_sessions ts ON oi.table_session_id = ts.id GROUP BY user_id, ts.status');
  console.log('Order items by user and ts status:', res2?.rows);
  const res3 = await pool.query('SELECT id, preferences_history FROM users');
  console.log('Users history:', res3?.rows);
  await pool.end();
}
run();
