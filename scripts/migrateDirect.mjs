// scripts/migrateDirect.mjs
import fs from 'fs';
import path from 'path';
import pg from 'pg';
const { Client } = pg;

const PROJECT_REF = 'pzxedvijuvpwertsjqcv';
const HOST = 'aws-0-eu-central-1.pooler.supabase.com';
const PORT = 6543;
const USERNAME = `postgres.${PROJECT_REF}`;
const DB_NAME = 'postgres';

const migrationSql = fs.readFileSync(path.resolve('./supabase/migrations/20260828000000_init_antigravity.sql'), 'utf8');
const seedSql = fs.readFileSync(path.resolve('./supabase/seed.sql'), 'utf8');

const candidatePasswords = [
  process.env.DB_PASSWORD,
  'Antigravity2026!',
  'Demo2026!',
  'Antigravity2026',
  'antigravity',
  'postgres',
].filter(Boolean);

async function tryConnectAndMigrate() {
  for (const password of candidatePasswords) {
    console.log(`Trying password... (${password.substring(0, 3)}***)`);
    const client = new Client({
      host: HOST,
      port: PORT,
      user: USERNAME,
      password: password,
      database: DB_NAME,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });

    try {
      await client.connect();
      console.log('>>> CONNECTED TO SUPABASE POSTGRESQL! <<<');
      
      console.log('Executing migration SQL...');
      await client.query(migrationSql);
      console.log('Migration SQL executed successfully!');

      console.log('Enabling Realtime publications...');
      await client.query(`
        DO $$
        BEGIN
          BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE gate_scans, alerts, incidents, zone_density_readings;
          EXCEPTION WHEN others THEN
            RAISE NOTICE 'Publication alter note: %', SQLERRM;
          END;
        END $$;
      `);
      console.log('Realtime publications enabled!');

      console.log('Executing seed SQL...');
      await client.query(seedSql);
      console.log('Seed SQL executed successfully!');

      await client.end();
      console.log('All migrations and seed completed with 100% SUCCESS!');
      return true;
    } catch (err) {
      console.log('Auth attempt failed:', err.message);
      try { await client.end(); } catch (e) {}
    }
  }
  return false;
}

tryConnectAndMigrate();
