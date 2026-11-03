const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:admin123@localhost:5432/sport_training',
});

async function run() {
  try {
    const tablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('Total Tables in PostgreSQL:', tablesRes.rows.length);
    for (const row of tablesRes.rows) {
      const t = row.table_name;
      const countRes = await pool.query(`SELECT count(*) as count FROM "${t}"`);
      const colsRes = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [t]);

      console.log(`\n========================================`);
      console.log(`TABLE: ${t} (Rows: ${countRes.rows[0].count})`);
      console.log(`========================================`);
      for (const col of colsRes.rows) {
        const nullable = col.is_nullable === 'NO' ? 'NOT NULL' : 'NULLABLE';
        const def = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(` - ${col.column_name}: ${col.data_type} [${nullable}]${def}`);
      }
    }
  } catch (err) {
    console.error('Error during DB audit:', err);
  } finally {
    await pool.end();
  }
}

run();

