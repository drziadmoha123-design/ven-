import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { sql } from 'drizzle-orm';

const pool = new pg.Pool({ connectionString: 'postgres://postgres:password@localhost:5432/venplus' });
const db = drizzle(pool);

async function test() {
  try {
    await db.execute(sql`SELECT 1`);
  } catch (err) {
    console.log("Error properties:");
    console.log("name:", err.name);
    console.log("message:", err.message);
    console.log("code:", err.code);
    console.log("cause:", err.cause?.code);
  } finally {
    pool.end();
  }
}
test();
