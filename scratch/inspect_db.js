import pg from 'pg';

const connectionString = 'postgresql://postgres:JpmYT07srhpjF2mG@db.efzusvjqyemthwbxumsm.supabase.co:5432/postgres';

async function check() {
  const client = new pg.Client({ connectionString });
  try {
    await client.connect();
    console.log("Connected to DB.");

    const users = await client.query('SELECT id, username FROM public.users');
    console.log("Users in public.users:", users.rows);

    const expenses = await client.query('SELECT * FROM public.expenses');
    console.log("Expenses in public.expenses:", expenses.rows);

    const participants = await client.query('SELECT * FROM public.expense_participants');
    console.log("Participants:", participants.rows);

    const policies = await client.query(`
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
      FROM pg_policies 
      WHERE schemaname = 'public'
    `);
    console.log("Policies:", policies.rows.filter(p => p.tablename === 'expenses' || p.tablename === 'expense_participants'));

  } catch (err) {
    console.error("Error", err);
  } finally {
    await client.end();
  }
}

check();
