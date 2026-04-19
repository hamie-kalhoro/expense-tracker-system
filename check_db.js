import pg from 'pg';

const connectionString = 'postgresql://postgres:JpmYT07srhpjF2mG@db.efzusvjqyemthwbxumsm.supabase.co:5432/postgres';

async function check() {
  const client = new pg.Client({ connectionString });
  try {
    await client.connect();
    console.log("✅ Connected to Postgres successfully!");

    // Check tables
    const res = await client.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema IN ('public')
    `);
    console.log("\n📦 Tables in public schema:");
    res.rows.forEach(r => console.log(` - ${r.table_name}`));

    // Try to check JWT secret if accessible
    try {
      const jwtRes = await client.query(`SHOW pgrst.jwt_secret`);
      console.log("\n🔑 JWT Secret found in settings!");
    } catch(e) {
      console.log("\n❌ Cannot read pgrst.jwt_secret directly. (This is normal for the 'postgres' role)");
    }
    
    // Check if RLS is enabled on users
    try {
      const rlsRes = await client.query(`
        SELECT relname, relrowsecurity 
        FROM pg_class 
        WHERE relname = 'users'
      `);
      if (rlsRes.rows.length > 0) {
        console.log(`\n🛡️ Table 'users' RLS enabled: ${rlsRes.rows[0].relrowsecurity}`);
      }
    } catch(e) {
      console.log("Could not check RLS.");
    }
  } catch (err) {
    console.error("Connection error", err.stack);
  } finally {
    await client.end();
  }
}

check();
