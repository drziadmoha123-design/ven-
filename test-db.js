const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/venplus' });

async function test() {
  try {
    await client.connect();
    const res = await client.query('SELECT 1');
    console.log("DB CONNECTIVITY:\nPASS");
  } catch (err) {
    console.log("DB CONNECTIVITY:\nFAIL");
    console.log(`error code: ${err.code}`);
    console.log(`safe error message: ${err.message}`);
    console.log(`hostname: ${client.host}`);
    console.log(`port: ${client.port}`);
    console.log(`database: ${client.database}`);
    console.log(`username: ${client.user}`);
    console.log(`SSL mode: ${client.ssl ? 'enabled' : 'disabled'}`);
  } finally {
    await client.end();
  }
}
test();
